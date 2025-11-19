import React, { useState, useEffect, useRef } from 'react';

// Local storage key for persistence
const STORAGE_KEY = 'tournament_state_v1';

const loadStateFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load state from storage', e);
    return null;
  }
};

const saveStateToStorage = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save state to storage', e);
  }
};

// Simplified logo and small inline icons (use emoji/text for lightweight UI)
const Logo = ({ className = '' }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="text-2xl sm:text-3xl">⭐</div>
    <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">Generator Turnieju</h1>
  </div>
);

const Users = ({ className = '' }) => <span className={className}>👥</span>;
const Trophy = ({ className = '' }) => <span className={className}>🏆</span>;
const Play = ({ className = '' }) => <span className={className}>▶️</span>;
const RefreshCw = ({ className = '' }) => <span className={className}>🔄</span>;
const Download = ({ className = '' }) => <span className={className}>⬇️</span>;

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
  const [returnStep, setReturnStep] = useState(null);
  const [pointsWin, setPointsWin] = useState(10);
  const [pointsDraw, setPointsDraw] = useState(5);
  const [pointsLoss, setPointsLoss] = useState(0);
  const [pointsPerGoal, setPointsPerGoal] = useState(1);

  // Load persisted state on mount
  useEffect(() => {
    const saved = loadStateFromStorage();
    if (saved) {
      if (typeof saved.step === 'number') setStep(saved.step);
      if (typeof saved.numPlayers === 'number') setNumPlayers(saved.numPlayers);
      if (typeof saved.numFields === 'number') setNumFields(saved.numFields);
      if (typeof saved.playersPerTeam === 'number') setPlayersPerTeam(saved.playersPerTeam);
      if (typeof saved.numRounds === 'number') setNumRounds(saved.numRounds);
      if (Array.isArray(saved.playerNames)) setPlayerNames(saved.playerNames);
      if (Array.isArray(saved.matches)) setMatches(saved.matches);
      if (saved.results && typeof saved.results === 'object') setResults(saved.results);
      if (Array.isArray(saved.finalStandings)) setFinalStandings(saved.finalStandings);
      if (typeof saved.pointsWin === 'number') setPointsWin(saved.pointsWin);
      if (typeof saved.pointsDraw === 'number') setPointsDraw(saved.pointsDraw);
      if (typeof saved.pointsLoss === 'number') setPointsLoss(saved.pointsLoss);
      if (typeof saved.pointsPerGoal === 'number') setPointsPerGoal(saved.pointsPerGoal);
      if (typeof saved.returnStep === 'number') setReturnStep(saved.returnStep);
    }
  }, []);

  // Debounced persist: save to localStorage 500ms after last change
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    const stateToSave = () => ({
      step,
      numPlayers,
      numFields,
      playersPerTeam,
      numRounds,
      playerNames,
      matches,
      results,
      finalStandings,
      pointsWin,
      pointsDraw,
      pointsLoss,
      pointsPerGoal,
      returnStep
    });

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveStateToStorage(stateToSave());
      saveTimeoutRef.current = null;
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [step, numPlayers, numFields, playersPerTeam, numRounds, playerNames, matches, results, finalStandings, pointsWin, pointsDraw, pointsLoss, pointsPerGoal, returnStep]);

  // Ensure state is flushed on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      saveStateToStorage({
        step,
        numPlayers,
        numFields,
        playersPerTeam,
        numRounds,
        playerNames,
        matches,
        results,
        finalStandings,
        pointsWin,
        pointsDraw,
        pointsLoss,
        pointsPerGoal,
        returnStep
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [step, numPlayers, numFields, playersPerTeam, numRounds, playerNames, matches, results, finalStandings, pointsWin, pointsDraw, pointsLoss, pointsPerGoal, returnStep]);

  useEffect(() => {
    if (numPlayers > 0 && playersPerTeam > 0 && numFields > 0) {
      const playersPerMatch = playersPerTeam * 2;
      const playersPerRound = numFields * playersPerMatch;
      
      if (playersPerRound >= numPlayers) {
        setSuggestedRounds("dowolna");
        setNumRounds(3);
      } else {
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
    const oldName = newNames[index];
    newNames[index] = name;
    setPlayerNames(newNames);
    
    // Jeśli turniej został już wygenerowany, zaktualizuj nazwy w meczach
    if (matches.length > 0) {
      const updatedMatches = matches.map(match => ({
        ...match,
        team1: match.team1.map(player => player === oldName ? name : player),
        team2: match.team2.map(player => player === oldName ? name : player)
      }));
      setMatches(updatedMatches);
      
      // Zaktualizuj standings jeśli istnieją
      if (finalStandings.length > 0) {
        const updatedStandings = finalStandings.map(standing => 
          standing.name === oldName ? { ...standing, name } : standing
        );
        setFinalStandings(updatedStandings);
      }
    }
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
      
      let availablePlayers = [...playerNames].filter(name => 
        playerMatchCount[name] < matchesPerPlayer
      );
      
      if (availablePlayers.length < playersPerRound) {
        availablePlayers = [...playerNames];
      }
      
      availablePlayers.sort((a, b) => playerMatchCount[a] - playerMatchCount[b]);
      
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
          
          for (let i = 0; i < playersPerTeam && availablePlayers.length > 0; i++) {
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
          standings[player].points += pointsWin;
        } else if (score1 === score2) {
          standings[player].draws++;
          standings[player].points += pointsDraw;
        } else {
          standings[player].losses++;
          standings[player].points += pointsLoss;
        }
        
        // Dodaj punkty za bramki
        standings[player].points += score1 * pointsPerGoal;
      });
      
      match.team2.forEach(player => {
        standings[player].matches++;
        standings[player].goalsFor += score2;
        standings[player].goalsAgainst += score1;
        
        if (score2 > score1) {
          standings[player].wins++;
          standings[player].points += pointsWin;
        } else if (score1 === score2) {
          standings[player].draws++;
          standings[player].points += pointsDraw;
        } else {
          standings[player].losses++;
          standings[player].points += pointsLoss;
        }
        
        // Dodaj punkty za bramki
        standings[player].points += score2 * pointsPerGoal;
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
    let csv = '\uFEFF';
    csv += 'PARAMETRY TURNIEJU\n';
    csv += `Zawodnicy;${numPlayers}\n`;
    csv += `Boiska;${numFields}\n`;
    csv += `Zawodników na drużynę;${playersPerTeam}\n`;
    csv += `Rundy;${numRounds}\n`;
    csv += `Łącznie meczy;${matches.length}\n`;
    csv += `\n`;
    csv += `PUNKTACJA\n`;
    csv += `Wygrana;${pointsWin} pkt\n`;
    csv += `Remis;${pointsDraw} pkt\n`;
    csv += `Przegrana;${pointsLoss} pkt\n`;
    csv += `Bramka;${pointsPerGoal} pkt\n`;
    csv += `\n`;
    
    csv += 'MECZE\n';
    csv += 'Runda;Boisko;Drużyna 1;Wynik;Drużyna 2\n';
    matches.forEach(match => {
      const score1 = results[match.id]?.score1 || 0;
      const score2 = results[match.id]?.score2 || 0;
      csv += `${match.round};${match.field};${match.team1.join(', ')};${score1}:${score2};${match.team2.join(', ')}\n`;
    });
    
    csv += '\n';
    
    csv += 'TABELA KOŃCOWA\n';
    csv += 'Miejsce;Zawodnik;Mecze;Wygrane;Remisy;Przegrane;Bramki zdobyte;Bramki stracone;Różnica bramek;Punkty\n';
    finalStandings.forEach((player, i) => {
      csv += `${i + 1};${player.name};${player.matches};${player.wins};${player.draws};${player.losses};${player.goalsFor};${player.goalsAgainst};${player.goalDiff};${player.points}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `turniej-wyniki-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-6">
          <div className="mb-4 sm:mb-6">
            <Logo />
          </div>

          {step === 1 && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  Liczba zawodników
                </label>
                <input
                  type="number"
                  min="4"
                  value={numPlayers}
                  onChange={(e) => setNumPlayers(parseInt(e.target.value) || 4)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  Liczba boisk
                </label>
                <input
                  type="number"
                  min="1"
                  value={numFields}
                  onChange={(e) => setNumFields(parseInt(e.target.value) || 1)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  Zawodników na drużynę
                </label>
                <input
                  type="number"
                  min="1"
                  value={playersPerTeam}
                  onChange={(e) => setPlayersPerTeam(parseInt(e.target.value) || 1)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  Liczba rund
                  <span className="block sm:inline sm:ml-2 text-xs sm:text-sm text-indigo-600 font-normal mt-1 sm:mt-0">
                    (Sugerowane: {suggestedRounds} - aby każdy zagrał taką samą liczbę meczy)
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={numRounds}
                  onChange={(e) => setNumRounds(parseInt(e.target.value) || 1)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="border-t pt-4 sm:pt-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Punktacja</h3>
                
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Punkty za wygraną
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={pointsWin}
                      onChange={(e) => setPointsWin(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Punkty za remis
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={pointsDraw}
                      onChange={(e) => setPointsDraw(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Punkty za przegraną
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={pointsLoss}
                      onChange={(e) => setPointsLoss(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Punkty za bramkę
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={pointsPerGoal}
                      onChange={(e) => setPointsPerGoal(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  initializePlayers();
                  setStep(2);
                }}
                className="w-full bg-indigo-600 text-white py-3 sm:py-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-base sm:text-lg"
              >
                Dalej
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                Wprowadź imiona zawodników
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-h-80 sm:max-h-96 overflow-y-auto p-2">
                {playerNames.map((name, index) => (
                  <input
                    key={index}
                    type="text"
                    value={name}
                    onChange={(e) => updatePlayerName(index, e.target.value)}
                    placeholder={`Zawodnik ${index + 1}`}
                    className="px-3 sm:px-4 py-2 sm:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => setStep(returnStep || 1)}
                  className="w-full bg-gray-200 text-gray-700 py-3 sm:py-4 rounded-lg hover:bg-gray-300 transition-colors font-medium text-base"
                >
                  {returnStep ? 'Powrót' : 'Wstecz'}
                </button>
                {!returnStep && (
                  <button
                    onClick={() => setStep(3)}
                    className="w-full bg-indigo-600 text-white py-3 sm:py-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-base"
                  >
                    Dalej
                  </button>
                )}
                {returnStep && (
                  <button
                    onClick={() => {
                      setStep(returnStep);
                      setReturnStep(null);
                    }}
                    className="w-full bg-indigo-600 text-white py-3 sm:py-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-base"
                  >
                    Zapisz zmiany
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Podsumowanie turnieju</h2>
              
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-2 sm:space-y-3 text-sm sm:text-base">
                <p><strong>Zawodników:</strong> {numPlayers}</p>
                <p><strong>Boisk:</strong> {numFields}</p>
                <p><strong>Zawodników na drużynę:</strong> {playersPerTeam}</p>
                <p><strong>Rund:</strong> {numRounds}</p>
                <p><strong>Łącznie meczy:</strong> {numRounds * numFields}</p>
                <div className="border-t pt-2 mt-3">
                  <p className="font-semibold mb-1">Punktacja:</p>
                  <p className="text-xs sm:text-sm">Wygrana: {pointsWin} pkt | Remis: {pointsDraw} pkt | Przegrana: {pointsLoss} pkt | Bramka: {pointsPerGoal} pkt</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="w-full bg-gray-200 text-gray-700 py-3 sm:py-4 rounded-lg hover:bg-gray-300 transition-colors font-medium text-base"
                  >
                    Wstecz
                  </button>
                  <button
                    onClick={generateTournament}
                    className="w-full bg-green-600 text-white py-3 sm:py-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 text-base"
                  >
                    <Play className="w-5 h-5" />
                    Generuj turniej
                  </button>
                </div>
                <button
                  onClick={() => {
                    setReturnStep(3);
                    setStep(2);
                  }}
                  className="w-full bg-indigo-100 text-indigo-700 py-2 sm:py-3 rounded-lg hover:bg-indigo-200 transition-colors font-medium text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  Edytuj imiona zawodników
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Mecze turnieju</h2>
              
              <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
                {Array.from({ length: numRounds }).map((_, roundIdx) => (
                  <div key={roundIdx} className="border-l-4 border-indigo-500 pl-3 sm:pl-4">
                    <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 text-indigo-700">Runda {roundIdx + 1}</h3>
                    {matches
                      .filter(m => m.round === roundIdx + 1)
                      .map(match => (
                        <div key={match.id} className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-2 sm:mb-3">
                          <div className="text-xs sm:text-sm text-gray-600 mb-2">Boisko {match.field}</div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                            <div className="flex-1 w-full sm:w-auto">
                              <div className="font-medium text-blue-600 text-sm sm:text-base">
                                {match.team1.join(', ')}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mx-auto sm:mx-0">
                              <input
                                type="number"
                                min="0"
                                value={results[match.id]?.score1 || 0}
                                onChange={(e) => updateScore(match.id, 'score1', e.target.value)}
                                className="w-14 sm:w-16 px-2 py-1 sm:py-2 border border-gray-300 rounded text-center text-base"
                              />
                              <span className="font-bold text-base sm:text-lg">:</span>
                              <input
                                type="number"
                                min="0"
                                value={results[match.id]?.score2 || 0}
                                onChange={(e) => updateScore(match.id, 'score2', e.target.value)}
                                className="w-14 sm:w-16 px-2 py-1 sm:py-2 border border-gray-300 rounded text-center text-base"
                              />
                            </div>
                            <div className="flex-1 w-full sm:w-auto sm:text-right">
                              <div className="font-medium text-red-600 text-sm sm:text-base">
                                {match.team2.join(', ')}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={calculateStandings}
                  className="w-full bg-indigo-600 text-white py-3 sm:py-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2 text-base"
                >
                  <Trophy className="w-5 h-5" />
                  Pokaż tabelę końcową
                </button>
                <button
                  onClick={() => {
                    setReturnStep(4);
                    setStep(2);
                  }}
                  className="w-full bg-indigo-100 text-indigo-700 py-2 sm:py-3 rounded-lg hover:bg-indigo-200 transition-colors font-medium text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  Edytuj imiona zawodników
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                Tabela końcowa
              </h2>
              
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                  <table className="min-w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Miejsce</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Zawodnik</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-700">M</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-700 hidden sm:table-cell">W</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-700 hidden sm:table-cell">R</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-700 hidden sm:table-cell">P</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-700">Bramki</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-700">Pkt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {finalStandings.map((player, index) => (
                        <tr key={player.name} className={index < 3 ? 'bg-yellow-50' : ''}>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-sm sm:text-base">
                            {index === 0 && '🥇'}
                            {index === 1 && '🥈'}
                            {index === 2 && '🥉'}
                            {index > 2 && `${index + 1}.`}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-xs sm:text-base">{player.name}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-base">{player.matches}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-green-600 text-xs sm:text-base hidden sm:table-cell">{player.wins}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-gray-600 text-xs sm:text-base hidden sm:table-cell">{player.draws}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-red-600 text-xs sm:text-base hidden sm:table-cell">{player.losses}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-base">{player.goalsFor}:{player.goalsAgainst}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-indigo-600 text-sm sm:text-base">{player.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <button
                  onClick={() => setStep(4)}
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm sm:text-base"
                >
                  Wstecz do wyników
                </button>
                <button
                  onClick={exportResults}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  Eksportuj wyniki
                </button>
                <button
                  onClick={() => {
                    setStep(1);
                    setMatches([]);
                    setResults({});
                    setFinalStandings([]);
                  }}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                  Nowy turniej
                </button>
              </div>
              
              <button
                onClick={() => {
                  setReturnStep(5);
                  setStep(2);
                }}
                className="w-full bg-indigo-100 text-indigo-700 py-2 sm:py-3 rounded-lg hover:bg-indigo-200 transition-colors font-medium text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                Edytuj imiona zawodników
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}