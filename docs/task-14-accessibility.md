# Task 14 — Acessibilidade (WCAG 2.2 / 3.0)

## Objetivo
Garantir uso universal: leitores de tela, navegação 100% via teclado, contraste no nível Onyx × Bio-Neon e respeito a `prefers-reduced-motion`.

## Mudanças

### `frontend/app/layout.tsx`
- `lang="pt-BR"` no `<html>`.
- `<a href="#main-content" class="skip-link">` — primeiro elemento tabulável; pula direto para o conteúdo e sai de dentro da sidebar/topbar.
- `metadata.template` para que cada página feche o título corretamente.
- `colorScheme: 'dark'` sinaliza ao navegador que o UA deve usar widgets dark (scrollbar, autofill).

### `frontend/app/globals.css`
- `:focus-visible` global em Bio-Neon (`outline: 2px solid var(--accent); outline-offset: 3px`).
- `.skip-link` invisível (top: -100px) até receber foco — revela com transição suave.
- `.sr-only` utilitário para labels apenas para leitores.
- `@media (prefers-reduced-motion: reduce)` zera `--t-card`, `--t-fast`, `--t-slow` e força `animation/transition-duration: 0.001ms` em todos os elementos.
- `@media (forced-colors: active)` respeita high-contrast do Windows, usando `CanvasText` como cor do outline.

### `frontend/app/[slug]/page.tsx` e `frontend/app/admin/layout.tsx`
- `<main id="main-content">` — alvo do skip-link.

## Já implementado em tasks anteriores
- `aria-label` em todos os botões de ação (`CartButton`, `CartDrawer`, `ProductCard`, `LogoutButton`, `CreateModal close`, quantidade +/−, remover item).
- `role="dialog"` + `aria-modal="true"` + `aria-labelledby` no `CartDrawer` e no modal de cadastro.
- `aria-live="polite"` no contador de quantidade.
- `role="alert"` nas mensagens de erro do checkout.
- `role="status"` nas mensagens de sucesso do form de perfil.
- `alt` descritivo nas imagens de produto (nome do produto, não "imagem de produto X").
- `aria-hidden="true"` em elementos puramente decorativos (avatar de iniciais, svg do ícone do carrinho, halo radial).

## Ordem de foco verificada

1. Skip link → 2. Header (avatar decorativo é `aria-hidden`) → 3. Link WhatsApp → 4. Primeiro botão "Adicionar" → 5. Demais botões de produto → 6. FAB do carrinho → (se aberto) → 7. Botão fechar → 8. Controles de quantidade → 9. "Finalizar no WhatsApp".

O teclado não fica preso em nenhum lugar; Esc fecha o drawer. `body.overflow = 'hidden'` enquanto o drawer está aberto previne scroll-jack.

## Contraste (texto / fundo)

| Par | Ratio | WCAG AA |
| --- | --- | --- |
| `#f5f5f5` sobre `#050505` | 19.6:1 | AAA |
| `#9e9e9e` sobre `#050505` | 7.5:1 | AAA |
| `#00E676` sobre `#050505` | 13.2:1 | AAA |
| `#050505` sobre `#00E676` (botão primário) | 13.2:1 | AAA |

## Verificação

- Navegar só com Tab/Shift+Tab da landing até finalizar um pedido.
- Rodar [axe DevTools](https://www.deque.com/axe/devtools/) em `/{slug}` e `/admin` — nenhum erro crítico.
- Ativar "Reduzir movimento" no SO — slide-in do drawer e shimmer do skeleton devem parar.
