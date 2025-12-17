import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Trophy, Download } from 'lucide-react';

// Local storage key for persistence
const STORAGE_KEY = 'team_tournament_state_v1';

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

export default function TournamentScheduler() {
  const [step, setStep] = useState(1);
  const [numTeams, setNumTeams] = useState('4');
  const [numFields, setNumFields] = useState('1');
  const [matchesPerPair, setMatchesPerPair] = useState('1');
  const [teams, setTeams] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [expandedTeams, setExpandedTeams] = useState({});
  const [results, setResults] = useState({});
  const [showStandings, setShowStandings] = useState(false);

  // Debounced persist: save to localStorage 500ms after last change
  const saveTimeoutRef = useRef(null);

  // Load persisted state on mount
  useEffect(() => {
    const saved = loadStateFromStorage();
    if (saved) {
      if (typeof saved.step === 'number') setStep(saved.step);
      if (typeof saved.numTeams === 'string') setNumTeams(saved.numTeams);
      if (typeof saved.numFields === 'string') setNumFields(saved.numFields);
      if (typeof saved.matchesPerPair === 'string') setMatchesPerPair(saved.matchesPerPair);
      if (Array.isArray(saved.teams)) setTeams(saved.teams);
      if (Array.isArray(saved.schedule)) setSchedule(saved.schedule);
      if (saved.results && typeof saved.results === 'object') setResults(saved.results);
      if (typeof saved.showStandings === 'boolean') setShowStandings(saved.showStandings);
    }
  }, []);

  // Save state changes with debounce
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      const stateToSave = {
        step,
        numTeams,
        numFields,
        matchesPerPair,
        teams,
        schedule,
        results,
        showStandings
      };
      saveStateToStorage(stateToSave);
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [step, numTeams, numFields, matchesPerPair, teams, schedule, results, showStandings]);

  const initializeTeams = () => {
    const teamCount = parseInt(numTeams) || 2;
    const newTeams = Array.from({ length: teamCount }, (_, i) => ({
      id: i + 1,
      name: `Drużyna ${i + 1}`,
      players: []
    }));
    setTeams(newTeams);
    setStep(2);
  };

  const updateTeamName = (id, name) => {
    const trimmedName = name.trim();
    let finalName = name;
    
    // Walidacja unikalności - sprawdź czy nazwa już istnieje (ignorując obecną drużynę)
    if (trimmedName) {
      const duplicateTeam = teams.find(t => 
        t.id !== id && 
        !t.isPause && 
        t.name.trim().toLowerCase() === trimmedName.toLowerCase()
      );
      
      if (duplicateTeam) {
        // Znajdź numer do dodania
        let counter = 2;
        let uniqueName = `${trimmedName} (${counter})`;
        while (teams.some(t => t.id !== id && !t.isPause && t.name.trim().toLowerCase() === uniqueName.toLowerCase())) {
          counter++;
          uniqueName = `${trimmedName} (${counter})`;
        }
        finalName = uniqueName;
      }
    }
    
    setTeams(teams.map(t => t.id === id ? { ...t, name: finalName } : t));
  };

  const addNewTeam = () => {
    const newId = teams.length > 0 ? Math.max(...teams.map(t => t.id)) + 1 : 1;
    const newTeam = {
      id: newId,
      name: `Drużyna ${newId}`,
      players: []
    };
    setTeams([...teams, newTeam]);
    setNumTeams(String(teams.length + 1));
    // Rozwiń nowo dodaną drużynę
    setExpandedTeams(prev => ({ ...prev, [newId]: true }));
  };

  const removeTeam = (teamId) => {
    if (teams.length <= 2) {
      alert('Turniej musi mieć co najmniej 2 drużyny!');
      return;
    }
    
    // Check if this team has played any matches
    const teamMatches = schedule.filter(m => 
      (m.home && m.home.id === teamId) || (m.away && m.away.id === teamId)
    );
    
    const hasResults = teamMatches.some(m => 
      results[m.id] && results[m.id].homeScore !== null && results[m.id].awayScore !== null
    );
    
    let confirmMessage = 'Czy na pewno chcesz usunąć tę drużynę?';
    if (hasResults) {
      confirmMessage = 'Ta drużyna ma rozegrane mecze. Po usunięciu, drużyna zostanie zastąpiona PAUZĄ. Czy na pewno chcesz kontynuować?';
    }
    
    if (window.confirm(confirmMessage)) {
      if (hasResults && schedule.length > 0) {
        // Replace team with PAUSE instead of removing
        const pauseTeam = {
          id: teamId,
          name: 'PAUZA',
          players: [],
          isPause: true
        };
        setTeams(teams.map(t => t.id === teamId ? pauseTeam : t));
      } else {
        // Remove team and regenerate schedule
        const updatedTeams = teams.filter(t => t.id !== teamId);
        setTeams(updatedTeams);
        setNumTeams(String(updatedTeams.length));
        
        if (schedule.length > 0) {
          setTimeout(() => {
            generateBergerSchedule(true);
          }, 100);
        }
      }
    }
  };

  const addPlayer = (teamId) => {
    setTeams(teams.map(t => 
      t.id === teamId 
        ? { ...t, players: [...t.players, ''] }
        : t
    ));
  };

  const updatePlayer = (teamId, playerIndex, value) => {
    setTeams(teams.map(t => 
      t.id === teamId 
        ? { 
            ...t, 
            players: t.players.map((p, i) => i === playerIndex ? value : p)
          }
        : t
    ));
  };

  const removePlayer = (teamId, playerIndex) => {
    setTeams(teams.map(t => 
      t.id === teamId 
        ? { ...t, players: t.players.filter((_, i) => i !== playerIndex) }
        : t
    ));
  };

  const toggleTeamExpanded = (teamId) => {
    setExpandedTeams(prev => ({ ...prev, [teamId]: !prev[teamId] }));
  };

  const generateBergerSchedule = (preserveResults = false) => {
    const n = teams.length;
    const isOdd = n % 2 !== 0;
    const totalTeams = isOdd ? n + 1 : n;
    const rounds = totalTeams - 1;
    const matchesPerRound = totalTeams / 2;
    const numMatchesPerPair = parseInt(matchesPerPair) || 1;

    const teamList = [...Array(totalTeams).keys()].map(i => i + 1);
    if (isOdd) teamList[totalTeams - 1] = null;

    const allMatches = [];

    // Generuj podstawową rundę Bergera
    for (let round = 0; round < rounds; round++) {
      const roundMatches = [];
      
      for (let match = 0; match < matchesPerRound; match++) {
        let home, away;
        
        if (match === 0) {
          home = teamList[0];
          away = teamList[totalTeams - 1];
        } else {
          home = teamList[match];
          away = teamList[totalTeams - 1 - match];
        }

        if (home !== null && away !== null) {
          roundMatches.push({ home, away });
        }
      }

      allMatches.push(roundMatches);

      const fixed = teamList[0];
      const rotating = teamList.slice(1);
      rotating.unshift(rotating.pop());
      teamList.splice(1, rotating.length, ...rotating);
    }

    // Jeśli więcej niż 1 mecz na parę, dodaj kolejne rundy z zamienionymi gospodarzami/gośćmi
    const finalMatches = [];
    for (let iteration = 0; iteration < numMatchesPerPair; iteration++) {
      allMatches.forEach((roundMatches) => {
        const roundMatchesCopy = roundMatches.map(match => {
          // Dla nieparzystych iteracji (1, 3, 5...) zamieniamy gospodarza z gościem
          if (iteration % 2 === 1) {
            return { home: match.away, away: match.home };
          }
          return { ...match };
        });
        finalMatches.push(roundMatchesCopy);
      });
    }

    const scheduledMatches = [];
    const fieldsCount = parseInt(numFields) || 1;
    let fieldAssignments = Array(fieldsCount).fill(0);

    // Create map of old results by team IDs
    const oldResultsByTeamIds = {};
    if (preserveResults && schedule.length > 0) {
      schedule.forEach(match => {
        if (match.home && match.away) {
          const key = `${match.home.id}-${match.away.id}`;
          const reverseKey = `${match.away.id}-${match.home.id}`;
          if (results[match.id]) {
            oldResultsByTeamIds[key] = { ...results[match.id], isHome: true };
            oldResultsByTeamIds[reverseKey] = { 
              homeScore: results[match.id].awayScore, 
              awayScore: results[match.id].homeScore,
              isHome: false 
            };
          }
        }
      });
    }

    const newResults = {};

    finalMatches.forEach((roundMatches, roundIndex) => {
      roundMatches.forEach((match) => {
        const fieldIndex = fieldAssignments.indexOf(Math.min(...fieldAssignments));
        
        const matchId = `r${roundIndex + 1}-f${fieldIndex + 1}-${match.home}-${match.away}`;
        
        const homeTeam = teams.find(t => t.id === match.home);
        const awayTeam = teams.find(t => t.id === match.away);
        
        scheduledMatches.push({
          id: matchId,
          round: roundIndex + 1,
          field: fieldIndex + 1,
          home: homeTeam,
          away: awayTeam,
          timeSlot: fieldAssignments[fieldIndex] + 1
        });

        // Restore results if preserving
        if (preserveResults && homeTeam && awayTeam) {
          const key = `${match.home}-${match.away}`;
          if (oldResultsByTeamIds[key]) {
            const oldResult = oldResultsByTeamIds[key];
            newResults[matchId] = {
              homeScore: oldResult.isHome ? oldResult.homeScore : oldResult.awayScore,
              awayScore: oldResult.isHome ? oldResult.awayScore : oldResult.homeScore
            };
          }
        }

        fieldAssignments[fieldIndex]++;
      });
    });

    setSchedule(scheduledMatches);
    if (preserveResults) {
      setResults(newResults);
    } else {
      setResults({});
    }
    setStep(3);
  };

  const updateResult = (matchId, homeScore, awayScore) => {
    setResults(prev => ({
      ...prev,
      [matchId]: {
        homeScore: homeScore === '' ? null : parseInt(homeScore),
        awayScore: awayScore === '' ? null : parseInt(awayScore)
      }
    }));
  };

  const calculateStandings = () => {
    const standings = teams
      .filter(team => !team.isPause)
      .map(team => ({
        id: team.id,
        name: team.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      }));

    schedule.forEach(match => {
      // Skip matches with PAUSE
      if ((match.home && match.home.isPause) || (match.away && match.away.isPause)) {
        return;
      }
      
      const result = results[match.id];
      if (result && result.homeScore !== null && result.awayScore !== null) {
        const homeTeam = standings.find(t => t.id === match.home.id);
        const awayTeam = standings.find(t => t.id === match.away.id);

        if (!homeTeam || !awayTeam) return;

        homeTeam.played++;
        awayTeam.played++;
        homeTeam.goalsFor += result.homeScore;
        homeTeam.goalsAgainst += result.awayScore;
        awayTeam.goalsFor += result.awayScore;
        awayTeam.goalsAgainst += result.homeScore;

        if (result.homeScore > result.awayScore) {
          homeTeam.won++;
          homeTeam.points += 3;
          awayTeam.lost++;
        } else if (result.homeScore < result.awayScore) {
          awayTeam.won++;
          awayTeam.points += 3;
          homeTeam.lost++;
        } else {
          homeTeam.drawn++;
          awayTeam.drawn++;
          homeTeam.points += 1;
          awayTeam.points += 1;
        }

        homeTeam.goalDifference = homeTeam.goalsFor - homeTeam.goalsAgainst;
        awayTeam.goalDifference = awayTeam.goalsFor - awayTeam.goalsAgainst;
      }
    });

    return standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
  };

  const groupByRound = () => {
    return schedule.reduce((acc, match) => {
      if (!acc[match.round]) acc[match.round] = [];
      acc[match.round].push(match);
      return acc;
    }, {});
  };

  const exportToExcel = () => {
    const standings = calculateStandings();
    
    // Use BOM for UTF-8 and semicolon as separator for better Excel compatibility
    let csvContent = "\uFEFF"; // UTF-8 BOM
    
    // Add tournament title
    csvContent += "TABELA WYNIKOWA TURNIEJU\r\n\r\n";
    
    // Add standings table with semicolon separator
    csvContent += "Poz;Drużyna;Mecze;Wygrane;Remisy;Porażki;Bramki zdobyte;Bramki stracone;Różnica bramek;Punkty\r\n";
    standings.forEach((team, index) => {
      csvContent += `${index + 1};${team.name};${team.played};${team.won};${team.drawn};${team.lost};${team.goalsFor};${team.goalsAgainst};${team.goalDifference};${team.points}\r\n`;
    });
    
    // Add spacing
    csvContent += "\r\n\r\n";
    
    // Add match results
    csvContent += "WYNIKI MECZÓW\r\n\r\n";
    csvContent += "Kolejka;Boisko;Drużyna gospodarzy;Wynik gospodarzy;Wynik gości;Drużyna gości\r\n";
    
    const roundsGrouped = groupByRound();
    Object.entries(roundsGrouped).forEach(([round, matches]) => {
      matches.forEach((match) => {
        const result = results[match.id];
        const homeScore = (result && result.homeScore !== null) ? result.homeScore : '-';
        const awayScore = (result && result.awayScore !== null) ? result.awayScore : '-';
        csvContent += `${round};${match.field};${match.home.name};${homeScore};${awayScore};${match.away.name}\r\n`;
      });
    });
    
    // Add team rosters if players exist
    const teamsWithPlayers = teams.filter(t => t.players && t.players.length > 0);
    if (teamsWithPlayers.length > 0) {
      csvContent += "\r\n\r\n";
      csvContent += "SKŁADY DRUŻYN\r\n\r\n";
      csvContent += "Drużyna;Zawodnik\r\n";
      teamsWithPlayers.forEach(team => {
        team.players.forEach((player, idx) => {
          if (player.trim()) {
            csvContent += `${team.name};${idx + 1}. ${player}\r\n`;
          }
        });
      });
    }
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `turniej_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetTournament = () => {
    if (window.confirm('Czy na pewno chcesz zresetować turniej? Wszystkie dane zostaną usunięte.')) {
      setStep(1);
      setNumTeams('4');
      setNumFields('1');
      setMatchesPerPair('1');
      setTeams([]);
      setSchedule([]);
      setExpandedTeams({});
      setResults({});
      setShowStandings(false);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const editTeams = () => {
    setStep(2);
  };

  const editFields = () => {
    const newFields = prompt('Podaj nową liczbę boisk:', numFields);
    if (newFields && !isNaN(newFields) && parseInt(newFields) >= 1) {
      const oldNumFields = numFields;
      
      // First update the state, then regenerate
      setNumFields(newFields);
      
      // Use the new fields value directly instead of relying on state update
      const n = teams.length;
      const isOdd = n % 2 !== 0;
      const totalTeams = isOdd ? n + 1 : n;
      const rounds = totalTeams - 1;
      const matchesPerRound = totalTeams / 2;
      const numMatchesPerPair = parseInt(matchesPerPair) || 1;

      const teamList = [...Array(totalTeams).keys()].map(i => i + 1);
      if (isOdd) teamList[totalTeams - 1] = null;

      const allMatches = [];

      for (let round = 0; round < rounds; round++) {
        const roundMatches = [];
        
        for (let match = 0; match < matchesPerRound; match++) {
          let home, away;
          
          if (match === 0) {
            home = teamList[0];
            away = teamList[totalTeams - 1];
          } else {
            home = teamList[match];
            away = teamList[totalTeams - 1 - match];
          }

          if (home !== null && away !== null) {
            roundMatches.push({ home, away });
          }
        }

        allMatches.push(roundMatches);

        const fixed = teamList[0];
        const rotating = teamList.slice(1);
        rotating.unshift(rotating.pop());
        teamList.splice(1, rotating.length, ...rotating);
      }

      // Jeśli więcej niż 1 mecz na parę, dodaj kolejne rundy z zamienionymi gospodarzami/gośćmi
      const finalMatches = [];
      for (let iteration = 0; iteration < numMatchesPerPair; iteration++) {
        allMatches.forEach((roundMatches) => {
          const roundMatchesCopy = roundMatches.map(match => {
            // Dla nieparzystych iteracji (1, 3, 5...) zamieniamy gospodarza z gościem
            if (iteration % 2 === 1) {
              return { home: match.away, away: match.home };
            }
            return { ...match };
          });
          finalMatches.push(roundMatchesCopy);
        });
      }

      const scheduledMatches = [];
      const fieldsCount = parseInt(newFields) || 1;
      let fieldAssignments = Array(fieldsCount).fill(0);

      // Create map of old results by team IDs
      const oldResultsByTeamIds = {};
      schedule.forEach(match => {
        if (match.home && match.away) {
          const key = `${match.home.id}-${match.away.id}`;
          const reverseKey = `${match.away.id}-${match.home.id}`;
          if (results[match.id]) {
            oldResultsByTeamIds[key] = { ...results[match.id], isHome: true };
            oldResultsByTeamIds[reverseKey] = { 
              homeScore: results[match.id].awayScore, 
              awayScore: results[match.id].homeScore,
              isHome: false 
            };
          }
        }
      });

      const newResults = {};

      finalMatches.forEach((roundMatches, roundIndex) => {
        roundMatches.forEach((match) => {
          const fieldIndex = fieldAssignments.indexOf(Math.min(...fieldAssignments));
          
          const matchId = `r${roundIndex + 1}-f${fieldIndex + 1}-${match.home}-${match.away}`;
          
          const homeTeam = teams.find(t => t.id === match.home);
          const awayTeam = teams.find(t => t.id === match.away);
          
          scheduledMatches.push({
            id: matchId,
            round: roundIndex + 1,
            field: fieldIndex + 1,
            home: homeTeam,
            away: awayTeam,
            timeSlot: fieldAssignments[fieldIndex] + 1
          });

          // Restore results
          if (homeTeam && awayTeam) {
            const key = `${match.home}-${match.away}`;
            if (oldResultsByTeamIds[key]) {
              const oldResult = oldResultsByTeamIds[key];
              newResults[matchId] = {
                homeScore: oldResult.isHome ? oldResult.homeScore : oldResult.awayScore,
                awayScore: oldResult.isHome ? oldResult.awayScore : oldResult.homeScore
              };
            }
          }

          fieldAssignments[fieldIndex]++;
        });
      });

      setSchedule(scheduledMatches);
      setResults(newResults);
      alert(`Harmonogram został zaktualizowany z ${oldNumFields} na ${newFields} boisk. Wyniki zostały zachowane.`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-900 mb-1 sm:mb-2 text-center">
                Generator Turniejów
              </h1>
              <p className="text-sm sm:text-base text-gray-600 text-center mb-0">
                System Bergera - Każdy z każdym
              </p>
            </div>
            {step > 1 && (
              <button
                onClick={resetTournament}
                className="ml-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition duration-200 text-xs sm:text-sm whitespace-nowrap"
                title="Resetuj turniej"
              >
                🔄 Resetuj
              </button>
            )}
          </div>
          <div className="mb-4 sm:mb-6 md:mb-8"></div>

          {/* Step 1: Configuration */}
          {step === 1 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-indigo-50 p-4 sm:p-6 rounded-lg sm:rounded-xl">
                <label className="block text-base sm:text-lg font-semibold text-indigo-900 mb-2 sm:mb-3">
                  Liczba drużyn
                </label>
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={numTeams}
                  onChange={(e) => setNumTeams(e.target.value)}
                  className="w-full p-3 sm:p-4 text-xl sm:text-2xl border-2 border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Wpisz liczbę"
                />
              </div>

              <div className="bg-green-50 p-4 sm:p-6 rounded-lg sm:rounded-xl">
                <label className="block text-base sm:text-lg font-semibold text-green-900 mb-2 sm:mb-3">
                  Liczba boisk
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={numFields}
                  onChange={(e) => setNumFields(e.target.value)}
                  className="w-full p-3 sm:p-4 text-xl sm:text-2xl border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Wpisz liczbę"
                />
              </div>

              <div className="bg-purple-50 p-4 sm:p-6 rounded-lg sm:rounded-xl">
                <label className="block text-base sm:text-lg font-semibold text-purple-900 mb-2 sm:mb-3">
                  Liczba meczów między drużynami
                </label>
                <p className="text-xs sm:text-sm text-purple-700 mb-2">
                  Wybierz ile razy każda para drużyn ma ze sobą zagrać
                </p>
                <select
                  value={matchesPerPair}
                  onChange={(e) => setMatchesPerPair(e.target.value)}
                  className="w-full p-3 sm:p-4 text-xl sm:text-2xl border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="1">1 mecz (pojedyncza runda)</option>
                  <option value="2">2 mecze (mecz i rewanż)</option>
                  <option value="3">3 mecze</option>
                  <option value="4">4 mecze</option>
                </select>
              </div>

              <button
                onClick={initializeTeams}
                disabled={!numTeams || parseInt(numTeams) < 2}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl transition duration-200 text-base sm:text-lg"
              >
                Dalej: Nazwij drużyny
              </button>
            </div>
          )}

          {/* Step 2: Team Setup */}
          {step === 2 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Konfiguracja drużyn</h2>
                <span className="text-xs sm:text-sm text-gray-600">Opcjonalne: dodaj zawodników</span>
              </div>

              <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto pr-1 sm:pr-2">
                {teams.map((team) => (
                  <div key={team.id} className={`rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 ${team.isPause ? 'bg-gray-200 border-gray-400 opacity-70' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <span className={`font-bold w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base shrink-0 ${team.isPause ? 'bg-gray-500 text-white' : 'bg-indigo-600 text-white'}`}>
                        {team.isPause ? '⏸' : team.id}
                      </span>
                      <input
                        type="text"
                        value={team.name}
                        onChange={(e) => updateTeamName(team.id, e.target.value)}
                        disabled={team.isPause}
                        className={`flex-1 p-2 sm:p-3 border-2 rounded-lg font-semibold text-sm sm:text-base ${team.isPause ? 'bg-gray-300 text-gray-600 cursor-not-allowed border-gray-400' : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500'}`}
                        placeholder={team.isPause ? 'PAUZA - Drużyna usunięta' : `Nazwa drużyny ${team.id}`}
                      />
                      {!team.isPause && (
                        <>
                          <button
                            onClick={() => toggleTeamExpanded(team.id)}
                            className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg shrink-0"
                          >
                            {expandedTeams[team.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                          {teams.length > 2 && (
                            <button
                              onClick={() => removeTeam(team.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg shrink-0"
                              title="Usuń drużynę"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </>
                      )}
                      {team.isPause && (
                        <span className="text-xs sm:text-sm text-gray-500 italic px-2">
                          Usunięta - ma rozegrane mecze
                        </span>
                      )}
                    </div>

                    {!team.isPause && expandedTeams[team.id] && (
                      <div className="ml-0 sm:ml-13 space-y-2">
                        {team.players.map((player, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={player}
                              onChange={(e) => updatePlayer(team.id, index, e.target.value)}
                              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm sm:text-base"
                              placeholder={`Zawodnik ${index + 1}`}
                            />
                            <button
                              onClick={() => removePlayer(team.id, index)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg shrink-0"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addPlayer(team.id)}
                          className="flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg text-sm"
                        >
                          <Plus size={14} />
                          Dodaj zawodnika
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={addNewTeam}
                className="w-full border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl transition duration-200 text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Dodaj dodatkową drużynę
              </button>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl transition duration-200 text-sm sm:text-base"
                >
                  Wstecz
                </button>
                <button
                  onClick={() => generateBergerSchedule(schedule.length > 0)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl transition duration-200 text-sm sm:text-base"
                >
                  {schedule.length > 0 ? 'Zaktualizuj harmonogram' : 'Generuj harmonogram'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Schedule Display with Results */}
          {step === 3 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 sm:p-6 rounded-lg sm:rounded-xl">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Harmonogram turnieju</h2>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-6 text-xs sm:text-sm">
                  <span>📊 Drużyn: {teams.length}</span>
                  <span>🏟️ Boisk: {numFields}</span>
                  <span>⚽ Meczów: {schedule.length}</span>
                  <span>🔄 Kolejek: {teams.length % 2 === 0 ? teams.length - 1 : teams.length}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={editTeams}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition duration-200 text-sm sm:text-base"
                >
                  ✏️ Edytuj drużyny
                </button>
                <button
                  onClick={editFields}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition duration-200 text-sm sm:text-base"
                >
                  🏟️ Edytuj boiska
                </button>
              </div>

              {/* Toggle Standings Button */}
              <button
                onClick={() => setShowStandings(!showStandings)}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Trophy size={18} />
                {showStandings ? 'Ukryj tabelę' : 'Pokaż tabelę wynikową'}
              </button>

              {/* Standings Table */}
              {showStandings && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 sm:p-6 rounded-lg sm:rounded-xl border-2 border-yellow-400">
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <Trophy className="text-yellow-600" size={20} />
                    Tabela wynikowa
                  </h3>
                  <div className="overflow-x-auto -mx-3 sm:mx-0">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="bg-gray-800 text-white">
                        <tr>
                          <th className="p-1 sm:p-3 text-left sticky left-0 bg-gray-800">Poz</th>
                          <th className="p-1 sm:p-3 text-left sticky left-8 sm:left-12 bg-gray-800">Drużyna</th>
                          <th className="p-1 sm:p-3 text-center">M</th>
                          <th className="p-1 sm:p-3 text-center">W</th>
                          <th className="p-1 sm:p-3 text-center">R</th>
                          <th className="p-1 sm:p-3 text-center">P</th>
                          <th className="p-1 sm:p-3 text-center">Br+</th>
                          <th className="p-1 sm:p-3 text-center">Br-</th>
                          <th className="p-1 sm:p-3 text-center">Różn</th>
                          <th className="p-1 sm:p-3 text-center font-bold">Pkt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calculateStandings().map((team, index) => (
                          <tr 
                            key={team.id} 
                            className={`border-b ${index === 0 ? 'bg-yellow-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                          >
                            <td className="p-1 sm:p-3 font-bold sticky left-0 bg-inherit">
                              {index === 0 && <Trophy className="inline text-yellow-600 mr-1" size={12} />}
                              {index + 1}
                            </td>
                            <td className="p-1 sm:p-3 font-semibold sticky left-8 sm:left-12 bg-inherit min-w-24 sm:min-w-0">{team.name}</td>
                            <td className="p-1 sm:p-3 text-center">{team.played}</td>
                            <td className="p-1 sm:p-3 text-center text-green-600 font-semibold">{team.won}</td>
                            <td className="p-1 sm:p-3 text-center text-gray-600">{team.drawn}</td>
                            <td className="p-1 sm:p-3 text-center text-red-600 font-semibold">{team.lost}</td>
                            <td className="p-1 sm:p-3 text-center">{team.goalsFor}</td>
                            <td className="p-1 sm:p-3 text-center">{team.goalsAgainst}</td>
                            <td className={`p-1 sm:p-3 text-center font-semibold ${team.goalDifference > 0 ? 'text-green-600' : team.goalDifference < 0 ? 'text-red-600' : ''}`}>
                              {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                            </td>
                            <td className="p-1 sm:p-3 text-center font-bold text-base sm:text-lg text-indigo-700">{team.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 sm:mt-4 text-xs text-gray-600">
                    <p><strong>Legenda:</strong> M - mecze, W - wygrane, R - remisy, P - porażki, Br+ - bramki zdobyte, Br- - bramki stracone, Różn - różnica bramek, Pkt - punkty</p>
                  </div>
                </div>
              )}

              {/* View by Round with Score Input */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Mecze - wpisz wyniki</h3>
                {Object.entries(groupByRound()).map(([round, matches]) => (
                  <div key={round} className="mb-4 sm:mb-6">
                    <div className="bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-t-lg font-bold text-sm sm:text-base">
                      Kolejka {round}
                    </div>
                    <div className="bg-white border-2 border-indigo-600 rounded-b-lg p-2 sm:p-4 space-y-2 sm:space-y-3">
                      {matches.map((match) => {
                        const isPauseMatch = (match.home && match.home.isPause) || (match.away && match.away.isPause);
                        
                        return (
                          <div key={match.id} className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg ${isPauseMatch ? 'bg-gray-200' : 'bg-gray-50'}`}>
                            <span className="text-xs sm:text-sm text-gray-600 font-semibold sm:w-20">
                              Boisko {match.field}
                            </span>
                            
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 flex-1">
                              <span className={`font-semibold text-sm sm:text-base sm:w-40 text-center sm:text-right ${isPauseMatch ? 'text-gray-500 italic' : 'text-indigo-900'}`}>
                                {match.home.name}
                              </span>
                              
                              {isPauseMatch ? (
                                <div className="flex items-center justify-center gap-2 text-gray-500 italic">
                                  <span className="text-sm sm:text-base">--- PAUZA ---</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder="-"
                                    value={results[match.id]?.homeScore ?? ''}
                                    onChange={(e) => updateResult(match.id, e.target.value, results[match.id]?.awayScore ?? '')}
                                    className="w-14 sm:w-16 p-2 text-center border-2 border-indigo-300 rounded-lg font-bold text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                  <span className="text-gray-400 font-bold text-lg sm:text-xl">:</span>
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder="-"
                                    value={results[match.id]?.awayScore ?? ''}
                                    onChange={(e) => updateResult(match.id, results[match.id]?.homeScore ?? '', e.target.value)}
                                    className="w-14 sm:w-16 p-2 text-center border-2 border-indigo-300 rounded-lg font-bold text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                </div>
                              )}
                              
                              <span className={`font-semibold text-sm sm:text-base sm:w-40 text-center sm:text-left ${isPauseMatch ? 'text-gray-500 italic' : 'text-indigo-900'}`}>
                                {match.away.name}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={exportToExcel}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl transition duration-200 text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Eksportuj do Excel (CSV)
                </button>
                <button
                  onClick={resetTournament}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl transition duration-200 text-sm sm:text-base"
                >
                  Resetuj turniej
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
