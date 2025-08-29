'use client';

import { useState, useEffect } from 'react';
import { User, Competition, SCORING_CRITERIA } from '@/types';
import ScoringForm from './ScoringForm';

interface Props {
  user: User;
}

export default function JuriDashboard({ user }: Props) {
  const [activeCompetitions, setActiveCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  
  const kelas = user.role === 'JURI_PUTRA' ? 'PUTRA' : 'PUTRI';

  useEffect(() => {
    fetchActiveCompetitions();
  }, [kelas]);

  const fetchActiveCompetitions = async () => {
    try {
      const response = await fetch(`/api/competitions?status=ACTIVE&kelas=${kelas}`);
      if (response.ok) {
        const competitions = await response.json();
        setActiveCompetitions(competitions);
      }
    } catch (error) {
      console.error('Error fetching competitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreSubmitted = () => {
    setSelectedCompetition(null);
    fetchActiveCompetitions();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (selectedCompetition) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Form Penilaian</h2>
            <p className="text-gray-600 dark:text-gray-300">
              {selectedCompetition.desa} - {selectedCompetition.kategori} - {selectedCompetition.golongan} {selectedCompetition.kelas}
            </p>
          </div>
          <button
            onClick={() => setSelectedCompetition(null)}
            className="btn-secondary"
          >
            Kembali
          </button>
        </div>

        <ScoringForm
          competition={selectedCompetition}
          juriName={user.username}
          onSubmitted={handleScoreSubmitted}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Pertandingan Aktif - {kelas}</h2>
        
        {activeCompetitions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Tidak ada pertandingan aktif saat ini</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Tunggu SIRKULATOR mengaktifkan sesi pertandingan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCompetitions.map(competition => (
              <div key={competition.id} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">{competition.desa}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{competition.kategori}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{competition.golongan} {competition.kelas}</p>
                </div>
                
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Kriteria Penilaian:</p>
                  <div className="space-y-1">
                    {SCORING_CRITERIA[competition.kategori].map(criteria => (
                      <div key={criteria.name} className="text-xs text-gray-600 dark:text-gray-300">
                        {criteria.name}: {criteria.min}-{criteria.max}
                      </div>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedCompetition(competition)}
                  className="btn-primary w-full text-sm"
                >
                  Beri Nilai
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}