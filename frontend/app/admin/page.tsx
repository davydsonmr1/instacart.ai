import Link from 'next/link';
import styles from './dashboard.module.css';

export default function AdminDashboard() {
  return (
    <section>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>
          Gerencie sua vitrine, edite produtos e receba pedidos direto no WhatsApp.
        </p>
      </header>

      <div className={styles.grid}>
        <Link href="/admin/products" className={styles.card}>
          <span className={styles.cardKicker}>Catálogo</span>
          <h2>Produtos</h2>
          <p>Cadastre nome, preço e imagem. Até 5 itens podem ir ao carrinho (plano Free).</p>
          <span className={styles.cardCta}>Abrir catálogo →</span>
        </Link>

        <Link href="/admin/profile" className={styles.card}>
          <span className={styles.cardKicker}>Loja</span>
          <h2>Perfil</h2>
          <p>Defina seu slug público, WhatsApp e bio. É assim que sua vitrine será indexada.</p>
          <span className={styles.cardCta}>Editar perfil →</span>
        </Link>
      </div>
    </section>
  );
}
