# Task 15 — Deploy & Infraestrutura (Vercel + Render + UptimeRobot)

## Objetivo
Publicar o MVP em produção sem custos: frontend Next.js no **Vercel** (Hobby), backend NestJS no **Render** (Free), monitoramento e keep-alive via **UptimeRobot** (Free).

## Arquitetura de deploy

```
┌─────────────────┐      HTTPS       ┌──────────────────┐     HTTPS     ┌──────────────────┐
│  Vercel (Edge)  │ ───────────────▶ │  Render (us-west)│ ────────────▶ │  Supabase (sa)   │
│  Next.js 16     │  Bearer JWT      │  NestJS 11       │  service_role │  Postgres + Auth │
│  gru1 (São      │                  │  oregon          │               │  + Storage       │
│  Paulo)         │                  │                  │               │                  │
└─────────────────┘                  └──────────────────┘               └──────────────────┘
         ▲                                     ▲
         │                                     │
         │ HTTPS (5 min)                       │ HTTPS (13 min)
         │                                     │
         └──────────── UptimeRobot ────────────┘
                    (ping /health)
```

## 1. Vercel — Frontend

### `frontend/vercel.json`
Configuração mínima: framework auto-detectado, região `gru1` (São Paulo) para latência baixa no Brasil, headers globais de segurança. Next.js 16 no App Router não precisa de `routes` customizadas — o Vercel faz o build via `next build` e roteia automaticamente.

### Passo a passo
1. `vercel login` → conectar repositório GitHub.
2. Em **Project Settings → General**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js (auto)
   - **Build Command**: `next build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm ci`
3. Em **Project Settings → Environment Variables**, adicionar (ver tabela abaixo).
4. **Deploy** — primeira build leva ~2 min.

### Domínio
Opcional: configurar domínio custom em **Domains**. Para MVP o subdomínio `*.vercel.app` resolve.

## 2. Render — Backend

### `backend/render.yaml`
Blueprint declarativo: na primeira vez usar **New → Blueprint** apontando para o repositório; nas próximas o Render detecta mudanças via `autoDeploy: true`.

