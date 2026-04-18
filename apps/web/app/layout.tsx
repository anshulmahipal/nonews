import type { Metadata } from 'next';
import { Providers } from './providers';
import { AppShell } from './components/AppShell';
import './globals.css';

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3005');

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'NoNews — Editorial summaries without the noise',
    template: '%s | NoNews',
  },
  description:
    '80-word editorial summaries from trusted sources. Stay informed, not overwhelmed. nonews.in',
  icons: {
    icon: '/icon.png',
  },
  openGraph: {
    siteName: 'NoNews',
    locale: 'en_IN',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased" suppressHydrationWarning>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
