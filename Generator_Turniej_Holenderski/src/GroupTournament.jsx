import React from 'react';
import { Construction } from 'lucide-react';

export default function GroupTournament() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-2 sm:p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-900 mb-1 sm:mb-2 text-center">
            Turniej Grupowy
          </h1>
          <p className="text-sm sm:text-base text-gray-600 text-center mb-4 sm:mb-6 md:mb-8">
            System grupowy z fazą pucharową
          </p>

          <div className="flex flex-col items-center justify-center py-12 sm:py-20">
            <Construction className="text-purple-400 mb-6" size={80} />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-3">
              W trakcie budowy
            </h2>
            <p className="text-gray-500 text-center max-w-md">
              Ten moduł jest obecnie w fazie rozwoju. Wkrótce będzie dostępny!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
