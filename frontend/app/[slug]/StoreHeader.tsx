import styles from './storefront.module.css';

export interface StoreProfile {
  id: string;
  slug: string;
  store_name: string;
  whatsapp: string | null;
  bio: string | null;
}

export function StoreHeader({ profile }: { profile: StoreProfile }) {
  const initials = profile.store_name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className={styles.header}>
      <div className={styles.avatar} aria-hidden="true">
        <span>{initials}</span>
      </div>
      <h1 className={styles.storeName}>{profile.store_name}</h1>
      {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
      {profile.whatsapp && (
        <a
          href={`https://wa.me/${profile.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.whatsappLink}
          aria-label="Abrir conversa no WhatsApp"
        >
          WhatsApp →
        </a>
      )}
    </header>
  );
}