- `startCommand: npm run start:prod` → executa `node dist/main` (já declarado em [package.json:14](backend/package.json#L14))
- `healthCheckPath: /health` → Render considera o deploy unhealthy se o endpoint não responder 200 em 5 min. Já implementado em [app.controller.ts:5-8](backend/src/app.controller.ts#L5-L8).
- `PORT: 10000` → Render injeta a porta via env var; o [main.ts:36](backend/src/main.ts#L36) lê `process.env.PORT` com fallback para 3333.
- `app.set('trust proxy', 1)` já configurado em [main.ts:12](backend/src/main.ts#L12) para que o `ThrottlerGuard` use o IP real do `X-Forwarded-For`.

### Passo a passo
1. **New → Blueprint** → conectar repositório.
2. Render detecta `backend/render.yaml` automaticamente.
3. Preencher secrets (`sync: false`) manualmente na UI.
4. Primeira build: ~4-5 min (npm ci + tsc).
5. URL gerada: `https://instacart-ai-backend.onrender.com`.

### Cold start (plano Free)
O Render Free **derruba a instância após 15 min sem tráfego**. Reboot leva ~40s. Mitigamos com UptimeRobot (ver abaixo) — ping a cada 5-13 min mantém o container quente.

## 3. Variáveis de ambiente

### Frontend (Vercel)
| Var | Exemplo | Observação |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://abcd.supabase.co` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Chave anônima (pública por design) |
| `NEXT_PUBLIC_API_URL` | `https://instacart-ai-backend.onrender.com` | URL pública do backend no Render |

### Backend (Render)
| Var | Exemplo | Segredo? |
| --- | --- | --- |
| `NODE_ENV` | `production` | não |
| `PORT` | `10000` | não (Render injeta) |
| `SUPABASE_URL` | `https://abcd.supabase.co` | não |
| `SUPABASE_ANON_KEY` | `eyJhbGc...` | não |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | **SIM — nunca expor** |
| `SUPABASE_STORAGE_BUCKET` | `product-images` | não |
| `GROQ_API_KEY` | `gsk_...` | **SIM** |
| `GROQ_MODEL` | `llama-3.1-8b-instant` | não |
| `CORS_ORIGINS` | `https://instacart-ai.vercel.app,https://www.meudominio.com` | não — origem do Vercel separada por vírgula |

### Checklist de segredos
- [ ] `SUPABASE_SERVICE_ROLE_KEY` **nunca** deve ser prefixada com `NEXT_PUBLIC_` nem referenciada no frontend.
- [ ] `GROQ_API_KEY` idem — só o backend consome.
- [ ] Rotacionar ambas se `.env` for commitado por engano (`.gitignore` já cobre `.env*`).

## 4. UptimeRobot — Anti-sleep + monitoramento

### Por que
Render Free = 750h/mês por instância + sleep após 15 min. Um único monitor HTTP a cada 5 min = 288 requests/dia, mantém o container ativo indefinidamente e ainda entrega alertas.

### Configuração
1. Criar conta em `uptimerobot.com` (free: 50 monitores, intervalo mín. 5 min).
2. **Add New Monitor**:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: `InstaCart AI — backend`
   - **URL**: `https://instacart-ai-backend.onrender.com/health`
   - **Monitoring Interval**: 5 minutes
   - **Monitor Timeout**: 30 seconds (cold start pode passar de 10s)
   - **HTTP Method**: GET
3. **Alert Contacts**: adicionar e-mail / Telegram / Discord webhook.
4. Opcional: criar segundo monitor para o Vercel (`https://<app>.vercel.app/`) — detecta erros 500 globais de SSR.

### Janela de custo
Render Free permite 750h/mês. Um serviço rodando 24/7 = 720h/mês → cabe no limite. Se ultrapassar (ex.: criar um segundo serviço), considerar:
- Migrar para Render Starter ($7/mês, sem sleep)
- Ou usar cron-job.org (free, intervalos de 1 min)

### Status page pública (opcional)
UptimeRobot oferece status page gratuita em `stats.uptimerobot.com/<hash>` — boa UX para lojistas verem se o serviço está no ar.

## 5. Checklist de go-live

- [ ] Schema Supabase aplicado (`database/schema.sql` + `database/storage.sql`)
- [ ] Bucket `product-images` criado + RLS policies ativas
- [ ] Env vars preenchidas no Vercel
- [ ] Env vars preenchidas no Render (incl. `CORS_ORIGINS` com URL do Vercel)
- [ ] Deploy inicial do backend ok (`/health` responde 200)
- [ ] Deploy inicial do frontend ok (landing carrega)
- [ ] Fluxo E2E: criar conta → slug → cadastrar produto com imagem → abrir `/{slug}` em anônimo → adicionar ao carrinho → finalizar via WhatsApp
- [ ] UptimeRobot ativo em `/health`
- [ ] Rate limiting testado (4ª requisição em `/checkout` retorna 429)
- [ ] axe DevTools sem erros críticos em `/` e `/{slug}`

## 6. Rollback

- **Vercel**: **Deployments → [deploy anterior] → Promote to Production**. Instantâneo.
- **Render**: **Events → Rollback** para o último deploy verde. ~40s.
- **Supabase**: snapshots automáticos diários no plano Free. Restaurar via dashboard (destrutivo — avisar usuários).

## 7. Observabilidade pós-deploy

| Camada | Ferramenta | O que olhar |
| --- | --- | --- |
| Frontend | Vercel → Analytics | Core Web Vitals, erros de runtime |
| Backend | Render → Logs (live tail) | 401/403 inesperados, rate-limit hits, erros Groq |
| DB | Supabase → Logs → Postgres | queries lentas, violações RLS |
| Uptime | UptimeRobot | SLA, tempo médio de resposta do `/health` |
