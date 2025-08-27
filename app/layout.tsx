import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pasanggiri - Sistem Penilaian Pencak Silat',
  description: 'Aplikasi penilaian kompetisi pencak silat Pasanggiri',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  );
}