"use client";

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div style={{ color: 'white', padding: '3rem', fontFamily: 'var(--font-sans)' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Painel Administrativo</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Se você está lendo isso, a autenticação SSR funcionou perfeitamente e o Edge Middleware liberou a rota.
      </p>
      <button 
        onClick={handleLogout}
        style={{
           background: 'var(--accent)', color: 'black', fontWeight: 'bold', 
           padding: '10px 20px', borderRadius: '8px' 
        }}>
        Sair
      </button>
    </div>
  );
}
