'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';
import { useCart } from '@/lib/cart/useCart';
import styles from './CartDrawer.module.css';

type Phase = 'idle' | 'loading' | 'error';

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const items = useCart((s) => s.items);
  const totalValue = useCart((s) => s.totalValue());
  const increase = useCart((s) => s.increaseQuantity);
  const decrease = useCart((s) => s.decreaseQuantity);
  const remove = useCart((s) => s.removeItem);
  const clear = useCart((s) => s.clear);

  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  async function handleCheckout() {
    if (items.length === 0) return;
    setPhase('loading');
    setError(null);
    try {
      const res = await fetch(`${API_URL}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((it) => ({ productId: it.id, quantity: it.quantity })),
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(
          Array.isArray(body?.message) ? body.message.join(', ') : body?.message ?? 'Erro no checkout',
        );
      }
      if (!body.whatsappUrl) {
        throw new Error('Loja sem WhatsApp configurado.');
      }
      clear();
      window.location.href = body.whatsappUrl;
    } catch (err) {
      setError((err as Error).message);
      setPhase('error');
    }
  }

  if (!open) return null;

  return (
    <div className={styles.root} role="dialog" aria-modal="true" aria-labelledby="cart-title">
      <button
        type="button"
        className={styles.overlay}
        onClick={phase === 'loading' ? undefined : onClose}
        aria-label="Fechar carrinho"
      />
      <aside className={styles.panel} data-phase={phase}>
        <header className={styles.header}>
          <h2 id="cart-title">Seu carrinho</h2>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeBtn}
            aria-label="Fechar"
            disabled={phase === 'loading'}
          >
            ✕
          </button>
        </header>

        {items.length === 0 ? (
          <p className={styles.empty}>Carrinho vazio. Adicione produtos da vitrine.</p>
        ) : (
          <ul className={styles.list}>
            {items.map((it) => (
              <li key={it.id} className={styles.item}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{it.name}</span>
                  <span className={styles.itemPrice}>
                    R$ {(it.price * it.quantity).toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className={styles.qty} role="group" aria-label={`Quantidade de ${it.name}`}>
                  <button type="button" onClick={() => decrease(it.id)} aria-label="Diminuir">−</button>
                  <span aria-live="polite">{it.quantity}</span>
                  <button type="button" onClick={() => increase(it.id)} aria-label="Aumentar">+</button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(it.id)}
                  className={styles.removeBtn}
                  aria-label={`Remover ${it.name}`}
                >
                  remover
                </button>
              </li>
            ))}
          </ul>
        )}

        <footer className={styles.footer}>
          <div className={styles.total}>
            <span>Total</span>
            <strong>R$ {totalValue.toFixed(2).replace('.', ',')}</strong>
          </div>

          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={items.length === 0 || phase === 'loading'}
            className={styles.finishBtn}
            data-loading={phase === 'loading' ? 'true' : 'false'}
          >
            {phase === 'loading' ? 'IA processando pedido…' : 'Finalizar no WhatsApp'}
          </button>
        </footer>
      </aside>
    </div>
  );
}
