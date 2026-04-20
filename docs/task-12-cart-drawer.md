# Task 12 — CartDrawer + redirect WhatsApp

## Objetivo
Gaveta lateral com Glassmorphism que mostra o carrinho, dispara o checkout (validação + IA num mesmo round-trip) e redireciona para `wa.me` com a mensagem gerada.

## Arquivos
- `frontend/components/CartDrawer/CartDrawer.tsx` — painel `position: fixed; right: 0` com slide-in.
- `frontend/components/CartDrawer/CartDrawer.module.css` — overlay escuro com blur, pulso neon durante loading.
- `frontend/components/CartDrawer/CartButton.tsx` — FAB circular com badge de quantidade.
- `frontend/components/CartDrawer/CartButton.module.css`.
- `frontend/app/[slug]/page.tsx` — renderiza `<CartButton />` dentro do storefront.

## Fluxo de checkout

```
clique "Finalizar"
  → phase='loading' (pulso neon no painel + "IA processando pedido…")
  → POST {API_URL}/checkout { items: [{productId, quantity}] }
    ↳ backend: valida preços (Task 10) + gera mensagem Groq (Task 11)
    ↳ retorna { whatsappUrl }
  → useCart.clear()
  → window.location.href = whatsappUrl
```

## UX / acessibilidade

- `role="dialog"` + `aria-modal="true"` + `aria-labelledby="cart-title"`.
- `Escape` fecha o drawer (listener removido no unmount).
- `body.overflow = 'hidden'` durante `open` evita scroll do fundo.
- Overlay (`<button>` explícito) é clicável para fechar — desabilitado enquanto `phase === 'loading'`.
- `aria-live="polite"` no contador de quantidade anuncia mudanças aos leitores.
- `prefers-reduced-motion`: zera slide-in e pulso.

## Estados visuais

| phase | Painel | Botão "Finalizar" |
| --- | --- | --- |
| `idle` | estático | sólido Bio-Neon |
| `loading` | pulsa Bio-Neon na borda | fundo translúcido + animação de pulso + texto "IA processando pedido…" |
| `error` | estático | sólido + `<div role="alert">` com mensagem |

## Tratamento de erro

- Loja sem WhatsApp cadastrado → erro amigável.
- Backend retorna 400 (ex.: `Produtos inexistentes`) → a mensagem vem direto do `body.message` do NestJS (já traduzida pelos DTOs).
- Limite de 5 itens já foi barrado na entrada (Task 9), mas o DTO do backend (max 5) é a última linha de defesa.
