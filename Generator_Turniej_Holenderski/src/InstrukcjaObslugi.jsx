import React from 'react';
import { ArrowLeft, Users, Trophy, Calendar, Edit3, Download, RotateCcw, Play, CheckCircle, Clipboard, Settings } from 'lucide-react';

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
            <div className="bg-orange-100 p-3 rounded-lg">
              <Users size={32} className="text-orange-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Turniej Holenderski</h2>
          </div>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            System turnieju holenderskiego to zaawansowany format rozgrywek dla grup zawodników, 
            gdzie uczestnicy grają na zmianę w losowo dobieranych drużynach, 
            zapewniając zrównoważone i ekscytujące mecze z różnymi partnerami.
          </p>

          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                Konfiguracja turnieju
              </h3>
              <p className="text-gray-600 mb-2">
                Ustaw podstawowe parametry turnieju:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li><strong>Liczba zawodników:</strong> Minimum 4 uczestników</li>
                <li><strong>Liczba boisk:</strong> Określ dostępną infrastrukturę</li>
                <li><strong>Zawodników na drużynę:</strong> Ustal wielkość drużyn (np. 2v2, 3v3)</li>
                <li><strong>Liczba rund:</strong> System podpowiada optymalną liczbę</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                Wprowadzanie zawodników
              </h3>
              <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Clipboard size={16} className="text-green-600" />
                    Wklej z Excela (NOWOŚĆ!)
                  </p>
                  <p className="text-gray-600 text-sm mb-2">
                    Kliknij przycisk <strong>"📋 Wklej z Excela"</strong> aby szybko wprowadzić zawodników:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 text-sm">
                    <li>Skopiuj kolumnę z Excela z imionami zawodników</li>
                    <li>Wklej do pola tekstowego (każde imię w nowej linii)</li>
                    <li>System automatycznie sprawdzi liczbę zawodników</li>
                    <li>Zatwierdź, aby uzupełnić wszystkie pola na raz</li>
                  </ul>
                </div>
                <p className="text-gray-600 text-sm">
                  <strong>Lub wprowadź ręcznie:</strong> Wypełnij pola jeden po drugim. System automatycznie 
                  sprawdza unikalność nazw i numeruje duplikaty (np. "Jan (2)", "Jan (3)").
                </p>
              </div>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                Dostosowanie punktacji
              </h3>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">
                  Przed generowaniem meczów możesz dostosować system punktacji:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 text-sm">
                  <li><strong>Punkty za wygraną:</strong> Domyślnie 10 pkt</li>
                  <li><strong>Punkty za remis:</strong> Domyślnie 5 pkt</li>
                  <li><strong>Punkty za przegraną:</strong> Domyślnie 0 pkt</li>
                  <li><strong>Punkty za bramkę:</strong> Dodatkowe punkty za każdą zdobytą bramkę</li>
                </ul>
              </div>
            </div>

            <div className="border-l-4 border-indigo-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
                Generowanie meczów
              </h3>
              <p className="text-gray-600 mb-2">
                Kliknij <strong>"Generuj mecze"</strong>. System wykorzystuje inteligentny algorytm:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Równomierna dystrybucja meczów między zawodnikami</li>
                <li>Minimalizacja powtarzających się par partnerów</li>
                <li>Optymalne wykorzystanie dostępnych boisk</li>
                <li>Unikanie następujących po sobie meczów tego samego zawodnika</li>
              </ul>
            </div>

            <div className="border-l-4 border-pink-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">5</span>
                Wprowadzanie wyników
              </h3>
              <div className="space-y-2">
                <p className="text-gray-600 text-sm">
                  Dla każdego meczu wprowadź wyniki w polach <strong>"Wynik 1"</strong> i <strong>"Wynik 2"</strong>
                </p>
                <div className="bg-pink-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-1 text-sm">Punktacja automatyczna:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 text-xs">
                    <li>Punkty za wynik (wygrana/remis/przegrana)</li>
                    <li>Dodatkowe punkty za każdą zdobytą bramkę</li>
                    <li>Tabela aktualizuje się na bieżąco</li>
                    <li>Ranking sortuje po punktach, następnie po wygranych</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">6</span>
                Funkcje dodatkowe
              </h3>
              <div className="space-y-2 text-gray-600 text-sm">
                <p><strong>📊 Tabela wyników:</strong> Zawsze dostępna klasyfikacja z pełnymi statystykami</p>
                <p><strong>📈 Matryca przeciwników:</strong> Zobacz z kim grał każdy zawodnik</p>
                <p><strong>✏️ Edycja zawodników:</strong> Popraw imiona bez utraty danych (przycisk "⚙️")</p>
                <p><strong>💾 Automatyczny zapis:</strong> Stan turnieju zapisuje się lokalnie</p>
                <p><strong>🔄 Reset:</strong> Wyczyść wszystkie dane i rozpocznij nowy turniej</p>
              </div>
            </div>
          </div>
        </div>

        {/* Turniej Drużynowy */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Trophy size={32} className="text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Turniej Drużynowy</h2>
          </div>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Kompleksowy system zarządzania turniejami drużynowymi z trzema formatami: Swiss System, 
            fazami grupowymi oraz tradycyjny każdy-z-każdym. Zaawansowane funkcje edycji, 
            zarządzania drużynami i eksportu danych.
          </p>

          <div className="space-y-6">
            {/* Formaty turniejowe */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-3">📋 Dostępne formaty turniejowe:</h3>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-lg">
                  <p className="font-semibold text-blue-600 mb-1 text-sm">Swiss System + Playoff</p>
                  <p className="text-xs text-gray-600">Faza Swiss + playoff dla najlepszych drużyn</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="font-semibold text-blue-600 mb-1 text-sm">Fazy Grupowe</p>
                  <p className="text-xs text-gray-600">Losowanie grup, awanse i faza pucharowa</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="font-semibold text-blue-600 mb-1 text-sm">Każdy z każdym</p>
                  <p className="text-xs text-gray-600">Tradycyjny system ligowy</p>
                </div>
              </div>
            </div>

            {/* Metodologia Swiss System */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
              <h3 className="text-xl font-bold text-purple-900 mb-3 flex items-center gap-2">
                🏆 Metodologia Swiss System (System Szwajcarski)
              </h3>
              <div className="space-y-3 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-2">Zasada działania:</p>
                  <p className="text-gray-600 mb-2">
                    System szwajcarski to format turnieju, w którym <strong>drużyny nie grają ze wszystkimi</strong>, 
                    a jedynie z <strong>wybranymi przeciwnikami o podobnym poziomie</strong>. Po każdej rundzie następuje 
                    parowanie drużyn na podstawie aktualnej tabeli.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
                    <li><strong>Runda 1:</strong> Losowe parowanie wszystkich drużyn</li>
                    <li><strong>Runda 2+:</strong> Drużyny z podobną liczbą punktów grają ze sobą</li>
                    <li><strong>Unikanie powtórek:</strong> System nie sparuje drużyn, które już grały</li>
                    <li><strong>BYE:</strong> Przy nieparzystej liczbie - jedna drużyna pauzuje (rotacja)</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-2">Zalety systemu szwajcarskiego:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
                    <li>⚡ <strong>Szybkość:</strong> Tylko 3-7 rund zamiast wszystkich kombinacji</li>
                    <li>🎯 <strong>Zrównoważenie:</strong> Silne drużyny grają ze sobą, słabsze też</li>
                    <li>⏱️ <strong>Efektywność:</strong> 8 drużyn = 3 rundy (vs 28 meczy w każdy-z-każdym)</li>
                    <li>🏅 <strong>Sprawiedliwość:</strong> Najlepsze drużyny wychodzą na top bez wygrywania wszystkich</li>
                    <li>🎪 <strong>Emocje:</strong> Każda runda to istotny mecz dla pozycji w tabeli</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-2">Faza Playoff:</p>
                  <p className="text-gray-600">
                    Po zakończeniu rund Swiss, <strong>najlepsze drużyny</strong> (2, 4, 8 lub 16) awansują do 
                    fazy playoff (pucharowa drabinka). Pozostałe drużyny zajmują miejsca według tabeli Swiss.
                  </p>
                </div>
              </div>
            </div>

            {/* Metodologia Faz Grupowych */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-lg border-2 border-green-200">
              <h3 className="text-xl font-bold text-green-900 mb-3 flex items-center gap-2">
                ⚽ Metodologia Faz Grupowych
              </h3>
              <div className="space-y-3 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-2">Zasada działania:</p>
                  <p className="text-gray-600 mb-2">
                    System wzorowany na <strong>Mistrzostwach Świata</strong> - turniej dzieli się na fazy 
                    z grupami kwalifikacyjnymi i fazą pucharową (playoff).
                  </p>
                  <ol className="list-decimal list-inside text-gray-600 space-y-1 ml-2">
                    <li><strong>Losowanie grup:</strong> Drużyny losowane do grup po 3-4 zespoły</li>
                    <li><strong>Faza grupowa:</strong> Każdy z każdym w swojej grupie (system ligowy)</li>
                    <li><strong>Awans:</strong> 1-2 najlepsze drużyny z każdej grupy awansują</li>
                    <li><strong>Playoff:</strong> Drabinka pucharowa (1/8, 1/4, półfinały, finał)</li>
                  </ol>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-2">Przykład - 16 drużyn:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>
                      <p className="font-semibold text-gray-700">Faza grupowa:</p>
                      <ul className="list-disc list-inside ml-2">
                        <li>4 grupy po 4 drużyny</li>
                        <li>Każda drużyna gra 3 mecze</li>
                        <li>Łącznie: 24 mecze grupowe</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">Faza playoff:</p>
                      <ul className="list-disc list-inside ml-2">
                        <li>8 drużyn awansuje</li>
                        <li>1/4 finału (4 mecze)</li>
                        <li>Półfinały (2 mecze)</li>
                        <li>Finał (1 mecz)</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-2">Zalety systemu grupowego:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
                    <li>🎲 <strong>Element losowania:</strong> Silne zespoły mogą trafić do jednej grupy</li>
                    <li>📊 <strong>Drugi szans:</strong> Można przegrać mecz i nadal awansować</li>
                    <li>🏆 <strong>Atmosfera MŚ:</strong> Klasyczny format znany z wielkich turniejów</li>
                    <li>⚖️ <strong>Sprawiedliwość:</strong> W grupie każdy gra z każdym</li>
                    <li>🎯 <strong>Finał:</strong> Jasna drabinka prowadząca do wielkiego finału</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Metodologia Każdy z Każdym */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200">
              <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
                📊 Metodologia Każdy z Każdym (Round Robin / Liga)
              </h3>
              <div className="space-y-3 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-2">Zasada działania:</p>
                  <p className="text-gray-600 mb-2">
                    Najbardziej <strong>tradycyjny i sprawiedliwy</strong> format turnieju - każda drużyna 
                    gra z każdą inną dokładnie jeden raz. Zwycięzca to drużyna z największą liczbą punktów.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
                    <li><strong>Algorytm Bergera:</strong> System generuje optymalny harmonogram</li>
                    <li><strong>Rozłożenie na rundy:</strong> Mecze równomiernie rozłożone na boiska</li>
                    <li><strong>Wszystkie kombinacje:</strong> n×(n-1)/2 meczów dla n drużyn</li>
                    <li><strong>Punktacja 3-1-0:</strong> 3 za wygraną, 1 za remis, 0 za przegraną</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-2">Przykładowa liczba meczów:</p>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="font-semibold">4 drużyny</p>
                      <p>6 meczy</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="font-semibold">8 drużyn</p>
                      <p>28 meczy</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="font-semibold">12 drużyn</p>
                      <p>66 meczy</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-2">Zalety systemu każdy-z-każdym:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
                    <li>⚖️ <strong>Maksymalna sprawiedliwość:</strong> Wszyscy grają ze wszystkimi</li>
                    <li>📈 <strong>Rzetelna tabela:</strong> Pełen obraz siły każdej drużyny</li>
                    <li>🎓 <strong>Tradycja:</strong> Klasyczny format ligowy (ekstraklasa, liga mistrzów)</li>
                    <li>📊 <strong>Pełne statystyki:</strong> Wiarygodne dane o wszystkich drużynach</li>
                    <li>🏅 <strong>Brak kontrowersji:</strong> Najlepszy wygrywa bez wątpliwości</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-2">⚠️ Uwagi:</p>
                  <p className="text-gray-600 text-xs">
                    Format wymaga <strong>więcej czasu</strong> niż Swiss System. Dla dużych turniejów 
                    (powyżej 12 drużyn) zalecany jest Swiss System lub fazy grupowe.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Calendar size={20} className="text-blue-600" />
                Rozpoczęcie turnieju
              </h3>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-2">1. Wybór formatu i konfiguracja:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 text-sm">
                    <li><strong>Liczba drużyn:</strong> Minimum 2, system dostosuje format</li>
                    <li><strong>Rundy Swiss:</strong> (dla Swiss System) Zalecane 3-7 rund</li>
                    <li><strong>Drużyn w playoff:</strong> 2, 4, 8 lub 16 (dla Swiss/Grupy)</li>
                    <li><strong>Liczba boisk:</strong> Określ dostępną infrastrukturę</li>
                    <li><strong>System punktacji:</strong> Dostosuj punkty za wygraną/remis/bye</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Clipboard size={16} className="text-blue-600" />
                    2. Wprowadzanie drużyn (NOWOŚĆ!):
                  </p>
                  <p className="text-gray-600 text-sm mb-2">
                    Kliknij <strong>"📋 Wklej z Excela"</strong> aby szybko wprowadzić nazwy drużyn:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 text-xs">
                    <li>Skopiuj kolumnę z nazwami drużyn z Excela</li>
                    <li>Wklej do pola (każda nazwa w nowej linii)</li>
                    <li>System sprawdzi liczbę i losowo przydzieli do grup</li>
                  </ul>
                  <p className="text-gray-600 text-xs mt-2">
                    <strong>Lub ręcznie:</strong> Rozwiń każdą drużynę i dodaj nazwę oraz zawodników
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-1">3. Generowanie harmonogramu:</p>
                  <p className="text-gray-600 text-sm">
                    System automatycznie generuje mecze używając <strong>algorytmu Bergera</strong> 
                    (każdy-z-każdym) lub systemu Swiss, w zależności od wybranego formatu.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Edit3 size={20} className="text-green-600" />
                Zarządzanie drużynami
              </h3>
              <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-2">📝 Edycja drużyn (przycisk "Drużyny"):</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 text-sm">
                    <li><strong>Zmiana nazw:</strong> Automatyczna walidacja unikalności</li>
                    <li><strong>Edycja składów:</strong> Dodawanie/usuwanie zawodników</li>
                    <li><strong>Dodawanie drużyn:</strong> Nowe drużyny w trakcie turnieju</li>
                    <li><strong>Usuwanie drużyn:</strong> Z walkowerm dla przeciwników</li>
                    <li><strong>Wycofywanie drużyn:</strong> System przyznaje walkowery</li>
                    <li><strong>Przywracanie:</strong> Cofnięcie wycofania drużyny</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-1 text-sm">⚠️ Ważne:</p>
                  <p className="text-gray-600 text-xs">
                    Wszystkie wyniki są zachowywane podczas edycji! Przy usuwaniu drużyn z rozegranymi 
                    meczami system przenosi drużynę do statusu PAUSE zamiast całkowicie usuwać.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Play size={20} className="text-purple-600" />
                Prowadzenie turnieju
              </h3>
              <div className="space-y-3">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-2">Wprowadzanie wyników:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 text-sm">
                    <li>Kliknij na mecz i wprowadź wynik (X:Y)</li>
                    <li>System automatycznie aktualizuje tabelę</li>
                    <li>W Swiss: potwierdź rundę, aby wygenerować następną</li>
                    <li>W fazach grupowych: przechodź przez grupy i fazy</li>
                    <li>W Playoff: wybieraj zwycięzców, aby przejść dalej</li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-2">System punktacji:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>
                      <p className="font-semibold">Faza grupowa/liga:</p>
                      <ul className="list-disc list-inside ml-2">
                        <li>Wygrana: 3 pkt</li>
                        <li>Remis: 1 pkt</li>
                        <li>Przegrana: 0 pkt</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">Swiss System:</p>
                      <ul className="list-disc list-inside ml-2">
                        <li>Punkty konfigurowalne</li>
                        <li>Bye: punkty za wolny mecz</li>
                        <li>Bilans bramek jako kryterium</li>
                      </ul>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    <strong>Ranking:</strong> Punkty → bilans bramek → bramki zdobyte
                  </p>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Download size={20} className="text-orange-600" />
                Eksport i zarządzanie
              </h3>
              <div className="space-y-3">
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-2">📥 Eksport do CSV/Excel:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 text-sm">
                    <li><strong>Tabela wyników:</strong> Pełna klasyfikacja ze statystykami</li>
                    <li><strong>Harmonogram meczów:</strong> Wszystkie mecze z wynikami</li>
                    <li><strong>Fazy turnieju:</strong> Grupy, Swiss, Playoff</li>
                    <li><strong>Format:</strong> CSV z UTF-8, separator średnik (;)</li>
                    <li><strong>Kompatybilność:</strong> Bezpośrednie otwarcie w Excel</li>
                  </ul>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-1 text-sm">💾 Automatyczny zapis:</p>
                  <p className="text-gray-600 text-xs">
                    Wszystkie zmiany zapisywane lokalnie w przeglądarce. 
                    Możesz bezpiecznie zamknąć i wrócić później.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Settings size={20} className="text-red-600" />
                Zaawansowane funkcje
              </h3>
              <div className="bg-red-50 p-3 rounded-lg">
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li><strong>🔄 Regeneracja harmonogramu:</strong> Zachowuje wyniki przy zmianie boisk</li>
                  <li><strong>👥 Zarządzanie zawodnikami w drużynie:</strong> Dodawaj/usuwaj członków</li>
                  <li><strong>📊 Tabele na żywo:</strong> Automatyczne sortowanie i aktualizacja</li>
                  <li><strong>🏆 Fazy playoff:</strong> Automatyczne parowanie zwycięzców</li>
                  <li><strong>⏸️ System PAUSE:</strong> Drużyny z historią nie są kasowane</li>
                  <li><strong>🔙 Cofanie wycofania:</strong> Przywracanie drużyn z anulowaniem walkowerów</li>
                </ul>
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
                <li>• Przygotuj listę w Excelu (szybkie wklejanie)</li>
                <li>• Określ dostępne boiska</li>
                <li>• Wybierz odpowiedni format turnieju</li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <h3 className="font-semibold mb-2">⚡ Podczas turnieju</h3>
              <ul className="text-sm space-y-1 opacity-90">
                <li>• Wprowadzaj wyniki na bieżąco</li>
                <li>• Regularnie eksportuj dane (backup)</li>
                <li>• Używaj edycji zamiast resetowania</li>
                <li>• Sprawdzaj tabele przed każdą rundą</li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <h3 className="font-semibold mb-2">🔒 Bezpieczeństwo danych</h3>
              <ul className="text-sm space-y-1 opacity-90">
                <li>• Dane zapisywane lokalnie w przeglądarce</li>
                <li>• Regularny eksport jako zabezpieczenie</li>
                <li>• Unikaj czyszczenia cache podczas turnieju</li>
                <li>• Używaj tej samej przeglądarki</li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <h3 className="font-semibold mb-2">🚀 Wydajność i funkcje</h3>
              <ul className="text-sm space-y-1 opacity-90">
                <li>• Wklejanie z Excela: oszczędność czasu</li>
                <li>• Działa offline po pierwszym załadowaniu</li>
                <li>• Responsywny design na telefony/tablety</li>
                <li>• Obsługuje duże turnieje ({'>'} 50 drużyn)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">❓ Często zadawane pytania</h2>
          <div className="space-y-4">
            <div className="border-b pb-3">
              <p className="font-semibold text-gray-800 mb-1">Jak najszybciej wprowadzić zawodników/drużyny?</p>
              <p className="text-gray-600 text-sm">
                Użyj funkcji <strong>"Wklej z Excela"</strong>! Przygotuj listę w Excelu (jedna kolumna), 
                skopiuj i wklej. System automatycznie wypełni wszystkie pola w sekundę.
              </p>
            </div>
            <div className="border-b pb-3">
              <p className="font-semibold text-gray-800 mb-1">Czy mogę edytować drużyny po rozpoczęciu turnieju?</p>
              <p className="text-gray-600 text-sm">
                Tak! System zachowuje wszystkie wyniki podczas edycji nazw, składów i liczby boisk. 
                Możesz także dodawać nowe drużyny, usuwać istniejące lub wycofywać/przywracać drużyny.
              </p>
            </div>
            <div className="border-b pb-3">
              <p className="font-semibold text-gray-800 mb-1">Co oznacza status PAUSE przy drużynie?</p>
              <p className="text-gray-600 text-sm">
                Gdy próbujesz usunąć drużynę, która już rozegrała mecze, system przenosi ją do statusu PAUSE 
                zamiast całkowicie usuwać. To zachowuje historię meczów i statystyki.
              </p>
            </div>
            <div className="border-b pb-3">
              <p className="font-semibold text-gray-800 mb-1">Jaka jest różnica między formatami turniejowymi?</p>
              <p className="text-gray-600 text-sm">
                <strong>Swiss System:</strong> Szybszy, drużyny grają 3-7 rund z podobnymi w rankingu, najlepsze do playoff.<br />
                <strong>Fazy grupowe:</strong> Losowanie grup, awanse, faza pucharowa - jak na mistrzostwach świata.<br />
                <strong>Każdy z każdym:</strong> Tradycyjna liga, każdy gra z każdym raz.
              </p>
            </div>
            <div className="border-b pb-3">
              <p className="font-semibold text-gray-800 mb-1">Co to jest "bye" w Swiss System?</p>
              <p className="text-gray-600 text-sm">
                Gdy liczba drużyn jest nieparzysta, jedna drużyna w każdej rundzie dostaje "bye" 
                (wolny mecz) i automatycznie otrzymuje punkty. System rotuje, aby każdy dostał bye raz.
              </p>
            </div>
            <div className="border-b pb-3">
              <p className="font-semibold text-gray-800 mb-1">Czy dane są bezpieczne?</p>
              <p className="text-gray-600 text-sm">
                Wszystkie dane są zapisywane lokalnie w Twojej przeglądarce. Nie są wysyłane na żaden serwer. 
                Zalecamy regularne eksportowanie danych do CSV jako dodatkowe zabezpieczenie.
              </p>
            </div>
            <div className="border-b pb-3">
              <p className="font-semibold text-gray-800 mb-1">Czy mogę prowadzić kilka turniejów jednocześnie?</p>
              <p className="text-gray-600 text-sm">
                Każdy turniej (Holenderski/Drużynowy) ma osobny zapis. Możesz mieć aktywny jeden turniej 
                każdego typu. Dla wielu turniejów tego samego typu użyj różnych przeglądarek lub profili.
              </p>
            </div>
            <div className="border-b pb-3">
              <p className="font-semibold text-gray-800 mb-1">Co zrobić gdy wpisałem duplikat nazwy?</p>
              <p className="text-gray-600 text-sm">
                System automatycznie doda numerację: "Drużyna A" → "Drużyna A (2)" → "Drużyna A (3)". 
                Możesz potem edytować nazwy w panelu zarządzania.
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-1">Czy mogę używać aplikacji na telefonie?</p>
              <p className="text-gray-600 text-sm">
                Tak! Aplikacja ma responsywny design i działa świetnie na telefonach i tabletach. 
                Wszystkie funkcje są dostępne na urządzeniach mobilnych.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm mb-1">
            <strong>Generator Turniejów</strong> • Wersja 3.0
          </p>
          <p className="text-xs">
            System Holenderski • Swiss System • Fazy Grupowe • Liga tradycyjna
          </p>
          <p className="text-xs mt-2 text-gray-500">
            ✨ Nowe: Wklejanie z Excela • Zaawansowane zarządzanie drużynami • Eksport CSV
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstrukcjaObslugi;
