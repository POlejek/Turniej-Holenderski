import React from 'react';
import { ArrowLeft, Users, Trophy, Calendar, Edit3, Download, RotateCcw, Play, CheckCircle } from 'lucide-react';

const InstrukcjaObslugi = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Powrót do menu
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📖 Instrukcja Obsługi</h1>
          <p className="text-gray-600">Kompleksowy przewodnik po systemie zarządzania turniejami</p>
        </div>

        {/* Turniej Holenderski */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users size={32} className="text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Turniej Holenderski</h2>
          </div>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            System turnieju holenderskiego to zaawansowany format rozgrywek dla grup zawodników, 
            gdzie uczestnicy grają na zmianę w różnych drużynach (wielkość drużyny ustalana przez użytkownika), 
            zapewniając zrównoważone i ekscytujące mecze.
          </p>

          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                Dodawanie zawodników
              </h3>
              <p className="text-gray-600 mb-2">
                Wprowadź imiona i nazwiska uczestników turnieju. System automatycznie:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Sprawdza unikalność nazw (automatyczne numerowanie duplikatów)</li>
                <li>Przypisuje zawodników do zrównoważonych drużyn</li>
                <li>Minimalizuje powtarzanie się par zawodników</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                Generowanie meczów
              </h3>
              <p className="text-gray-600">
                Kliknij przycisk <strong>"Generuj mecze"</strong>. System utworzy harmonogram rozgrywek, 
                dbając o to, aby każdy zawodnik miał równą liczbę meczów i różnych partnerów.
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                Wprowadzanie wyników
              </h3>
              <p className="text-gray-600 mb-2">
                Dla każdego meczu wprowadź wyniki w polach <strong>"Wynik 1"</strong> i <strong>"Wynik 2"</strong>:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Punkty są automatycznie dodawane do klasyfikacji zawodników</li>
                <li>Tabela aktualizuje się na bieżąco</li>
                <li>Ranking uwzględnia liczbę wygranych meczów przy równej liczbie punktów</li>
              </ul>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
                Funkcje dodatkowe
              </h3>
              <div className="space-y-2 text-gray-600">
                <p><strong>💾 Automatyczny zapis:</strong> Stan turnieju zapisuje się lokalnie w przeglądarce</p>
                <p><strong>🔄 Reset:</strong> Wyczyść wszystkie dane i rozpocznij nowy turniej</p>
                <p><strong>📊 Tabela wyników:</strong> Zawsze aktualna klasyfikacja z bilansem meczów</p>
              </div>
            </div>
          </div>
        </div>

        {/* Turniej Drużynowy */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Trophy size={32} className="text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Turniej Drużynowy</h2>
          </div>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            System zarządzania turniejami drużynowymi oferuje kompleksowe rozwiązanie dla trenerów, którzy organizują turnieje 
            typu "każdy z każdym" z zaawansowanymi funkcjami edycji i eksportu danych.
          </p>

          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Calendar size={20} className="text-blue-600" />
                Tworzenie harmonogramu
              </h3>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-1">1. Wprowadź dane podstawowe:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 text-sm">
                    <li><strong>Liczba drużyn:</strong> Minimum 2, maksimum 50 zespołów</li>
                    <li><strong>Liczba boisk:</strong> Określ dostępną infrastrukturę</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-1">2. Generuj harmonogram:</p>
                  <p className="text-gray-600 text-sm">
                    System wykorzystuje <strong>algorytm Bergera</strong> do utworzenia optymalnego 
                    harmonogramu, w którym każda drużyna zagra z każdą dokładnie jeden raz.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Edit3 size={20} className="text-green-600" />
                Zaawansowana edycja
              </h3>
              <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-1">Edycja drużyn:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 text-sm">
                    <li>Zmiana nazw drużyn z automatyczną walidacją unikalności</li>
                    <li>Dodawanie nowych drużyn w trakcie turnieju</li>
                    <li>Usuwanie drużyn (z systemem PAUSE dla drużyn z rozegranymi meczami)</li>
                    <li><strong>Wyniki są zachowywane</strong> podczas wszystkich edycji!</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-1">Edycja boisk:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 text-sm">
                    <li>Zmiana liczby dostępnych boisk</li>
                    <li>Automatyczne przeliczenie harmonogramu z zachowaniem wyników</li>
                    <li>Optymalizacja rozgrywek pod nową infrastrukturę</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Play size={20} className="text-purple-600" />
                Prowadzenie turnieju
              </h3>
              <div className="space-y-2">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-2">Wprowadzanie wyników:</p>
                  <p className="text-gray-600 text-sm mb-2">
                    Kliknij na mecz w harmonogramie i wprowadź wynik w formacie <strong>X:Y</strong>
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-green-600" />
                    <span>Tabela aktualizuje się automatycznie po każdym wyniku</span>
                  </div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-1">System punktacji:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 text-sm">
                    <li><strong>Wygrana:</strong> 3 punkty</li>
                    <li><strong>Remis:</strong> 1 punkt</li>
                    <li><strong>Przegrana:</strong> 0 punktów</li>
                    <li><strong>Ranking:</strong> Punkty → bilans bramek → bramki zdobyte</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Download size={20} className="text-orange-600" />
                Eksport danych
              </h3>
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">
                  Eksportuj kompletne dane turnieju do pliku CSV/Excel:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 text-sm">
                  <li><strong>Tabela wyników:</strong> Pełna klasyfikacja z wszystkimi statystykami</li>
                  <li><strong>Harmonogram:</strong> Wszystkie mecze z wynikami i czasami</li>
                  <li><strong>Format:</strong> CSV z polskimi znakami (UTF-8), separator średnik</li>
                  <li><strong>Kompatybilność:</strong> Bezpośrednie otwarcie w Microsoft Excel</li>
                </ul>
              </div>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <RotateCcw size={20} className="text-red-600" />
                Reset i zarządzanie danymi
              </h3>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">
                  <strong>💾 Automatyczny zapis:</strong> Wszystkie zmiany zapisywane lokalnie w przeglądarce
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>🔄 Reset turnieju:</strong> Wyczyść dane i rozpocznij od nowa (z potwierdzeniem)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Wskazówki i najlepsze praktyki */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-4">💡 Wskazówki i najlepsze praktyki</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <h3 className="font-semibold mb-2">🎯 Przed rozpoczęciem</h3>
              <ul className="text-sm space-y-1 opacity-90">
                <li>• Sprawdź liczbę uczestników/drużyn</li>
                <li>• Przygotuj listę nazw zawodników</li>
                <li>• Określ dostępne boiska (turniej drużynowy)</li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <h3 className="font-semibold mb-2">⚡ Podczas turnieju</h3>
              <ul className="text-sm space-y-1 opacity-90">
                <li>• Wprowadzaj wyniki na bieżąco</li>
                <li>• Regularnie eksportuj dane (backup)</li>
                <li>• Używaj edycji zamiast resetowania</li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <h3 className="font-semibold mb-2">🔒 Bezpieczeństwo danych</h3>
              <ul className="text-sm space-y-1 opacity-90">
                <li>• Dane zapisywane lokalnie w przeglądarce</li>
                <li>• Regularny eksport jako zabezpieczenie</li>
                <li>• Unikaj czyszczenia cache przeglądarki</li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <h3 className="font-semibold mb-2">🚀 Wydajność</h3>
              <ul className="text-sm space-y-1 opacity-90">
                <li>• System obsługuje {'>'} 10,000 użytkowników</li>
                <li>• Działa offline po pierwszym załadowaniu</li>
                <li>• Responsywny design na wszystkich urządzeniach</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">❓ Często zadawane pytania</h2>
          <div className="space-y-4">
            <div className="border-b pb-3">
              <p className="font-semibold text-gray-800 mb-1">Czy mogę edytować drużyny po rozpoczęciu turnieju?</p>
              <p className="text-gray-600 text-sm">
                Tak! System zachowuje wszystkie wyniki podczas edycji nazw drużyn i liczby boisk. 
                Możesz także dodawać nowe drużyny lub usuwać istniejące.
              </p>
            </div>
            <div className="border-b pb-3">
              <p className="font-semibold text-gray-800 mb-1">Co się stanie jeśli wpiszę dwie drużyny/zawodników o tej samej nazwie?</p>
              <p className="text-gray-600 text-sm">
                System automatycznie doda numerację, np. "Drużyna A" → "Drużyna A (2)" → "Drużyna A (3)".
              </p>
            </div>
            <div className="border-b pb-3">
              <p className="font-semibold text-gray-800 mb-1">Czy dane są bezpieczne?</p>
              <p className="text-gray-600 text-sm">
                Wszystkie dane są zapisywane lokalnie w Twojej przeglądarce. Nie są wysyłane na żaden serwer. 
                Zalecamy regularne eksportowanie danych jako dodatkowe zabezpieczenie.
              </p>
            </div>
            <div className="border-b pb-3">
              <p className="font-semibold text-gray-800 mb-1">Jak długo przechowywane są dane?</p>
              <p className="text-gray-600 text-sm">
                Dane są przechowywane w przeglądarce do momentu ręcznego usunięcia lub wyczyszczenia cache. 
                Możesz mieć wiele turniejów jednocześnie w różnych kartach przeglądarki.
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-1">Czy mogę używać aplikacji offline?</p>
              <p className="text-gray-600 text-sm">
                Tak! Po pierwszym załadowaniu aplikacja działa offline. Wymaga połączenia z internetem 
                tylko przy pierwszym otwarciu lub aktualizacji.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            Generator Turniejów • Wersja 2.0 • System Holenderski & Drużynowy
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstrukcjaObslugi;
