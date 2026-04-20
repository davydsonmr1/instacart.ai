# Task 13 — Auditoria de Segurança (BOLA + Rate Limiting + Helmet)

## Objetivo
Reforçar o sistema contra **BOLA** (Broken Object Level Authorization) e impedir que um atacante dispare custos de IA em massa.

## Mudanças

### `backend/src/app.module.ts`
- Registra `ThrottlerModule` com default de **60 req/min por IP**.
- Instala `ThrottlerGuard` global via `APP_GUARD` — toda rota passa a ser rate-limited.

### `backend/src/checkout/checkout.controller.ts`
- `@Throttle({ default: { ttl: 60_000, limit: 3 } })` no `POST /checkout`.
- **3 chamadas / 60s / IP** porque cada hit dispara Groq ($).
- O valor é o mais severo do app; permite até 1 retry honesto mas mata um bot.

### `backend/src/main.ts`
- `app.use(helmet())` — headers de segurança (CSP, XFO, HSTS, etc).
- `app.set('trust proxy', 1)` — Render/Vercel entregam via `X-Forwarded-For`; sem isso o ThrottlerGuard rate-limitaria pelo IP do proxy (e trataria todo mundo como 1 IP).

## Revisão BOLA — já ativa desde a Task 6

### `ProductsService.update`
```ts
await this.ensureOwnership(userId, productId);            // 1) SELECT + compara user_id
const { data, error } = await this.supabase.admin
  .from('products')
  .update(patch)
  .eq('id', productId)
  .eq('user_id', userId)                                   // 2) AND user_id = ? no UPDATE
  .select('*')
  .single();
```

### `ProductsService.remove`
Mesmo padrão — `ensureOwnership` + `.eq('id', id).eq('user_id', userId)` no DELETE. Mesmo que alguém troque o `id` na URL, o service **jamais** toca em linha de outro dono.

### `ProfilesService.upsert`
Payload força `id: userId` (o `id` vem do `@CurrentUser()`, que vem do token). Cliente nunca consegue alterar outro perfil.

## Defesa em profundidade

| Camada | Como protege |
| --- | --- |
| `ValidationPipe` global | Descarta campos extras (`forbidNonWhitelisted`), valida UUIDs e ranges |
| `SupabaseAuthGuard` | `userId` só vem do JWT, nunca do body/query |
| `ensureOwnership` no service | Verifica `row.user_id === req.user.id` antes de qualquer mutação |
| `.eq('user_id', req.user.id)` na query | Falha silenciosamente se o `id` não for do dono — belt + suspenders |
| **RLS no Postgres** (Task 4) | Última linha de defesa; mesmo que o backend vaze a service role, RLS ainda bloqueia |
| Helmet | Protege o cliente de XSS/clickjacking |
| Throttler global 60/min, `/checkout` 3/min | Amortece abuso e custo $ de IA |

## Verificação manual

```bash
# Dispara 6 checkouts rapidamente no mesmo IP
for i in {1..6}; do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3333/checkout \
    -H "Content-Type: application/json" \
    -d '{"items":[{"productId":"00000000-0000-0000-0000-000000000000","quantity":1}]}'
done
# Esperado: 400, 400, 400, 429, 429, 429
```
