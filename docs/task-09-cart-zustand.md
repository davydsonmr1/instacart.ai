# Task 09 — Cart Zustand + Regra Free-5

## Objetivo
Store de carrinho que persiste no `localStorage`, bloqueia o 6º item distinto no plano Free e evita carrinhos cruzando lojas diferentes.

## Arquivos
- `frontend/lib/cart/useCart.ts`
- `frontend/app/[slug]/ProductGrid.tsx` agora injeta `addItem` do Zustand como callback `onAdd` do `ProductCard`.
- `frontend/app/[slug]/page.tsx` passa `storeId = profile.id` para o grid (necessário para a regra cross-store).

## API da store

```ts
interface CartState {
  items: CartItem[];
  storeId: string | null;

  addItem: (item) => AddResult;      // { ok, reason?, message? }
  increaseQuantity: (id) => void;
  decreaseQuantity: (id) => void;    // remove ao chegar em 0
  removeItem: (id) => void;
  clear: () => void;

  totalItems(): number;              // soma de quantities
  totalValue(): number;
  distinctCount(): number;           // usado pela regra Free
}

export const FREE_PLAN_ITEM_LIMIT = 5;
```

## Regras de negócio

1. **Free-5** — `items.length >= 5` bloqueia insert de um 6º item **distinto** (aumentar a quantidade de um item já existente continua permitido — a monetização é sobre variedade).
2. **Cross-store** — se o carrinho já tem itens da loja A, adicionar produto da loja B retorna `reason: 'cross-store'`. O `ProductCard` mostra a mensagem retornada no próprio botão (Task 8 já suportava isso via `onAdd`).
3. **Persistência** — `persist` middleware com `createJSONStorage(() => localStorage)`, `name: 'instacart-cart'`, `version: 1` (facilita migrações futuras).
4. **Partialize** — só persiste `items` e `storeId`, nunca funções.

## Integração com o ProductCard

O `ProductCard` já retornava resultado de `onAdd` na Task 8. A store retorna `{ ok: false, message }` quando bate no limite — o card automaticamente vira vermelho com a mensagem durante 2.4s.

## Como testar

1. Cadastre 6 produtos na `/admin/products`.
2. Acesse `/{slug}` e clique em "Adicionar" nos 6 cards.
3. O 6º deve mostrar **"Plano Free: máximo 5 itens distintos."** no próprio botão.
4. Dê F5 — os 5 itens devem continuar lá (vindos do localStorage).
