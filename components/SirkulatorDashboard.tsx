'use client';

import { useState, useEffect } from 'react';
import { User, Competition, DESA_LIST, GOLONGAN_LIST, KATEGORI_LIST } from '@/types';
import ResultsView from './ResultsView';

interface Props {
  user: User;
}

export default function SirkulatorDashboard({ user }: Props) {
  const [activeTab, setActiveTab] = useState<'control' | 'results'>('control');
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [creatingCompetition, setCreatingCompetition] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const kelas = user.role === 'SIRKULATOR_PUTRA' ? 'PUTRA' : 'PUTRI';

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const response = await fetch(`/api/competitions?kelas=${kelas}`);
        if (response.ok) {
          const data = await response.json();
          setCompetitions(data);
        }
      } catch (error) {
        console.error('Error fetching competitions:', error);
      }
    };

    fetchCompetitions();
  }, [kelas]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const createCompetition = async (desa: string, golongan: string, kategori: string) => {
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
        setCompetitions([...competitions, newCompetition]);
        showToast(`✅ Sesi ${desa} - ${kategori} berhasil dibuat!`, 'success');
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

  const isCompetitionCreated = (desa: string, golongan: string, kategori: string) => {
    return competitions.some(c => 
      c.desa === desa && c.golongan === golongan && c.kategori === kategori && c.kelas === kelas
    );
  };

  const isCompetitionCreating = (desa: string, golongan: string, kategori: string) => {
    const competitionKey = `${desa}-${golongan}-${kategori}-${kelas}`;
    return creatingCompetition === competitionKey;
  };

  const toggleCompetitionStatus = async (competition: Competition) => {
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
      }
    } catch (error) {
      console.error('Error updating competition:', error);
    }
  };

  const deleteCompetition = async (competitionId: string) => {
    if (!confirm('Yakin ingin menghapus sesi ini?')) return;
    
    try {
      const response = await fetch(`/api/competitions?id=${competitionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCompetitions(competitions.filter(c => c.id !== competitionId));
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
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab('control')}
          className={`pb-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'control'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Kontrol Pertandingan
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`pb-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'results'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Hasil Pertandingan
        </button>
      </div>

      {activeTab === 'control' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Buat Sesi Pertandingan Baru - {kelas}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DESA_LIST.map(desa => (
                <div key={desa} className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3">{desa}</h3>
                  
                  {GOLONGAN_LIST.map(golongan => (
                    <div key={golongan} className="mb-3">
                      <p className="text-sm font-medium text-gray-600 mb-2">{golongan}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {KATEGORI_LIST.map(kategori => {
                          const isCreated = isCompetitionCreated(desa, golongan, kategori);
                          const isCreating = isCompetitionCreating(desa, golongan, kategori);
                          
                          return (
                            <button
                              key={kategori}
                              onClick={() => createCompetition(desa, golongan, kategori)}
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
            <h2 className="text-lg font-semibold mb-4">Sesi Aktif</h2>
            
            {competitions.length === 0 ? (
              <p className="text-gray-500">Belum ada sesi pertandingan</p>
            ) : (
              <div className="space-y-3">
                {competitions.map(competition => (
                  <div key={competition.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{competition.desa} - {competition.kategori}</p>
                      <p className="text-sm text-gray-600">{competition.golongan} {competition.kelas}</p>
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
                        onClick={() => deleteCompetition(competition.id)}
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

      {activeTab === 'results' && (
        <div>
          <h2 className="text-xl font-semibold mb-6">Hasil Pertandingan - {kelas}</h2>
          <ResultsView kelas={kelas} />
        </div>
      )}
    </div>
  );
}