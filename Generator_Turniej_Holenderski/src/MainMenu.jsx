import React, { useState } from 'react';
import { Shuffle, Users, BookOpen } from 'lucide-react';
import TurniejHolenderski from './Turniej_Holenderski';
import TeamTournamentMenu from './TeamTournamentMenu';
import InstrukcjaObslugi from './InstrukcjaObslugi';

export default function MainMenu() {
  const [selectedTournament, setSelectedTournament] = useState(null);

  if (selectedTournament === 'dutch') {
    return (
      <div>
        <button
          onClick={() => setSelectedTournament(null)}
          className="fixed top-4 left-4 z-10 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-200 flex items-center gap-2"
        >
          ← Powrót do menu
        </button>
        <TurniejHolenderski />
      </div>
    );
  }

  if (selectedTournament === 'team') {
    return <TeamTournamentMenu onBack={() => setSelectedTournament(null)} />;
  }

  if (selectedTournament === 'instructions') {
    return <InstrukcjaObslugi onBack={() => setSelectedTournament(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-2 sm:p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Przycisk Instrukcja */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setSelectedTournament('instructions')}
            className="bg-white hover:bg-blue-50 text-blue-600 font-semibold py-2 px-6 rounded-lg shadow-lg transition duration-200 flex items-center gap-2 border-2 border-blue-200 hover:border-blue-400"
          >
            <BookOpen size={20} />
            Instrukcja
          </button>
        </div>

        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-3 sm:mb-4">
            Generator Turniejów
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Wybierz typ turnieju, który chcesz zorganizować
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Dutch Tournament */}
          <button
            onClick={() => setSelectedTournament('dutch')}
            className="group bg-white hover:bg-gradient-to-br hover:from-orange-50 hover:to-yellow-50 rounded-2xl sm:rounded-3xl p-6 sm:p-10 transition duration-300 transform hover:scale-105 shadow-2xl border-2 border-transparent hover:border-orange-300"
          >
            <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6">
              <div className="bg-gradient-to-br from-orange-400 to-yellow-500 p-5 sm:p-6 rounded-full shadow-lg group-hover:shadow-xl transition duration-300">
                <Shuffle size={56} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">
                  Turniej Holenderski
                </h2>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Losowe zespoły co rundę - każdy zawodnik gra z różnymi partnerami
                </p>
              </div>
              <div className="pt-3 sm:pt-4 space-y-2 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <span>🎲</span>
                  <span>Losowe drużyny</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span>⚖️</span>
                  <span>Wyrównane rozgrywki</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span>📊</span>
                  <span>Ranking indywidualny</span>
                </div>
              </div>
            </div>
          </button>

          {/* Team Tournament */}
          <button
            onClick={() => setSelectedTournament('team')}
            className="group bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 rounded-2xl sm:rounded-3xl p-6 sm:p-10 transition duration-300 transform hover:scale-105 shadow-2xl border-2 border-transparent hover:border-blue-300"
          >
            <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-5 sm:p-6 rounded-full shadow-lg group-hover:shadow-xl transition duration-300">
                <Users size={56} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">
                  Turniej Drużyn
                </h2>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Stałe zespoły rywalizujące w różnych formatach rozgrywek
                </p>
              </div>
              <div className="pt-3 sm:pt-4 space-y-2 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <span>👥</span>
                  <span>Stałe drużyny</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span>🏆</span>
                  <span>Różne formaty</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span>📈</span>
                  <span>Tabele i statystyki</span>
                </div>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-12 sm:mt-16 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            🎯 Wybierz format i rozpocznij organizację turnieju w kilka kliknięć
          </p>
        </div>

        {/* Support Section */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-xl p-6 shadow-lg inline-block">
            <p className="text-sm sm:text-base text-gray-700 mb-3">
              Jeżeli chcesz mnie wesprzeć w rozwijaniu narzędzi
            </p>
            <a
              href="https://buymeacoffee.com/olejniczakd"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-200 transform hover:scale-105"
            >
              ☕ Kup mi kawę
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
