'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { api, type Profile } from '@/lib/api';
import styles from './profile.module.css';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [slug, setSlug] = useState('');
  const [storeName, setStoreName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await api.get<Profile>('/profiles/me');
        setProfile(me);
        setSlug(me.slug ?? '');
        setStoreName(me.store_name ?? '');
        setWhatsapp(me.whatsapp ?? '');
        setBio(me.bio ?? '');
      } catch (e) {
        setStatus({ type: 'err', msg: (e as Error).message });
      }
    })();
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      const updated = await api.patchJson<Profile>('/profiles/me', {
        slug: slug.trim().toLowerCase() || undefined,
        store_name: storeName.trim() || undefined,
        whatsapp: whatsapp.replace(/\D/g, '') || undefined,
        bio: bio.trim() || undefined,
      });
      setProfile(updated);
      setStatus({ type: 'ok', msg: 'Perfil salvo com sucesso.' });
    } catch (err) {
      setStatus({ type: 'err', msg: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.wrap}>
      <header>
        <h1 className={styles.title}>Perfil da loja</h1>
        <p className={styles.subtitle}>
          Sua vitrine pública será: <code>/{slug || 'sua-loja'}</code>
        </p>
      </header>

      <form onSubmit={handleSave} className={styles.form}>
        <label className={styles.field}>
          <span>Slug (URL pública)</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            minLength={3}
            maxLength={40}
            pattern="[a-z0-9][a-z0-9-]*[a-z0-9]"
            placeholder="minha-loja"
          />
        </label>

        <label className={styles.field}>
          <span>Nome da loja</span>
          <input
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            minLength={2}
            maxLength={80}
            placeholder="Boutique Onyx"
          />
        </label>

        <label className={styles.field}>
          <span>WhatsApp (somente números, com DDI)</span>
          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric"
            maxLength={15}
            placeholder="5511988887777"
          />
        </label>

        <label className={styles.field}>
          <span>Bio</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={280}
            rows={3}
            placeholder="Peças selecionadas com estética minimalista."
          />
        </label>

        {status && (
          <div className={status.type === 'ok' ? styles.ok : styles.err} role="status">
            {status.msg}
          </div>
        )}

        <div className={styles.actions}>
          <button type="submit" className={styles.primary} disabled={submitting}>
            {submitting ? 'Salvando…' : 'Salvar'}
          </button>
        </div>

        {profile?.bootstrap && (
          <p className={styles.hint}>
            Esta é sua primeira vez aqui — preencha os dados e clique em salvar para publicar sua vitrine.
          </p>
        )}
      </form>
    </section>
  );
}
