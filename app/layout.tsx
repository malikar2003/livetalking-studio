import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Avaada Electro — Virtual Tour',
  description: 'Explore our advanced solar manufacturing ecosystem.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#182e7b',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:wght@400;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
