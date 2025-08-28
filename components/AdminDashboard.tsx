'use client';

import { useState, useEffect } from 'react';
import { User, Competition, ActivityLog } from '@/types';
import ResultsView from './ResultsView';

interface Props {
  user: User;
}

export default function AdminDashboard({ user }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'competitions' | 'users' | 'logs'>('overview');
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    fetchCompetitions();
    fetchUsers();
    fetchLogs();
  }, []);

  const fetchCompetitions = async () => {
    try {
      const response = await fetch('/api/competitions');
      if (response.ok) {
        const data = await response.json();
        setCompetitions(data);
      }
    } catch (error) {
      console.error('Error fetching competitions:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.filter((u: User) => u.role !== 'SUPER_ADMIN'));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/activity-logs?limit=50');
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, is_active: !currentStatus }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(u => u.id === userId ? updatedUser : u));
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const activeCompetitions = competitions.filter(c => c.status === 'ACTIVE');
  const completedCompetitions = competitions.filter(c => c.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'overview'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('competitions')}
          className={`pb-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'competitions'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Pertandingan
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'users'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          User
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'logs'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Log Aktivitas
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Dashboard Admin</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900">Total User</h3>
              <p className="text-3xl font-bold text-primary-600">{users.length}</p>
            </div>
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900">Sesi Aktif</h3>
              <p className="text-3xl font-bold text-green-600">{activeCompetitions.length}</p>
            </div>
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900">Sesi Selesai</h3>
              <p className="text-3xl font-bold text-blue-600">{completedCompetitions.length}</p>
            </div>
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900">Total Sesi</h3>
              <p className="text-3xl font-bold text-gray-600">{competitions.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-medium mb-4">Sesi Aktif</h3>
              {activeCompetitions.length === 0 ? (
                <p className="text-gray-500">Tidak ada sesi aktif</p>
              ) : (
                <div className="space-y-2">
                  {activeCompetitions.slice(0, 5).map(comp => (
                    <div key={comp.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{comp.desa} - {comp.kategori}</p>
                        <p className="text-sm text-gray-600">{comp.golongan} {comp.kelas}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        AKTIF
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="text-lg font-medium mb-4">Aktivitas Terbaru</h3>
              <div className="space-y-2">
                {logs.slice(0, 5).map(log => (
                  <div key={log.id} className="p-2 bg-gray-50 rounded">
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-xs text-gray-600">{log.username} - {new Date(log.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'competitions' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Semua Pertandingan</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Kelas PUTRA</h3>
              <ResultsView kelas="PUTRA" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Kelas PUTRI</h3>
              <ResultsView kelas="PUTRI" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Manajemen User</h2>
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Username</th>
                    <th className="text-left py-2">Role</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b">
                      <td className="py-2">{u.username}</td>
                      <td className="py-2">{u.role}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {u.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => toggleUserStatus(u.id, u.is_active)}
                          className={`text-xs px-2 py-1 rounded ${
                            u.is_active 
                              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Log Aktivitas</h2>
          <div className="card">
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="border-b pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{log.action}</p>
                      <p className="text-sm text-gray-600">{log.details}</p>
                      <p className="text-xs text-gray-500">oleh: {log.username}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}