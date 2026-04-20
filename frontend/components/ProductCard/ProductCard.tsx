'use client';

import Image from 'next/image';
import styles from './ProductCard.module.css';

export interface ProductCardData {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <article className={styles.card} aria-label={`Produto ${product.name}`}>
      <div className={styles.thumb}>
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 480px) 50vw, 220px"
          />
        ) : (
          <span className={styles.placeholder} aria-hidden="true">
            Sem imagem
          </span>
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>
        <span className={styles.price}>
          R$ {product.price.toFixed(2).replace('.', ',')}
        </span>
      </div>
    </article>
  );
}
