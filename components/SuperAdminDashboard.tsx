'use client';

import { useState, useEffect } from 'react';
import { User, ActivityLog } from '@/types';

interface Props {
  user: User;
}

export default function SuperAdminDashboard({ user }: Props) {
  const [activeTab, setActiveTab] = useState<'users' | 'logs' | 'system'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);

  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'JURI' as any
  });

  useEffect(() => {
    fetchUsers();
    fetchLogs();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/activity-logs?limit=100');
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const createUser = async () => {
    if (!newUser.username || !newUser.password) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        const createdUser = await response.json();
        setUsers([createdUser, ...users]);
        setNewUser({ username: '', password: '', role: 'JURI' });
        setShowCreateUser(false);
        
        await fetch('/api/activity-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            username: user.username,
            action: 'CREATE_USER',
            details: `Membuat user baru: ${createdUser.username} (${createdUser.role})`
          }),
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
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
        
        await fetch('/api/activity-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            username: user.username,
            action: 'TOGGLE_USER_STATUS',
            details: `${!currentStatus ? 'Mengaktifkan' : 'Menonaktifkan'} user: ${updatedUser.username}`
          }),
        });
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const deleteUser = async (userId: string, username: string) => {
    if (!confirm(`Yakin ingin menghapus user ${username}?`)) return;
    
    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId));
        
        await fetch('/api/activity-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            username: user.username,
            action: 'DELETE_USER',
            details: `Menghapus user: ${username}`
          }),
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const exportData = async (type: string) => {
    try {
      let data, filename;
      
      switch (type) {
        case 'users':
          data = users;
          filename = 'users-export.json';
          break;
        case 'competitions':
          const compResponse = await fetch('/api/competitions');
          data = await compResponse.json();
          filename = 'competitions-export.json';
          break;
        case 'scores':
          const scoresResponse = await fetch('/api/scores');
          data = await scoresResponse.json();
          filename = 'scores-export.json';
          break;
        case 'logs':
          data = logs;
          filename = 'activity-logs-export.json';
          break;
        default:
          return;
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          username: user.username,
          action: 'EXPORT_DATA',
          details: `Export data: ${type}`
        }),
      });
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const resetAllPasswords = async () => {
    if (!confirm('Yakin ingin reset semua password ke "password123"?')) return;
    
    try {
      for (const u of users) {
        await fetch('/api/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: u.id, password: 'password123' }),
        });
      }
      
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          username: user.username,
          action: 'RESET_ALL_PASSWORDS',
          details: 'Reset semua password user ke default'
        }),
      });
      
      alert('Semua password berhasil direset ke "password123"');
    } catch (error) {
      console.error('Error resetting passwords:', error);
    }
  };

  const clearLogs = async () => {
    if (!confirm('Yakin ingin menghapus log aktivitas lama (>30 hari)?')) return;
    
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Filter logs yang akan dihapus
      const logsToDelete = logs.filter(log => new Date(log.created_at) < thirtyDaysAgo);
      
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          username: user.username,
          action: 'CLEAR_OLD_LOGS',
          details: `Menghapus ${logsToDelete.length} log lama`
        }),
      });
      
      fetchLogs(); // Refresh logs
      alert(`${logsToDelete.length} log lama berhasil dihapus`);
    } catch (error) {
      console.error('Error clearing logs:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'users'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Manajemen User
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
        <button
          onClick={() => setActiveTab('system')}
          className={`pb-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'system'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Sistem
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Manajemen User</h2>
            <button
              onClick={() => setShowCreateUser(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
            >
              Tambah User
            </button>
          </div>

          {showCreateUser && (
            <div className="card">
              <h3 className="text-lg font-medium mb-4">Buat User Baru</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="border rounded px-3 py-2"
                />
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as any})}
                  className="border rounded px-3 py-2"
                >
                  <option value="JURI">JURI</option>
                  <option value="SIRKULATOR_PUTRA">SIRKULATOR PUTRA</option>
                  <option value="SIRKULATOR_PUTRI">SIRKULATOR PUTRI</option>
                  <option value="KOORDINATOR_PUTRA">KOORDINATOR PUTRA</option>
                  <option value="KOORDINATOR_PUTRI">KOORDINATOR PUTRI</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              </div>
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={createUser}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Buat
                </button>
                <button
                  onClick={() => setShowCreateUser(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Username</th>
                    <th className="text-left py-2">Role</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Dibuat</th>
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
                      <td className="py-2">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="py-2">
                        <div className="flex space-x-2">
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
                          <button
                            onClick={() => deleteUser(u.id, u.username)}
                            className="bg-red-100 text-red-700 hover:bg-red-200 text-xs px-2 py-1 rounded"
                          >
                            Hapus
                          </button>
                        </div>
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

      {activeTab === 'system' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Sistem</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-medium mb-4">Export Data</h3>
              <div className="space-y-3">
                <button
                  onClick={() => exportData('users')}
                  className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded"
                >
                  Export Data User
                </button>
                <button
                  onClick={() => exportData('competitions')}
                  className="w-full bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 rounded"
                >
                  Export Data Pertandingan
                </button>
                <button
                  onClick={() => exportData('scores')}
                  className="w-full bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-2 rounded"
                >
                  Export Data Nilai
                </button>
                <button
                  onClick={() => exportData('logs')}
                  className="w-full bg-orange-100 text-orange-700 hover:bg-orange-200 px-4 py-2 rounded"
                >
                  Export Log Aktivitas
                </button>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-medium mb-4">Statistik Sistem</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total User:</span>
                  <span className="font-medium">{users.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>User Aktif:</span>
                  <span className="font-medium text-green-600">{users.filter(u => u.is_active).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Log:</span>
                  <span className="font-medium">{logs.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sistem:</span>
                  <span className="font-medium text-blue-600">Online</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium mb-4">Konfigurasi Sistem</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => resetAllPasswords()}
                className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-4 py-2 rounded"
              >
                Reset Semua Password
              </button>
              <button
                onClick={() => clearLogs()}
                className="bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded"
              >
                Hapus Log Lama
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}