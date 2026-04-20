import Link from 'next/link';
import styles from './storefront.module.css';

export default function StoreNotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.ambient} aria-hidden="true" />
      <main className={styles.main} style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Loja não encontrada
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          O link que você acessou não existe ou foi removido.
        </p>
        <Link href="/" className={styles.whatsappLink}>
          Voltar para o início
        </Link>
      </main>
    </div>
  );
}
