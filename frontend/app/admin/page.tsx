'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, type Profile } from '@/lib/api';
import styles from './dashboard.module.css';

export default function AdminDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await api.get<Profile>('/profiles/me');
        setProfile(me);
      } catch {
        /* ignore — user will see cards regardless */
      }
    })();
  }, []);

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      const { url } = await api.postJson<{ url: string }>('/payment/create-checkout', {});
      window.location.href = url;
    } catch (err) {
      alert((err as Error).message);
      setUpgrading(false);
    }
  }

  const isPremium = profile?.plan === 'premium';

  return (
    <section>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>
          Gerencie sua vitrine, edite produtos e receba pedidos direto no WhatsApp.
        </p>
      </header>

      {/* Banner de plano */}
      {profile && (
        <div className={isPremium ? styles.planPremium : styles.planFree}>
          <div className={styles.planInfo}>
            <span className={styles.planBadge} data-plan={profile.plan ?? 'free'}>
              {isPremium ? '⭐ Premium' : 'Free'}
            </span>
            <p className={styles.planText}>
              {isPremium
                ? 'Carrinho ilimitado ativo. Seus clientes podem adicionar quantos itens quiserem.'
                : 'Plano Free: máximo 5 itens no carrinho. Faça upgrade para remover o limite.'}
            </p>
          </div>
          {!isPremium && (
            <button
              type="button"
              className={styles.upgradeBtn}
              onClick={handleUpgrade}
              disabled={upgrading}
            >
              {upgrading ? 'Redirecionando…' : 'Desbloquear por R$9,99/mês →'}
            </button>
          )}
        </div>
      )}

      <div className={styles.grid}>
        <Link href="/admin/orders" className={styles.card}>
          <span className={styles.cardKicker}>Histórico</span>
          <h2>Pedidos</h2>
          <p>Acompanhe todos os pedidos recebidos, valores e status em tempo real.</p>
          <span className={styles.cardCta}>Ver pedidos →</span>
        </Link>

        <Link href="/admin/products" className={styles.card}>
          <span className={styles.cardKicker}>Catálogo</span>
          <h2>Produtos</h2>
          <p>Cadastre nome, preço e imagem. {isPremium ? 'Carrinho ilimitado.' : 'Até 5 itens (plano Free).'}</p>
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
