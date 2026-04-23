import { createClient } from '@/utils/supabase/client';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';

async function authHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Sessão expirada. Faça login novamente.');
  return { Authorization: `Bearer ${token}` };
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = body?.message ?? body?.error ?? res.statusText;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  async get<T>(path: string): Promise<T> {
    const headers = await authHeaders();
    return handle<T>(await fetch(`${API_URL}${path}`, { headers, cache: 'no-store' }));
  },

  async patchJson<T>(path: string, body: unknown): Promise<T> {
    const headers = await authHeaders();
    return handle<T>(
      await fetch(`${API_URL}${path}`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    );
  },

  async postForm<T>(path: string, form: FormData): Promise<T> {
    const headers = await authHeaders();
    return handle<T>(
      await fetch(`${API_URL}${path}`, { method: 'POST', headers, body: form }),
    );
  },

  async del<T>(path: string): Promise<T> {
    const headers = await authHeaders();
    return handle<T>(await fetch(`${API_URL}${path}`, { method: 'DELETE', headers }));
  },
};

export interface Product {
  id: string;
  user_id: string;
  name: string;
  price: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  slug: string;
  store_name: string;
  whatsapp: string | null;
  bio: string | null;
  bootstrap?: boolean;
  plan: 'free' | 'premium';
}
