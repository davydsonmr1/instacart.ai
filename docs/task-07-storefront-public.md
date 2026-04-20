# Task 07 — Storefront público (Next.js Server Components)

## Objetivo
Página pública `/{slug}` com SEO otimizado, renderizada no servidor, que mostra a vitrine da loja (header + grid de produtos).

## Decisão de arquitetura
- **Server Component** busca dados diretamente do Supabase (RLS permite leitura pública) via `utils/supabase/server.ts`. Isso evita uma ida extra ao backend NestJS e aproveita o cache do App Router.
- `generateMetadata` roda no servidor e entrega `title`/`description`/`openGraph` corretos para cada slug → link compartilhado no Instagram aparece com o nome e bio da loja.
- `ProductGrid` é Client Component porque no futuro (Task 9) precisa falar com a store Zustand do carrinho.

## Arquivos criados
- `frontend/app/[slug]/page.tsx` — `async function Storefront({ params })`, `notFound()` se slug não existir.
- `frontend/app/[slug]/not-found.tsx` — página 404 dedicada à rota.
- `frontend/app/[slug]/StoreHeader.tsx` — Server Component com avatar (iniciais), nome, bio e link WhatsApp.
- `frontend/app/[slug]/ProductGrid.tsx` — Client Component que renderiza `ProductCard`.
- `frontend/app/[slug]/storefront.module.css` — layout com fundo Onyx e halo radial Bio-Neon.
- `frontend/components/ProductCard/ProductCard.tsx` + `.module.css` — versão inicial (Task 8 faz o upgrade com Glassmorphism + skeleton + microinterações).

## Detalhes importantes
- `params` é `Promise<>` (Next.js 16) — aguardado via `await params`.
- Lista de slugs reservados (`admin`, `login`, `auth`, `api`, …) retorna `null` em `loadStore` → cai no `notFound()` e evita conflito com rotas estáticas.
- Query no Supabase usa `maybeSingle()` (não `.single()`) para que slug inexistente não gere erro, apenas `null`.
- Imagens otimizadas via `next/image` + `images.remotePatterns` configurado na Task 6.

## Como testar

```bash
# Com backend e frontend rodando, cadastre um perfil com slug "teste" e um produto
# no /admin, depois acesse:
curl http://localhost:3000/teste
# View-source deve mostrar <title>Nome | InstaCart AI</title> já renderizado (SSR).
```
