# Task 05 — Backend Profiles (NestJS + SupabaseAuthGuard)

## Objetivo
Endpoints para o lojista **ler** e **atualizar** seu perfil (slug, nome da loja, whatsapp, bio), com identidade vinda exclusivamente do JWT do Supabase.

## O que foi implementado

### Arquivos novos
- `backend/src/supabase/supabase.service.ts` — cliente singleton com `admin` (service role) e `anon`.
- `backend/src/supabase/supabase.module.ts` — módulo `@Global()`, reutilizado pelos próximos módulos.
- `backend/src/auth/supabase-auth.guard.ts` — extrai `Authorization: Bearer <token>`, valida via `supabase.auth.getUser(token)`, injeta `request.user`.
- `backend/src/auth/current-user.decorator.ts` — `@CurrentUser()` para pegar `{ id, email }` já validado.
- `backend/src/profiles/dto/update-profile.dto.ts` — `class-validator` com regex/transform (slug lowercase, whatsapp só dígitos).
- `backend/src/profiles/profiles.service.ts` — `findByUserId`, `findBySlug`, `upsert` (bootstrap de slug no primeiro login).
- `backend/src/profiles/profiles.controller.ts` — `GET /profiles/me`, `PATCH /profiles/me`, `GET /profiles/by-slug/:slug`.
- `backend/src/profiles/profiles.module.ts`.

### Arquivos alterados
- `backend/src/app.module.ts` — adiciona `ConfigModule.forRoot({ isGlobal: true })`, `SupabaseModule`, `ProfilesModule`.
- `backend/src/main.ts` — `ValidationPipe` global (whitelist + forbidNonWhitelisted + transform), CORS, porta configurável.
- `backend/src/app.controller.ts` — vira `HealthController` (`GET /health`) para o UptimeRobot da Task 15.
- `.env.example` — novas chaves (`SUPABASE_STORAGE_BUCKET`, `GROQ_MODEL`, `RATE_LIMIT_*`).

## Segurança (prevenção de BOLA)
- O **`userId` NUNCA** vem do body — é lido de `request.user` depois que o guard validou o JWT.
- O `upsert` força `id = req.user.id` no payload, ignorando qualquer `id` que o cliente envie.
- Slug duplicado → `409 Conflict` (tratado antes e também por código `23505` do Postgres).
- `whitelist: true` + `forbidNonWhitelisted: true` derrubam campos extras no DTO.
- Service Role Key fica **somente no backend**; o frontend continua usando `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Endpoints

| Método | Rota | Auth | Descrição |
| --- | --- | --- | --- |
| `GET` | `/health` | — | Healthcheck (UptimeRobot) |
| `GET` | `/profiles/me` | Bearer | Retorna perfil do lojista logado |
| `PATCH` | `/profiles/me` | Bearer | Upsert parcial (slug/store_name/whatsapp/bio) |
| `GET` | `/profiles/by-slug/:slug` | — | Leitura pública (vitrine) |

## Como testar

```bash
cd backend
npm install
npm run start:dev

# supondo token válido obtido via frontend
curl http://localhost:3333/profiles/me -H "Authorization: Bearer $TOKEN"

curl -X PATCH http://localhost:3333/profiles/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"slug":"Minha-Loja","store_name":"Boutique","whatsapp":"5511988887777"}'
# -> slug é normalizado para "minha-loja"
```
