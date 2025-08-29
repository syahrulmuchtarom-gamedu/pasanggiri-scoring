'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import SirkulatorDashboard from '@/components/SirkulatorDashboard';
import JuriDashboard from '@/components/JuriDashboard';
import SuperAdminDashboard from '@/components/SuperAdminDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import KoordinatorDashboard from '@/components/KoordinatorDashboard';
import ViewerDashboard from '@/components/ViewerDashboard';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/auth/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p>Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/images/logo.png" 
                alt="Logo Pasanggiri" 
                className="h-10 w-10 object-contain"
              />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">PASANGGIRI</h1>
                <p className="text-sm text-gray-600">{user.username} - {user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary text-sm"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {user.role === 'SUPER_ADMIN' && <SuperAdminDashboard user={user} />}
        {user.role === 'ADMIN' && <AdminDashboard user={user} />}
        {(user.role === 'KOORDINATOR_PUTRA' || user.role === 'KOORDINATOR_PUTRI') && (
          <KoordinatorDashboard user={user} />
        )}
        {(user.role === 'SIRKULATOR_PUTRA' || user.role === 'SIRKULATOR_PUTRI') && (
          <SirkulatorDashboard user={user} />
        )}
        {(user.role === 'JURI_PUTRA' || user.role === 'JURI_PUTRI') && <JuriDashboard user={user} />}
        {user.role === 'VIEWER' && <ViewerDashboard user={user} />}
      </main>
    </div>
  );
}