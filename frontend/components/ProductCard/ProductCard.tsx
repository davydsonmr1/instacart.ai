'use client';

import Image from 'next/image';
import { useState } from 'react';
import styles from './ProductCard.module.css';

export interface ProductCardData {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
}

export function ProductCard({
  product,
  onAdd,
  priority = false,
}: {
  product: ProductCardData;
  onAdd?: (p: ProductCardData) => { ok: boolean; message?: string };
  priority?: boolean;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [added, setAdded] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  function handleAdd() {
    const result = onAdd?.(product) ?? { ok: true };
    if (result.ok) {
      setAdded(true);
      setWarning(null);
      window.setTimeout(() => setAdded(false), 1400);
    } else {
      setWarning(result.message ?? 'Não foi possível adicionar.');
      window.setTimeout(() => setWarning(null), 2400);
    }
  }

  return (
    <article className={styles.card} aria-label={`Produto ${product.name}`}>
      <div className={styles.thumb}>
        {product.image_url ? (
          <>
            {!imgLoaded && <div className={styles.skeleton} aria-hidden="true" />}
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 480px) 50vw, (max-width: 1024px) 33vw, 220px"
              className={styles.image}
              data-loaded={imgLoaded ? 'true' : 'false'}
              onLoad={() => setImgLoaded(true)}
              priority={priority}
            />
          </>
        ) : (
          <span className={styles.placeholder} aria-hidden="true">Sem imagem</span>
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>
        <span className={styles.price}>
          R$ {product.price.toFixed(2).replace('.', ',')}
        </span>

        <button
          type="button"
          onClick={handleAdd}
          className={styles.addButton}
          data-state={added ? 'added' : warning ? 'warn' : 'idle'}
          aria-label={`Adicionar ${product.name} ao carrinho`}
        >
          {added ? '✓ Adicionado' : warning ?? 'Adicionar'}
        </button>
      </div>
    </article>
  );
}
