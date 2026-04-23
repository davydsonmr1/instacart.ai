'use client';

import { useEffect, useState } from 'react';
import { api, type Order } from '@/lib/api';
import styles from './orders.module.css';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<Order[]>('/orders');
        setOrders(data);
      } catch (e) {
        setError((e as Error).message);
        setOrders([]);
      }
    })();
  }, []);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatCurrency(value: number) {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  }

  return (
    <section>
      <header className={styles.header}>
        <h1 className={styles.title}>Pedidos</h1>
        <p className={styles.subtitle}>
          {orders
            ? `${orders.length} ${orders.length === 1 ? 'pedido recebido' : 'pedidos recebidos'}`
            : 'Carregando…'}
        </p>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      {orders && orders.length === 0 && (
        <div className={styles.empty}>
          <p>Nenhum pedido recebido ainda.</p>
          <p>Quando um cliente finalizar uma compra pelo WhatsApp, o pedido aparecerá aqui.</p>
        </div>
      )}

      {orders && orders.length > 0 && (
        <div className={styles.list}>
          {orders.map((order) => (
            <article key={order.id} className={styles.order}>
              <div className={styles.orderHeader}>
                <div className={styles.orderMeta}>
                  <span className={styles.orderDate}>
                    {formatDate(order.created_at)}
                  </span>
                  <span className={styles.orderId}>
                    #{order.id.slice(0, 8)}
                  </span>
                </div>

                <div className={styles.orderRight}>
                  <span
                    className={styles.statusBadge}
                    data-status={order.status}
                  >
                    {order.status === 'pending' ? 'Pendente' : order.status === 'completed' ? 'Concluído' : order.status}
                  </span>
                  <span className={styles.orderTotal}>
                    {formatCurrency(order.total_amount)}
                  </span>
                  <button
                    type="button"
                    className={styles.toggleBtn}
                    onClick={() => toggle(order.id)}
                    aria-expanded={expanded.has(order.id)}
                    aria-controls={`items-${order.id}`}
                  >
                    {expanded.has(order.id) ? 'Ocultar' : 'Ver Itens'}
                  </button>
                </div>
              </div>

              {expanded.has(order.id) && (
                <div
                  className={styles.itemsPanel}
                  id={`items-${order.id}`}
                >
                  <table className={styles.itemsTable}>
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Qtd</th>
                        <th>Unitário</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td className={styles.itemPrice}>
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className={styles.itemPrice}>
                            {formatCurrency(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
