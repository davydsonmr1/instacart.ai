import Link from 'next/link';
import styles from './page.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'InstaCart AI | O Futuro das Vendas Online',
  description: 'Crie sua loja inteligente em segundos com integração IA. Sem taxas, sem complicação.',
};

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <div className={styles.ambient} />
      <div className={styles.ambientSecondary} />
      
      <main className={styles.main}>
        <div className={styles.badge}>
          ✨ InstaCart AI Beta Disponível
        </div>
        
        <h1 className={styles.title}>
          O Futuro das Vendas <br/> Online com IA
        </h1>
        
        <p className={styles.description}>
          Construa sua vitrine inteligente em segundos. Uma plataforma rápida, minimalista e projetada para escalar o seu negócio diretamente pelo WhatsApp.
        </p>
        
        <div className={styles.ctas}>
          <Link href="/login" className={styles.primaryCta}>
            Criar Minha Loja Grátis
          </Link>
          <Link href="/admin" className={styles.secondaryCta}>
            Acessar Painel
          </Link>
        </div>
      </main>
    </div>
  );
}
