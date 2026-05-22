import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MotoFinance — Controle financeiro para entregadores',
  description:
    'Saiba quanto você realmente ganha. MotoFinance calcula seu lucro líquido incluindo combustível, manutenção e todos os custos.',
  applicationName: 'MotoFinance',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MotoFinance'
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0B0F' }
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-dvh bg-bg text-fg antialiased">{children}</body>
    </html>
  );
}
