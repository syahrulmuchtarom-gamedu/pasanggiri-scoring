import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pasanggiri - Sistem Penilaian Pencak Silat',
  description: 'Aplikasi penilaian kompetisi pencak silat Pasanggiri',
  themeColor: '#000000',
  viewport: 'width=device-width, initial-scale=1',
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