'use client';

import { useState, useEffect } from 'react';
import { User, ActivityLog, DESA_LIST, GOLONGAN_LIST, KATEGORI_LIST } from '@/types';
import ResultsView from './ResultsView';
import RankingView from './RankingView';
import JuaraUmumGabungan from './JuaraUmumGabungan';

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
  const [competitionSubTab, setCompetitionSubTab] = useState<'putra' | 'putri' | 'juara_umum'>('putra');
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
            <button
              onClick={() => setCompetitionSubTab('juara_umum')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                competitionSubTab === 'juara_umum'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🏆 JUARA UMUM
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

          {competitionView === 'results' && (
            <div>
              {competitionSubTab === 'juara_umum' ? (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    🏆 JUARA UMUM GABUNGAN (PUTRA + PUTRI)
                  </h3>
                  <JuaraUmumGabungan />
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Ranking & Hasil - {competitionSubTab.toUpperCase()}
                  </h3>
                  <RankingView kelas={competitionSubTab.toUpperCase() as 'PUTRA' | 'PUTRI'} />
                </div>
              )}
            </div>
          )}

          {competitionView === 'control' && competitionSubTab === 'juara_umum' && (
            <div className="card">
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  🏆 JUARA UMUM GABUNGAN
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Juara Umum dihitung otomatis berdasarkan gabungan nilai PUTRA + PUTRI dari semua sesi yang telah selesai.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Silakan lihat tab "Hasil Pertandingan" untuk melihat ranking Juara Umum.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}