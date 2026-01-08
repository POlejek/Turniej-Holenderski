import React, { useState, useEffect } from 'react';
import { Save, Upload, Download, Users, Award, ArrowRight, RotateCcw, Edit2, Trash2, Trophy } from 'lucide-react';

export default function GroupStageTournament() {
  const STORAGE_KEY = 'group_stage_tournament_v2';

  // Kroki: 0=setup, 1=team names, 2=qualifying, 3=finals, 4=playoff
  const [step, setStep] = useState(0);
  
  // Setup
  const [numQualGroups, setNumQualGroups] = useState(6);
  const [teamsPerQualGroup, setTeamsPerQualGroup] = useState(6);
  const [tier1Groups, setTier1Groups] = useState(2);
  const [tier1TeamsPerGroup, setTier1TeamsPerGroup] = useState(6);
  const [tier2Groups, setTier2Groups] = useState(4);
  const [pointsWin, setPointsWin] = useState(3);
  const [pointsDraw, setPointsDraw] = useState(1);
  const [matchesPerPair, setMatchesPerPair] = useState(1);
  const [teamNamesInput, setTeamNamesInput] = useState('');
  
  // Playoff
  const [hasPlayoff, setHasPlayoff] = useState(false);
  const [playoffType, setPlayoffType] = useState('final'); // 'final', 'semis', 'mini-league', 'bracket'
  const [playoffTeamsCount, setPlayoffTeamsCount] = useState(4);
  const [playoffMatches, setPlayoffMatches] = useState([]);
  const [playoffResults, setPlayoffResults] = useState({});

  // Dane
  const [teams, setTeams] = useState([]);
  const [qualifyingGroups, setQualifyingGroups] = useState([]);
  const [qualifyingMatches, setQualifyingMatches] = useState({});
  const [qualifyingResults, setQualifyingResults] = useState({});
  
  const [tier1GroupsData, setTier1GroupsData] = useState([]);
  const [tier1Matches, setTier1Matches] = useState({});
  const [tier1Results, setTier1Results] = useState({});
  
  const [tier2GroupsData, setTier2GroupsData] = useState([]);
  const [tier2Matches, setTier2Matches] = useState({});
  const [tier2Results, setTier2Results] = useState({});

  // UI
  const [selectedGroup, setSelectedGroup] = useState(0);
  const [currentTier, setCurrentTier] = useState(1);
  const [showTeamManagement, setShowTeamManagement] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);

  // Auto-save
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      const state = {
        step, numQualGroups, teamsPerQualGroup, tier1Groups, tier1TeamsPerGroup, tier2Groups,
        pointsWin, pointsDraw, matchesPerPair, teamNamesInput, teams, qualifyingGroups, qualifyingMatches, qualifyingResults,
        tier1GroupsData, tier1Matches, tier1Results, tier2GroupsData, tier2Matches, tier2Results, currentTier,
        hasPlayoff, playoffType, playoffTeamsCount, playoffMatches, playoffResults
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, 500);
    return () => clearTimeout(saveTimer);
  }, [step, numQualGroups, teamsPerQualGroup, tier1Groups, tier1TeamsPerGroup, tier2Groups,
      pointsWin, pointsDraw, matchesPerPair, teamNamesInput, teams, qualifyingGroups, qualifyingMatches, qualifyingResults,
      tier1GroupsData, tier1Matches, tier1Results, tier2GroupsData, tier2Matches, tier2Results, currentTier,
      hasPlayoff, playoffType, playoffTeamsCount, playoffMatches, playoffResults]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        setStep(state.step || 0);
        setNumQualGroups(state.numQualGroups || 6);
        setTeamsPerQualGroup(state.teamsPerQualGroup || 6);
        setTier1Groups(state.tier1Groups || 2);
        setTier1TeamsPerGroup(state.tier1TeamsPerGroup || 6);
        setTier2Groups(state.tier2Groups || 4);
        setPointsWin(state.pointsWin || 3);
        setPointsDraw(state.pointsDraw || 1);
        setMatchesPerPair(state.matchesPerPair || 1);
        setTeamNamesInput(state.teamNamesInput || '');
        setTeams(state.teams || []);
        setQualifyingGroups(state.qualifyingGroups || []);
        setQualifyingMatches(state.qualifyingMatches || {});
        setQualifyingResults(state.qualifyingResults || {});
        setTier1GroupsData(state.tier1GroupsData || []);
        setTier1Matches(state.tier1Matches || {});
        setTier1Results(state.tier1Results || {});
        setTier2GroupsData(state.tier2GroupsData || []);
        setTier2Matches(state.tier2Matches || {});
        setTier2Results(state.tier2Results || {});
        setCurrentTier(state.currentTier || 1);
        setHasPlayoff(state.hasPlayoff || false);
        setPlayoffType(state.playoffType || 'final');
        setPlayoffTeamsCount(state.playoffTeamsCount || 4);
        setPlayoffMatches(state.playoffMatches || []);
        setPlayoffResults(state.playoffResults || {});
      } catch (e) {
        console.error('Błąd wczytywania:', e);
      }
    }
  }, []);

  const getGroupName = (index) => String.fromCharCode(65 + index);

  // Algorytm Round-Robin Rotation - równomierne rozłożenie meczów
  const generateRoundRobinMatches = (teamIds, groupId, phase) => {
    const matches = [];
    const n = teamIds.length;
    let matchId = 0;

    const teams = n % 2 !== 0 ? [...teamIds, null] : [...teamIds];
    const totalTeams = teams.length;
    const rounds = totalTeams - 1;

    for (let round = 0; round < rounds; round++) {
      for (let i = 0; i < totalTeams / 2; i++) {
        const home = teams[i];
        const away = teams[totalTeams - 1 - i];

        if (home !== null && away !== null) {
          matches.push({
            id: `${phase}-g${groupId}-r${round + 1}-m${matchId++}`,
            groupId, teamA: home, teamB: away, phase, round: round + 1
          });

          if (matchesPerPair === 2) {
            matches.push({
              id: `${phase}-g${groupId}-r${round + rounds + 1}-m${matchId++}`,
              groupId, teamA: away, teamB: home, phase, round: round + rounds + 1
            });
          }
        }
      }

      const fixed = teams[0];
      const rest = teams.slice(1);
      const rotated = [rest[rest.length - 1], ...rest.slice(0, rest.length - 1)];
      teams.splice(0, teams.length, fixed, ...rotated);
    }

    return matches;
  };

  // Inicjalizacja - przejście do ekranu nazw drużyn
  const initializeTournament = () => {
    const totalTeams = numQualGroups * teamsPerQualGroup;
    const tier1Total = tier1Groups * tier1TeamsPerGroup;
    const tier2Total = totalTeams - tier1Total;

    if (tier2Total < 0) {
      alert('Błąd: Więcej miejsc w I lidze niż drużyn!');
      return;
    }

    if (tier2Total > 0 && tier2Groups === 0) {
      alert('Błąd: Ustaw liczbę grup II ligi (zostało ' + tier2Total + ' drużyn)');
      return;
    }

    // Stwórz domyślne nazwy drużyn
    const defaultNames = Array.from({ length: totalTeams }, (_, i) => `Drużyna ${i + 1}`);
    setTeamNamesInput(defaultNames.join('\n'));

    setStep(1); // Przejdź do ekranu nazw
  };

  // Losowanie grup i start turnieju
  const startTournamentWithTeams = () => {
    const totalTeams = numQualGroups * teamsPerQualGroup;
    
    // Parsuj nazwy drużyn
    const names = teamNamesInput
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (names.length < totalTeams) {
      alert(`Potrzebujesz ${totalTeams} nazw drużyn! Masz tylko ${names.length}.`);
      return;
    }

    // Losowe przydzielenie drużyn do grup
    const shuffledNames = [...names].sort(() => Math.random() - 0.5);

    const newTeams = shuffledNames.slice(0, totalTeams).map((name, i) => ({
      id: i + 1,
      name: name,
      originalGroup: Math.floor(i / teamsPerQualGroup),
      qualPoints: 0, qualGoalsFor: 0, qualGoalsAgainst: 0,
      qualWins: 0, qualDraws: 0, qualLosses: 0,
      finalPoints: 0, finalGoalsFor: 0, finalGoalsAgainst: 0,
      finalWins: 0, finalDraws: 0, finalLosses: 0,
    }));

    setTeams(newTeams);

    const groups = Array.from({ length: numQualGroups }, (_, i) => ({
      id: i,
      name: getGroupName(i),
      teams: newTeams.filter(t => t.originalGroup === i).map(t => t.id)
    }));

    setQualifyingGroups(groups);

    const matches = {};
    groups.forEach(group => {
      matches[group.id] = generateRoundRobinMatches(group.teams, group.id, 'qual');
    });
    setQualifyingMatches(matches);

    const results = {};
    Object.values(matches).flat().forEach(match => {
      results[match.id] = { scoreA: '', scoreB: '', completed: false };
    });
    setQualifyingResults(results);

    setStep(2); // Przejdź do kwalifikacji
    setSelectedGroup(0);
  };

  // Sortowanie drużyn w grupie
  const sortGroupTeams = (teamIds, phase, groupId) => {
    const prefix = phase === 'qual' ? 'qual' : 'final';
    const matches = phase === 'qual' ? qualifyingMatches : (phase === 'tier1' ? tier1Matches : tier2Matches);
    const results = phase === 'qual' ? qualifyingResults : (phase === 'tier1' ? tier1Results : tier2Results);

    const getHeadToHead = (a, b) => {
      let aPoints = 0, bPoints = 0, aGF = 0, aGA = 0, bGF = 0, bGA = 0, count = 0;

      const groupMatches = matches[groupId] || [];
      groupMatches.forEach(match => {
        const result = results[match.id];
        if (!result?.completed) return;

        if ((match.teamA === a.id && match.teamB === b.id) || (match.teamA === b.id && match.teamB === a.id)) {
          count++;
          const scoreA = parseInt(result.scoreA);
          const scoreB = parseInt(result.scoreB);

          if (match.teamA === a.id) {
            aGF += scoreA; aGA += scoreB; bGF += scoreB; bGA += scoreA;
            if (scoreA > scoreB) aPoints += pointsWin;
            else if (scoreA === scoreB) { aPoints += pointsDraw; bPoints += pointsDraw; }
            else bPoints += pointsWin;
          } else {
            bGF += scoreA; bGA += scoreB; aGF += scoreB; aGA += scoreA;
            if (scoreA > scoreB) bPoints += pointsWin;
            else if (scoreA === scoreB) { aPoints += pointsDraw; bPoints += pointsDraw; }
            else aPoints += pointsWin;
          }
        }
      });

      return count === 0 ? null : { aPoints, bPoints, aGD: aGF - aGA, bGD: bGF - bGA, aGF, bGF };
    };

    return teamIds
      .map(id => teams.find(t => t.id === id))
      .sort((a, b) => {
        if (b[`${prefix}Points`] !== a[`${prefix}Points`]) 
          return b[`${prefix}Points`] - a[`${prefix}Points`];

        const h2h = getHeadToHead(a, b);
        if (h2h) {
          if (h2h.aPoints !== h2h.bPoints) return h2h.bPoints - h2h.aPoints;
          if (h2h.aGD !== h2h.bGD) return h2h.bGD - h2h.aGD;
          if (h2h.aGF !== h2h.bGF) return h2h.bGF - h2h.aGF;
        }

        const aDiff = a[`${prefix}GoalsFor`] - a[`${prefix}GoalsAgainst`];
        const bDiff = b[`${prefix}GoalsFor`] - b[`${prefix}GoalsAgainst`];
        if (bDiff !== aDiff) return bDiff - aDiff;

        return b[`${prefix}GoalsFor`] - a[`${prefix}GoalsFor`];
      })
      .map(t => t.id);
  };

  // Aktualizacja wyniku
  const updateResult = (matchId, field, value, phase) => {
    const [results, setResults] = phase === 'qual' ? [qualifyingResults, setQualifyingResults] :
                                    phase === 'tier1' ? [tier1Results, setTier1Results] :
                                    [tier2Results, setTier2Results];

    setResults({ ...results, [matchId]: { ...results[matchId], [field]: value === '' ? '' : parseInt(value) || 0 } });
  };

  // Zatwierdzenie meczu
  const confirmMatch = (matchId, phase) => {
    const [results, setResults, matches] = phase === 'qual' ? [qualifyingResults, setQualifyingResults, qualifyingMatches] :
                                             phase === 'tier1' ? [tier1Results, setTier1Results, tier1Matches] :
                                             [tier2Results, setTier2Results, tier2Matches];

    const result = results[matchId];
    if (result.scoreA === '' || result.scoreB === '') {
      alert('Wprowadź oba wyniki!');
      return;
    }

    const match = Object.values(matches).flat().find(m => m.id === matchId);
    if (!match) return;

    const updatedTeams = teams.map(team => {
      if (team.id !== match.teamA && team.id !== match.teamB) return team;

      const newTeam = { ...team };
      const prefix = phase === 'qual' ? 'qual' : 'final';
      const scored = team.id === match.teamA ? result.scoreA : result.scoreB;
      const conceded = team.id === match.teamA ? result.scoreB : result.scoreA;

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
    setResults({ ...results, [matchId]: { ...result, completed: true } });
  };

  // Przejście do fazy finałowej
  const advanceToFinals = () => {
    const tier1TotalTeams = tier1Groups * tier1TeamsPerGroup;
    const tier1PerGroup = Math.floor(tier1TotalTeams / numQualGroups);
    const tier1Extra = tier1TotalTeams % numQualGroups;

    const tier1Teams = [];
    const tier2Teams = [];

    // Dodaj pozycje w grupach
    qualifyingGroups.forEach(group => {
      const sorted = sortGroupTeams(group.teams, 'qual', group.id);
      sorted.forEach((teamId, position) => {
        const team = teams.find(t => t.id === teamId);
        team.qualPosition = position + 1;
        team.qualGroupId = group.id;
      });
    });

    // Równy podział
    if (tier1Extra === 0) {
      qualifyingGroups.forEach(group => {
        const sorted = sortGroupTeams(group.teams, 'qual', group.id);
        tier1Teams.push(...sorted.slice(0, tier1PerGroup).map(id => teams.find(t => t.id === id)));
        tier2Teams.push(...sorted.slice(tier1PerGroup).map(id => teams.find(t => t.id === id)));
      });
    } else {
      // Nierówny podział - tabela miejsc premiowanych
      qualifyingGroups.forEach(group => {
        const sorted = sortGroupTeams(group.teams, 'qual', group.id);
        tier1Teams.push(...sorted.slice(0, tier1PerGroup).map(id => teams.find(t => t.id === id)));
      });

      const extraCandidates = [];
      qualifyingGroups.forEach(group => {
        const sorted = sortGroupTeams(group.teams, 'qual', group.id);
        if (sorted.length > tier1PerGroup) {
          extraCandidates.push(teams.find(t => t.id === sorted[tier1PerGroup]));
        }
      });

      const sortedCandidates = extraCandidates.sort((a, b) => {
        if (b.qualPoints !== a.qualPoints) return b.qualPoints - a.qualPoints;
        const aDiff = a.qualGoalsFor - a.qualGoalsAgainst;
        const bDiff = b.qualGoalsFor - b.qualGoalsAgainst;
        if (bDiff !== aDiff) return bDiff - aDiff;
        return b.qualGoalsFor - a.qualGoalsFor;
      });

      tier1Teams.push(...sortedCandidates.slice(0, tier1Extra));

      qualifyingGroups.forEach(group => {
        const sorted = sortGroupTeams(group.teams, 'qual', group.id);
        sorted.forEach(teamId => {
          const team = teams.find(t => t.id === teamId);
          if (!tier1Teams.find(t => t.id === team.id)) {
            tier2Teams.push(team);
          }
        });
      });
    }

    // Rozdziel I liga - serpentyna
    const tier1GroupsArray = Array.from({ length: tier1Groups }, () => []);
    tier1Teams.forEach((team, index) => {
      const groupIndex = index % tier1Groups;
      tier1GroupsArray[groupIndex].push(team.id);
    });

    const newTier1Groups = tier1GroupsArray.map((teamIds, i) => ({
      id: i, name: `I-${getGroupName(i)}`, teams: teamIds, tier: 1
    }));

    setTier1GroupsData(newTier1Groups);

    const tier1MatchesData = {};
    newTier1Groups.forEach(group => {
      tier1MatchesData[group.id] = generateRoundRobinMatches(group.teams, group.id, 'tier1');
    });
    setTier1Matches(tier1MatchesData);

    const tier1ResultsData = {};
    Object.values(tier1MatchesData).flat().forEach(match => {
      tier1ResultsData[match.id] = { scoreA: '', scoreB: '', completed: false };
    });
    setTier1Results(tier1ResultsData);

    // Rozdziel II liga
    const tier2GroupsArray = Array.from({ length: tier2Groups }, () => []);
    tier2Teams.forEach((team, index) => {
      const groupIndex = index % tier2Groups;
      tier2GroupsArray[groupIndex].push(team.id);
    });

    const newTier2Groups = tier2GroupsArray.map((teamIds, i) => ({
      id: i, name: `II-${getGroupName(i)}`, teams: teamIds, tier: 2
    }));

    setTier2GroupsData(newTier2Groups);

    const tier2MatchesData = {};
    newTier2Groups.forEach(group => {
      tier2MatchesData[group.id] = generateRoundRobinMatches(group.teams, group.id, 'tier2');
    });
    setTier2Matches(tier2MatchesData);

    const tier2ResultsData = {};
    Object.values(tier2MatchesData).flat().forEach(match => {
      tier2ResultsData[match.id] = { scoreA: '', scoreB: '', completed: false };
    });
    setTier2Results(tier2ResultsData);

    setStep(3);
    setSelectedGroup(0);
    setCurrentTier(1);
  };

  // Sprawdzenie czy wszystkie mecze zakończone
  const allTier1MatchesCompleted = () => {
    return Object.values(tier1Results).every(r => r.completed);
  };

  const allTier2MatchesCompleted = () => {
    return Object.values(tier2Results).every(r => r.completed);
  };

  const allFinalsCompleted = () => {
    return allTier1MatchesCompleted() && allTier2MatchesCompleted();
  };

  // Generowanie klasyfikacji końcowej
  const generateFinalRanking = () => {
    const ranking = [];

    // Najpierw wszystkie drużyny z I Ligi
    tier1GroupsData.forEach((group, groupIndex) => {
      const sorted = sortGroupTeams(group.teams, 'tier1', group.id);
      sorted.forEach((teamId, position) => {
        const team = teams.find(t => t.id === teamId);
        ranking.push({
          ...team,
          tier: 1,
          groupName: group.name,
          groupPosition: position + 1,
          totalPoints: team.qualPoints + team.finalPoints,
          totalGoalsFor: team.qualGoalsFor + team.finalGoalsFor,
          totalGoalsAgainst: team.qualGoalsAgainst + team.finalGoalsAgainst,
        });
      });
    });

    // Potem wszystkie drużyny z II Ligi
    tier2GroupsData.forEach((group, groupIndex) => {
      const sorted = sortGroupTeams(group.teams, 'tier2', group.id);
      sorted.forEach((teamId, position) => {
        const team = teams.find(t => t.id === teamId);
        ranking.push({
          ...team,
          tier: 2,
          groupName: group.name,
          groupPosition: position + 1,
          totalPoints: team.qualPoints + team.finalPoints,
          totalGoalsFor: team.qualGoalsFor + team.finalGoalsFor,
          totalGoalsAgainst: team.qualGoalsAgainst + team.finalGoalsAgainst,
        });
      });
    });

    return ranking;
  };

  // Generowanie playoff
  const generatePlayoff = () => {
    if (!hasPlayoff) return;

    const tier1Ranking = [];
    tier1GroupsData.forEach(group => {
      const sorted = sortGroupTeams(group.teams, 'tier1', group.id);
      sorted.forEach((teamId, position) => {
        const team = teams.find(t => t.id === teamId);
        tier1Ranking.push({ ...team, groupId: group.id, groupName: group.name, position: position + 1 });
      });
    });

    let playoffTeams = [];
    const matches = [];
    const results = {};

    if (tier1Groups === 2 && playoffType === 'final') {
      // Finał: 1. z grupy A vs 1. z grupy B
      const group1Winners = tier1Ranking.filter(t => t.groupId === tier1GroupsData[0].id && t.position === 1);
      const group2Winners = tier1Ranking.filter(t => t.groupId === tier1GroupsData[1].id && t.position === 1);
      
      playoffTeams = [group1Winners[0], group2Winners[0]];
      matches.push({
        team1: group1Winners[0].name,
        team2: group2Winners[0].name,
        type: 'final'
      });

    } else if (tier1Groups === 2 && playoffType === 'semis') {
      // Półfinały: 1. A vs 2. B, 1. B vs 2. A
      const group1Teams = tier1Ranking.filter(t => t.groupId === tier1GroupsData[0].id).slice(0, 2);
      const group2Teams = tier1Ranking.filter(t => t.groupId === tier1GroupsData[1].id).slice(0, 2);
      
      playoffTeams = [...group1Teams, ...group2Teams];
      
      matches.push({
        team1: group1Teams[0].name,
        team2: group2Teams[1].name,
        type: 'semi'
      });
      matches.push({
        team1: group2Teams[0].name,
        team2: group1Teams[1].name,
        type: 'semi'
      });
      matches.push({
        team1: 'Zwycięzca SF1',
        team2: 'Zwycięzca SF2',
        type: 'final'
      });
      matches.push({
        team1: 'Przegrany SF1',
        team2: 'Przegrany SF2',
        type: 'third'
      });

    } else if (tier1Groups === 2 && playoffType === 'placement') {
      // Mecze o miejsca: 1. A vs 1. B (o miejsca 1-2), 2. A vs 2. B (o miejsca 3-4), itd.
      const group1Teams = tier1Ranking.filter(t => t.groupId === tier1GroupsData[0].id);
      const group2Teams = tier1Ranking.filter(t => t.groupId === tier1GroupsData[1].id);
      
      const maxTeams = Math.min(group1Teams.length, group2Teams.length);
      playoffTeams = [...group1Teams.slice(0, maxTeams), ...group2Teams.slice(0, maxTeams)];
      
      for (let i = 0; i < maxTeams; i++) {
        const place1 = i * 2 + 1;
        const place2 = i * 2 + 2;
        matches.push({
          team1: group1Teams[i].name,
          team2: group2Teams[i].name,
          type: 'placement',
          label: `Mecz o miejsca ${place1}-${place2}`,
          places: `${place1}-${place2}`
        });
      }

    } else if (tier1Groups % 2 === 1 && playoffType === 'mini-league') {
      // Mini liga: zwycięzcy grup grają każdy z każdym
      const winners = tier1Ranking.filter(t => t.position === 1);
      playoffTeams = winners;
      
      // Generuj mecze round-robin
      for (let i = 0; i < winners.length; i++) {
        for (let j = i + 1; j < winners.length; j++) {
          matches.push({
            team1: winners[i].name,
            team2: winners[j].name,
            type: 'league'
          });
        }
      }

    } else if (playoffType === 'bracket') {
      // Drabinka playoff - zbierz top N drużyn
      const teamsPerGroup = Math.ceil(playoffTeamsCount / tier1Groups);
      
      tier1GroupsData.forEach(group => {
        const sorted = sortGroupTeams(group.teams, 'tier1', group.id);
        sorted.slice(0, teamsPerGroup).forEach(teamId => {
          const team = teams.find(t => t.id === teamId);
          if (team && playoffTeams.length < playoffTeamsCount) {
            playoffTeams.push(team);
          }
        });
      });

      // Generuj drabinkę
      for (let i = 0; i < playoffTeamsCount / 2; i++) {
        const label = playoffTeamsCount === 4 ? '1/2 finału' : 
                      playoffTeamsCount === 8 ? '1/4 finału' :
                      playoffTeamsCount === 16 ? '1/8 finału' : '1/16 finału';
        matches.push({
          team1: playoffTeams[i * 2]?.name || 'TBD',
          team2: playoffTeams[i * 2 + 1]?.name || 'TBD',
          type: 'bracket',
          label: `${label} - Mecz ${i + 1}`
        });
      }
    }

    setPlayoffMatches(matches);
    setStep(4); // Przejdź do playoff
  };

  // useEffect do aktualizacji nazw drużyn w finałach po zatwierdzeniu półfinałów
  useEffect(() => {
    if (playoffType === 'semis' && playoffMatches.length === 4) {
      const semi0confirmed = playoffResults['playoff_semi0_confirmed'];
      const semi1confirmed = playoffResults['playoff_semi1_confirmed'];
      
      if (semi0confirmed && semi1confirmed) {
        const score0_1 = parseInt(playoffResults['playoff_semi0_team1']) || 0;
        const score0_2 = parseInt(playoffResults['playoff_semi0_team2']) || 0;
        const score1_1 = parseInt(playoffResults['playoff_semi1_team1']) || 0;
        const score1_2 = parseInt(playoffResults['playoff_semi1_team2']) || 0;
        
        const winner0 = score0_1 > score0_2 ? playoffMatches[0].team1 : playoffMatches[0].team2;
        const loser0 = score0_1 > score0_2 ? playoffMatches[0].team2 : playoffMatches[0].team1;
        const winner1 = score1_1 > score1_2 ? playoffMatches[1].team1 : playoffMatches[1].team2;
        const loser1 = score1_1 > score1_2 ? playoffMatches[1].team2 : playoffMatches[1].team1;
        
        setPlayoffMatches(prev => {
          const updated = [...prev];
          updated[2] = { ...updated[2], team1: winner0, team2: winner1 };
          updated[3] = { ...updated[3], team1: loser0, team2: loser1 };
          return updated;
        });
      }
    }
  }, [playoffResults, playoffType, playoffMatches.length]);

  const resetTournament = () => {
    if (window.confirm('Czy na pewno chcesz zresetować turniej?')) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  const saveTeamName = () => {
    if (!editingTeam) return;
    setTeams(teams.map(t => t.id === editingTeam.id ? editingTeam : t));
    setEditingTeam(null);
  };

  const exportCSV = () => {
    let csv = 'Turniej Grupowy - Wyniki\n\n';
    csv += 'FAZA KWALIFIKACYJNA\n';
    qualifyingGroups.forEach(group => {
      csv += `\nGrupa ${group.name}\n`;
      csv += 'Miejsce,Drużyna,Mecze,Pkt,Bramki\n';
      const sorted = sortGroupTeams(group.teams, 'qual', group.id);
      sorted.forEach((teamId, i) => {
        const team = teams.find(t => t.id === teamId);
        csv += `${i+1},${team.name},${team.qualWins + team.qualDraws + team.qualLosses},${team.qualPoints},${team.qualGoalsFor}:${team.qualGoalsAgainst}\n`;
      });
    });

    if (step >= 2) {
      csv += '\n\nI LIGA\n';
      tier1GroupsData.forEach(group => {
        csv += `\nGrupa ${group.name}\n`;
        csv += 'Miejsce,Drużyna,Mecze,Pkt,Bramki\n';
        const sorted = sortGroupTeams(group.teams, 'tier1', group.id);
        sorted.forEach((teamId, i) => {
          const team = teams.find(t => t.id === teamId);
          csv += `${i+1},${team.name},${team.finalWins + team.finalDraws + team.finalLosses},${team.finalPoints},${team.finalGoalsFor}:${team.finalGoalsAgainst}\n`;
        });
      });

      csv += '\n\nII LIGA\n';
      tier2GroupsData.forEach(group => {
        csv += `\nGrupa ${group.name}\n`;
        csv += 'Miejsce,Drużyna,Mecze,Pkt,Bramki\n';
        const sorted = sortGroupTeams(group.teams, 'tier2', group.id);
        sorted.forEach((teamId, i) => {
          const team = teams.find(t => t.id === teamId);
          csv += `${i+1},${team.name},${team.finalWins + team.finalDraws + team.finalLosses},${team.finalPoints},${team.finalGoalsFor}:${team.finalGoalsAgainst}\n`;
        });
      });

      // Klasyfikacja końcowa
      if (allFinalsCompleted()) {
        csv += '\n\nKLASYFIKACJA KOŃCOWA\n';
        csv += 'Miejsce,Drużyna,Liga,Grupa,Pozycja w grupie,Pkt finałowe,Bramki finałowe,Bilans finałowy,Pkt łącznie,Bramki łącznie,Bilans łączny\n';
        const finalRanking = generateFinalRanking();
        finalRanking.forEach((team, index) => {
          const tierName = team.tier === 1 ? 'I Liga' : 'II Liga';
          const finalGD = team.finalGoalsFor - team.finalGoalsAgainst;
          const totalGD = team.totalGoalsFor - team.totalGoalsAgainst;
          csv += `${index + 1},${team.name},${tierName},${team.groupName},${team.groupPosition},${team.finalPoints},${team.finalGoalsFor}:${team.finalGoalsAgainst},${finalGD >= 0 ? '+' : ''}${finalGD},${team.totalPoints},${team.totalGoalsFor}:${team.totalGoalsAgainst},${totalGD >= 0 ? '+' : ''}${totalGD}\n`;
        });
      }
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'turniej_grupowy.csv';
    link.click();
  };

  // Generowanie klasyfikacji końcowej
  const getFinalRanking = () => {
    const ranking = [];

    // Najpierw I Liga - sortowana według grup
    tier1GroupsData.forEach(group => {
      const sorted = sortGroupTeams(group.teams, 'tier1', group.id);
      sorted.forEach((teamId, position) => {
        const team = teams.find(t => t.id === teamId);
        ranking.push({ ...team, tier: 1, groupPosition: position + 1, groupName: group.name });
      });
    });

    // Potem II Liga - sortowana według grup
    tier2GroupsData.forEach(group => {
      const sorted = sortGroupTeams(group.teams, 'tier2', group.id);
      sorted.forEach((teamId, position) => {
        const team = teams.find(t => t.id === teamId);
        ranking.push({ ...team, tier: 2, groupPosition: position + 1, groupName: group.name });
      });
    });

    // Sortowanie międzygrupowe w obrębie każdej ligi
    const tier1Teams = ranking.filter(t => t.tier === 1).sort((a, b) => {
      // Najpierw według pozycji w grupie (1. miejsca, potem 2. miejsca itd.)
      if (a.groupPosition !== b.groupPosition) return a.groupPosition - b.groupPosition;
      // Przy równej pozycji - według punktów
      if (b.finalPoints !== a.finalPoints) return b.finalPoints - a.finalPoints;
      // Potem bilans
      const aDiff = a.finalGoalsFor - a.finalGoalsAgainst;
      const bDiff = b.finalGoalsFor - b.finalGoalsAgainst;
      if (bDiff !== aDiff) return bDiff - aDiff;
      // Na końcu bramki strzelone
      return b.finalGoalsFor - a.finalGoalsFor;
    });

    const tier2Teams = ranking.filter(t => t.tier === 2).sort((a, b) => {
      if (a.groupPosition !== b.groupPosition) return a.groupPosition - b.groupPosition;
      if (b.finalPoints !== a.finalPoints) return b.finalPoints - a.finalPoints;
      const aDiff = a.finalGoalsFor - a.finalGoalsAgainst;
      const bDiff = b.finalGoalsFor - b.finalGoalsAgainst;
      if (bDiff !== aDiff) return bDiff - aDiff;
      return b.finalGoalsFor - a.finalGoalsFor;
    });

    return [...tier1Teams, ...tier2Teams];
  };

  const renderGroupTable = (groupTeams, phase, groupId) => {
    const prefix = phase === 'qual' ? 'qual' : 'final';
    const sorted = sortGroupTeams(groupTeams, phase, groupId);
    const tier1TotalTeams = tier1Groups * tier1TeamsPerGroup;
    const tier1PerGroup = Math.floor(tier1TotalTeams / numQualGroups);

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
              const isAdvancing = phase === 'qual' && index < tier1PerGroup;
              
              return (
                <tr key={team.id} className={`border-t ${isAdvancing ? 'bg-green-100' : ''}`}>
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

  const renderGroupMatches = (groupId, phase) => {
    const [matches, results] = phase === 'qual' ? [qualifyingMatches, qualifyingResults] :
                                 phase === 'tier1' ? [tier1Matches, tier1Results] :
                                 [tier2Matches, tier2Results];

    const groupMatches = (matches[groupId] || []).sort((a, b) => a.round - b.round);

    return (
      <div className="space-y-4">
        {Array.from(new Set(groupMatches.map(m => m.round))).map(round => (
          <div key={round}>
            <h4 className="font-semibold text-gray-700 mb-2">Runda {round}</h4>
            <div className="space-y-2">
              {groupMatches.filter(m => m.round === round).map(match => {
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
          </div>
        ))}
      </div>
    );
  };

  // STEP 0: Setup
  if (step === 0) {
    const totalTeams = numQualGroups * teamsPerQualGroup;
    const tier1Total = tier1Groups * tier1TeamsPerGroup;
    const tier2Total = totalTeams - tier1Total;

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">
              Turniej Grupowy
            </h1>
            <p className="text-gray-600 text-center mb-8">
              System grupowy z przechodzeniem do I i II ligi
            </p>

            <div className="space-y-6">
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                <h3 className="font-bold text-purple-900 mb-3">Faza kwalifikacyjna</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Liczba grup kwalifikacyjnych:
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="12"
                      value={numQualGroups}
                      onChange={(e) => setNumQualGroups(parseInt(e.target.value) || 2)}
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
                      value={teamsPerQualGroup}
                      onChange={(e) => setTeamsPerQualGroup(parseInt(e.target.value) || 3)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                <h3 className="font-bold text-yellow-900 mb-3">I Liga (finały)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Liczba grup I ligi:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={tier1Groups}
                      onChange={(e) => setTier1Groups(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Drużyn w grupie I ligi:
                    </label>
                    <input
                      type="number"
                      min="3"
                      max="8"
                      value={tier1TeamsPerGroup}
                      onChange={(e) => setTier1TeamsPerGroup(parseInt(e.target.value) || 3)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-3">II Liga</h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Liczba grup II ligi:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={tier2Groups}
                    onChange={(e) => setTier2Groups(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Do II ligi trafi: <strong>{tier2Total > 0 ? tier2Total : 0} drużyn</strong>
                    {tier2Total > 0 && ` (po ~${Math.ceil(tier2Total / tier2Groups)} w grupie)`}
                  </p>
                </div>
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

              {/* Faza pucharowa */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="hasPlayoff"
                    checked={hasPlayoff}
                    onChange={(e) => {
                      setHasPlayoff(e.target.checked);
                      if (e.target.checked && tier1Groups === 2) {
                        setPlayoffType('semis');
                      } else if (e.target.checked && tier1Groups % 2 === 1) {
                        setPlayoffType('mini-league');
                      } else if (e.target.checked) {
                        setPlayoffType('bracket');
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <label htmlFor="hasPlayoff" className="font-bold text-green-900 cursor-pointer">
                    Faza pucharowa po I Lidze
                  </label>
                </div>

                {hasPlayoff && (
                  <div className="space-y-3 mt-3">
                    {tier1Groups === 2 && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Format playoff (2 grupy):
                        </label>
                        <select
                          value={playoffType}
                          onChange={(e) => setPlayoffType(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="final">Finał (1. vs 1.)</option>
                          <option value="semis">Półfinały + Finał (1. vs 2.)</option>
                          <option value="placement">Mecze o miejsca (1-4, 5-8, ...)</option>
                        </select>
                      </div>
                    )}

                    {tier1Groups % 2 === 1 && (
                      <div className="text-sm text-green-800">
                        <strong>Mini liga finałowa:</strong> Zwycięzcy grup I Ligi zagrają każdy z każdym
                      </div>
                    )}

                    {tier1Groups !== 2 && tier1Groups % 2 === 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Liczba drużyn w playoff:
                        </label>
                        <select
                          value={playoffTeamsCount}
                          onChange={(e) => {
                            const count = parseInt(e.target.value);
                            setPlayoffTeamsCount(count);
                            setPlayoffType('bracket');
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value={4}>4 drużyny (1/2 finału)</option>
                          <option value={8}>8 drużyn (1/4 finału)</option>
                          <option value={16}>16 drużyn (1/8 finału)</option>
                          <option value={32}>32 drużyny (1/16 finału)</option>
                        </select>
                        <p className="text-xs text-gray-600 mt-2">
                          Po {Math.ceil(playoffTeamsCount / tier1Groups)} najlepszych z każdej grupy
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Podsumowanie:</strong><br />
                  • {totalTeams} drużyn w {numQualGroups} grupach kwalifikacyjnych<br />
                  • I Liga: {tier1Groups} grup × {tier1TeamsPerGroup} drużyn = {tier1Total} miejsc<br />
                  • II Liga: {tier2Groups} {tier2Groups === 1 ? 'grupa' : 'grup'}, {tier2Total > 0 ? tier2Total : 0} drużyn<br />
                  • Wszystkie drużyny awansują do kolejnej fazy<br />
                  {hasPlayoff && (
                    <>
                      • <strong className="text-green-700">Faza pucharowa: </strong>
                      {tier1Groups === 2 && playoffType === 'final' && 'Finał (1. vs 1.)'}
                      {tier1Groups === 2 && playoffType === 'semis' && 'Półfinały + Finał'}
                      {tier1Groups === 2 && playoffType === 'placement' && 'Mecze o miejsca (1-4, 5-8, ...)'}
                      {tier1Groups % 2 === 1 && 'Mini liga finałowa'}
                      {tier1Groups !== 2 && tier1Groups % 2 === 0 && `Drabinka ${playoffTeamsCount} drużyn`}
                    </>
                  )}
                  {tier2Total < 0 && <span className="text-red-600 block mt-2">⚠️ Błąd: Więcej miejsc w I lidze niż drużyn!</span>}
                </p>
              </div>

              <button
                onClick={initializeTournament}
                disabled={tier2Total < 0}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Rozpocznij turniej
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STEP 1: Team Names
  if (step === 1) {
    const totalTeams = numQualGroups * teamsPerQualGroup;
    const currentLines = teamNamesInput.split('\n').filter(line => line.trim().length > 0).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">
              Nazwy drużyn
            </h1>
            <p className="text-gray-600 text-center mb-6">
              Uzupełnij nazwy {totalTeams} drużyn. Możesz wkleić z Excela (każda nazwa w nowej linii).
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Wskazówki:</strong><br />
                • Każda drużyna w osobnej linii<br />
                • Możesz skopiować kolumnę z Excela i wkleić tutaj<br />
                • Drużyny zostaną losowo przydzielone do {numQualGroups} grup po {teamsPerQualGroup} drużyn<br />
                • Aktualna liczba: <strong className={currentLines === totalTeams ? 'text-green-600' : 'text-red-600'}>{currentLines} / {totalTeams}</strong>
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lista drużyn (po jednej w linii):
              </label>
              <textarea
                value={teamNamesInput}
                onChange={(e) => setTeamNamesInput(e.target.value)}
                rows={Math.min(totalTeams + 2, 20)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-mono text-sm focus:border-blue-500 focus:outline-none"
                placeholder={`Drużyna 1\nDrużyna 2\nDrużyna 3\n...`}
              />
              <p className="text-xs text-gray-500 mt-2">
                Wklej nazwy z Excela lub wprowadź ręcznie
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(0)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition duration-200"
              >
                ← Wstecz
              </button>
              <button
                onClick={startTournamentWithTeams}
                disabled={currentLines < totalTeams}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Losuj grupy i rozpocznij →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: Qualifying
  if (step === 2) {
    const allMatchesCompleted = Object.values(qualifyingResults).every(r => r.completed);

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-purple-900">
                Faza Kwalifikacyjna
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

            <div className="flex gap-2 flex-wrap">
              {qualifyingGroups.map((group, idx) => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(idx)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    selectedGroup === idx
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Grupa {group.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Grupa {qualifyingGroups[selectedGroup]?.name} - Tabela
            </h2>
            {renderGroupTable(qualifyingGroups[selectedGroup]?.teams, 'qual', qualifyingGroups[selectedGroup]?.id)}
          </div>

          <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Grupa {qualifyingGroups[selectedGroup]?.name} - Mecze
            </h2>
            {renderGroupMatches(qualifyingGroups[selectedGroup]?.id, 'qual')}
          </div>

          {allMatchesCompleted && (
            <div className="bg-white rounded-xl shadow-xl p-6">
              <button
                onClick={advanceToFinals}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 shadow-lg flex items-center justify-center gap-2"
              >
                Przejdź do fazy finałowej (I i II liga) <ArrowRight size={24} />
              </button>
            </div>
          )}
        </div>

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
                        <button onClick={saveTeamName} className="bg-green-500 text-white px-3 py-1 rounded">✓</button>
                        <button onClick={() => setEditingTeam(null)} className="bg-gray-300 px-3 py-1 rounded">✕</button>
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

  // STEP 3: Finals (I i II liga)
  if (step === 3) {
    const currentGroups = currentTier === 1 ? tier1GroupsData : tier2GroupsData;
    const currentPhase = currentTier === 1 ? 'tier1' : 'tier2';
    const currentResults = currentTier === 1 ? tier1Results : tier2Results;
    const allMatchesCompleted = Object.values(currentResults).every(r => r.completed);
    
    // Sprawdź czy wszystkie mecze w obu ligach są zakończone
    const allTier1Completed = Object.values(tier1Results).every(r => r.completed);
    const allTier2Completed = Object.values(tier2Results).every(r => r.completed);
    const allFinalsCompleted = allTier1Completed && allTier2Completed;

    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-orange-900">
                Faza Finałowa
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

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { setCurrentTier(1); setSelectedGroup(0); }}
                className={`px-6 py-3 rounded-lg font-bold transition ${
                  currentTier === 1
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Trophy className="inline mr-2" size={20} />
                I Liga
              </button>
              <button
                onClick={() => { setCurrentTier(2); setSelectedGroup(0); }}
                className={`px-6 py-3 rounded-lg font-bold transition ${
                  currentTier === 2
                    ? 'bg-gray-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                II Liga
              </button>
            </div>

            <div className="flex gap-2 flex-wrap">
              {currentGroups.map((group, idx) => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(idx)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    selectedGroup === idx
                      ? currentTier === 1 ? 'bg-yellow-500 text-white' : 'bg-gray-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Grupa {group.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Grupa {currentGroups[selectedGroup]?.name} - Tabela
            </h2>
            {renderGroupTable(currentGroups[selectedGroup]?.teams, currentPhase, currentGroups[selectedGroup]?.id)}
          </div>

          <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Grupa {currentGroups[selectedGroup]?.name} - Mecze
            </h2>
            {renderGroupMatches(currentGroups[selectedGroup]?.id, currentPhase)}
          </div>

          {allMatchesCompleted && (
            <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="text-yellow-500" />
                {currentTier === 1 ? 'I Liga - Zakończona' : 'II Liga - Zakończona'}
              </h2>
              <div className="text-center text-green-600 font-semibold text-lg">
                Wszystkie mecze rozegrane! Zobacz tabele powyżej.
              </div>
            </div>
          )}

          {allFinalsCompleted && hasPlayoff && (
            <div className="bg-green-50 border-2 border-green-500 rounded-xl shadow-xl p-6 mb-6">
              <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2 justify-center">
                <Trophy className="text-green-600" />
                Faza Pucharowa
              </h2>
              <p className="text-center text-gray-700 mb-4">
                {tier1Groups === 2 && playoffType === 'final' && 'Finał między zwycięzcami grup'}
                {tier1Groups === 2 && playoffType === 'semis' && 'Półfinały i Finał'}
                {tier1Groups === 2 && playoffType === 'placement' && 'Mecze o miejsca 1-4, 5-8, ...'}
                {tier1Groups % 2 === 1 && 'Mini liga finałowa - najlepsi z każdej grupy'}
                {tier1Groups !== 2 && tier1Groups % 2 === 0 && `Drabinka ${playoffTeamsCount} najlepszych drużyn`}
              </p>
              <button
                onClick={generatePlayoff}
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 shadow-lg flex items-center justify-center gap-2"
              >
                Rozpocznij fazę pucharową <ArrowRight size={24} />
              </button>
            </div>
          )}

          {allFinalsCompleted && !hasPlayoff && (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-2xl shadow-2xl p-8 mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-3">
                <Trophy className="text-yellow-500" size={36} />
                KLASYFIKACJA KOŃCOWA
                <Trophy className="text-yellow-500" size={36} />
              </h2>
              
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
                      <tr>
                        <th className="p-3 text-left font-bold">Miejsce</th>
                        <th className="p-3 text-left font-bold">Drużyna</th>
                        <th className="p-3 text-center font-bold">Liga</th>
                        <th className="p-3 text-center font-bold">Gr.</th>
                        <th className="p-3 text-center font-bold">Poz.</th>
                        <th className="p-3 text-center font-bold">M</th>
                        <th className="p-3 text-center font-bold">Pkt</th>
                        <th className="p-3 text-center font-bold">Bramki</th>
                        <th className="p-3 text-center font-bold">Bilans</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generateFinalRanking().map((team, index) => {
                        let bgColor = 'bg-white';
                        let medalIcon = null;
                        
                        if (index === 0) {
                          bgColor = 'bg-yellow-100 border-l-4 border-yellow-500';
                          medalIcon = <span className="text-2xl">🥇</span>;
                        } else if (index === 1) {
                          bgColor = 'bg-gray-100 border-l-4 border-gray-400';
                          medalIcon = <span className="text-2xl">🥈</span>;
                        } else if (index === 2) {
                          bgColor = 'bg-orange-100 border-l-4 border-orange-500';
                          medalIcon = <span className="text-2xl">🥉</span>;
                        } else if (team.tier === 1) {
                          bgColor = 'bg-blue-50';
                        }

                        return (
                          <tr key={team.id} className={`${bgColor} border-b hover:bg-opacity-75 transition`}>
                            <td className="p-3 font-bold text-lg">
                              <div className="flex items-center gap-2">
                                {medalIcon}
                                <span>{index + 1}</span>
                              </div>
                            </td>
                            <td className="p-3 font-semibold">{team.name}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                team.tier === 1 
                                  ? 'bg-yellow-200 text-yellow-800' 
                                  : 'bg-gray-200 text-gray-700'
                              }`}>
                                {team.tier === 1 ? 'I' : 'II'}
                              </span>
                            </td>
                            <td className="p-3 text-center text-sm">{team.groupName}</td>
                            <td className="p-3 text-center font-semibold">{team.groupPosition}</td>
                            <td className="p-3 text-center">{team.finalWins + team.finalDraws + team.finalLosses}</td>
                            <td className="p-3 text-center font-bold text-blue-600">{team.finalPoints}</td>
                            <td className="p-3 text-center">{team.finalGoalsFor}:{team.finalGoalsAgainst}</td>
                            <td className="p-3 text-center font-semibold">
                              <span className={team.finalGoalsFor - team.finalGoalsAgainst >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {team.finalGoalsFor - team.finalGoalsAgainst >= 0 ? '+' : ''}{team.finalGoalsFor - team.finalGoalsAgainst}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">🥇</div>
                  <div className="font-bold text-lg">{generateFinalRanking()[0]?.name}</div>
                  <div className="text-sm text-gray-600">Zwycięzca turnieju</div>
                </div>
                <div className="bg-gray-100 border-2 border-gray-400 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">🥈</div>
                  <div className="font-bold text-lg">{generateFinalRanking()[1]?.name}</div>
                  <div className="text-sm text-gray-600">2. miejsce</div>
                </div>
                <div className="bg-orange-100 border-2 border-orange-400 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">🥉</div>
                  <div className="font-bold text-lg">{generateFinalRanking()[2]?.name}</div>
                  <div className="text-sm text-gray-600">3. miejsce</div>
                </div>
              </div>

              <div className="mt-6 text-center text-sm text-gray-600">
                <p><strong>Legenda:</strong></p>
                <p>Gr. = Grupa w finale | Poz. = Pozycja w grupie | M = Mecze | Pkt = Punkty</p>
                <p className="mt-2">Klasyfikacja: 1. miejsca z I Ligi → 2. miejsca z I Ligi → ... → 1. miejsca z II Ligi → ...</p>
              </div>
            </div>
          )}
        </div>

        {/* ============= KROK 4: FAZA PUCHAROWA ============= */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center">Faza pucharowa</h2>
            
            {playoffType === 'final' && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-center mb-4">🏆 Finał</h3>
                {playoffMatches.map((match, idx) => (
                  <div key={idx} className="bg-white border-2 border-yellow-400 rounded-lg p-6 shadow-lg">
                    <h4 className="text-xl font-bold text-center mb-4">Mecz finałowy</h4>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 text-center">
                        <div className="font-bold text-lg">{match.team1}</div>
                        <input
                          type="number"
                          min="0"
                          value={playoffResults[`playoff_${idx}_team1`] || ''}
                          onChange={(e) => setPlayoffResults({ ...playoffResults, [`playoff_${idx}_team1`]: e.target.value })}
                          className="w-20 text-center border-2 border-gray-300 rounded p-2 text-xl font-bold mt-2"
                        />
                      </div>
                      <div className="text-3xl font-bold">VS</div>
                      <div className="flex-1 text-center">
                        <div className="font-bold text-lg">{match.team2}</div>
                        <input
                          type="number"
                          min="0"
                          value={playoffResults[`playoff_${idx}_team2`] || ''}
                          onChange={(e) => setPlayoffResults({ ...playoffResults, [`playoff_${idx}_team2`]: e.target.value })}
                          className="w-20 text-center border-2 border-gray-300 rounded p-2 text-xl font-bold mt-2"
                        />
                      </div>
                    </div>
                    {playoffResults[`playoff_${idx}_confirmed`] && (
                      <div className="mt-4 text-center">
                        <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold">
                          ✓ Wynik zatwierdzony
                        </span>
                      </div>
                    )}
                    {!playoffResults[`playoff_${idx}_confirmed`] && 
                     playoffResults[`playoff_${idx}_team1`] && 
                     playoffResults[`playoff_${idx}_team2`] && (
                      <button
                        onClick={() => {
                          setPlayoffResults({ ...playoffResults, [`playoff_${idx}_confirmed`]: true });
                        }}
                        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                      >
                        Zatwierdź wynik
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {playoffType === 'semis' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-center mb-4">Półfinały</h3>
                  {playoffMatches.filter(m => m.type === 'semi').map((match, idx) => (
                    <div key={idx} className="bg-white border-2 border-blue-400 rounded-lg p-6 shadow-lg">
                      <h4 className="text-xl font-bold text-center mb-4">Półfinał {idx + 1}</h4>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 text-center">
                          <div className="font-bold text-lg">{match.team1}</div>
                          <input
                            type="number"
                            min="0"
                            value={playoffResults[`playoff_semi${idx}_team1`] || ''}
                            onChange={(e) => setPlayoffResults({ ...playoffResults, [`playoff_semi${idx}_team1`]: e.target.value })}
                            className="w-20 text-center border-2 border-gray-300 rounded p-2 text-xl font-bold mt-2"
                          />
                        </div>
                        <div className="text-3xl font-bold">VS</div>
                        <div className="flex-1 text-center">
                          <div className="font-bold text-lg">{match.team2}</div>
                          <input
                            type="number"
                            min="0"
                            value={playoffResults[`playoff_semi${idx}_team2`] || ''}
                            onChange={(e) => setPlayoffResults({ ...playoffResults, [`playoff_semi${idx}_team2`]: e.target.value })}
                            className="w-20 text-center border-2 border-gray-300 rounded p-2 text-xl font-bold mt-2"
                          />
                        </div>
                      </div>
                      {playoffResults[`playoff_semi${idx}_confirmed`] && (
                        <div className="mt-4 text-center">
                          <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold">
                            ✓ Wynik zatwierdzony
                          </span>
                        </div>
                      )}
                      {!playoffResults[`playoff_semi${idx}_confirmed`] && 
                       playoffResults[`playoff_semi${idx}_team1`] && 
                       playoffResults[`playoff_semi${idx}_team2`] && (
                        <button
                          onClick={() => {
                            setPlayoffResults({ ...playoffResults, [`playoff_semi${idx}_confirmed`]: true });
                          }}
                          className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                        >
                          Zatwierdź wynik
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {playoffResults['playoff_semi0_confirmed'] && playoffResults['playoff_semi1_confirmed'] && (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-center mb-4">🥉 Mecz o 3. miejsce</h3>
                      {playoffMatches.filter(m => m.type === 'third').map((match, idx) => (
                        <div key={idx} className="bg-white border-2 border-orange-400 rounded-lg p-6 shadow-lg">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 text-center">
                              <div className="font-bold text-lg">{match.team1}</div>
                              <input
                                type="number"
                                min="0"
                                value={playoffResults[`playoff_third_team1`] || ''}
                                onChange={(e) => setPlayoffResults({ ...playoffResults, [`playoff_third_team1`]: e.target.value })}
                                className="w-20 text-center border-2 border-gray-300 rounded p-2 text-xl font-bold mt-2"
                              />
                            </div>
                            <div className="text-3xl font-bold">VS</div>
                            <div className="flex-1 text-center">
                              <div className="font-bold text-lg">{match.team2}</div>
                              <input
                                type="number"
                                min="0"
                                value={playoffResults[`playoff_third_team2`] || ''}
                                onChange={(e) => setPlayoffResults({ ...playoffResults, [`playoff_third_team2`]: e.target.value })}
                                className="w-20 text-center border-2 border-gray-300 rounded p-2 text-xl font-bold mt-2"
                              />
                            </div>
                          </div>
                          {playoffResults[`playoff_third_confirmed`] && (
                            <div className="mt-4 text-center">
                              <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold">
                                ✓ Wynik zatwierdzony
                              </span>
                            </div>
                          )}
                          {!playoffResults[`playoff_third_confirmed`] && 
                           playoffResults[`playoff_third_team1`] && 
                           playoffResults[`playoff_third_team2`] && (
                            <button
                              onClick={() => {
                                setPlayoffResults({ ...playoffResults, [`playoff_third_confirmed`]: true });
                              }}
                              className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                            >
                              Zatwierdź wynik
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-center mb-4">🏆 Finał</h3>
                      {playoffMatches.filter(m => m.type === 'final').map((match, idx) => (
                        <div key={idx} className="bg-white border-2 border-yellow-400 rounded-lg p-6 shadow-lg">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 text-center">
                              <div className="font-bold text-lg">{match.team1}</div>
                              <input
                                type="number"
                                min="0"
                                value={playoffResults[`playoff_final_team1`] || ''}
                                onChange={(e) => setPlayoffResults({ ...playoffResults, [`playoff_final_team1`]: e.target.value })}
                                className="w-20 text-center border-2 border-gray-300 rounded p-2 text-xl font-bold mt-2"
                              />
                            </div>
                            <div className="text-3xl font-bold">VS</div>
                            <div className="flex-1 text-center">
                              <div className="font-bold text-lg">{match.team2}</div>
                              <input
                                type="number"
                                min="0"
                                value={playoffResults[`playoff_final_team2`] || ''}
                                onChange={(e) => setPlayoffResults({ ...playoffResults, [`playoff_final_team2`]: e.target.value })}
                                className="w-20 text-center border-2 border-gray-300 rounded p-2 text-xl font-bold mt-2"
                              />
                            </div>
                          </div>
                          {playoffResults[`playoff_final_confirmed`] && (
                            <div className="mt-4 text-center">
                              <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold">
                                ✓ Wynik zatwierdzony
                              </span>
                            </div>
                          )}
                          {!playoffResults[`playoff_final_confirmed`] && 
                           playoffResults[`playoff_final_team1`] && 
                           playoffResults[`playoff_final_team2`] && (
                            <button
                              onClick={() => {
                                setPlayoffResults({ ...playoffResults, [`playoff_final_confirmed`]: true });
                              }}
                              className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded"
                            >
                              Zatwierdź wynik
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {playoffType === 'placement' && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-center mb-4">🏆 Mecze o miejsca</h3>
                <p className="text-center text-gray-600 mb-4">Każda pozycja z grupy A vs ta sama pozycja z grupy B</p>
                {playoffMatches.map((match, idx) => (
                  <div key={idx} className="bg-white border-2 border-indigo-400 rounded-lg p-6 shadow-lg">
                    <h4 className="text-lg font-bold text-center mb-4 text-indigo-600">{match.label}</h4>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 text-center">
                        <div className="font-bold text-lg">{match.team1}</div>
                        <input
                          type="number"
                          min="0"
                          value={playoffResults[`playoff_${idx}_team1`] || ''}
                          onChange={(e) => setPlayoffResults({ ...playoffResults, [`playoff_${idx}_team1`]: e.target.value })}
                          className="w-20 text-center border-2 border-gray-300 rounded p-2 text-xl font-bold mt-2"
                        />
                      </div>
                      <div className="text-3xl font-bold">VS</div>
                      <div className="flex-1 text-center">
                        <div className="font-bold text-lg">{match.team2}</div>
                        <input
                          type="number"
                          min="0"
                          value={playoffResults[`playoff_${idx}_team2`] || ''}
                          onChange={(e) => setPlayoffResults({ ...playoffResults, [`playoff_${idx}_team2`]: e.target.value })}
                          className="w-20 text-center border-2 border-gray-300 rounded p-2 text-xl font-bold mt-2"
                        />
                      </div>
                    </div>
                    {playoffResults[`playoff_${idx}_confirmed`] && (
                      <div className="mt-4 text-center">
                        <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold">
                          ✓ Wynik zatwierdzony
                        </span>
                      </div>
                    )}
                    {!playoffResults[`playoff_${idx}_confirmed`] && 
                     playoffResults[`playoff_${idx}_team1`] && 
                     playoffResults[`playoff_${idx}_team2`] && (
                      <button
                        onClick={() => {
                          setPlayoffResults({ ...playoffResults, [`playoff_${idx}_confirmed`]: true });
                        }}
                        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                      >
                        Zatwierdź wynik
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {playoffType === 'mini-league' && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-center mb-4">🏆 Mini Liga Finałowa</h3>
                <p className="text-center text-gray-600 mb-4">Każdy z każdym - system kołowy</p>
                {playoffMatches.map((match, idx) => (
                  <div key={idx} className="bg-white border-2 border-green-400 rounded-lg p-6 shadow-lg">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 text-center">
                        <div className="font-bold text-lg">{match.team1}</div>
                        <input
                          type="number"
                          min="0"
                          value={playoffResults[`playoff_${idx}_team1`] || ''}
                          onChange={(e) => setPlayoffResults({ ...playoffResults, [`playoff_${idx}_team1`]: e.target.value })}
                          className="w-20 text-center border-2 border-gray-300 rounded p-2 text-xl font-bold mt-2"
                        />
                      </div>
                      <div className="text-3xl font-bold">VS</div>
                      <div className="flex-1 text-center">
                        <div className="font-bold text-lg">{match.team2}</div>
                        <input
                          type="number"
                          min="0"
                          value={playoffResults[`playoff_${idx}_team2`] || ''}
                          onChange={(e) => setPlayoffResults({ ...playoffResults, [`playoff_${idx}_team2`]: e.target.value })}
                          className="w-20 text-center border-2 border-gray-300 rounded p-2 text-xl font-bold mt-2"
                        />
                      </div>
                    </div>
                    {playoffResults[`playoff_${idx}_confirmed`] && (
                      <div className="mt-4 text-center">
                        <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold">
                          ✓ Wynik zatwierdzony
                        </span>
                      </div>
                    )}
                    {!playoffResults[`playoff_${idx}_confirmed`] && 
                     playoffResults[`playoff_${idx}_team1`] && 
                     playoffResults[`playoff_${idx}_team2`] && (
                      <button
                        onClick={() => {
                          setPlayoffResults({ ...playoffResults, [`playoff_${idx}_confirmed`]: true });
                        }}
                        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                      >
                        Zatwierdź wynik
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {playoffType === 'bracket' && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-center mb-4">🏆 Drabinka pucharowa ({playoffTeamsCount} drużyn)</h3>
                {playoffMatches.map((match, idx) => (
                  <div key={idx} className="bg-white border-2 border-purple-400 rounded-lg p-6 shadow-lg">
                    <h4 className="text-lg font-bold text-center mb-4">{match.label || `Mecz ${idx + 1}`}</h4>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 text-center">
                        <div className="font-bold text-lg">{match.team1}</div>
                        <input
                          type="number"
                          min="0"
                          value={playoffResults[`playoff_${idx}_team1`] || ''}
                          onChange={(e) => setPlayoffResults({ ...playoffResults, [`playoff_${idx}_team1`]: e.target.value })}
                          className="w-20 text-center border-2 border-gray-300 rounded p-2 text-xl font-bold mt-2"
                        />
                      </div>
                      <div className="text-3xl font-bold">VS</div>
                      <div className="flex-1 text-center">
                        <div className="font-bold text-lg">{match.team2}</div>
                        <input
                          type="number"
                          min="0"
                          value={playoffResults[`playoff_${idx}_team2`] || ''}
                          onChange={(e) => setPlayoffResults({ ...playoffResults, [`playoff_${idx}_team2`]: e.target.value })}
                          className="w-20 text-center border-2 border-gray-300 rounded p-2 text-xl font-bold mt-2"
                        />
                      </div>
                    </div>
                    {playoffResults[`playoff_${idx}_confirmed`] && (
                      <div className="mt-4 text-center">
                        <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold">
                          ✓ Wynik zatwierdzony
                        </span>
                      </div>
                    )}
                    {!playoffResults[`playoff_${idx}_confirmed`] && 
                     playoffResults[`playoff_${idx}_team1`] && 
                     playoffResults[`playoff_${idx}_team2`] && (
                      <button
                        onClick={() => {
                          setPlayoffResults({ ...playoffResults, [`playoff_${idx}_confirmed`]: true });
                        }}
                        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                      >
                        Zatwierdź wynik
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="text-center mt-8">
              <button
                onClick={() => setStep(3)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg mr-4"
              >
                ← Powrót do finałów
              </button>
            </div>
          </div>
        )}

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
                        <button onClick={saveTeamName} className="bg-green-500 text-white px-3 py-1 rounded">✓</button>
                        <button onClick={() => setEditingTeam(null)} className="bg-gray-300 px-3 py-1 rounded">✕</button>
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

  return null;
}
