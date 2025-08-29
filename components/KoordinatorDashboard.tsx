'use client';

import { useState, useEffect } from 'react';
import { User, Competition } from '@/types';
import RankingView from './RankingView';
import ResultsView from './ResultsView';

interface Props {
  user: User;
  activeTab?: string;
}

export default function KoordinatorDashboard({ user, activeTab: externalActiveTab }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'competitions' | 'results' | 'details'>(externalActiveTab as any || 'overview');
  
  useEffect(() => {
    if (externalActiveTab) {
      setActiveTab(externalActiveTab as any);
    }
  }, [externalActiveTab]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  
  const kelas = user.role === 'KOORDINATOR_PUTRA' ? 'PUTRA' : 'PUTRI';

  useEffect(() => {
    fetchCompetitions();
  }, [kelas]);

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

  const activeCompetitions = competitions.filter(c => c.status === 'ACTIVE');
  const completedCompetitions = competitions.filter(c => c.status === 'COMPLETED');

  return (
    <div className="space-y-6">


      {activeTab === 'overview' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Dashboard Koordinator {kelas}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Sesi Aktif</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{activeCompetitions.length}</p>
            </div>
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Sesi Selesai</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{completedCompetitions.length}</p>
            </div>
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Sesi</h3>
              <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">{competitions.length}</p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Sesi Aktif Saat Ini</h3>
            {activeCompetitions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">Tidak ada sesi aktif untuk kelas {kelas}</p>
            ) : (
              <div className="space-y-3">
                {activeCompetitions.map(competition => (
                  <div key={competition.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{competition.desa} - {competition.kategori}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{competition.golongan} {competition.kelas}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-1 rounded-full text-xs">
                        AKTIF
                      </span>
                      <button
                        onClick={() => toggleCompetitionStatus(competition)}
                        className="bg-red-100 text-red-700 hover:bg-red-200 text-xs px-2 py-1 rounded"
                      >
                        Selesai
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'competitions' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Supervisi Sesi - {kelas}</h2>
          
          <div className="card">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Semua Sesi</h3>
            {competitions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">Belum ada sesi pertandingan untuk kelas {kelas}</p>
            ) : (
              <div className="space-y-3">
                {competitions.map(competition => (
                  <div key={competition.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{competition.desa} - {competition.kategori}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{competition.golongan} {competition.kelas}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(competition.created_at).toLocaleString()}</p>
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'results' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Ranking & Hasil - {kelas}</h2>
          <RankingView kelas={kelas} />
        </div>
      )}

      {activeTab === 'details' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Detail Penilaian - {kelas}</h2>
          <ResultsView kelas={kelas} />
        </div>
      )}
    </div>
  );
}