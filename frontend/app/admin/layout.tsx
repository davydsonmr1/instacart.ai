import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './layout.module.css';
import { LogoutButton } from './LogoutButton';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar} aria-label="Navegação do painel">
        <div className={styles.brand}>
          InstaCart <span>AI</span>
        </div>
        <nav className={styles.nav}>
          <Link href="/admin" className={styles.navLink}>Dashboard</Link>
          <Link href="/admin/products" className={styles.navLink}>Produtos</Link>
          <Link href="/admin/profile" className={styles.navLink}>Perfil da Loja</Link>
        </nav>
        <div className={styles.footer}>
          <LogoutButton />
        </div>
      </aside>
      <main id="main-content" className={styles.content}>{children}</main>
    </div>
  );
}
