"use client";

import { createClient } from '@/utils/supabase/client';
import styles from './login.module.css';

export default function LoginPage() {
  const supabase = createClient();

  const handleLogin = async () => {
    // Redireciona o usuário para o Google.
    // Lembre-se, o redirectTo deve apontar para o nosso middleware central em /auth/callback
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Erro de Autenticação:', error.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.ambientGlow} />

      <main className={styles.glassCard}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            InstaCart <span>AI</span>
          </h1>
          <p className={styles.subtitle}>
            Acesse o painel do lojista usando sua conta Google.
          </p>
        </header>

        <button onClick={handleLogin} className={styles.googleBtn}>
          <svg className={styles.googleIcon} viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"
            />
          </svg>
          Entrar com Google
        </button>
      </main>
    </div>
  );
}
