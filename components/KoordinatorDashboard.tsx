'use client';

import { useState, useEffect } from 'react';
import { User, Competition } from '@/types';
import ResultsView from './ResultsView';

interface Props {
  user: User;
}

export default function KoordinatorDashboard({ user }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'competitions' | 'results'>('overview');
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
          Supervisi Sesi
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`pb-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'results'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Hasil
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Dashboard Koordinator {kelas}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <div className="card">
            <h3 className="text-lg font-medium mb-4">Sesi Aktif Saat Ini</h3>
            {activeCompetitions.length === 0 ? (
              <p className="text-gray-500">Tidak ada sesi aktif untuk kelas {kelas}</p>
            ) : (
              <div className="space-y-3">
                {activeCompetitions.map(competition => (
                  <div key={competition.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                    <div>
                      <p className="font-medium">{competition.desa} - {competition.kategori}</p>
                      <p className="text-sm text-gray-600">{competition.golongan} {competition.kelas}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
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
          <h2 className="text-xl font-semibold">Supervisi Sesi - {kelas}</h2>
          
          <div className="card">
            <h3 className="text-lg font-medium mb-4">Semua Sesi</h3>
            {competitions.length === 0 ? (
              <p className="text-gray-500">Belum ada sesi pertandingan untuk kelas {kelas}</p>
            ) : (
              <div className="space-y-3">
                {competitions.map(competition => (
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
          <h2 className="text-xl font-semibold">Hasil Pertandingan - {kelas}</h2>
          <ResultsView kelas={kelas} />
        </div>
      )}
    </div>
  );
}