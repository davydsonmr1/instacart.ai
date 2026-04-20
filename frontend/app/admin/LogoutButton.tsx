'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import styles from './layout.module.css';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <button type="button" onClick={handleLogout} className={styles.logout} aria-label="Sair da conta">
      Sair
    </button>
  );
}
