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

  // For input fields: allow empty string for controlled input
  const [numPlayersInput, setNumPlayersInput] = useState('8');
  const [numFieldsInput, setNumFieldsInput] = useState('2');
  const [playersPerTeamInput, setPlayersPerTeamInput] = useState('2');
  const [numRoundsInput, setNumRoundsInput] = useState('0');
  const [inputError, setInputError] = useState('');
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
  const [showPasteMode, setShowPasteMode] = useState(false);
  const [pasteInput, setPasteInput] = useState('');

  // Edit tournament state
  const [numPlayersToAdd, setNumPlayersToAdd] = useState(1);
  const [numPlayersToAddInput, setNumPlayersToAddInput] = useState('1');
  const [newPlayerNames, setNewPlayerNames] = useState(['']);
  const [additionalRoundsToAdd, setAdditionalRoundsToAdd] = useState(1);
  const [additionalRoundsInput, setAdditionalRoundsInput] = useState('1');
  const [editTournamentError, setEditTournamentError] = useState('');
  const [previewNewMatches, setPreviewNewMatches] = useState([]);

  // Debounced persist: save to localStorage 500ms after last change
  const saveTimeoutRef = useRef(null);

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
  // Synchronize input fields with state
  useEffect(() => { setNumPlayersInput(numPlayers === '' ? '' : String(numPlayers)); }, [numPlayers]);
  useEffect(() => { setNumFieldsInput(numFields === '' ? '' : String(numFields)); }, [numFields]);
  useEffect(() => { setPlayersPerTeamInput(playersPerTeam === '' ? '' : String(playersPerTeam)); }, [playersPerTeam]);
  useEffect(() => { setNumRoundsInput(numRounds === '' ? '' : String(numRounds)); }, [numRounds]);

  // Validation flags for inputs — only used for UI highlighting while typing
  const parsedNumPlayersInput = numPlayersInput === '' ? NaN : parseInt(numPlayersInput);
  const parsedNumFieldsInput = numFieldsInput === '' ? NaN : parseInt(numFieldsInput);
  const parsedPlayersPerTeamInput = playersPerTeamInput === '' ? NaN : parseInt(playersPerTeamInput);
  const parsedNumRoundsInput = numRoundsInput === '' ? NaN : parseInt(numRoundsInput);

  const numPlayersInvalid = numPlayersInput !== '' && (isNaN(parsedNumPlayersInput) || parsedNumPlayersInput < 4);
  const numFieldsInvalid = numFieldsInput !== '' && (isNaN(parsedNumFieldsInput) || parsedNumFieldsInput < 1);
  const playersPerTeamInvalid = playersPerTeamInput !== '' && (isNaN(parsedPlayersPerTeamInput) || parsedPlayersPerTeamInput < 1);
  const numRoundsInvalid = numRoundsInput !== '' && (isNaN(parsedNumRoundsInput) || parsedNumRoundsInput < 1);

  useEffect(() => {
    // Use parsed input values while user types so suggested rounds update
    const parsedNumPlayers = numPlayersInput === '' ? numPlayers : parseInt(numPlayersInput);
    const parsedPlayersPerTeam = playersPerTeamInput === '' ? playersPerTeam : parseInt(playersPerTeamInput);
    const parsedNumFields = numFieldsInput === '' ? numFields : parseInt(numFieldsInput);

    if (
      parsedNumPlayers && parsedPlayersPerTeam && parsedNumFields &&
      !isNaN(parsedNumPlayers) && !isNaN(parsedPlayersPerTeam) && !isNaN(parsedNumFields)
    ) {
      const playersPerMatch = parsedPlayersPerTeam * 2;
      const playersPerRound = parsedNumFields * playersPerMatch;
      if (playersPerRound >= parsedNumPlayers) {
        setSuggestedRounds("dowolna");
        // Only set default numRounds if the user hasn't typed any value yet
        if (numRoundsInput === '') setNumRounds(3);
      } else {
        const suggestions = [];
        for (let rounds = 1; rounds <= 20 && suggestions.length < 5; rounds++) {
          const totalSlots = rounds * playersPerRound;
          if (totalSlots % parsedNumPlayers === 0) {
            suggestions.push(rounds);
          }
        }
        setSuggestedRounds(suggestions.length > 0 ? suggestions.join(', ') : []);
        if (numRoundsInput === '') setNumRounds(suggestions.length > 0 ? suggestions[0] : 1);
      }
    }
  }, [numPlayersInput, playersPerTeamInput, numFieldsInput]);

  const initializePlayers = () => {
    const count = arguments.length > 0 && typeof arguments[0] === 'number' ? arguments[0] : numPlayers;
    const names = Array(count).fill('').map((_, i) => `Zawodnik ${i + 1}`);
    setPlayerNames(names);
  };

  // Ensure when entering the player-name step the list matches the configured number
  useEffect(() => {
    if (step === 2) {
      if (!Array.isArray(playerNames) || playerNames.length !== numPlayers) {
        initializePlayers(numPlayers);
      }
    }
  }, [step, numPlayers]);

  const updatePlayerName = (index, name) => {
    const newNames = [...playerNames];
    const oldName = newNames[index];
    
    // Walidacja unikalności - sprawdź czy nazwa już istnieje (ignorując obecny indeks)
    const trimmedName = name.trim();
    if (trimmedName) {
      const duplicateIndex = newNames.findIndex((n, i) => 
        i !== index && n.trim().toLowerCase() === trimmedName.toLowerCase()
      );
      
      if (duplicateIndex !== -1) {
        // Znajdź numer do dodania
        let counter = 2;
        let uniqueName = `${trimmedName} (${counter})`;
        while (newNames.some((n, i) => i !== index && n.trim().toLowerCase() === uniqueName.toLowerCase())) {
          counter++;
          uniqueName = `${trimmedName} (${counter})`;
        }
        newNames[index] = uniqueName;
      } else {
        newNames[index] = name;
      }
    } else {
      newNames[index] = name;
    }
    
    setPlayerNames(newNames);
    
    // Jeśli turniej został już wygenerowany, zaktualizuj nazwy w meczach
    if (matches.length > 0) {
      const updatedMatches = matches.map(match => ({
        ...match,
        team1: match.team1.map(player => player === oldName ? newNames[index] : player),
        team2: match.team2.map(player => player === oldName ? newNames[index] : player)
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

  const handlePasteSubmit = () => {
    const lines = pasteInput.split('\n').map(line => line.trim()).filter(line => line !== '');
    
    if (lines.length !== numPlayers) {
      alert(`Wklejono ${lines.length} imion, ale potrzeba ${numPlayers}. Popraw dane lub zmień liczbę zawodników.`);
      return;
    }
    
    // Automatyczne losowe pomieszanie zawodników
    const shuffledLines = shuffle(lines);
    setPlayerNames(shuffledLines);
    setShowPasteMode(false);
    setPasteInput('');
  };

  const handleManualEntry = () => {
    setShowPasteMode(false);
    setPasteInput('');
  };

  const shuffle = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const getSuggestedAdditionalRounds = (newPlayersCount = 1) => {
    if (!matches.length || numPlayers === 0) return 1;
    const totalSlots = matches.length * playersPerTeam * 2;
    const avgMatchesPerPlayer = totalSlots / numPlayers;
    const newTotalPlayers = numPlayers + newPlayersCount;
    const playersPerRound = numFields * playersPerTeam * 2;
    if (playersPerRound >= newTotalPlayers) {
      return Math.max(1, Math.round(avgMatchesPerPlayer));
    }
    const matchesPerPlayerPerRound = playersPerRound / newTotalPlayers;
    return Math.max(1, Math.ceil(avgMatchesPerPlayer / Math.max(matchesPerPlayerPerRound, 0.01)));
  };

  const generateAdditionalMatches = (newNamesArg, additionalRounds) => {
    const namesArray = Array.isArray(newNamesArg) ? newNamesArg : [newNamesArg];
    return generateMatchesCore([...playerNames, ...namesArray], additionalRounds, numRounds + 1, matches);
  };

  // Core scheduling engine: generates rounds starting at startRound,
  // building match-count / teammate history from historyMatches.
  const generateMatchesCore = (allPlayerNames, numRoundsToGenerate, startRound, historyMatches) => {
    const playersPerMatch = playersPerTeam * 2;
    const playersPerRound = numFields * playersPerMatch;

    // Build current match counts from history
    const playerMatchCount = {};
    allPlayerNames.forEach(name => { playerMatchCount[name] = 0; });
    historyMatches.forEach(match => {
      [...match.team1, ...match.team2].forEach(p => {
        if (p in playerMatchCount) playerMatchCount[p]++;
      });
    });

    // Desired total matches per player over new rounds (distributed fairly)
    const totalNewSlots = numRoundsToGenerate * numFields * playersPerMatch;
    const baseNew = Math.floor(totalNewSlots / allPlayerNames.length);
    const extraNew = totalNewSlots % allPlayerNames.length;
    const desiredMatches = {};
    allPlayerNames.forEach((name, idx) => {
      desiredMatches[name] = (playerMatchCount[name] || 0) + baseNew + (idx < extraNew ? 1 : 0);
    });

    // Build teammate history from history
    const playerTeammates = {};
    allPlayerNames.forEach(name => { playerTeammates[name] = new Set(); });
    historyMatches.forEach(match => {
      match.team1.forEach(p1 => match.team1.forEach(p2 => {
        if (p1 !== p2 && p1 in playerTeammates) playerTeammates[p1].add(p2);
      }));
      match.team2.forEach(p1 => match.team2.forEach(p2 => {
        if (p1 !== p2 && p1 in playerTeammates) playerTeammates[p1].add(p2);
      }));
    });

    // Track last round played
    const lastPlayedRound = {};
    allPlayerNames.forEach(name => { lastPlayedRound[name] = -1000; });
    historyMatches.forEach(match => {
      [...match.team1, ...match.team2].forEach(p => {
        if (p in lastPlayedRound) lastPlayedRound[p] = Math.max(lastPlayedRound[p], match.round);
      });
    });

    const newMatches = [];

    for (let r = 0; r < numRoundsToGenerate; r++) {
      const round = startRound + r;
      const playersAssignedThisRound = new Set();

      const comparator = (a, b) => {
        const aPlayedPrev = lastPlayedRound[a] === round - 1 ? 1 : 0;
        const bPlayedPrev = lastPlayedRound[b] === round - 1 ? 1 : 0;
        if (aPlayedPrev !== bPlayedPrev) return aPlayedPrev - bPlayedPrev;
        if (playerMatchCount[a] !== playerMatchCount[b]) return playerMatchCount[a] - playerMatchCount[b];
        return lastPlayedRound[a] - lastPlayedRound[b];
      };

      let needyPlayers = allPlayerNames.filter(p => playerMatchCount[p] < (desiredMatches[p] || 0));
      needyPlayers.sort(comparator);
      if (needyPlayers.length < playersPerMatch * numFields) {
        needyPlayers = allPlayerNames.filter(p => !playersAssignedThisRound.has(p)).sort(comparator);
      }
      let selectedThisRound = needyPlayers.slice(0, playersPerRound);

      let success = false;
      let attempts = 0;

      while (!success && attempts < 20) {
        attempts++;
        const pool = shuffle([...selectedThisRound]);
        const tentativeFields = [];
        const tempTeammates = {};
        allPlayerNames.forEach(n => { tempTeammates[n] = new Set(playerTeammates[n]); });
        let ok = true;

        const pickForTeam = (team, poolLocal) => {
          let bestIdx = 0, bestScore = Infinity;
          const lookahead = Math.min(8, poolLocal.length);
          for (let j = 0; j < lookahead; j++) {
            const candidate = poolLocal[j];
            const shared = team.filter(t => tempTeammates[candidate]?.has(t)).length;
            if (shared < bestScore) { bestScore = shared; bestIdx = j; }
          }
          return poolLocal.splice(bestIdx, 1)[0];
        };

        for (let field = 0; field < numFields; field++) {
          const team1 = [], team2 = [];
          for (let i = 0; i < playersPerTeam; i++) {
            if (pool.length === 0) { ok = false; break; }
            team1.push(pickForTeam(team1, pool));
          }
          if (!ok) break;
          for (let i = 0; i < playersPerTeam; i++) {
            if (pool.length === 0) { ok = false; break; }
            team2.push(pickForTeam(team2, pool));
          }
          if (!ok) break;
          team1.forEach(p1 => team1.forEach(p2 => { if (p1 !== p2) tempTeammates[p1].add(p2); }));
          team2.forEach(p1 => team2.forEach(p2 => { if (p1 !== p2) tempTeammates[p1].add(p2); }));
          tentativeFields.push({ team1, team2 });
        }

        if (ok && tentativeFields.length === numFields) {
          tentativeFields.forEach((f, idx) => {
            const fieldNum = idx + 1;
            [...f.team1, ...f.team2].forEach(p => {
              playersAssignedThisRound.add(p);
              playerMatchCount[p] = (playerMatchCount[p] || 0) + 1;
              lastPlayedRound[p] = round;
            });
            f.team1.forEach(p1 => f.team1.forEach(p2 => { if (p1 !== p2) playerTeammates[p1].add(p2); }));
            f.team2.forEach(p1 => f.team2.forEach(p2 => { if (p1 !== p2) playerTeammates[p1].add(p2); }));
            newMatches.push({ id: `r${round}f${fieldNum}`, round, field: fieldNum, team1: f.team1, team2: f.team2, score1: 0, score2: 0 });
          });
          success = true;
        } else {
          selectedThisRound.push(selectedThisRound.shift());
        }
      }

      if (!success) {
        let pool = [...allPlayerNames].sort(comparator).slice(0, playersPerRound);
        for (let field = 0; field < numFields; field++) {
          if (pool.length < playersPerMatch) break;
          const team1 = pool.splice(0, playersPerTeam);
          const team2 = pool.splice(0, playersPerTeam);
          [...team1, ...team2].forEach(p => {
            playerMatchCount[p] = (playerMatchCount[p] || 0) + 1;
            lastPlayedRound[p] = round;
          });
          team1.forEach(p1 => team1.forEach(p2 => { if (p1 !== p2) playerTeammates[p1].add(p2); }));
          team2.forEach(p1 => team2.forEach(p2 => { if (p1 !== p2) playerTeammates[p1].add(p2); }));
          newMatches.push({ id: `r${round}f${field + 1}`, round, field: field + 1, team1, team2, score1: 0, score2: 0 });
        }
      }
    }

    return newMatches;
  };

  const validateEditInputs = () => {
    const trimmedNames = newPlayerNames.map(n => n.trim()).filter(n => n !== '');
    if (trimmedNames.length === 0) {
      setEditTournamentError('Podaj imię co najmniej jednego nowego zawodnika.');
      return null;
    }
    const duplicateInExisting = trimmedNames.find(n =>
      playerNames.some(p => p.trim().toLowerCase() === n.toLowerCase())
    );
    if (duplicateInExisting) {
      setEditTournamentError(`Zawodnik "${duplicateInExisting}" już istnieje w turnieju.`);
      return null;
    }
    const uniqueNew = new Set(trimmedNames.map(n => n.toLowerCase()));
    if (uniqueNew.size !== trimmedNames.length) {
      setEditTournamentError('Lista nowych zawodników zawiera duplikaty.');
      return null;
    }
    if (additionalRoundsToAdd < 1) {
      setEditTournamentError('Liczba dodatkowych rund musi być co najmniej 1.');
      return null;
    }
    return trimmedNames;
  };

  const resetEditState = () => {
    setNumPlayersToAdd(1);
    setNumPlayersToAddInput('1');
    setNewPlayerNames(['']);
    setAdditionalRoundsToAdd(1);
    setAdditionalRoundsInput('1');
    setEditTournamentError('');
    setPreviewNewMatches([]);
  };

  // Opcja 1: Turniej od nowa — czyści wyniki, generuje pełny turniej od rundy 1
  const applyOption1Fresh = () => {
    const trimmedNames = validateEditInputs();
    if (!trimmedNames) return;
    const allNames = [...playerNames, ...trimmedNames];
    const totalRounds = numRounds + additionalRoundsToAdd;
    const newMatches = generateMatchesCore(allNames, totalRounds, 1, []);
    const newResults = {};
    newMatches.forEach(m => { newResults[m.id] = { score1: '', score2: '' }; });
    setPlayerNames(allNames);
    setNumPlayers(allNames.length);
    setNumRounds(totalRounds);
    setMatches(newMatches);
    setResults(newResults);
    setFinalStandings([]);
    resetEditState();
    setStep(4);
  };

  // Opcja 2: Zachowaj rozegrane mecze, wylosuj nierozegrane od nowa + dodatkowe rundy
  const applyOption2KeepPlayed = () => {
    const trimmedNames = validateEditInputs();
    if (!trimmedNames) return;
    const allNames = [...playerNames, ...trimmedNames];

    // Znajdź ostatnią w pełni rozegranę rundę (wszystkie mecze mają wyniki)
    const roundNums = [...new Set(matches.map(m => m.round))].sort((a, b) => a - b);
    let lastFullyPlayedRound = 0;
    for (const r of roundNums) {
      const roundMatches = matches.filter(m => m.round === r);
      const allScored = roundMatches.every(m => {
        const res = results[m.id];
        return res && res.score1 !== '' && res.score2 !== '';
      });
      if (allScored) lastFullyPlayedRound = r;
      else break;
    }

    const playedMatches = matches.filter(m => m.round <= lastFullyPlayedRound);
    const roundsToGenerate = (numRounds - lastFullyPlayedRound) + additionalRoundsToAdd;
    const startRound = lastFullyPlayedRound + 1;

    const newMatches = generateMatchesCore(allNames, roundsToGenerate, startRound, playedMatches);

    const newResults = {};
    playedMatches.forEach(m => { newResults[m.id] = results[m.id]; });
    newMatches.forEach(m => { newResults[m.id] = { score1: '', score2: '' }; });

    setPlayerNames(allNames);
    setNumPlayers(allNames.length);
    setNumRounds(lastFullyPlayedRound + roundsToGenerate);
    setMatches([...playedMatches, ...newMatches]);
    setResults(newResults);
    setFinalStandings([]);
    resetEditState();
    setStep(4);
  };

  const generateTournament = () => {
    // New scheduling algorithm: fill each round and field by selecting players
    // with the lowest match counts and preventing a player from playing more
    // than once in the same round. This balances matches across players.
    const allMatches = [];
    const playerMatchCount = {};
    const playerTeammates = {};
    // Track last round when a player has played; used to avoid consecutive matches
    const lastPlayedRound = {};

    playerNames.forEach(name => {
      playerMatchCount[name] = 0;
      playerTeammates[name] = new Set();
      lastPlayedRound[name] = -1000;
    });

    const playersPerMatch = playersPerTeam * 2;
    const totalSlots = numRounds * numFields * playersPerMatch;
    const matchesPerPlayer = totalSlots / numPlayers;

    // Desired matches per player (distribute remainder among first players)
    const baseMatches = Math.floor(totalSlots / numPlayers);
    const extraMatches = totalSlots % numPlayers;
    const desiredMatches = {};
    playerNames.forEach((name, idx) => {
      desiredMatches[name] = baseMatches + (idx < extraMatches ? 1 : 0);
    });

    for (let round = 0; round < numRounds; round++) {
      const playersAssignedThisRound = new Set();

      // Select set of players that still need matches for this round
      let needyPlayers = playerNames.filter(p => playerMatchCount[p] < (desiredMatches[p] || 0));
      const comparator = (a, b) => {
        const aPlayedPrev = lastPlayedRound[a] === round - 1 ? 1 : 0;
        const bPlayedPrev = lastPlayedRound[b] === round - 1 ? 1 : 0;
        if (aPlayedPrev !== bPlayedPrev) return aPlayedPrev - bPlayedPrev;
        if (playerMatchCount[a] !== playerMatchCount[b]) return playerMatchCount[a] - playerMatchCount[b];
        return lastPlayedRound[a] - lastPlayedRound[b];
      };

      needyPlayers.sort(comparator);

      // If for some reason we don't have enough needy players (edge-case), fall back to all players
      if (needyPlayers.length < playersPerMatch * numFields) {
        needyPlayers = playerNames.filter(p => !playersAssignedThisRound.has(p)).sort(comparator);
      }

      // Choose players that will play this round (exactly playersPerRound)
      const playersPerRound = numFields * playersPerMatch;
      const selectedThisRound = needyPlayers.slice(0, playersPerRound);

      // Attempt to split selected players into fields while minimizing teammate repeats.
      let success = false;
      let attempts = 0;
      const maxAttempts = 20;

      while (!success && attempts < maxAttempts) {
        attempts++;
        const pool = shuffle(selectedThisRound);
        const tentativeFields = [];
        const tempTeammates = {};
        playerNames.forEach(n => { tempTeammates[n] = new Set(playerTeammates[n]); });
        let ok = true;

        const pickForTeam = (team, poolLocal) => {
          let bestIdx = 0; let bestScore = Infinity; const lookahead = Math.min(8, poolLocal.length);
          for (let j = 0; j < lookahead; j++) {
            const candidate = poolLocal[j];
            const shared = team.filter(t => tempTeammates[candidate]?.has(t)).length;
            if (shared < bestScore) { bestScore = shared; bestIdx = j; }
          }
          return poolLocal.splice(bestIdx, 1)[0];
        };

        for (let field = 0; field < numFields; field++) {
          const team1 = [];
          const team2 = [];
          for (let i = 0; i < playersPerTeam; i++) {
            if (pool.length === 0) { ok = false; break; }
            team1.push(pickForTeam(team1, pool));
          }
          for (let i = 0; i < playersPerTeam; i++) {
            if (pool.length === 0) { ok = false; break; }
            team2.push(pickForTeam(team2, pool));
          }
          if (!ok) break;

          // update temp teammates
          team1.forEach(p1 => team1.forEach(p2 => { if (p1 !== p2) tempTeammates[p1].add(p2); }));
          team2.forEach(p1 => team2.forEach(p2 => { if (p1 !== p2) tempTeammates[p1].add(p2); }));

          tentativeFields.push({ team1, team2 });
        }

        if (ok && tentativeFields.length === numFields) {
          // commit tentative fields
          tentativeFields.forEach((f, idx) => {
            const fieldNum = idx + 1;
            [...f.team1, ...f.team2].forEach(p => {
              playersAssignedThisRound.add(p);
              playerMatchCount[p] = (playerMatchCount[p] || 0) + 1;
              lastPlayedRound[p] = round;
            });
            f.team1.forEach(p1 => f.team1.forEach(p2 => { if (p1 !== p2) playerTeammates[p1].add(p2); }));
            f.team2.forEach(p1 => f.team2.forEach(p2 => { if (p1 !== p2) playerTeammates[p1].add(p2); }));
            allMatches.push({ id: `r${round + 1}f${fieldNum}`, round: round + 1, field: fieldNum, team1: f.team1, team2: f.team2, score1: 0, score2: 0 });
          });
          success = true;
        } else {
          // rotate selection and retry
          selectedThisRound.push(selectedThisRound.shift());
        }
      }

      // If we failed to build balanced fields after retries, use a conservative fallback:
      if (!success) {
        for (let field = 0; field < numFields; field++) {
          // Build candidate pool: prefer players not assigned this round and those who still need matches
          let candidates = playerNames
            .filter(p => !playersAssignedThisRound.has(p) && playerMatchCount[p] < (desiredMatches[p] || 0))
            .sort(comparator);

          if (candidates.length < playersPerMatch) {
            candidates = playerNames
              .filter(p => !playersAssignedThisRound.has(p))
              .sort(comparator);
          }

          const pickPlayerForTeam = (team, pool) => {
            let bestIdx = 0; let bestScore = Infinity; const lookahead = Math.min(8, pool.length);
            for (let j = 0; j < lookahead; j++) {
              const candidate = pool[j];
              const shared = team.filter(t => playerTeammates[candidate]?.has(t)).length;
              if (shared < bestScore) { bestScore = shared; bestIdx = j; }
            }
            return pool.splice(bestIdx, 1)[0];
          };

          const pool = [...candidates];
          const team1 = []; const team2 = [];
          for (let i = 0; i < playersPerTeam; i++) { if (pool.length === 0) break; team1.push(pickPlayerForTeam(team1, pool)); }
          for (let i = 0; i < playersPerTeam; i++) { if (pool.length === 0) break; team2.push(pickPlayerForTeam(team2, pool)); }

          if (team1.length + team2.length < playersPerMatch) {
            const remaining = playerNames.filter(p => !playersAssignedThisRound.has(p) && !team1.includes(p) && !team2.includes(p));
            while (team1.length + team2.length < playersPerMatch && remaining.length > 0) {
              remaining.sort((a, b) => playerMatchCount[a] - playerMatchCount[b]);
              const pick = remaining.shift(); if (team1.length < playersPerTeam) team1.push(pick); else team2.push(pick);
            }
          }

          if (team1.length !== playersPerTeam || team2.length !== playersPerTeam) continue;

          [...team1, ...team2].forEach(p => { playersAssignedThisRound.add(p); playerMatchCount[p] = (playerMatchCount[p] || 0) + 1; lastPlayedRound[p] = round; });
          team1.forEach(p1 => team1.forEach(p2 => { if (p1 !== p2) playerTeammates[p1].add(p2); }));
          team2.forEach(p1 => team2.forEach(p2 => { if (p1 !== p2) playerTeammates[p1].add(p2); }));

          allMatches.push({ id: `r${round + 1}f${field + 1}`, round: round + 1, field: field + 1, team1, team2, score1: 0, score2: 0 });
        }
      }
    }

    setMatches(allMatches);
    const initialResults = {};
    allMatches.forEach(match => {
      initialResults[match.id] = { score1: '', score2: '' };
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
      const score1 = results[match.id]?.score1;
      const score2 = results[match.id]?.score2;

      // Pomijaj mecze z pustymi wynikami
      if (score1 === '' || score2 === '' || score1 === undefined || score2 === undefined) {
        return;
      }

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

  // Ensure standings are calculated when user navigates to step 5
  // This covers timing issues where matches/results may have been set just before navigation.
  useEffect(() => {
    if (step === 5) {
      // If there are matches but standings are empty, (re)calculate them
      if (matches && matches.length > 0 && finalStandings.length === 0) {
        calculateStandings();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, matches, results]);

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

  const resetCache = () => {
    if (!window.confirm('Użycie tego usunie wszystkie dane o obecnym turnieju. Czy jesteś tego pewny?')) return;

    // Anuluj zaplanowane zapisy
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Nie udało się usunąć pamięci podręcznej', e);
    }

    // Zresetuj stany do wartości domyślnych
    setStep(1);
    setNumPlayers(8);
    setNumFields(2);
    setPlayersPerTeam(2);
    setNumRounds(0);
    setNumPlayersInput('8');
    setNumFieldsInput('2');
    setPlayersPerTeamInput('2');
    setNumRoundsInput('0');
    setInputError('');
    setSuggestedRounds(0);
    setPlayerNames([]);
    setMatches([]);
    setResults({});
    setFinalStandings([]);
    setReturnStep(null);
    setPointsWin(10);
    setPointsDraw(5);
    setPointsLoss(0);
    setPointsPerGoal(1);

    // Odśwież stronę, aby zapewnić pełne wyczyszczenie stanu UI
    window.location.reload();
  };

  const handleNewTournament = () => {
    const confirmNewTournament = window.confirm("Czy na pewno chcesz rozpocząć nowy turniej? Wszystkie dane zostaną utracone.");
    if (confirmNewTournament) {
      setStep(1);
      setNumPlayers(8);
      setNumFields(2);
      setPlayersPerTeam(2);
      setNumRounds(0);
      setPlayerNames([]);
      setMatches([]);
      setResults({});
      setFinalStandings([]);
      setReturnStep(null);
      setPointsWin(10);
      setPointsDraw(5);
      setPointsLoss(0);
      setPointsPerGoal(1);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const calculateRounds = () => {
    const rounds = [];
    for (let i = 0; i < numRounds; i++) {
      rounds.push([]);
    }

    for (let i = 0; i < numPlayers; i++) {
      const roundIndex = i % numRounds;
      rounds[roundIndex].push(`Zawodnik ${i + 1}`);
    }

    return rounds;
  };

  const handleStartTournament = () => {
    const rounds = calculateRounds();
    setMatches(rounds);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-6">
          <div className="mb-4 sm:mb-6 flex items-center justify-between">
            <Logo />
            <div className="ml-4">
              <button
                onClick={resetCache}
                className="bg-red-50 text-red-700 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
              >
                RESETUJ/ODŚWIEŻ
              </button>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  Liczba zawodników
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={numPlayersInput}
                  onChange={e => {
                    const val = e.target.value;
                    setNumPlayersInput(val);
                    // allow user to type any number; highlight if invalid but don't change state
                    setInputError('');
                  }}
                  aria-invalid={numPlayersInvalid}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-base rounded-lg focus:ring-2 focus:border-transparent ${numPlayersInvalid ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-indigo-500'}`}
                />
                {numPlayersInvalid && (
                  <div className="text-red-600 text-sm mt-1">Minimalna liczba zawodników to 4</div>
                )}
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  Liczba boisk
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={numFieldsInput}
                  onChange={e => {
                    const val = e.target.value;
                    setNumFieldsInput(val);
                    setInputError('');
                  }}
                  aria-invalid={numFieldsInvalid}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-base rounded-lg focus:ring-2 focus:border-transparent ${numFieldsInvalid ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-indigo-500'}`}
                />
                {numFieldsInvalid && (
                  <div className="text-red-600 text-sm mt-1">Minimalna liczba boisk to 1</div>
                )}
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  Zawodników na drużynę
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={playersPerTeamInput}
                  onChange={e => {
                    const val = e.target.value;
                    setPlayersPerTeamInput(val);
                    setInputError('');
                  }}
                  aria-invalid={playersPerTeamInvalid}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-base rounded-lg focus:ring-2 focus:border-transparent ${playersPerTeamInvalid ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-indigo-500'}`}
                />
                {playersPerTeamInvalid && (
                  <div className="text-red-600 text-sm mt-1">Minimalna liczba zawodników w drużynie to 1</div>
                )}
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  Liczba rund
                  <span className="block sm:inline sm:ml-2 text-xs sm:text-sm text-indigo-600 font-normal mt-1 sm:mt-0">
                    (Sugerowane: {suggestedRounds} - aby każdy zagrał taką samą liczbę meczy)
                  </span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={numRoundsInput}
                  onChange={e => {
                    const val = e.target.value;
                    setNumRoundsInput(val);
                    setInputError('');
                  }}
                  aria-invalid={numRoundsInvalid}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-base rounded-lg focus:ring-2 focus:border-transparent ${numRoundsInvalid ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-indigo-500'}`}
                />
                {numRoundsInvalid && (
                  <div className="text-red-600 text-sm mt-1">Liczba rund musi być większa lub równa 1</div>
                )}
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

              {inputError && (
                <div className="text-red-600 text-sm font-medium mt-2">{inputError}</div>
              )}

              <button
                onClick={() => {
                  // Validate all fields before proceeding
                  const parsedNumPlayers = numPlayersInput ? parseInt(numPlayersInput) : NaN;
                  const parsedNumFields = numFieldsInput ? parseInt(numFieldsInput) : NaN;
                  const parsedPlayersPerTeam = playersPerTeamInput ? parseInt(playersPerTeamInput) : NaN;
                  const parsedNumRounds = numRoundsInput ? parseInt(numRoundsInput) : NaN;

                  if (
                    isNaN(parsedNumPlayers) || parsedNumPlayers < 4 ||
                    isNaN(parsedNumFields) || parsedNumFields < 1 ||
                    isNaN(parsedPlayersPerTeam) || parsedPlayersPerTeam < 1 ||
                    isNaN(parsedNumRounds) || parsedNumRounds < 1
                  ) {
                    setInputError('Uzupełnij poprawnie wszystkie pola liczbowe.');
                    return;
                  }

                  setInputError('');
                  setNumPlayers(parsedNumPlayers);
                  setNumFields(parsedNumFields);
                  setPlayersPerTeam(parsedPlayersPerTeam);
                  setNumRounds(parsedNumRounds);
                  // initialize immediately with parsed count to avoid async state timing issues
                  initializePlayers(parsedNumPlayers);
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

              {!showPasteMode ? (
                <>
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => setShowPasteMode(true)}
                      className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
                    >
                      📋 Wklej z Excela
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-h-80 sm:max-h-96 overflow-y-auto p-2">
                    {playerNames.map((name, index) => (
                      <input
                        key={index}
                        type="text"
                        value={name}
                        onChange={(e) => updatePlayerName(index, e.target.value)}
                        placeholder={`Zawodnik ${index + 1}`}
                        className={`px-3 sm:px-4 py-2 sm:py-3 text-base border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${name.trim() === '' ? 'border-red-500' : 'border-gray-300'}`}
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
                        onClick={() => {
                          // Automatyczne losowe pomieszanie zawodników
                          setPlayerNames(shuffle(playerNames));
                          setStep(3);
                        }}
                        className={`w-full bg-indigo-600 text-white py-3 sm:py-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-base ${playerNames.some(name => name.trim() === '') ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={playerNames.some(name => name.trim() === '')}
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
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Wskazówki:</strong><br />
                      • Każde imię w osobnej linii<br />
                      • Możesz skopiować kolumnę z Excela i wkleić tutaj<br />
                      • Aktualna liczba: <strong className={pasteInput.split('\n').filter(l => l.trim()).length === numPlayers ? 'text-green-600' : 'text-red-600'}>
                        {pasteInput.split('\n').filter(l => l.trim()).length} / {numPlayers}
                      </strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Lista zawodników (po jednym w linii):
                    </label>
                    <textarea
                      value={pasteInput}
                      onChange={(e) => setPasteInput(e.target.value)}
                      rows={Math.min(numPlayers + 2, 20)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-mono text-sm focus:border-indigo-500 focus:outline-none"
                      placeholder={`Zawodnik 1\nZawodnik 2\nZawodnik 3\n...`}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Wklej imiona z Excela lub wprowadź ręcznie
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleManualEntry}
                      className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Anuluj
                    </button>
                    <button
                      onClick={handlePasteSubmit}
                      disabled={pasteInput.split('\n').filter(l => l.trim()).length !== numPlayers}
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Zatwierdź i wprowadź imiona
                    </button>
                  </div>
                </div>
              )}
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

              {/* Removed inline matryca from Podsumowanie. The real matrix is available after Generuj (see dedicated view). */}

              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="w-full bg-gray-200 text-gray-700 py-3 sm:py-4 rounded-lg hover:bg-gray-300 transition-colors font-medium text-base"
                  >
                    Wstecz
                  </button>
                  <button
                        onClick={() => {
                          generateTournament();
                          // After generation, navigate to matches view (step 4)
                          setStep(4);
                        }}
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

          {step === 6 && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Harmonogram (matryca zawodnik vs runda)</h2>

              <div className="overflow-x-auto bg-white rounded-lg shadow border my-4">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-2 border-b bg-gray-50 text-left">Zawodnik</th>
                      {Array.from({ length: numRounds }).map((_, r) => (
                        <th key={r} className="px-2 py-2 border-b bg-gray-50 text-center">R{r + 1}</th>
                      ))}
                      <th className="px-2 py-2 border-b bg-gray-50 text-center">Suma</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerNames.map((name) => {
                      const roundArr = Array(numRounds).fill(0);
                      matches.forEach(m => {
                        if (m.team1.includes(name) || m.team2.includes(name)) {
                          const rIdx = Math.max(0, (m.round || 1) - 1);
                          if (rIdx < numRounds) roundArr[rIdx] += 1;
                        }
                      });
                      const playerTotal = roundArr.reduce((s, v) => s + v, 0);
                      return (
                        <tr key={name}>
                          <td className="px-2 py-1 border-b font-medium whitespace-nowrap">{name}</td>
                          {roundArr.map((val, r) => (
                            <td key={r} className="px-2 py-1 border-b text-center">{val}</td>
                          ))}
                          <td className="px-2 py-1 border-b text-center font-bold">{playerTotal}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(4)}
                  className="bg-gray-200 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Powrót do meczów
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="bg-indigo-600 text-white py-2 px-3 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Pokaż tabelę końcową
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
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={results[match.id]?.score1 === undefined ? '' : results[match.id]?.score1}
                                onChange={e => updateScore(match.id, 'score1', e.target.value.replace(/[^0-9]/g, ''))}
                                className={`w-14 sm:w-16 px-2 py-1 sm:py-2 border rounded text-center text-base ${results[match.id]?.score1 === '' || results[match.id]?.score1 === undefined ? 'border-red-500' : 'border-gray-300'}`}
                              />
                              <span className="font-bold text-base sm:text-lg">:</span>
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={results[match.id]?.score2 === undefined ? '' : results[match.id]?.score2}
                                onChange={e => updateScore(match.id, 'score2', e.target.value.replace(/[^0-9]/g, ''))}
                                className={`w-14 sm:w-16 px-2 py-1 sm:py-2 border rounded text-center text-base ${results[match.id]?.score2 === '' || results[match.id]?.score2 === undefined ? 'border-red-500' : 'border-gray-300'}`}
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
                  onClick={() => setStep(6)}
                  className="w-full bg-gray-100 text-gray-800 py-2 sm:py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  Pokaż matrycę (harmonogram)
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
                <button
                  onClick={() => {
                    setNumPlayersToAdd(1);
                    setNumPlayersToAddInput('1');
                    setNewPlayerNames(['']);
                    const suggested = getSuggestedAdditionalRounds(1);
                    setAdditionalRoundsToAdd(suggested);
                    setAdditionalRoundsInput(String(suggested));
                    setEditTournamentError('');
                    setPreviewNewMatches([]);
                    setStep(7);
                  }}
                  className="w-full bg-orange-100 text-orange-700 py-2 sm:py-3 rounded-lg hover:bg-orange-200 transition-colors font-medium text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  ✏️ Edytuj turniej (dodaj zawodnika)
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
                  onClick={resetCache}
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
              <button
                onClick={() => {
                  const suggested = getSuggestedAdditionalRounds();
                  setAdditionalRoundsToAdd(suggested);
                  setAdditionalRoundsInput(String(suggested));
                  setNewPlayerName('');
                  setEditTournamentError('');
                  setPreviewNewMatches([]);
                  setStep(7);
                }}
                className="w-full bg-orange-100 text-orange-700 py-2 sm:py-3 rounded-lg hover:bg-orange-200 transition-colors font-medium text-sm sm:text-base flex items-center justify-center gap-2"
              >
                ✏️ Edytuj turniej (dodaj zawodnika)
              </button>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">✏️ Edytuj turniej — dodaj zawodników</h2>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p><strong>Aktualny turniej:</strong> {numPlayers} zawodników, {numRounds} rund, {matches.length} meczy</p>
                <p className="mt-1">Dodaj nowych zawodników — system wygeneruje dla nich dodatkowe rundy, aby wyrównać liczbę meczów z pozostałymi.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ilu zawodników chcesz dodać?
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={numPlayersToAddInput}
                  onChange={e => {
                    const val = e.target.value;
                    setNumPlayersToAddInput(val);
                    const parsed = parseInt(val);
                    if (!isNaN(parsed) && parsed >= 1 && parsed <= 20) {
                      setNumPlayersToAdd(parsed);
                      setNewPlayerNames(prev => {
                        const updated = [...prev];
                        while (updated.length < parsed) updated.push('');
                        return updated.slice(0, parsed);
                      });
                      const suggested = getSuggestedAdditionalRounds(parsed);
                      setAdditionalRoundsToAdd(suggested);
                      setAdditionalRoundsInput(String(suggested));
                      setPreviewNewMatches([]);
                      setEditTournamentError('');
                    }
                  }}
                  className="w-32 px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imiona nowych zawodników
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {newPlayerNames.map((name, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={name}
                      onChange={e => {
                        const updated = [...newPlayerNames];
                        updated[idx] = e.target.value;
                        setNewPlayerNames(updated);
                        setEditTournamentError('');
                        setPreviewNewMatches([]);
                      }}
                      placeholder={`Zawodnik ${idx + 1}`}
                      className={`px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent ${name.trim() === '' ? 'border-red-300' : 'border-gray-300'}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Liczba dodatkowych rund
                  <span className="ml-2 text-xs text-orange-600 font-normal">
                    (Sugerowane: {getSuggestedAdditionalRounds(numPlayersToAdd)} — aby nowi zawodnicy zagrali podobną liczbę meczy)
                  </span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={additionalRoundsInput}
                  onChange={e => {
                    const val = e.target.value;
                    setAdditionalRoundsInput(val);
                    const parsed = parseInt(val);
                    if (!isNaN(parsed) && parsed >= 1) {
                      setAdditionalRoundsToAdd(parsed);
                    }
                    setPreviewNewMatches([]);
                    setEditTournamentError('');
                  }}
                  className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent ${additionalRoundsInput !== '' && (isNaN(parseInt(additionalRoundsInput)) || parseInt(additionalRoundsInput) < 1) ? 'border-red-500' : 'border-gray-300'}`}
                />
                {additionalRoundsInput !== '' && (isNaN(parseInt(additionalRoundsInput)) || parseInt(additionalRoundsInput) < 1) && (
                  <p className="text-red-600 text-sm mt-1">Minimalna liczba rund to 1</p>
                )}
              </div>

              {editTournamentError && (
                <p className="text-red-600 text-sm font-medium">{editTournamentError}</p>
              )}

              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700">Wybierz sposób aktualizacji turnieju:</p>

                <button
                  onClick={applyOption2KeepPlayed}
                  disabled={!newPlayerNames.some(n => n.trim()) || additionalRoundsToAdd < 1}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  🎲 Wylosuj nierozegrane mecze
                  <span className="block text-xs font-normal opacity-90 mt-0.5">Zachowuje wpisane wyniki, losuje od nowa nierozegrane rundy + dodatkowe</span>
                </button>

                <button
                  onClick={applyOption1Fresh}
                  disabled={!newPlayerNames.some(n => n.trim()) || additionalRoundsToAdd < 1}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  🔄 Turniej od nowa
                  <span className="block text-xs font-normal opacity-90 mt-0.5">Usuwa wszystkie wyniki i generuje cały harmonogram od początku</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setNewPlayerNames(['']);
                    setNumPlayersToAdd(1);
                    setNumPlayersToAddInput('1');
                    setEditTournamentError('');
                    setPreviewNewMatches([]);
                    setStep(4);
                  }}
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Powrót
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}