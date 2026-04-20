# Task 10 — Checkout com validação server-side de preço

## Objetivo
Garantir que o valor total do pedido seja calculado **apenas com preços do banco**, ignorando qualquer valor enviado pelo cliente (anti-fraude).

## Arquivos novos
- `backend/src/checkout/dto/checkout.dto.ts` — `items: [{ productId: UUID, quantity: 1..99 }]`, no mínimo 1, no máximo 5 itens (alinhado ao plano Free da Task 9).
- `backend/src/checkout/checkout.service.ts` — lookup `.in(ids)`, valida inexistência, exige **mesma loja para todos os itens**, calcula `subtotal` e `totalValue` com arredondamento de centavos.
- `backend/src/checkout/checkout.controller.ts` — `POST /checkout` (status 200).
- `backend/src/checkout/checkout.module.ts`.

## Regras de validação

| Regra | Resposta |
| --- | --- |
| IDs duplicados | `400 — Itens duplicados no payload` |
| Algum ID não existe | `400 — Produtos inexistentes: <lista>` |
| Produtos de lojas diferentes | `400 — Todos os itens devem pertencer à mesma loja` |
| Loja (perfil) não encontrada | `404 — Loja não encontrada` |
| Body inválido (schema/UUID/quantidade) | `400` via `ValidationPipe` global |

## Por que funciona como defesa

- O cliente **nunca** envia preço; envia só `productId` + `quantity`.
- O service faz `SELECT id, user_id, name, price FROM products WHERE id IN (...)` com **service role** (bypassa RLS, mas não importa porque só lê os IDs que vieram no body).
- Cálculo de total é float-safe via `Math.round(x * 100) / 100`.
- Endpoint é **público** (sem guard) — é o cliente final da loja que chama, ainda sem login. A Task 13 adiciona `@nestjs/throttler` para limitar 2 chamadas/min/IP.

## Resposta exemplo

```json
POST /checkout
{
  "items": [
    { "productId": "9f1a…", "quantity": 2 },
    { "productId": "7b4c…", "quantity": 1 }
  ]
}

→ 200 OK
{
  "items": [
    { "productId": "9f1a…", "name": "Camiseta Onyx", "unitPrice": 89.9, "quantity": 2, "subtotal": 179.8 },
    { "productId": "7b4c…", "name": "Tote Bag", "unitPrice": 59.0, "quantity": 1, "subtotal": 59.0 }
  ],
  "totalValue": 238.80,
  "currency": "BRL",
  "store": { "id": "…", "slug": "boutique", "store_name": "Boutique Onyx", "whatsapp": "5511988887777" }
}
```

A Task 11 consome esse payload para gerar a mensagem do WhatsApp via Groq.
