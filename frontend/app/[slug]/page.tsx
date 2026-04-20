import { notFound } from 'next/navigation';
import { cache } from 'react';
import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { CartButton } from '@/components/CartDrawer/CartButton';
import { StoreHeader, type StoreProfile } from './StoreHeader';
import { ProductGrid, type PublicProduct } from './ProductGrid';
import styles from './storefront.module.css';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const RESERVED = new Set(['admin', 'login', 'auth', 'api', '_next', 'favicon.ico']);

const loadStore = cache(async (slug: string) => {
  const normalized = slug.toLowerCase();
  if (RESERVED.has(normalized)) return null;

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, slug, store_name, whatsapp, bio')
    .eq('slug', normalized)
    .maybeSingle();

  if (!profile) return null;

  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, image_url')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false });

  return {
    profile: profile as StoreProfile,
    products: (products ?? []) as PublicProduct[],
  };
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const store = await loadStore(slug);
  if (!store) {
    return { title: 'Loja não encontrada | InstaCart AI' };
  }
  const title = `${store.profile.store_name} | InstaCart AI`;
  const description =
    store.profile.bio ?? `Confira a vitrine de ${store.profile.store_name} e peça pelo WhatsApp.`;
  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function Storefront({ params }: PageProps) {
  const { slug } = await params;
  const store = await loadStore(slug);
  if (!store) notFound();

  return (
    <div className={styles.page}>
      <div className={styles.ambient} aria-hidden="true" />
      <StoreHeader profile={store.profile} />
      <main id="main-content" className={styles.main}>
        {store.products.length === 0 ? (
          <p className={styles.empty}>Esta loja ainda não publicou produtos.</p>
        ) : (
          <ProductGrid products={store.products} storeId={store.profile.id} />
        )}
      </main>
      <footer className={styles.footer}>
        Feito com <span>InstaCart AI</span>
      </footer>
      <CartButton />
    </div>
  );
}
