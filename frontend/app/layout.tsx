import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'InstaCart AI',
    template: '%s | InstaCart AI',
  },
  description: 'Vitrine e checkout via WhatsApp para micro-lojistas, com mensagens geradas por IA.',
  applicationName: 'InstaCart AI',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <a href="#main-content" className="skip-link">
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
