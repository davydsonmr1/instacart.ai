# Task 06 — Products CRUD + Supabase Storage + Admin UI

## Objetivo
Lojista cadastra/remove produtos com imagem. Backend faz upload no Supabase Storage e retorna a URL pública. Frontend tem grid de produtos com modal de cadastro em Glassmorphism.

## Backend (NestJS)

### Novos arquivos
- `backend/src/products/dto/create-product.dto.ts` — `name` (2-80 chars), `price` (> 0, 2 decimais).
- `backend/src/products/dto/update-product.dto.ts` — mesmos campos, opcionais.
- `backend/src/products/products.service.ts`
  - `findAllByUser(userId)` / `findPublicByUserId(userId)`
  - `create(userId, dto, file)` — faz upload e insere.
  - `update(userId, productId, dto, file)` — com `ensureOwnership` + `.eq('user_id', userId)` na query (**BOLA defense dupla**).
  - `remove(userId, productId)` — mesma defesa.
  - `uploadImage`: valida mime (`jpeg|png|webp|avif`), tamanho (≤5MB), gera path `{userId}/{uuid}.ext`, chama `storage.from(bucket).upload(...)` e retorna `publicUrl`.
- `backend/src/products/products.controller.ts` — rotas abaixo.
- `backend/src/products/products.module.ts`.

### Rotas
| Método | Rota | Auth | Body |
| --- | --- | --- | --- |
| `GET` | `/products/mine` | Bearer | — |
| `POST` | `/products` | Bearer | `multipart/form-data` com `name`, `price`, `image` |
| `PATCH` | `/products/:id` | Bearer | idem, campos opcionais |
| `DELETE` | `/products/:id` | Bearer | — |

### Dependências
- `multer` (runtime) + `@types/multer` (dev) para `@UseInterceptors(FileInterceptor('image'))`.
- `database/storage.sql` cria bucket `product-images` (público) com políticas por pasta `userId`.

## Frontend (Next.js)

### Novos arquivos
- `frontend/lib/api.ts` — helper `api.get/patchJson/postForm/del` que pega `access_token` da sessão e envia como Bearer.
- `frontend/app/admin/layout.tsx` + `layout.module.css` — sidebar com nav (Dashboard, Produtos, Perfil) e logout.
- `frontend/app/admin/LogoutButton.tsx` — client component (precisa ser client porque o layout é server).
- `frontend/app/admin/page.tsx` + `dashboard.module.css` — dashboard com cards de navegação.
- `frontend/app/admin/products/page.tsx` + `products.module.css` — grid de produtos + modal de cadastro com validação client-side (`price > 0`).
- `frontend/app/admin/profile/page.tsx` + `profile.module.css` — edição de perfil (consome `/profiles/me`).

### Alterados
- `frontend/next.config.ts` — `images.remotePatterns` aponta para o host do Supabase Storage (derivado da env `NEXT_PUBLIC_SUPABASE_URL`) → `next/image` consegue otimizar as fotos.
- `frontend/.env.local` — adicionado `NEXT_PUBLIC_API_URL=http://localhost:3333`.

## Segurança
- Controller usa `@UseGuards(SupabaseAuthGuard)` em todas as rotas de escrita.
- `userId` vem do token, nunca do body.
- Query `DELETE ... WHERE id = ? AND user_id = ?` mesmo após `ensureOwnership` (belt + suspenders).
- Storage path `{userId}/...` permite que a RLS do bucket bloqueie uploads cross-user via anon key.
- Validação client-side de preço **não substitui** a validação server-side (DTO + `@Min(0.01)`).

## Como testar

```bash
# 1) No SQL Editor do Supabase, rode database/storage.sql
# 2) Backend
cd backend && npm install && npm run start:dev
# 3) Frontend
cd frontend && npm install && npm run dev
# 4) Acesse http://localhost:3000/login, entre com Google,
#    vá em /admin/products e cadastre um produto com imagem.
```
