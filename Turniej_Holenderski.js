import React, { useState, useEffect } from 'react';
import { Users, Trophy, Play, RefreshCw, Download } from 'lucide-react';

export default function TournamentGenerator() {
  const [step, setStep] = useState(1);
  const [numPlayers, setNumPlayers] = useState(8);
  const [numFields, setNumFields] = useState(2);
  const [playersPerTeam, setPlayersPerTeam] = useState(2);
  const [numRounds, setNumRounds] = useState(0);
  const [suggestedRounds, setSuggestedRounds] = useState(0);
  const [playerNames, setPlayerNames] = useState([]);
  const [matches, setMatches] = useState([]);
  const [results, setResults] = useState({});
  const [finalStandings, setFinalStandings] = useState([]);

  // Oblicz sugerowaną liczbę rund
  useEffect(() => {
    if (numPlayers > 0 && playersPerTeam > 0 && numFields > 0) {
      const playersPerMatch = playersPerTeam * 2;
      const playersPerRound = numFields * playersPerMatch;
      
      // Sprawdź czy wszyscy grają w każdej rundzie
      if (playersPerRound >= numPlayers) {
        setSuggestedRounds("dowolna");
        setNumRounds(3);
      } else {
        // Znajdź rundy, które dają równą liczbę meczy dla wszystkich
        const suggestions = [];
        for (let rounds = 1; rounds <= 20 && suggestions.length < 5; rounds++) {
          const totalSlots = rounds * playersPerRound;
          if (totalSlots % numPlayers === 0) {
            suggestions.push(rounds);
          }
        }
        setSuggestedRounds(suggestions.length > 0 ? suggestions.join(', ') : []);
        setNumRounds(suggestions.length > 0 ? suggestions[0] : 1);
      }
    }
  }, [numPlayers, playersPerTeam, numFields]);

  const initializePlayers = () => {
    const names = Array(numPlayers).fill('').map((_, i) => `Zawodnik ${i + 1}`);
    setPlayerNames(names);
  };

  const updatePlayerName = (index, name) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const shuffle = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const generateTournament = () => {
    const allMatches = [];
    const playerMatchCount = {};
    const playerTeammates = {};
    
    playerNames.forEach(name => {
      playerMatchCount[name] = 0;
      playerTeammates[name] = new Set();
    });

    const playersPerMatch = playersPerTeam * 2;
    const playersPerRound = numFields * playersPerMatch;
    const totalSlots = numRounds * playersPerRound;
    const matchesPerPlayer = totalSlots / numPlayers;

    for (let round = 0; round < numRounds; round++) {
      const roundMatches = [];
      
      // Znajdź graczy, którzy muszą zagrać w tej rundzie
      let availablePlayers = [...playerNames].filter(name => 
        playerMatchCount[name] < matchesPerPlayer
      );
      
      // Jeśli nie ma wystarczająco graczy (wszyscy zagrali już swoje mecze), weź wszystkich
      if (availablePlayers.length < playersPerRound) {
        availablePlayers = [...playerNames];
      }
      
      // Sortuj według liczby meczy (priorytet dla tych z mniejszą liczbą)
      availablePlayers.sort((a, b) => playerMatchCount[a] - playerMatchCount[b]);
      
      // Tasuj grupy graczy z taką samą liczbą meczy
      const grouped = {};
      availablePlayers.forEach(player => {
        const count = playerMatchCount[player];
        if (!grouped[count]) grouped[count] = [];
        grouped[count].push(player);
      });
      
      availablePlayers = [];
      Object.keys(grouped).sort((a, b) => a - b).forEach(count => {
        availablePlayers.push(...shuffle(grouped[count]));
      });
      
      for (let field = 0; field < numFields; field++) {
        if (availablePlayers.length >= playersPerTeam * 2) {
          const team1 = [];
          const team2 = [];
          
          // Wybierz graczy do team1
          for (let i = 0; i < playersPerTeam && availablePlayers.length > 0; i++) {
            // Wybierz gracza, który najrzadziej grał z już wybranymi
            let bestPlayerIdx = 0;
            let minSharedGames = Infinity;
            
            for (let j = 0; j < Math.min(5, availablePlayers.length); j++) {
              const player = availablePlayers[j];
              const sharedGames = team1.filter(t => playerTeammates[player]?.has(t)).length;
              if (sharedGames < minSharedGames) {
                minSharedGames = sharedGames;
                bestPlayerIdx = j;
              }
            }
            
            const player = availablePlayers.splice(bestPlayerIdx, 1)[0];
            team1.push(player);
          }
          
          // Wybierz graczy do team2
          for (let i = 0; i < playersPerTeam && availablePlayers.length > 0; i++) {
            let bestPlayerIdx = 0;
            let minSharedGames = Infinity;
            
            for (let j = 0; j < Math.min(5, availablePlayers.length); j++) {
              const player = availablePlayers[j];
              const sharedGames = team2.filter(t => playerTeammates[player]?.has(t)).length;
              if (sharedGames < minSharedGames) {
                minSharedGames = sharedGames;
                bestPlayerIdx = j;
              }
            }
            
            const player = availablePlayers.splice(bestPlayerIdx, 1)[0];
            team2.push(player);
          }
          
          // Aktualizuj statystyki
          [...team1, ...team2].forEach(player => {
            playerMatchCount[player]++;
          });
          
          team1.forEach(p1 => {
            team1.forEach(p2 => {
              if (p1 !== p2) playerTeammates[p1].add(p2);
            });
          });
          
          team2.forEach(p1 => {
            team2.forEach(p2 => {
              if (p1 !== p2) playerTeammates[p1].add(p2);
            });
          });
          
          roundMatches.push({
            id: `r${round + 1}f${field + 1}`,
            round: round + 1,
            field: field + 1,
            team1,
            team2,
            score1: 0,
            score2: 0
          });
        }
      }
      
      allMatches.push(...roundMatches);
    }
    
    setMatches(allMatches);
    const initialResults = {};
    allMatches.forEach(match => {
      initialResults[match.id] = { score1: 0, score2: 0 };
    });
    setResults(initialResults);
    setStep(4);
  };

  const updateScore = (matchId, team, score) => {
    setResults(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: parseInt(score) || 0
      }
    }));
  };

  const calculateStandings = () => {
    const standings = {};
    
    playerNames.forEach(name => {
      standings[name] = {
        name,
        matches: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDiff: 0,
        points: 0
      };
    });

    matches.forEach(match => {
      const score1 = results[match.id]?.score1 || 0;
      const score2 = results[match.id]?.score2 || 0;
      
      match.team1.forEach(player => {
        standings[player].matches++;
        standings[player].goalsFor += score1;
        standings[player].goalsAgainst += score2;
        
        if (score1 > score2) {
          standings[player].wins++;
          standings[player].points += 3;
        } else if (score1 === score2) {
          standings[player].draws++;
          standings[player].points += 1;
        } else {
          standings[player].losses++;
        }
      });
      
      match.team2.forEach(player => {
        standings[player].matches++;
        standings[player].goalsFor += score2;
        standings[player].goalsAgainst += score1;
        
        if (score2 > score1) {
          standings[player].wins++;
          standings[player].points += 3;
        } else if (score1 === score2) {
          standings[player].draws++;
          standings[player].points += 1;
        } else {
          standings[player].losses++;
        }
      });
    });

    Object.values(standings).forEach(s => {
      s.goalDiff = s.goalsFor - s.goalsAgainst;
    });

    const sorted = Object.values(standings).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      return b.goalsFor - a.goalsFor;
    });

    setFinalStandings(sorted);
    setStep(5);
  };

  const exportResults = () => {
    // Przygotuj dane w formacie CSV (kompatybilnym z Excel)
    let csv = '\uFEFF'; // BOM dla poprawnego kodowania UTF-8 w Excel
    
    // Nagłówek parametrów
    csv += 'PARAMETRY TURNIEJU\n';
    csv += `Zawodnicy;${numPlayers}\n`;
    csv += `Boiska;${numFields}\n`;
    csv += `Zawodników na drużynę;${playersPerTeam}\n`;
    csv += `Rundy;${numRounds}\n`;
    csv += `Łącznie meczy;${matches.length}\n\n`;
    
    // Tabela meczy
    csv += 'MECZE\n';
    csv += 'Runda;Boisko;Drużyna 1;Wynik;Drużyna 2\n';
    matches.forEach(match => {
      const score1 = results[match.id]?.score1 || 0;
      const score2 = results[match.id]?.score2 || 0;
      csv += `${match.round};${match.field};${match.team1.join(', ')};${score1}:${score2};${match.team2.join(', ')}\n`;
    });
    
    csv += '\n';
    
    // Tabela końcowa
    csv += 'TABELA KOŃCOWA\n';
    csv += 'Miejsce;Zawodnik;Mecze;Wygrane;Remisy;Przegrane;Bramki zdobyte;Bramki stracone;Różnica bramek;Punkty\n';
    finalStandings.forEach((player, i) => {
      csv += `${i + 1};${player.name};${player.matches};${player.wins};${player.draws};${player.losses};${player.goalsFor};${player.goalsAgainst};${player.goalDiff};${player.points}\n`;
    });
    
    // Pobierz plik
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'turniej-wyniki.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">Generator Turnieju</h1>
          </div>

          {/* Krok 1: Parametry */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Liczba zawodników
                </label>
                <input
                  type="number"
                  min="4"
                  value={numPlayers}
                  onChange={(e) => setNumPlayers(parseInt(e.target.value) || 4)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Liczba boisk
                </label>
                <input
                  type="number"
                  min="1"
                  value={numFields}
                  onChange={(e) => setNumFields(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zawodników na drużynę
                </label>
                <input
                  type="number"
                  min="1"
                  value={playersPerTeam}
                  onChange={(e) => setPlayersPerTeam(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Liczba rund
                  <span className="ml-2 text-indigo-600 font-normal">
                    (Sugerowane: {suggestedRounds} - aby każdy zagrał taką samą liczbę meczy)
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={numRounds}
                  onChange={(e) => setNumRounds(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={() => {
                  initializePlayers();
                  setStep(2);
                }}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Dalej
              </button>
            </div>
          )}

          {/* Krok 2: Imiona zawodników */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Wprowadź imiona zawodników
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-2">
                {playerNames.map((name, index) => (
                  <input
                    key={index}
                    type="text"
                    value={name}
                    onChange={(e) => updatePlayerName(index, e.target.value)}
                    placeholder={`Zawodnik ${index + 1}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Wstecz
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Dalej
                </button>
              </div>
            </div>
          )}

          {/* Krok 3: Podsumowanie przed generowaniem */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Podsumowanie turnieju</h2>
              
              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <p><strong>Zawodników:</strong> {numPlayers}</p>
                <p><strong>Boisk:</strong> {numFields}</p>
                <p><strong>Zawodników na drużynę:</strong> {playersPerTeam}</p>
                <p><strong>Rund:</strong> {numRounds}</p>
                <p><strong>Łącznie meczy:</strong> {numRounds * numFields}</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Wstecz
                </button>
                <button
                  onClick={generateTournament}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Generuj turniej
                </button>
              </div>
            </div>
          )}

          {/* Krok 4: Mecze i wyniki */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Mecze turnieju</h2>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Array.from({ length: numRounds }).map((_, roundIdx) => (
                  <div key={roundIdx} className="border-l-4 border-indigo-500 pl-4">
                    <h3 className="font-bold text-lg mb-3 text-indigo-700">Runda {roundIdx + 1}</h3>
                    {matches
                      .filter(m => m.round === roundIdx + 1)
                      .map(match => (
                        <div key={match.id} className="bg-gray-50 rounded-lg p-4 mb-3">
                          <div className="text-sm text-gray-600 mb-2">Boisko {match.field}</div>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="font-medium text-blue-600">
                                {match.team1.join(', ')}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                value={results[match.id]?.score1 || 0}
                                onChange={(e) => updateScore(match.id, 'score1', e.target.value)}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                              />
                              <span className="font-bold">:</span>
                              <input
                                type="number"
                                min="0"
                                value={results[match.id]?.score2 || 0}
                                onChange={(e) => updateScore(match.id, 'score2', e.target.value)}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                              />
                            </div>
                            <div className="flex-1 text-right">
                              <div className="font-medium text-red-600">
                                {match.team2.join(', ')}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
              </div>

              <button
                onClick={calculateStandings}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Trophy className="w-5 h-5" />
                Pokaż tabelę końcową
              </button>
            </div>
          )}

          {/* Krok 5: Tabela końcowa */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Tabela końcowa
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Miejsce</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Zawodnik</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Mecze</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Wygrane</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Remisy</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Przegrane</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Bramki</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Punkty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {finalStandings.map((player, index) => (
                      <tr key={player.name} className={index < 3 ? 'bg-yellow-50' : ''}>
                        <td className="px-4 py-3 text-center font-bold">
                          {index === 0 && '🥇'}
                          {index === 1 && '🥈'}
                          {index === 2 && '🥉'}
                          {index > 2 && `${index + 1}.`}
                        </td>
                        <td className="px-4 py-3 font-medium">{player.name}</td>
                        <td className="px-4 py-3 text-center">{player.matches}</td>
                        <td className="px-4 py-3 text-center text-green-600">{player.wins}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{player.draws}</td>
                        <td className="px-4 py-3 text-center text-red-600">{player.losses}</td>
                        <td className="px-4 py-3 text-center">{player.goalsFor}:{player.goalsAgainst}</td>
                        <td className="px-4 py-3 text-center font-bold text-indigo-600">{player.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Wstecz do wyników
                </button>
                <button
                  onClick={exportResults}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Eksportuj wyniki
                </button>
                <button
                  onClick={() => {
                    setStep(1);
                    setMatches([]);
                    setResults({});
                    setFinalStandings([]);
                  }}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Nowy turniej
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
