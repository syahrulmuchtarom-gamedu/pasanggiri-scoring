import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-primary-600 mb-2">PASANGGIRI</h1>
        <p className="text-gray-600 mb-8">Sistem Penilaian Pencak Silat</p>
        
        <div className="space-y-4">
          <Link href="/auth/login" className="btn-primary block w-full">
            Masuk ke Sistem
          </Link>
          
          <div className="text-sm text-gray-500">
            <p>Untuk JURI dan SIRKULATOR</p>
          </div>
        </div>
      </div>
    </div>
  );
}