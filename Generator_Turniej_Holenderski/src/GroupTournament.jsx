import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, Trophy, Download, ArrowLeft, ArrowRight, Users, RefreshCw } from 'lucide-react';

const STORAGE_KEY = 'swiss_tournament_state_v1';

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

export default function GroupTournament() {
  // Stan kroków
  const [step, setStep] = useState(1);
  
  // Konfiguracja turnieju
  const [numTeams, setNumTeams] = useState('8');
  const [swissRounds, setSwissRounds] = useState('3');
  const [playoffTopN, setPlayoffTopN] = useState('4');
  const [pointsWin, setPointsWin] = useState(3);
  const [pointsDraw, setPointsDraw] = useState(1);
  const [pointsBye, setPointsBye] = useState(3);
  
  // Drużyny
  const [teams, setTeams] = useState([]);
  const [expandedTeams, setExpandedTeams] = useState({});
  
  // Rundy Swiss
  const [swissMatches, setSwissMatches] = useState([]); // Array of rounds, each containing matches
  const [swissResults, setSwissResults] = useState({});
  const [currentSwissRound, setCurrentSwissRound] = useState(0);
  
  // Faza playoff
  const [playoffBracket, setPlayoffBracket] = useState([]);
  const [playoffResults, setPlayoffResults] = useState({});
  const [finalRanking, setFinalRanking] = useState([]);
  
  // UI
  const [showStandings, setShowStandings] = useState(false);
  const [selectedRound, setSelectedRound] = useState(0);
  
  const saveTimeoutRef = useRef(null);

  // Wczytaj stan z localStorage
  useEffect(() => {
    const saved = loadStateFromStorage();
    if (saved) {
      if (typeof saved.step === 'number') setStep(saved.step);
      if (typeof saved.numTeams === 'string') setNumTeams(saved.numTeams);
      if (typeof saved.swissRounds === 'string') setSwissRounds(saved.swissRounds);
      if (typeof saved.playoffTopN === 'string') setPlayoffTopN(saved.playoffTopN);
      if (typeof saved.pointsWin === 'number') setPointsWin(saved.pointsWin);
      if (typeof saved.pointsDraw === 'number') setPointsDraw(saved.pointsDraw);
      if (typeof saved.pointsBye === 'number') setPointsBye(saved.pointsBye);
      if (Array.isArray(saved.teams)) setTeams(saved.teams);
      if (Array.isArray(saved.swissMatches)) setSwissMatches(saved.swissMatches);
      if (saved.swissResults) setSwissResults(saved.swissResults);
      if (typeof saved.currentSwissRound === 'number') setCurrentSwissRound(saved.currentSwissRound);
      if (Array.isArray(saved.playoffBracket)) setPlayoffBracket(saved.playoffBracket);
      if (saved.playoffResults) setPlayoffResults(saved.playoffResults);
      if (Array.isArray(saved.finalRanking)) setFinalRanking(saved.finalRanking);
    }
  }, []);

  // Zapisz stan do localStorage
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      const stateToSave = {
        step,
        numTeams,
        swissRounds,
        playoffTopN,
        pointsWin,
        pointsDraw,
        pointsBye,
        teams,
        swissMatches,
        swissResults,
        currentSwissRound,
        playoffBracket,
        playoffResults,
        finalRanking
      };
      saveStateToStorage(stateToSave);
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [step, numTeams, swissRounds, playoffTopN, pointsWin, pointsDraw, pointsBye, teams, swissMatches, swissResults, currentSwissRound, playoffBracket, playoffResults, finalRanking]);

  // Krok 1: Inicjalizacja drużyn
  const initializeTeams = () => {
    const teamCount = parseInt(numTeams) || 4;
    const newTeams = Array.from({ length: teamCount }, (_, i) => ({
      id: `team-${i + 1}`,
      name: `Drużyna ${i + 1}`,
      players: [],
      swissPoints: 0,
      swissOpponents: [],
      byeCount: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      wins: 0,
      draws: 0,
      losses: 0
    }));
    setTeams(newTeams);
    setStep(2);
  };

  // Aktualizacja nazwy drużyny
  const updateTeamName = (id, name) => {
    const trimmedName = name.trim();
    let finalName = name;
    
    if (trimmedName) {
      const duplicateTeam = teams.find(t => 
        t.id !== id && t.name.trim().toLowerCase() === trimmedName.toLowerCase()
      );
      
      if (duplicateTeam) {
        let counter = 2;
        let uniqueName = `${trimmedName} (${counter})`;
        while (teams.some(t => t.id !== id && t.name.trim().toLowerCase() === uniqueName.toLowerCase())) {
          counter++;
          uniqueName = `${trimmedName} (${counter})`;
        }
        finalName = uniqueName;
      }
    }
    
    setTeams(teams.map(t => t.id === id ? { ...t, name: finalName } : t));
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

  // Funkcja generowania parowań Swiss
  const generateSwissPairings = (roundNumber) => {
    const teamsCopy = teams.map(t => ({
      ...t,
      swissPoints: t.swissPoints || 0,
      swissOpponents: t.swissOpponents || [],
      byeCount: t.byeCount || 0
    }));
    
    // Sortuj drużyny wg punktów malejąco, potem różnicy bramek
    const sortedTeams = [...teamsCopy].sort((a, b) => {
      if (b.swissPoints !== a.swissPoints) return b.swissPoints - a.swissPoints;
      const aDiff = (a.goalsFor || 0) - (a.goalsAgainst || 0);
      const bDiff = (b.goalsFor || 0) - (b.goalsAgainst || 0);
      return bDiff - aDiff;
    });

    const pairings = [];
    const used = new Set();

    // Obsługa bye jeśli nieparzysta liczba drużyn
    if (sortedTeams.length % 2 !== 0) {
      // Znajdź drużynę z najmniejszą liczbą bye, która jeszcze nie dostała
      const byeCandidates = sortedTeams.filter(t => !used.has(t.id));
      byeCandidates.sort((a, b) => a.byeCount - b.byeCount);
      
      const byeTeam = byeCandidates[0];
      if (byeTeam) {
        pairings.push({
          id: `r${roundNumber}-bye-${byeTeam.id}`,
          round: roundNumber,
          teamA: byeTeam.id,
          teamB: null,
          isBye: true,
          scoreA: null,
          scoreB: null
        });
        used.add(byeTeam.id);
      }
    }

    // Parowanie pozostałych drużyn
    for (let i = 0; i < sortedTeams.length; i++) {
      const teamA = sortedTeams[i];
      if (used.has(teamA.id)) continue;

      let paired = false;
      // Szukaj najbliższego przeciwnika, którego jeszcze nie spotkał
      for (let j = i + 1; j < sortedTeams.length; j++) {
        const teamB = sortedTeams[j];
        if (used.has(teamB.id)) continue;

        // Sprawdź czy już grali ze sobą
        if (!teamA.swissOpponents.includes(teamB.id)) {
          pairings.push({
            id: `r${roundNumber}-${teamA.id}-${teamB.id}`,
            round: roundNumber,
            teamA: teamA.id,
            teamB: teamB.id,
            isBye: false,
            scoreA: '',
            scoreB: ''
          });
          used.add(teamA.id);
          used.add(teamB.id);
          paired = true;
          break;
        }
      }

      // Jeśli nie znaleziono przeciwnika (wszyscy już spotkani), sparuj z najbliższym dostępnym
      if (!paired) {
        for (let j = i + 1; j < sortedTeams.length; j++) {
          const teamB = sortedTeams[j];
          if (used.has(teamB.id)) continue;
          
          pairings.push({
            id: `r${roundNumber}-${teamA.id}-${teamB.id}`,
            round: roundNumber,
            teamA: teamA.id,
            teamB: teamB.id,
            isBye: false,
            scoreA: '',
            scoreB: '',
            isRematch: true
          });
          used.add(teamA.id);
          used.add(teamB.id);
          break;
        }
      }
    }

    return pairings;
  };

  // Rozpocznij fazę Swiss
  const startSwissPhase = () => {
    // Wygeneruj pierwszą rundę
    const firstRound = generateSwissPairings(1);
    setSwissMatches([firstRound]);
    
    // Inicjalizuj wyniki
    const results = {};
    firstRound.forEach(match => {
      results[match.id] = { scoreA: '', scoreB: '', completed: false };
    });
    setSwissResults(results);
    
    setCurrentSwissRound(1);
    setSelectedRound(1);
    setStep(3);
  };

  // Aktualizacja wyniku meczu Swiss
  const updateSwissScore = (matchId, team, score) => {
    setSwissResults(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: score === '' ? '' : parseInt(score) || 0
      }
    }));
  };

  // Zatwierdź wyniki rundy Swiss
  const confirmSwissRound = (roundNumber) => {
    const roundMatches = swissMatches[roundNumber - 1];
    if (!roundMatches) return;

    // Sprawdź czy wszystkie mecze mają wyniki
    const allCompleted = roundMatches.every(match => {
      if (match.isBye) return true;
      const result = swissResults[match.id];
      return result && result.scoreA !== '' && result.scoreB !== '';
    });

    if (!allCompleted) {
      alert('Uzupełnij wyniki wszystkich meczów przed przejściem dalej!');
      return;
    }

    // Aktualizuj statystyki drużyn
    const updatedTeams = teams.map(team => {
      const teamData = { ...team };
      
      roundMatches.forEach(match => {
        const result = swissResults[match.id];
        
        if (match.isBye && match.teamA === team.id) {
          // Bye - dodaj punkty
          teamData.swissPoints = (teamData.swissPoints || 0) + pointsBye;
          teamData.byeCount = (teamData.byeCount || 0) + 1;
        } else if (!match.isBye) {
          const isTeamA = match.teamA === team.id;
          const isTeamB = match.teamB === team.id;
          
          if (isTeamA || isTeamB) {
            const scoreFor = isTeamA ? parseInt(result.scoreA) : parseInt(result.scoreB);
            const scoreAgainst = isTeamA ? parseInt(result.scoreB) : parseInt(result.scoreA);
            const opponentId = isTeamA ? match.teamB : match.teamA;
            
            teamData.goalsFor = (teamData.goalsFor || 0) + scoreFor;
            teamData.goalsAgainst = (teamData.goalsAgainst || 0) + scoreAgainst;
            
            if (scoreFor > scoreAgainst) {
              teamData.swissPoints = (teamData.swissPoints || 0) + pointsWin;
              teamData.wins = (teamData.wins || 0) + 1;
            } else if (scoreFor === scoreAgainst) {
              teamData.swissPoints = (teamData.swissPoints || 0) + pointsDraw;
              teamData.draws = (teamData.draws || 0) + 1;
            } else {
              teamData.losses = (teamData.losses || 0) + 1;
            }
            
            if (!teamData.swissOpponents.includes(opponentId)) {
              teamData.swissOpponents = [...(teamData.swissOpponents || []), opponentId];
            }
          }
        }
      });
      
      return teamData;
    });

    setTeams(updatedTeams);

    // Oznacz rundę jako ukończoną
    setSwissResults(prev => {
      const updated = { ...prev };
      roundMatches.forEach(match => {
        if (updated[match.id]) {
          updated[match.id].completed = true;
        }
      });
      return updated;
    });

    // Jeśli to nie ostatnia runda, wygeneruj następną
    const totalRounds = parseInt(swissRounds);
    if (roundNumber < totalRounds) {
      const nextRound = generateSwissPairings(roundNumber + 1);
      setSwissMatches(prev => [...prev, nextRound]);
      
      // Inicjalizuj wyniki następnej rundy
      const newResults = {};
      nextRound.forEach(match => {
        newResults[match.id] = { scoreA: '', scoreB: '', completed: false };
      });
      setSwissResults(prev => ({ ...prev, ...newResults }));
      
      setCurrentSwissRound(roundNumber + 1);
      setSelectedRound(roundNumber + 1);
    } else {
      // Wszystkie rundy Swiss zakończone - przejdź do playoff
      alert('Faza Swiss zakończona! Teraz zostanie wygenerowana faza playoff.');
    }
  };

  // Obliczanie tabeli Swiss
  const calculateSwissStandings = () => {
    return [...teams].sort((a, b) => {
      if (b.swissPoints !== a.swissPoints) return b.swissPoints - a.swissPoints;
      const aDiff = (a.goalsFor || 0) - (a.goalsAgainst || 0);
      const bDiff = (b.goalsFor || 0) - (b.goalsAgainst || 0);
      if (bDiff !== aDiff) return bDiff - aDiff;
      return (b.goalsFor || 0) - (a.goalsFor || 0);
    });
  };

  // Generowanie fazy playoff
  const generatePlayoffPhase = () => {
    const standings = calculateSwissStandings();
    const topN = parseInt(playoffTopN);
    
    // Drużyny do playoff
    const playoffTeams = standings.slice(0, topN);
    
    // Sprawdź czy liczba playoff teams jest potęgą 2
    const validSizes = [2, 4, 8, 16];
    if (!validSizes.includes(topN)) {
      alert(`Liczba drużyn w playoff (${topN}) musi być potęgą 2 (2, 4, 8, 16)`);
      return;
    }
    
    // Generuj drabinkę playoff (najlepszy vs najgorszy itd.)
    const bracket = [];
    const numRounds = Math.log2(topN);
    
    // Pierwsza runda playoff - seed przeciwko seed (1 vs 8, 2 vs 7, 3 vs 6, 4 vs 5)
    const firstRound = [];
    for (let i = 0; i < topN / 2; i++) {
      const matchId = `playoff-r1-${i + 1}`;
      firstRound.push({
        id: matchId,
        round: 1,
        roundName: topN === 2 ? 'Finał' : topN === 4 ? 'Półfinał' : `1/${topN}`,
        teamA: playoffTeams[i].id,
        teamB: playoffTeams[topN - 1 - i].id,
        scoreA: '',
        scoreB: '',
        winner: null
      });
    }
    bracket.push(firstRound);
    
    // Kolejne rundy (placeholdery)
    for (let round = 2; round <= numRounds; round++) {
      const roundMatches = [];
      const prevRoundMatches = bracket[round - 2].length;
      for (let i = 0; i < prevRoundMatches / 2; i++) {
        const matchId = `playoff-r${round}-${i + 1}`;
        const remainingTeams = topN / Math.pow(2, round);
        let roundName;
        if (remainingTeams === 1) roundName = 'Finał';
        else if (remainingTeams === 2) roundName = 'Półfinał';
        else roundName = `1/${remainingTeams * 2}`;
        
        roundMatches.push({
          id: matchId,
          round,
          roundName,
          teamA: null,
          teamB: null,
          scoreA: '',
          scoreB: '',
          winner: null
        });
      }
      bracket.push(roundMatches);
    }
    
    setPlayoffBracket(bracket);
    
    // Inicjalizuj wyniki playoff
    const results = {};
    bracket.forEach(round => {
      round.forEach(match => {
        results[match.id] = { scoreA: '', scoreB: '', winner: null };
      });
    });
    setPlayoffResults(results);
    
    setStep(4);
  };

  // Aktualizacja wyniku playoff
  const updatePlayoffScore = (matchId, team, score) => {
    setPlayoffResults(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: score === '' ? '' : parseInt(score) || 0
      }
    }));
  };

  // Zatwierdzenie wyniku playoff
  const confirmPlayoffMatch = (matchId) => {
    const result = playoffResults[matchId];
    if (result.scoreA === '' || result.scoreB === '') {
      alert('Wprowadź wyniki dla obu drużyn');
      return;
    }
    
    const scoreA = parseInt(result.scoreA) || 0;
    const scoreB = parseInt(result.scoreB) || 0;
    
    if (scoreA === scoreB) {
      alert('W fazie playoff nie może być remisu. Wprowadź rozstrzygający wynik.');
      return;
    }
    
    // Znajdź mecz w bracket
    let matchRound = -1;
    let matchIndex = -1;
    playoffBracket.forEach((round, rIdx) => {
      round.forEach((match, mIdx) => {
        if (match.id === matchId) {
          matchRound = rIdx;
          matchIndex = mIdx;
        }
      });
    });
    
    if (matchRound === -1) return;
    
    const match = playoffBracket[matchRound][matchIndex];
    const winnerId = scoreA > scoreB ? match.teamA : match.teamB;
    
    // Aktualizuj zwycięzcę w obecnym meczu
    const updatedBracket = [...playoffBracket];
    updatedBracket[matchRound][matchIndex] = { ...match, winner: winnerId };
    
    // Jeśli to nie finał, przenieś zwycięzcę do następnej rundy
    if (matchRound < playoffBracket.length - 1) {
      const nextRoundMatchIndex = Math.floor(matchIndex / 2);
      const nextMatch = updatedBracket[matchRound + 1][nextRoundMatchIndex];
      
      if (matchIndex % 2 === 0) {
        updatedBracket[matchRound + 1][nextRoundMatchIndex] = {
          ...nextMatch,
          teamA: winnerId
        };
      } else {
        updatedBracket[matchRound + 1][nextRoundMatchIndex] = {
          ...nextMatch,
          teamB: winnerId
        };
      }
    } else {
      // To był finał - ustaw ranking
      calculateFinalRanking(winnerId);
    }
    
    setPlayoffBracket(updatedBracket);
    
    // Oznacz zwycięzcę w wynikach
    setPlayoffResults(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        winner: winnerId
      }
    }));
  };

  // Obliczenie rankingu końcowego
  const calculateFinalRanking = (championId) => {
    const ranking = [];
    
    // 1. miejsce - zwycięzca playoff
    ranking.push({ teamId: championId, place: 1 });
    
    // 2. miejsce - finalista (przegrany finału)
    const finalMatch = playoffBracket[playoffBracket.length - 1][0];
    const runnerUpId = finalMatch.teamA === championId ? finalMatch.teamB : finalMatch.teamA;
    ranking.push({ teamId: runnerUpId, place: 2 });
    
    // Kolejne miejsca z playoff (półfinaliści itd.)
    const topN = parseInt(playoffTopN);
    let currentPlace = 3;
    for (let round = playoffBracket.length - 2; round >= 0; round--) {
      const losers = playoffBracket[round]
        .filter(m => m.winner && m.winner !== championId && m.winner !== runnerUpId)
        .map(m => m.teamA === m.winner ? m.teamB : m.teamA)
        .filter(id => id && !ranking.find(r => r.teamId === id));
      
      losers.forEach(loserId => {
        ranking.push({ teamId: loserId, place: currentPlace });
      });
      currentPlace += losers.length;
    }
    
    // Pozostałe drużyny według wyników Swiss
    const standings = calculateSwissStandings();
    standings.forEach(team => {
      if (!ranking.find(r => r.teamId === team.id)) {
        ranking.push({ teamId: team.id, place: currentPlace++ });
      }
    });
    
    setFinalRanking(ranking);
  };

  // Eksport wyników do CSV
  const exportResults = () => {
    let csv = '\uFEFF';
    csv += 'TURNIEJ - SWISS SYSTEM + PLAYOFF\n\n';
    
    csv += 'PARAMETRY TURNIEJU\n';
    csv += `Liczba drużyn;${teams.length}\n`;
    csv += `Rundy Swiss;${swissRounds}\n`;
    csv += `Drużyn w playoff;${playoffTopN}\n`;
    csv += `Punkty za wygraną;${pointsWin}\n`;
    csv += `Punkty za remis;${pointsDraw}\n`;
    csv += `Punkty za bye;${pointsBye}\n\n`;
    
    // Faza Swiss
    csv += 'FAZA SWISS\n\n';
    const standings = calculateSwissStandings();
    csv += 'Miejsce;Drużyna;Punkty Swiss;Mecze;Wygrane;Remisy;Przegrane;Bramki zdobyte;Bramki stracone;Różnica\n';
    standings.forEach((team, i) => {
      csv += `${i + 1};${team.name};${team.swissPoints};${(team.wins || 0) + (team.draws || 0) + (team.losses || 0)};${team.wins || 0};${team.draws || 0};${team.losses || 0};${team.goalsFor || 0};${team.goalsAgainst || 0};${(team.goalsFor || 0) - (team.goalsAgainst || 0)}\n`;
    });
    csv += '\n';
    
    // Mecze Swiss
    csv += 'MECZE SWISS\n';
    csv += 'Runda;Drużyna A;Wynik;Drużyna B\n';
    swissMatches.forEach((round, idx) => {
      round.forEach(match => {
        const teamA = teams.find(t => t.id === match.teamA);
        const teamB = match.teamB ? teams.find(t => t.id === match.teamB) : null;
        const result = swissResults[match.id];
        const score = match.isBye ? 'BYE' : 
          (result && result.scoreA !== '' && result.scoreB !== '' ? `${result.scoreA}:${result.scoreB}` : '-:-');
        csv += `${idx + 1};${teamA?.name || '?'};${score};${teamB?.name || 'BYE'}\n`;
      });
    });
    csv += '\n';
    
    // Faza playoff
    if (playoffBracket.length > 0) {
      csv += 'FAZA PLAYOFF\n\n';
      playoffBracket.forEach(round => {
        const roundName = round[0].roundName;
        csv += `${roundName}\n`;
        round.forEach(match => {
          if (match.teamA && match.teamB) {
            const teamA = teams.find(t => t.id === match.teamA);
            const teamB = teams.find(t => t.id === match.teamB);
            const result = playoffResults[match.id];
            const score = result && result.scoreA !== '' && result.scoreB !== ''
              ? `${result.scoreA}:${result.scoreB}`
              : '-:-';
            csv += `${teamA?.name || '?'};${score};${teamB?.name || '?'}`;
            if (match.winner) {
              const winner = teams.find(t => t.id === match.winner);
              csv += `;Zwycięzca: ${winner?.name || '?'}`;
            }
            csv += '\n';
          }
        });
        csv += '\n';
      });
    }
    
    if (finalRanking.length > 0) {
      csv += '\nRANKING KOŃCOWY\n';
      csv += 'Miejsce;Drużyna\n';
      finalRanking.forEach(rank => {
        const team = teams.find(t => t.id === rank.teamId);
        csv += `${rank.place};${team?.name || '?'}\n`;
      });
    }
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `turniej-swiss-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Resetowanie turnieju
  const resetTournament = () => {
    if (!window.confirm('Czy na pewno chcesz zresetować turniej? Wszystkie dane zostaną utracone.')) {
      return;
    }
    
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  // Renderowanie kroków
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg">
        <h2 className="text-xl font-bold text-purple-900 mb-2">Jak działa Swiss System?</h2>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>Rundy Swiss:</strong> Drużyny są parowane według podobnej liczby punktów</li>
          <li>• <strong>Unikanie rematchy:</strong> System stara się nie parować drużyn, które już grały</li>
          <li>• <strong>Bye:</strong> Przy nieparzystej liczbie drużyn, najsłabsza bez bye dostaje walkower</li>
          <li>• <strong>Playoff:</strong> Najlepsze drużyny awansują do fazy pucharowej</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Liczba drużyn
          </label>
          <input
            type="number"
            min="4"
            value={numTeams}
            onChange={(e) => setNumTeams(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Liczba rund Swiss
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={swissRounds}
            onChange={(e) => setSwissRounds(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Zazwyczaj 3-5 rund</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Drużyn awansuje do playoff
          </label>
          <select
            value={playoffTopN}
            onChange={(e) => setPlayoffTopN(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="2">2 (Finał)</option>
            <option value="4">4 (Półfinały)</option>
            <option value="8">8 (Ćwierćfinały)</option>
            <option value="16">16</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Punktacja</label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-gray-600">Wygrana</label>
              <input
                type="number"
                min="0"
                value={pointsWin}
                onChange={(e) => setPointsWin(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Remis</label>
              <input
                type="number"
                min="0"
                value={pointsDraw}
                onChange={(e) => setPointsDraw(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Bye</label>
              <input
                type="number"
                min="0"
                value={pointsBye}
                onChange={(e) => setPointsBye(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={initializeTeams}
        disabled={parseInt(numTeams) < 4 || parseInt(swissRounds) < 1}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
      >
        Dalej <ArrowRight className="inline ml-2" size={20} />
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-purple-900">Wprowadź drużyny</h2>
        <button
          onClick={() => setStep(1)}
          className="text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1"
        >
          <ArrowLeft size={20} /> Wstecz
        </button>
      </div>

      <div className="space-y-3">
        {teams.map((team) => (
          <div key={team.id} className="bg-white border-2 border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <input
                type="text"
                value={team.name}
                onChange={(e) => updateTeamName(team.id, e.target.value)}
                className="text-lg font-bold text-purple-900 bg-transparent border-b-2 border-purple-300 focus:border-purple-500 outline-none flex-1"
              />
              <button
                onClick={() => toggleTeamExpanded(team.id)}
                className="ml-4 text-purple-600 hover:text-purple-800"
              >
                {expandedTeams[team.id] ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </button>
            </div>

            {expandedTeams[team.id] && (
              <div className="space-y-2 mt-3 pl-4 border-l-2 border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    <Users size={16} className="inline mr-1" />
                    Zawodnicy ({team.players.length})
                  </span>
                  <button
                    onClick={() => addPlayer(team.id)}
                    className="text-purple-600 hover:text-purple-800 text-sm font-semibold flex items-center gap-1"
                  >
                    <Plus size={16} /> Dodaj
                  </button>
                </div>
                {team.players.map((player, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={player}
                      onChange={(e) => updatePlayer(team.id, index, e.target.value)}
                      placeholder={`Zawodnik ${index + 1}`}
                      className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => removePlayer(team.id, index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {team.players.length === 0 && (
                  <p className="text-xs text-gray-500 italic">Dodaj zawodników do drużyny</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={startSwissPhase}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
      >
        Rozpocznij fazę Swiss <ArrowRight className="inline ml-2" size={20} />
      </button>
    </div>
  );

  const renderStep3 = () => {
    const standings = calculateSwissStandings();
    const totalRounds = parseInt(swissRounds);
    const currentRound = swissMatches[selectedRound - 1] || [];
    const isRoundCompleted = currentRound.length > 0 && swissResults[currentRound[0]?.id]?.completed;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-2xl font-bold text-purple-900">Faza Swiss</h2>
          <button
            onClick={() => setShowStandings(!showStandings)}
            className="bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
          >
            <Trophy size={20} />
            {showStandings ? 'Ukryj tabelę' : 'Pokaż tabelę'}
          </button>
        </div>

        {/* Tabela Swiss */}
        {showStandings && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-purple-900 mb-3">Tabela Swiss</h3>
            <div className="bg-white rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-purple-200">
                  <tr>
                    <th className="px-2 py-2 text-left">#</th>
                    <th className="px-2 py-2 text-left">Drużyna</th>
                    <th className="px-2 py-2 text-center">Pkt</th>
                    <th className="px-2 py-2 text-center">M</th>
                    <th className="px-2 py-2 text-center">W</th>
                    <th className="px-2 py-2 text-center">R</th>
                    <th className="px-2 py-2 text-center">P</th>
                    <th className="px-2 py-2 text-center">BR+</th>
                    <th className="px-2 py-2 text-center">BR-</th>
                    <th className="px-2 py-2 text-center">Diff</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((team, i) => (
                    <tr key={team.id} className={i < parseInt(playoffTopN) ? 'bg-green-50' : ''}>
                      <td className="px-2 py-2">{i + 1}</td>
                      <td className="px-2 py-2 font-semibold">{team.name}</td>
                      <td className="px-2 py-2 text-center font-bold">{team.swissPoints || 0}</td>
                      <td className="px-2 py-2 text-center">{(team.wins || 0) + (team.draws || 0) + (team.losses || 0)}</td>
                      <td className="px-2 py-2 text-center">{team.wins || 0}</td>
                      <td className="px-2 py-2 text-center">{team.draws || 0}</td>
                      <td className="px-2 py-2 text-center">{team.losses || 0}</td>
                      <td className="px-2 py-2 text-center">{team.goalsFor || 0}</td>
                      <td className="px-2 py-2 text-center">{team.goalsAgainst || 0}</td>
                      <td className="px-2 py-2 text-center">{(team.goalsFor || 0) - (team.goalsAgainst || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              * Zielonym ozanczone są drużyny awansujące do playoff
            </p>
          </div>
        )}

        {/* Wybór rundy */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {swissMatches.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedRound(idx + 1)}
              className={`px-4 py-2 rounded-lg font-semibold transition duration-200 ${
                selectedRound === idx + 1
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Runda {idx + 1}
            </button>
          ))}
        </div>

        {/* Mecze wybranej rundy */}
        {currentRound.length > 0 && (
          <div className="bg-white border-2 border-purple-200 rounded-lg p-4">
            <h3 className="text-xl font-bold text-purple-900 mb-4">Runda {selectedRound}</h3>
            <div className="space-y-3">
              {currentRound.map(match => {
                const teamA = teams.find(t => t.id === match.teamA);
                const teamB = match.teamB ? teams.find(t => t.id === match.teamB) : null;
                const result = swissResults[match.id] || {};
                
                return (
                  <div key={match.id} className={`p-3 rounded-lg ${match.isRematch ? 'bg-yellow-50 border border-yellow-300' : 'bg-gradient-to-r from-purple-50 to-pink-50'}`}>
                    {match.isBye ? (
                      <div className="text-center">
                        <span className="font-semibold text-gray-800">{teamA?.name}</span>
                        <span className="ml-2 text-sm text-gray-600">(BYE - walkower)</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 text-right font-semibold text-gray-800">
                            {teamA?.name || '?'}
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={result.scoreA ?? ''}
                              onChange={(e) => updateSwissScore(match.id, 'scoreA', e.target.value)}
                              disabled={result.completed}
                              className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 disabled:bg-gray-200"
                            />
                            <span className="font-bold text-gray-600">:</span>
                            <input
                              type="number"
                              min="0"
                              value={result.scoreB ?? ''}
                              onChange={(e) => updateSwissScore(match.id, 'scoreB', e.target.value)}
                              disabled={result.completed}
                              className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 disabled:bg-gray-200"
                            />
                          </div>
                          <div className="flex-1 text-left font-semibold text-gray-800">
                            {teamB?.name || '?'}
                          </div>
                        </div>
                        {match.isRematch && (
                          <div className="text-center mt-1">
                            <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                              ⚠️ Rewanż - te drużyny już grały
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {!isRoundCompleted && selectedRound === currentSwissRound && (
              <button
                onClick={() => confirmSwissRound(selectedRound)}
                className="w-full mt-4 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
              >
                Zatwierdź rundę {selectedRound}
              </button>
            )}

            {isRoundCompleted && (
              <div className="mt-4 text-center text-green-600 font-semibold">
                ✓ Runda {selectedRound} zakończona
              </div>
            )}
          </div>
        )}

        {/* Przycisk do playoff */}
        {currentSwissRound >= totalRounds && currentRound.length > 0 && swissResults[currentRound[currentRound.length - 1]?.id]?.completed && (
          <button
            onClick={generatePlayoffPhase}
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
          >
            Zakończ fazę Swiss i generuj Playoff <ArrowRight className="inline ml-2" size={20} />
          </button>
        )}
      </div>
    );
  };

  const renderStep4 = () => {
    const champion = finalRanking.find(r => r.place === 1);
    const championTeam = champion ? teams.find(t => t.id === champion.teamId) : null;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-purple-900">Faza Playoff</h2>
          {championTeam && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-lg">
              <Trophy size={24} />
              <span className="font-bold">Zwycięzca: {championTeam.name}</span>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {playoffBracket.map((round, roundIndex) => (
            <div key={roundIndex} className="bg-white border-2 border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-bold text-purple-900 mb-4">
                {round[0].roundName}
              </h3>
              <div className="space-y-3">
                {round.map(match => {
                  const teamA = match.teamA ? teams.find(t => t.id === match.teamA) : null;
                  const teamB = match.teamB ? teams.find(t => t.id === match.teamB) : null;
                  const result = playoffResults[match.id] || {};
                  
                  return (
                    <div key={match.id} className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                      {teamA && teamB ? (
                        <>
                          <div className="flex items-center justify-between gap-4 mb-3">
                            <div className="flex-1 text-right">
                              <span className={`font-semibold ${match.winner === teamA.id ? 'text-green-600' : 'text-gray-800'}`}>
                                {teamA.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                value={result.scoreA ?? ''}
                                onChange={(e) => updatePlayoffScore(match.id, 'scoreA', e.target.value)}
                                disabled={!!match.winner}
                                className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 disabled:bg-gray-200"
                              />
                              <span className="font-bold text-gray-600">:</span>
                              <input
                                type="number"
                                min="0"
                                value={result.scoreB ?? ''}
                                onChange={(e) => updatePlayoffScore(match.id, 'scoreB', e.target.value)}
                                disabled={!!match.winner}
                                className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 disabled:bg-gray-200"
                              />
                            </div>
                            <div className="flex-1 text-left">
                              <span className={`font-semibold ${match.winner === teamB.id ? 'text-green-600' : 'text-gray-800'}`}>
                                {teamB.name}
                              </span>
                            </div>
                          </div>
                          {!match.winner && (
                            <button
                              onClick={() => confirmPlayoffMatch(match.id)}
                              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
                            >
                              Zatwierdź wynik
                            </button>
                          )}
                          {match.winner && (
                            <div className="text-center text-sm font-semibold text-green-600">
                              ✓ Awansuje: {teams.find(t => t.id === match.winner)?.name}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center text-gray-500 italic">
                          Oczekiwanie na wyniki poprzedniej rundy...
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Ranking końcowy */}
        {finalRanking.length > 0 && (
          <div className="bg-white border-2 border-purple-200 rounded-lg p-4">
            <h3 className="text-lg font-bold text-purple-900 mb-4">Ranking Końcowy</h3>
            <div className="space-y-2">
              {finalRanking.slice(0, 10).map(rank => {
                const team = teams.find(t => t.id === rank.teamId);
                return (
                  <div key={rank.teamId} className={`flex items-center gap-4 p-2 rounded ${
                    rank.place === 1 ? 'bg-gradient-to-r from-yellow-200 to-orange-200' :
                    rank.place === 2 ? 'bg-gradient-to-r from-gray-200 to-gray-300' :
                    rank.place === 3 ? 'bg-gradient-to-r from-orange-200 to-yellow-300' :
                    'bg-gray-50'
                  }`}>
                    <div className="text-2xl font-bold text-gray-700 w-10 text-center">
                      {rank.place === 1 ? '🥇' : rank.place === 2 ? '🥈' : rank.place === 3 ? '🥉' : rank.place}
                    </div>
                    <div className="flex-1 font-semibold text-gray-800">{team?.name || '?'}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {championTeam && (
          <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white p-6 rounded-xl text-center">
            <Trophy size={64} className="mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Zwycięzca Turnieju</h2>
            <p className="text-4xl font-bold">{championTeam.name}</p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={exportResults}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <Download size={20} />
            Eksportuj wyniki (CSV)
          </button>
          <button
            onClick={resetTournament}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <RefreshCw size={20} />
            Nowy turniej
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-2 sm:p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-900 mb-1 sm:mb-2 text-center">
            Turniej Grupowy
          </h1>
          <p className="text-sm sm:text-base text-gray-600 text-center mb-4 sm:mb-6 md:mb-8">
            System Swiss + Playoff
          </p>

          {/* Wskaźnik postępu */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <React.Fragment key={s}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      step >= s
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {s}
                  </div>
                  {s < 4 && (
                    <div
                      className={`w-8 h-1 ${
                        step > s ? 'bg-purple-500' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Renderowanie odpowiedniego kroku */}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>
      </div>
    </div>
  );
}
