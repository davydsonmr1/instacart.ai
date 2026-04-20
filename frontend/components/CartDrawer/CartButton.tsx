'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart/useCart';
import { CartDrawer } from './CartDrawer';
import styles from './CartButton.module.css';

export function CartButton() {
  const [open, setOpen] = useState(false);
  const totalItems = useCart((s) => s.totalItems());

  return (
    <>
      <button
        type="button"
        className={styles.fab}
        onClick={() => setOpen(true)}
        aria-label={`Abrir carrinho${totalItems > 0 ? ` (${totalItems} ${totalItems === 1 ? 'item' : 'itens'})` : ''}`}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path
            fill="currentColor"
            d="M7 4h-2l-1 2v2h2l3.6 7.59-1.35 2.44A2 2 0 0 0 10 21h10v-2H10.42l1.1-2h7.45a2 2 0 0 0 1.8-1.11l3.24-5.88A1 1 0 0 0 23.12 8H7.45l-.94-2H4v2h2zM9 22a2 2 0 1 0 2-2 2 2 0 0 0-2 2m10 0a2 2 0 1 0 2-2 2 2 0 0 0-2 2"
          />
        </svg>
        {totalItems > 0 && <span className={styles.badge} aria-hidden="true">{totalItems}</span>}
      </button>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
