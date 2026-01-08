import React, { useState, useEffect } from 'react';
import { Save, Upload, Download, Users, Award, ArrowRight, RotateCcw, Edit2, Trash2 } from 'lucide-react';

export default function GroupStageTournament() {
  const STORAGE_KEY = 'group_stage_tournament_v1';

  // Kroki turnieju
  const [step, setStep] = useState(0); // 0=setup, 1=qualifying, 2=final
  
  // Setup
  const [numGroups, setNumGroups] = useState(4);
  const [teamsPerGroup, setTeamsPerGroup] = useState(4);
  const [advancePerGroup, setAdvancePerGroup] = useState(2);
  const [finalGroups, setFinalGroups] = useState(2);
  const [pointsWin, setPointsWin] = useState(3);
  const [pointsDraw, setPointsDraw] = useState(1);
  const [matchesPerPair, setMatchesPerPair] = useState(1); // 1 lub 2 mecze

  // Drużyny i grupy
  const [teams, setTeams] = useState([]);
  const [qualifyingGroups, setQualifyingGroups] = useState([]);
  const [qualifyingMatches, setQualifyingMatches] = useState({});
  const [qualifyingResults, setQualifyingResults] = useState({});
  
  const [finalGroupsData, setFinalGroupsData] = useState([]);
  const [finalMatches, setFinalMatches] = useState({});
  const [finalResults, setFinalResults] = useState({});

  // UI
  const [selectedGroup, setSelectedGroup] = useState(0);
  const [showTeamManagement, setShowTeamManagement] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);

  // Zapisz do localStorage
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      const state = {
        step, numGroups, teamsPerGroup, advancePerGroup, finalGroups,
        pointsWin, pointsDraw, matchesPerPair,
        teams, qualifyingGroups, qualifyingMatches, qualifyingResults,
        finalGroupsData, finalMatches, finalResults
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, 500);
    return () => clearTimeout(saveTimer);
  }, [step, numGroups, teamsPerGroup, advancePerGroup, finalGroups, pointsWin, pointsDraw, matchesPerPair,
      teams, qualifyingGroups, qualifyingMatches, qualifyingResults, finalGroupsData, finalMatches, finalResults]);

  // Wczytaj z localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        setStep(state.step || 0);
        setNumGroups(state.numGroups || 4);
        setTeamsPerGroup(state.teamsPerGroup || 4);
        setAdvancePerGroup(state.advancePerGroup || 2);
        setFinalGroups(state.finalGroups || 2);
        setPointsWin(state.pointsWin || 3);
        setPointsDraw(state.pointsDraw || 1);
        setMatchesPerPair(state.matchesPerPair || 1);
        setTeams(state.teams || []);
        setQualifyingGroups(state.qualifyingGroups || []);
        setQualifyingMatches(state.qualifyingMatches || {});
        setQualifyingResults(state.qualifyingResults || {});
        setFinalGroupsData(state.finalGroupsData || []);
        setFinalMatches(state.finalMatches || {});
        setFinalResults(state.finalResults || {});
      } catch (e) {
        console.error('Błąd wczytywania:', e);
      }
    }
  }, []);

  // Generuj nazwy grup (A, B, C, ...)
  const getGroupName = (index) => String.fromCharCode(65 + index);

  // Inicjalizacja turnieju
  const initializeTournament = () => {
    const totalTeams = numGroups * teamsPerGroup;
    const newTeams = Array.from({ length: totalTeams }, (_, i) => ({
      id: i + 1,
      name: `Drużyna ${i + 1}`,
      originalGroup: Math.floor(i / teamsPerGroup),
      qualifyingPoints: 0,
      qualifyingGoalsFor: 0,
      qualifyingGoalsAgainst: 0,
      qualifyingWins: 0,
      qualifyingDraws: 0,
      qualifyingLosses: 0,
      finalPoints: 0,
      finalGoalsFor: 0,
      finalGoalsAgainst: 0,
      finalWins: 0,
      finalDraws: 0,
      finalLosses: 0,
    }));

    setTeams(newTeams);

    // Stwórz grupy kwalifikacyjne
    const groups = Array.from({ length: numGroups }, (_, i) => {
      const groupTeams = newTeams.filter(t => t.originalGroup === i);
      return {
        id: i,
        name: getGroupName(i),
        teams: groupTeams.map(t => t.id)
      };
    });

    setQualifyingGroups(groups);

    // Generuj mecze dla każdej grupy kwalifikacyjnej
    const matches = {};
    groups.forEach(group => {
      matches[group.id] = generateRoundRobinMatches(group.teams, group.id, 'qualifying');
    });
    setQualifyingMatches(matches);

    // Inicjalizuj wyniki
    const results = {};
    Object.values(matches).flat().forEach(match => {
      results[match.id] = { scoreA: '', scoreB: '', completed: false };
    });
    setQualifyingResults(results);

    setStep(1);
    setSelectedGroup(0);
  };

  // Generowanie meczów każdy z każdym
  const generateRoundRobinMatches = (teamIds, groupId, phase) => {
    const matches = [];
    let matchId = 0;

    for (let i = 0; i < teamIds.length; i++) {
      for (let j = i + 1; j < teamIds.length; j++) {
        // Pierwszy mecz
        matches.push({
          id: `${phase}-g${groupId}-m${matchId++}`,
          groupId,
          teamA: teamIds[i],
          teamB: teamIds[j],
          phase,
          leg: 1
        });

        // Rewanż jeśli włączony
        if (matchesPerPair === 2) {
          matches.push({
            id: `${phase}-g${groupId}-m${matchId++}`,
            groupId,
            teamA: teamIds[j],
            teamB: teamIds[i],
            phase,
            leg: 2
          });
        }
      }
    }

    return matches;
  };

  // Aktualizacja wyniku
  const updateResult = (matchId, field, value, phase) => {
    const results = phase === 'qualifying' ? qualifyingResults : finalResults;
    const setResults = phase === 'qualifying' ? setQualifyingResults : setFinalResults;

    setResults({
      ...results,
      [matchId]: {
        ...results[matchId],
        [field]: value === '' ? '' : parseInt(value) || 0
      }
    });
  };

  // Zatwierdzenie wyniku meczu
  const confirmMatch = (matchId, phase) => {
    const results = phase === 'qualifying' ? qualifyingResults : finalResults;
    const setResults = phase === 'qualifying' ? setQualifyingResults : setFinalResults;
    const matches = phase === 'qualifying' ? qualifyingMatches : finalMatches;

    const result = results[matchId];
    if (result.scoreA === '' || result.scoreB === '') {
      alert('Wprowadź oba wyniki!');
      return;
    }

    // Znajdź mecz
    let match;
    if (phase === 'qualifying') {
      match = Object.values(matches).flat().find(m => m.id === matchId);
    } else {
      match = Object.values(matches).flat().find(m => m.id === matchId);
    }

    if (!match) return;

    // Aktualizuj statystyki drużyn
    const updatedTeams = teams.map(team => {
      const newTeam = { ...team };
      const isTeamA = team.id === match.teamA;
      const isTeamB = team.id === match.teamB;

      if (!isTeamA && !isTeamB) return team;

      const prefix = phase === 'qualifying' ? 'qualifying' : 'final';
      const scored = isTeamA ? result.scoreA : result.scoreB;
      const conceded = isTeamA ? result.scoreB : result.scoreA;

      newTeam[`${prefix}GoalsFor`] += scored;
      newTeam[`${prefix}GoalsAgainst`] += conceded;

      if (scored > conceded) {
        newTeam[`${prefix}Points`] += pointsWin;
        newTeam[`${prefix}Wins`]++;
      } else if (scored === conceded) {
        newTeam[`${prefix}Points`] += pointsDraw;
        newTeam[`${prefix}Draws`]++;
      } else {
        newTeam[`${prefix}Losses`]++;
      }

      return newTeam;
    });

    setTeams(updatedTeams);

    setResults({
      ...results,
      [matchId]: { ...result, completed: true }
    });
  };

  // Sortowanie drużyn w grupie
  const sortGroupTeams = (teamIds, phase) => {
    const prefix = phase === 'qualifying' ? 'qualifying' : 'final';
    const matches = phase === 'qualifying' ? qualifyingMatches : finalMatches;
    const results = phase === 'qualifying' ? qualifyingResults : finalResults;

    // Funkcja do sprawdzenia bezpośrednich meczów
    const getHeadToHeadResult = (teamA, teamB, groupId) => {
      let teamAPoints = 0;
      let teamBPoints = 0;
      let teamAGoalsFor = 0;
      let teamAGoalsAgainst = 0;
      let teamBGoalsFor = 0;
      let teamBGoalsAgainst = 0;
      let matchesPlayed = 0;

      const groupMatches = matches[groupId] || [];
      
      groupMatches.forEach(match => {
        const result = results[match.id];
        if (!result?.completed) return;

        if ((match.teamA === teamA.id && match.teamB === teamB.id) ||
            (match.teamA === teamB.id && match.teamB === teamA.id)) {
          matchesPlayed++;
          
          const scoreA = parseInt(result.scoreA);
          const scoreB = parseInt(result.scoreB);
          
          if (match.teamA === teamA.id) {
            teamAGoalsFor += scoreA;
            teamAGoalsAgainst += scoreB;
            teamBGoalsFor += scoreB;
            teamBGoalsAgainst += scoreA;
            
            if (scoreA > scoreB) teamAPoints += pointsWin;
            else if (scoreA === scoreB) {
              teamAPoints += pointsDraw;
              teamBPoints += pointsDraw;
            } else teamBPoints += pointsWin;
          } else {
            teamBGoalsFor += scoreA;
            teamBGoalsAgainst += scoreB;
            teamAGoalsFor += scoreB;
            teamAGoalsAgainst += scoreA;
            
            if (scoreA > scoreB) teamBPoints += pointsWin;
            else if (scoreA === scoreB) {
              teamAPoints += pointsDraw;
              teamBPoints += pointsDraw;
            } else teamAPoints += pointsWin;
          }
        }
      });

      if (matchesPlayed === 0) return null;

      return {
        teamAPoints, teamBPoints,
        teamAGoalDiff: teamAGoalsFor - teamAGoalsAgainst,
        teamBGoalDiff: teamBGoalsFor - teamBGoalsAgainst,
        teamAGoalsFor, teamBGoalsFor
      };
    };

    const groupId = teams.find(t => teamIds.includes(t.id))?.originalGroup;

    return teamIds
      .map(id => teams.find(t => t.id === id))
      .sort((a, b) => {
        // 1. Punkty
        if (b[`${prefix}Points`] !== a[`${prefix}Points`]) 
          return b[`${prefix}Points`] - a[`${prefix}Points`];
        
        // 2. Bezpośredni mecz
        const headToHead = getHeadToHeadResult(a, b, groupId);
        if (headToHead) {
          if (headToHead.teamAPoints !== headToHead.teamBPoints) {
            return headToHead.teamBPoints - headToHead.teamAPoints;
          }
          if (headToHead.teamAGoalDiff !== headToHead.teamBGoalDiff) {
            return headToHead.teamBGoalDiff - headToHead.teamAGoalDiff;
          }
          if (headToHead.teamAGoalsFor !== headToHead.teamBGoalsFor) {
            return headToHead.teamBGoalsFor - headToHead.teamAGoalsFor;
          }
        }
        
        // 3. Bilans bramek
        const aDiff = a[`${prefix}GoalsFor`] - a[`${prefix}GoalsAgainst`];
        const bDiff = b[`${prefix}GoalsFor`] - b[`${prefix}GoalsAgainst`];
        if (bDiff !== aDiff) return bDiff - aDiff;
        
        // 4. Bramki strzelone
        return b[`${prefix}GoalsFor`] - a[`${prefix}GoalsFor`];
      })
      .map(t => t.id);
  };

  // Przejście do fazy finałowej
  const advanceToFinals = () => {
    const advancedTeams = [];

    // Zbierz drużyny z każdej grupy
    qualifyingGroups.forEach(group => {
      const sorted = sortGroupTeams(group.teams, 'qualifying');
      const advancing = sorted.slice(0, advancePerGroup).map(id => teams.find(t => t.id === id));
      advancedTeams.push(...advancing);
    });

    // Rozdziel drużyny do grup finałowych według klucza rozstawienia
    // Najlepsze rozwiązanie: serpentyna (snake draft)
    const finalGroupsArray = Array.from({ length: finalGroups }, () => []);
    
    advancedTeams.forEach((team, index) => {
      const groupIndex = Math.floor(index / (advancedTeams.length / finalGroups));
      const pos = index % (advancedTeams.length / finalGroups);
      
      // Serpentyna: 0→1→2→3, 3→2→1→0
      const targetGroup = pos % 2 === 0 ? groupIndex : (finalGroups - 1 - groupIndex);
      finalGroupsArray[targetGroup].push(team.id);
    });

    const newFinalGroups = finalGroupsArray.map((teamIds, i) => ({
      id: i,
      name: getGroupName(i),
      teams: teamIds
    }));

    setFinalGroupsData(newFinalGroups);

    // Generuj mecze dla grup finałowych
    const matches = {};
    newFinalGroups.forEach(group => {
      matches[group.id] = generateRoundRobinMatches(group.teams, group.id, 'final');
    });
    setFinalMatches(matches);

    // Inicjalizuj wyniki
    const results = {};
    Object.values(matches).flat().forEach(match => {
      results[match.id] = { scoreA: '', scoreB: '', completed: false };
    });
    setFinalResults(results);

    setStep(2);
    setSelectedGroup(0);
  };

  // Reset turnieju
  const resetTournament = () => {
    if (window.confirm('Czy na pewno chcesz zresetować cały turniej?')) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  // Edycja nazwy drużyny
  const saveTeamName = () => {
    if (!editingTeam) return;
    setTeams(teams.map(t => t.id === editingTeam.id ? editingTeam : t));
    setEditingTeam(null);
  };

  // Eksport CSV
  const exportCSV = () => {
    let csv = 'Turniej Grupowy - Wyniki\n\n';
    
    csv += 'FAZA KWALIFIKACYJNA\n';
    qualifyingGroups.forEach(group => {
      csv += `\nGrupa ${group.name}\n`;
      csv += 'Miejsce,Drużyna,Mecze,Pkt,Bramki\n';
      const sorted = sortGroupTeams(group.teams, 'qualifying');
      sorted.forEach((teamId, i) => {
        const team = teams.find(t => t.id === teamId);
        csv += `${i+1},${team.name},${team.qualifyingWins + team.qualifyingDraws + team.qualifyingLosses},${team.qualifyingPoints},${team.qualifyingGoalsFor}:${team.qualifyingGoalsAgainst}\n`;
      });
    });

    if (step >= 2) {
      csv += '\n\nFAZA FINAŁOWA\n';
      finalGroupsData.forEach(group => {
        csv += `\nGrupa ${group.name}\n`;
        csv += 'Miejsce,Drużyna,Mecze,Pkt,Bramki\n';
        const sorted = sortGroupTeams(group.teams, 'final');
        sorted.forEach((teamId, i) => {
          const team = teams.find(t => t.id === teamId);
          csv += `${i+1},${team.name},${team.finalWins + team.finalDraws + team.finalLosses},${team.finalPoints},${team.finalGoalsFor}:${team.finalGoalsAgainst}\n`;
        });
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'turniej_grupowy.csv';
    link.click();
  };

  // Renderowanie tabeli grupy
  const renderGroupTable = (groupTeams, phase) => {
    const prefix = phase === 'qualifying' ? 'qualifying' : 'final';
    const sorted = sortGroupTeams(groupTeams, phase);

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Drużyna</th>
              <th className="p-2 text-center">M</th>
              <th className="p-2 text-center">W</th>
              <th className="p-2 text-center">R</th>
              <th className="p-2 text-center">P</th>
              <th className="p-2 text-center">Bramki</th>
              <th className="p-2 text-center">Bilans</th>
              <th className="p-2 text-center font-bold">Pkt</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((teamId, index) => {
              const team = teams.find(t => t.id === teamId);
              const isAdvancing = phase === 'qualifying' && index < advancePerGroup;
              
              return (
                <tr key={team.id} className={`border-t ${isAdvancing ? 'bg-green-50' : ''}`}>
                  <td className="p-2 font-semibold">{index + 1}</td>
                  <td className="p-2">{team.name}</td>
                  <td className="p-2 text-center">{team[`${prefix}Wins`] + team[`${prefix}Draws`] + team[`${prefix}Losses`]}</td>
                  <td className="p-2 text-center">{team[`${prefix}Wins`]}</td>
                  <td className="p-2 text-center">{team[`${prefix}Draws`]}</td>
                  <td className="p-2 text-center">{team[`${prefix}Losses`]}</td>
                  <td className="p-2 text-center">{team[`${prefix}GoalsFor`]}:{team[`${prefix}GoalsAgainst`]}</td>
                  <td className="p-2 text-center">{team[`${prefix}GoalsFor`] - team[`${prefix}GoalsAgainst`]}</td>
                  <td className="p-2 text-center font-bold">{team[`${prefix}Points`]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Renderowanie meczów grupy
  const renderGroupMatches = (groupId, phase) => {
    const matches = phase === 'qualifying' ? qualifyingMatches[groupId] : finalMatches[groupId];
    const results = phase === 'qualifying' ? qualifyingResults : finalResults;

    return (
      <div className="space-y-2">
        {matches?.map(match => {
          const teamA = teams.find(t => t.id === match.teamA);
          const teamB = teams.find(t => t.id === match.teamB);
          const result = results[match.id] || {};

          return (
            <div key={match.id} className="bg-white border rounded-lg p-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 text-right font-semibold">{teamA?.name}</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={result.scoreA ?? ''}
                    onChange={(e) => updateResult(match.id, 'scoreA', e.target.value, phase)}
                    disabled={result.completed}
                    className="w-16 px-2 py-1 text-center border rounded disabled:bg-gray-100"
                  />
                  <span className="font-bold">:</span>
                  <input
                    type="number"
                    min="0"
                    value={result.scoreB ?? ''}
                    onChange={(e) => updateResult(match.id, 'scoreB', e.target.value, phase)}
                    disabled={result.completed}
                    className="w-16 px-2 py-1 text-center border rounded disabled:bg-gray-100"
                  />
                </div>
                <div className="flex-1 text-left font-semibold">{teamB?.name}</div>
                {!result.completed ? (
                  <button
                    onClick={() => confirmMatch(match.id, phase)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    ✓
                  </button>
                ) : (
                  <span className="text-green-600 px-3">✓</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // STEP 0: Setup
  if (step === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">
              Turniej Grupowy
            </h1>
            <p className="text-gray-600 text-center mb-8">
              System grupowy z przechodzeniem wyników
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Liczba grup kwalifikacyjnych:
                </label>
                <input
                  type="number"
                  min="2"
                  max="8"
                  value={numGroups}
                  onChange={(e) => setNumGroups(parseInt(e.target.value) || 2)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Drużyn w grupie kwalifikacyjnej:
                </label>
                <input
                  type="number"
                  min="3"
                  max="8"
                  value={teamsPerGroup}
                  onChange={(e) => setTeamsPerGroup(parseInt(e.target.value) || 3)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ile drużyn awansuje z grupy:
                </label>
                <input
                  type="number"
                  min="1"
                  max={teamsPerGroup - 1}
                  value={advancePerGroup}
                  onChange={(e) => setAdvancePerGroup(Math.min(parseInt(e.target.value) || 1, teamsPerGroup - 1))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Liczba grup finałowych:
                </label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={finalGroups}
                  onChange={(e) => setFinalGroups(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mecze między drużynami:
                </label>
                <select
                  value={matchesPerPair}
                  onChange={(e) => setMatchesPerPair(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value={1}>1 mecz (każda para raz)</option>
                  <option value={2}>2 mecze (rewanż)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Punkty za wygraną:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={pointsWin}
                    onChange={(e) => setPointsWin(parseInt(e.target.value) || 3)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Punkty za remis:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={pointsDraw}
                    onChange={(e) => setPointsDraw(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Podsumowanie:</strong><br />
                  • {numGroups * teamsPerGroup} drużyn w {numGroups} grupach kwalifikacyjnych<br />
                  • {numGroups * advancePerGroup} drużyn awansuje do {finalGroups} grup finałowych<br />
                  • Po {numGroups * advancePerGroup / finalGroups} drużyn w każdej grupie finałowej
                </p>
              </div>

              <button
                onClick={initializeTournament}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 shadow-lg"
              >
                Rozpocznij turniej
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STEP 1 & 2: Qualifying & Finals
  const isQualifying = step === 1;
  const currentGroups = isQualifying ? qualifyingGroups : finalGroupsData;
  const currentPhase = isQualifying ? 'qualifying' : 'final';
  const allMatchesCompleted = Object.values(isQualifying ? qualifyingResults : finalResults)
    .every(r => r.completed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Nagłówek */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              {isQualifying ? 'Faza Kwalifikacyjna' : 'Faza Finałowa'}
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTeamManagement(!showTeamManagement)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Users size={20} />
                Drużyny
              </button>
              <button
                onClick={exportCSV}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Download size={20} />
                CSV
              </button>
              <button
                onClick={resetTournament}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <RotateCcw size={20} />
                Reset
              </button>
            </div>
          </div>

          {/* Wybór grupy */}
          <div className="flex gap-2 flex-wrap">
            {currentGroups.map((group, idx) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(idx)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  selectedGroup === idx
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Grupa {group.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela grupy */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Grupa {currentGroups[selectedGroup]?.name} - Tabela
          </h2>
          {renderGroupTable(currentGroups[selectedGroup]?.teams, currentPhase)}
        </div>

        {/* Mecze grupy */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Grupa {currentGroups[selectedGroup]?.name} - Mecze
          </h2>
          {renderGroupMatches(currentGroups[selectedGroup]?.id, currentPhase)}
        </div>

        {/* Przycisk przejścia do finałów */}
        {isQualifying && allMatchesCompleted && (
          <div className="bg-white rounded-xl shadow-xl p-6">
            <button
              onClick={advanceToFinals}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 shadow-lg flex items-center justify-center gap-2"
            >
              Przejdź do fazy finałowej <ArrowRight size={24} />
            </button>
          </div>
        )}

        {/* Klasyfikacja końcowa */}
        {!isQualifying && allMatchesCompleted && (
          <div className="bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Award className="text-yellow-500" />
              Klasyfikacja końcowa
            </h2>
            <div className="text-center text-green-600 font-semibold text-lg">
              Turniej zakończony! Zobacz tabele powyżej.
            </div>
          </div>
        )}
      </div>

      {/* Modal zarządzania drużynami */}
      {showTeamManagement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Zarządzanie drużynami</h2>
            <div className="space-y-2 mb-4">
              {teams.map(team => (
                <div key={team.id} className="flex items-center gap-2 p-2 border rounded">
                  {editingTeam?.id === team.id ? (
                    <>
                      <input
                        type="text"
                        value={editingTeam.name}
                        onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                        className="flex-1 px-2 py-1 border rounded"
                      />
                      <button
                        onClick={saveTeamName}
                        className="bg-green-500 text-white px-3 py-1 rounded"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingTeam(null)}
                        className="bg-gray-300 px-3 py-1 rounded"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1">{team.name}</span>
                      <button
                        onClick={() => setEditingTeam(team)}
                        className="bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-1"
                      >
                        <Edit2 size={16} /> Edytuj
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowTeamManagement(false)}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              Zamknij
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
