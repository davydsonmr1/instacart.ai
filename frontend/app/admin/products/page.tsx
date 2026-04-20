'use client';

import Image from 'next/image';
import { useEffect, useState, type FormEvent } from 'react';
import { api, type Product } from '@/lib/api';
import styles from './products.module.css';

export default function AdminProductsPage() {
  const [items, setItems] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function refresh() {
    try {
      const data = await api.get<Product[]>('/products/mine');
      setItems(data);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setItems([]);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Remover este produto?')) return;
    try {
      await api.del(`/products/${id}`);
      setItems((prev) => prev?.filter((p) => p.id !== id) ?? null);
    } catch (e) {
      alert((e as Error).message);
    }
  }

  return (
    <section>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Produtos</h1>
          <p className={styles.subtitle}>
            {items ? `${items.length} ${items.length === 1 ? 'item cadastrado' : 'itens cadastrados'}` : 'Carregando…'}
          </p>
        </div>
        <button type="button" className={styles.primary} onClick={() => setModalOpen(true)}>
          + Novo produto
        </button>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.grid}>
        {items?.map((p) => (
          <article key={p.id} className={styles.card}>
            <div className={styles.thumb}>
              {p.image_url ? (
                <Image src={p.image_url} alt={p.name} fill sizes="(max-width: 720px) 50vw, 240px" />
              ) : (
                <span className={styles.noImage}>Sem imagem</span>
              )}
            </div>
            <div className={styles.cardBody}>
              <h3>{p.name}</h3>
              <span className={styles.price}>R$ {p.price.toFixed(2).replace('.', ',')}</span>
              <button
                type="button"
                onClick={() => handleDelete(p.id)}
                className={styles.deleteBtn}
                aria-label={`Remover ${p.name}`}
              >
                Remover
              </button>
            </div>
          </article>
        ))}

        {items?.length === 0 && (
          <div className={styles.empty}>
            <p>Você ainda não cadastrou produtos.</p>
            <button type="button" className={styles.primary} onClick={() => setModalOpen(true)}>
              Cadastrar o primeiro
            </button>
          </div>
        )}
      </div>

      {modalOpen && (
        <CreateModal
          onClose={() => setModalOpen(false)}
          onCreated={(p) => {
            setItems((prev) => (prev ? [p, ...prev] : [p]));
            setModalOpen(false);
          }}
        />
      )}
    </section>
  );
}

function CreateModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (p: Product) => void;
}) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const priceNum = Number(price.replace(',', '.'));
    if (!name.trim() || name.trim().length < 2) {
      setError('Nome deve ter pelo menos 2 caracteres.');
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setError('Preço deve ser positivo.');
      return;
    }

    const form = new FormData();
    form.append('name', name.trim());
    form.append('price', String(priceNum));
    if (file) form.append('image', file);

    setSubmitting(true);
    try {
      const created = await api.postForm<Product>('/products', form);
      onCreated(created);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button
        type="button"
        className={styles.backdropClose}
        aria-label="Fechar modal"
        onClick={onClose}
      />
      <div className={styles.modal}>
        <header className={styles.modalHeader}>
          <h2 id="modal-title">Novo produto</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className={styles.closeBtn}>
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span>Nome</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              required
              placeholder="Camiseta Onyx"
            />
          </label>

          <label className={styles.field}>
            <span>Preço (R$)</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min={0.01}
              step={0.01}
              required
              placeholder="89,90"
            />
          </label>

          <label className={styles.field}>
            <span>Imagem</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <small>JPEG/PNG/WebP, máx 5MB</small>
          </label>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.ghost} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className={styles.primary} disabled={submitting}>
              {submitting ? 'Salvando…' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
