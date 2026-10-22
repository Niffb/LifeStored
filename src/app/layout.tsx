import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LifeStored — Secure Digital Legacy & Vital Vault',
  description: 'Preserve what matters most. LifeStored is a calm, encrypted vault for your will, vital records and wishes, handed over safely to the people you trust.',
  keywords: ['digital legacy', 'vault', 'document storage', 'memory capsule', 'zero knowledge', 'life stored', 'estate planning'],
  authors: [{ name: 'LifeStored' }],
  openGraph: {
    title: 'LifeStored — Preserve What Matters Most',
    description: 'The tranquil, encrypted sanctuary for your vital records, family directives, and memories.',
    url: 'https://lifestored.com',
    siteName: 'LifeStored',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LifeStored — Coming Soon',
    description: 'Private beta opening soon. Reserve your priority spot.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <body>
        {children}
      </body>
    </html>
  );
}
