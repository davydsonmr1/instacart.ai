# Task 08 — ProductCard (Glassmorphism + micro-interações)

## Objetivo
Turbinar o `ProductCard` inicial da Task 7 para transparecer luxo tecnológico: vidro fosco, skeleton enquanto a imagem carrega, feedback visual "Adicionado" e respeito a `prefers-reduced-motion`.

## O que mudou

### `frontend/components/ProductCard/ProductCard.tsx`
- Estado `imgLoaded` controla opacidade da imagem e exibição do skeleton por trás.
- Estado `added` (true por ~1.4s) e `warning` (até 2.4s) alteram `data-state` do botão para variações de cor.
- Prop `onAdd(product) => { ok, message? }` permite que o pai decida se o item entra no carrinho ou se deve mostrar um aviso (Task 9 usa isso para barrar o 6º item no plano Free).
- `priority={priority}` no `<Image />` para o primeiro card (above-the-fold).
- `aria-label` no botão identifica o produto ("Adicionar Camiseta Onyx ao carrinho").

### `frontend/components/ProductCard/ProductCard.module.css`
- `backdrop-filter: blur(20px) saturate(140%)` + borda `rgba(255,255,255,0.1)`.
- `:hover` eleva 4px e aplica halo Bio-Neon; imagem faz `scale(1.06)` suave.
- `:active` no botão → `scale(0.96)` (haptic visual).
- `:focus-visible` no botão → outline Bio-Neon de 2px com 3px de offset.
- `.skeleton` com `@keyframes shimmer` em gradiente (200% width).
- `.addButton[data-state='added']` vira sólido Bio-Neon com glow; `'warn'` vira vermelho translúcido.
- `@media (prefers-reduced-motion: reduce)` zera transições e para o shimmer.

### `frontend/app/globals.css`
- Import adicional da **Fira Code** (usada no preço para reforçar o visual tecnológico).
- Variáveis de motion centralizadas (`--t-card`, `--t-fast`) que a Task 14 usará para desligar motion globalmente.

## Tipografia
- Nome do produto: **Plus Jakarta Sans 600** com `-webkit-line-clamp: 2` (evita quebra desalinhada do grid).
- Preço: **Fira Code 600** — variação tecnológica que destaca o número.

## Como testar

Abra `/{slug}` com vários produtos; passe o mouse sobre um card e clique em **Adicionar**. O botão deve piscar "✓ Adicionado" e voltar. Em navegador com "Reduzir movimento" ligado, nenhuma animação deve rodar.
