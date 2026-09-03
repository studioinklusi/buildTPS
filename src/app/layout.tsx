import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Inklusi TPS Spatial Intelligence — Kab. Banjarnegara',
  description:
    'Sistem Pendukung Keputusan Spasial (SDSS) Berbasis WebGIS untuk Rekomendasi Lokasi Prioritas Pembangunan TPS di Kabupaten Banjarnegara.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <body className={`${inter.className} h-full bg-slate-950 text-slate-100`}>
        {children}
      </body>
    </html>
  );
}
