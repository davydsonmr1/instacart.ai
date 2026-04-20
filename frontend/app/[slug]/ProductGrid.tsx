'use client';

import { ProductCard, type ProductCardData } from '@/components/ProductCard/ProductCard';
import { useCart } from '@/lib/cart/useCart';
import styles from './storefront.module.css';

export interface PublicProduct extends ProductCardData {}

export function ProductGrid({
  products,
  storeId,
}: {
  products: PublicProduct[];
  storeId: string;
}) {
  const addItem = useCart((s) => s.addItem);

  return (
    <div className={styles.grid}>
      {products.map((p, i) => (
        <ProductCard
          key={p.id}
          product={p}
          priority={i === 0}
          onAdd={(product) => addItem({ ...product, storeId })}
        />
      ))}
    </div>
  );
}
