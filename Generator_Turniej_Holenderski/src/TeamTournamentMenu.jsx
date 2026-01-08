import React, { useState } from 'react';
import { ArrowLeft, Users, Grid } from 'lucide-react';
import TournamentScheduler from './TournamentScheduler';
import GroupTournament from './GroupTournament';

export default function TeamTournamentMenu({ onBack }) {
  const [selectedMode, setSelectedMode] = useState(null);

  if (selectedMode === 'round-robin') {
    return (
      <div>
        <button
          onClick={() => setSelectedMode(null)}
          className="fixed top-4 left-4 z-10 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-200 flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Wstecz
        </button>
        <TournamentScheduler />
      </div>
    );
  }

  if (selectedMode === 'group') {
    return (
      <div>
        <button
          onClick={() => setSelectedMode(null)}
          className="fixed top-4 left-4 z-10 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-200 flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Wstecz
        </button>
        <GroupTournament />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-2 sm:p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="mb-4 sm:mb-6 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-200 flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Powrót do menu głównego
        </button>

        <div className="bg-white rounded-lg sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 text-center">
            Turniej Drużyn
          </h1>
          <p className="text-sm sm:text-base text-gray-600 text-center mb-8 sm:mb-12">
            Wybierz typ rozgrywek
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Round Robin Tournament */}
            <button
              onClick={() => setSelectedMode('round-robin')}
              className="group bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl sm:rounded-2xl p-6 sm:p-8 transition duration-300 transform hover:scale-105 shadow-xl"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-white/20 p-4 rounded-full">
                  <Users size={48} className="text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold">
                  Każdy z każdym
                </h2>
                <p className="text-sm sm:text-base text-blue-100">
                  System Bergera - wszystkie drużyny grają ze sobą
                </p>
                <div className="pt-2 text-xs sm:text-sm text-blue-200">
                  📊 Tabela wynikowa<br />
                  ⚽ Pełna statystyka<br />
                  🏟️ Wiele boisk
                </div>
              </div>
            </button>

            {/* Group Tournament */}
            <button
              onClick={() => setSelectedMode('group')}
              className="group bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl sm:rounded-2xl p-6 sm:p-8 transition duration-300 transform hover:scale-105 shadow-xl"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-white/20 p-4 rounded-full">
                  <Grid size={48} className="text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold">
                  Turniej Grupowy
                </h2>
                <p className="text-sm sm:text-base text-purple-100">
                  System Swiss + Playoff
                </p>
                <div className="pt-2 text-xs sm:text-sm text-purple-200">
                  🔄 Parowanie wg punktów<br />
                  🏆 Play-off<br />
                  👑 Wielki finał
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
