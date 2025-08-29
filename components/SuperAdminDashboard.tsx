'use client';

import { useState, useEffect } from 'react';
import { User, ActivityLog, DESA_LIST, GOLONGAN_LIST, KATEGORI_LIST } from '@/types';
import ResultsView from './ResultsView';
import RankingView from './RankingView';

interface Props {
  user: User;
  activeTab?: string;
}

export default function SuperAdminDashboard({ user, activeTab: externalActiveTab }: Props) {
  const [activeTab, setActiveTab] = useState<'users' | 'competitions' | 'details' | 'logs' | 'system'>(externalActiveTab as any || 'users');
  
  useEffect(() => {
    if (externalActiveTab) {
      setActiveTab(externalActiveTab as any);
    }
  }, [externalActiveTab]);
  const [competitionSubTab, setCompetitionSubTab] = useState<'putra' | 'putri'>('putra');
  const [competitionView, setCompetitionView] = useState<'control' | 'results'>('control');
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingCompetition, setCreatingCompetition] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    username: '',
    role: '',
    password: ''
  });

  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'JURI_PUTRA' as any
  });

  useEffect(() => {
    fetchUsers();
    fetchLogs();
    fetchCompetitions();
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

  const startEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setEditForm({
      username: userToEdit.username,
      role: userToEdit.role,
      password: ''
    });
  };

  const updateUser = async () => {
    if (!editingUser || !editForm.username || !editForm.role) return;
    
    setLoading(true);
    try {
      const updateData: any = {
        id: editingUser.id,
        username: editForm.username,
        role: editForm.role
      };
      
      if (editForm.password) {
        updateData.password = editForm.password;
      }

      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
        setEditingUser(null);
        setEditForm({ username: '', role: '', password: '' });
        
        await fetch('/api/activity-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            username: user.username,
            action: 'UPDATE_USER',
            details: `Mengupdate user: ${updatedUser.username} (${updatedUser.role})`
          }),
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetUserPassword = async (userId: string, username: string) => {
    if (!confirm(`Reset password user ${username} ke "password123"?`)) return;
    
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, password: 'password123' }),
      });

      if (response.ok) {
        await fetch('/api/activity-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            username: user.username,
            action: 'RESET_PASSWORD',
            details: `Reset password user: ${username}`
          }),
        });
        
        alert(`Password user ${username} berhasil direset ke "password123"`);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
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

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const createCompetition = async (desa: string, golongan: string, kategori: string, kelas: string) => {
    const competitionKey = `${desa}-${golongan}-${kategori}-${kelas}`;
    
    // Check if competition already exists
    const existingCompetition = competitions.find(c => 
      c.desa === desa && c.golongan === golongan && c.kategori === kategori && c.kelas === kelas
    );
    
    if (existingCompetition) {
      showToast(`⚠️ Sesi ${desa} - ${kategori} sudah ada sebelumnya`, 'info');
      return;
    }
    
    setCreatingCompetition(competitionKey);
    try {
      const response = await fetch('/api/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ desa, kelas, golongan, kategori }),
      });

      if (response.ok) {
        const newCompetition = await response.json();
        setCompetitions([newCompetition, ...competitions]);
        showToast(`✅ Sesi ${desa} - ${kategori} berhasil dibuat!`, 'success');
        
        await fetch('/api/activity-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            username: user.username,
            action: 'CREATE_COMPETITION',
            details: `Membuat sesi: ${desa} - ${kategori} (${kelas})`
          }),
        });
      } else {
        showToast(`❌ Gagal membuat sesi ${desa} - ${kategori}`, 'error');
      }
    } catch (error) {
      console.error('Error creating competition:', error);
      showToast(`❌ Gagal membuat sesi ${desa} - ${kategori}`, 'error');
    } finally {
      setCreatingCompetition(null);
    }
  };

  const isCompetitionCreated = (desa: string, golongan: string, kategori: string, kelas: string) => {
    return competitions.some(c => 
      c.desa === desa && c.golongan === golongan && c.kategori === kategori && c.kelas === kelas
    );
  };

  const isCompetitionCreating = (desa: string, golongan: string, kategori: string, kelas: string) => {
    const competitionKey = `${desa}-${golongan}-${kategori}-${kelas}`;
    return creatingCompetition === competitionKey;
  };

  const toggleCompetitionStatus = async (competition: any) => {
    try {
      const newStatus = competition.status === 'ACTIVE' ? 'COMPLETED' : 'ACTIVE';
      const response = await fetch(`/api/competitions/${competition.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setCompetitions(competitions.map(c => 
          c.id === competition.id ? { ...c, status: newStatus } : c
        ));
        
        await fetch('/api/activity-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            username: user.username,
            action: 'TOGGLE_COMPETITION_STATUS',
            details: `${newStatus === 'ACTIVE' ? 'Mengaktifkan' : 'Menyelesaikan'} sesi: ${competition.desa} - ${competition.kategori}`
          }),
        });
      }
    } catch (error) {
      console.error('Error updating competition:', error);
    }
  };

  const deleteCompetition = async (competitionId: string, competitionName: string) => {
    if (!confirm(`Yakin ingin menghapus sesi ${competitionName}?`)) return;
    
    try {
      const response = await fetch(`/api/competitions?id=${competitionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCompetitions(competitions.filter(c => c.id !== competitionId));
        
        await fetch('/api/activity-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            username: user.username,
            action: 'DELETE_COMPETITION',
            details: `Menghapus sesi: ${competitionName}`
          }),
        });
      }
    } catch (error) {
      console.error('Error deleting competition:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium ${
          toastType === 'success' ? 'bg-green-500' :
          toastType === 'error' ? 'bg-red-500' :
          'bg-blue-500'
        }`}>
          {toastMessage}
        </div>
      )}


      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Manajemen User</h2>
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
                  <option value="JURI_PUTRA">JURI PUTRA</option>
                  <option value="JURI_PUTRI">JURI PUTRI</option>
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

          {editingUser && (
            <div className="card">
              <h3 className="text-lg font-medium mb-4">Edit User: {editingUser.username}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={editForm.username}
                  onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                  className="border rounded px-3 py-2"
                />
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  className="border rounded px-3 py-2"
                >
                  <option value="JURI_PUTRA">JURI PUTRA</option>
                  <option value="JURI_PUTRI">JURI PUTRI</option>
                  <option value="SIRKULATOR_PUTRA">SIRKULATOR PUTRA</option>
                  <option value="SIRKULATOR_PUTRI">SIRKULATOR PUTRI</option>
                  <option value="KOORDINATOR_PUTRA">KOORDINATOR PUTRA</option>
                  <option value="KOORDINATOR_PUTRI">KOORDINATOR PUTRI</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
                <input
                  type="password"
                  placeholder="Password Baru (opsional)"
                  value={editForm.password}
                  onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                  className="border rounded px-3 py-2"
                />
              </div>
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={updateUser}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Update
                </button>
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setEditForm({ username: '', role: '', password: '' });
                  }}
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
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-2 text-gray-900 dark:text-white">Username</th>
                    <th className="text-left py-2 text-gray-900 dark:text-white">Role</th>
                    <th className="text-left py-2 text-gray-900 dark:text-white">Status</th>
                    <th className="text-left py-2 text-gray-900 dark:text-white">Dibuat</th>
                    <th className="text-left py-2 text-gray-900 dark:text-white">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b dark:border-gray-700">
                      <td className="py-2 text-gray-900 dark:text-gray-100">{u.username}</td>
                      <td className="py-2 text-gray-900 dark:text-gray-100">{u.role}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {u.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="py-2 text-gray-900 dark:text-gray-100">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="py-2">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => startEditUser(u)}
                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs px-2 py-1 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => resetUserPassword(u.id, u.username)}
                            className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 text-xs px-2 py-1 rounded"
                          >
                            Reset
                          </button>
                          <button
                            onClick={() => toggleUserStatus(u.id, u.is_active)}
                            className={`text-xs px-2 py-1 rounded ${
                              u.is_active 
                                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {u.is_active ? 'Off' : 'On'}
                          </button>
                          <button
                            onClick={() => deleteUser(u.id, u.username)}
                            className="bg-red-100 text-red-700 hover:bg-red-200 text-xs px-2 py-1 rounded"
                          >
                            Del
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

      {activeTab === 'competitions' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Kontrol Pertandingan</h2>
          
          {/* Class Tabs */}
          <div className="flex space-x-4 border-b">
            <button
              onClick={() => setCompetitionSubTab('putra')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                competitionSubTab === 'putra'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              KELAS PUTRA
            </button>
            <button
              onClick={() => setCompetitionSubTab('putri')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                competitionSubTab === 'putri'
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              KELAS PUTRI
            </button>
          </div>

          {/* Competition View Tabs */}
          <div className="flex space-x-4 border-b">
            <button
              onClick={() => setCompetitionView('control')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                competitionView === 'control'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Kontrol Pertandingan
            </button>
            <button
              onClick={() => setCompetitionView('results')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                competitionView === 'results'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Hasil Pertandingan
            </button>
          </div>

          {competitionView === 'control' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">
                  Buat Sesi Pertandingan Baru - {competitionSubTab.toUpperCase()}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {DESA_LIST.map(desa => (
                    <div key={desa} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">{desa}</h4>
                      
                      {GOLONGAN_LIST.map(golongan => (
                        <div key={golongan} className="mb-3">
                          <p className="text-sm font-medium text-gray-600 mb-2">{golongan}</p>
                          <div className="grid grid-cols-2 gap-2">
                            {KATEGORI_LIST.map(kategori => {
                              const isCreated = isCompetitionCreated(desa, golongan, kategori, competitionSubTab.toUpperCase());
                              const isCreating = isCompetitionCreating(desa, golongan, kategori, competitionSubTab.toUpperCase());
                              
                              return (
                                <button
                                  key={kategori}
                                  onClick={() => createCompetition(desa, golongan, kategori, competitionSubTab.toUpperCase())}
                                  disabled={isCreated || isCreating}
                                  className={`text-xs px-2 py-1 rounded font-medium transition-all duration-200 ${
                                    isCreated 
                                      ? 'bg-green-100 text-green-800 cursor-not-allowed'
                                      : isCreating
                                      ? 'bg-yellow-100 text-yellow-800 cursor-wait'
                                      : 'bg-primary-100 hover:bg-primary-200 text-primary-700 hover:shadow-sm'
                                  }`}
                                >
                                  {isCreated ? '✅ CREATED' : isCreating ? '⏳ Creating...' : kategori}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold mb-4">
                  Sesi {competitionSubTab.toUpperCase()} - Override Control
                </h3>
                
                {competitions.filter(c => c.kelas === competitionSubTab.toUpperCase()).length === 0 ? (
                  <p className="text-gray-500">Belum ada sesi pertandingan untuk kelas {competitionSubTab.toUpperCase()}</p>
                ) : (
                  <div className="space-y-3">
                    {competitions
                      .filter(c => c.kelas === competitionSubTab.toUpperCase())
                      .map(competition => (
                      <div key={competition.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{competition.desa} - {competition.kategori}</p>
                          <p className="text-sm text-gray-600">{competition.golongan} {competition.kelas}</p>
                          <p className="text-xs text-gray-500">{new Date(competition.created_at).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            competition.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {competition.status}
                          </span>
                          <button
                            onClick={() => toggleCompetitionStatus(competition)}
                            className="btn-secondary text-xs"
                          >
                            {competition.status === 'ACTIVE' ? 'Selesai' : 'Aktifkan'}
                          </button>
                          <button
                            onClick={() => deleteCompetition(competition.id, `${competition.desa} - ${competition.kategori}`)}
                            className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {competitionView === 'results' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Ranking & Hasil - {competitionSubTab.toUpperCase()}
              </h3>
              <RankingView kelas={competitionSubTab.toUpperCase() as 'PUTRA' | 'PUTRI'} />
            </div>
          )}
        </div>
      )}

      {activeTab === 'details' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Detail Penilaian</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Detail Penilaian PUTRA</h3>
              <ResultsView kelas="PUTRA" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Detail Penilaian PUTRI</h3>
              <ResultsView kelas="PUTRI" />
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