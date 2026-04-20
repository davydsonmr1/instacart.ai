'use client';

import { ProductCard } from '@/components/ProductCard/ProductCard';
import styles from './storefront.module.css';

export interface PublicProduct {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
}

export function ProductGrid({
  products,
  whatsapp: _whatsapp,
}: {
  products: PublicProduct[];
  whatsapp: string | null;
}) {
  return (
    <div className={styles.grid}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
