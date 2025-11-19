// Node script to simulate the updated generateTournament algorithm
const shuffle = (array) => {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function simulate({numPlayers, numFields, playersPerTeam, numRounds}){
  const playerNames = Array.from({length: numPlayers}, (_, i) => `Zawodnik ${i+1}`);
  const allMatches = [];
  const playerMatchCount = {};
  const playerTeammates = {};
  const lastPlayedRound = {};

  playerNames.forEach(name => { playerMatchCount[name] = 0; playerTeammates[name] = new Set(); lastPlayedRound[name] = -1000; });
  const playersPerMatch = playersPerTeam * 2;
  const totalSlots = numRounds * numFields * playersPerMatch;
  const baseMatches = Math.floor(totalSlots / numPlayers);
  const extraMatches = totalSlots % numPlayers;
  const desiredMatches = {};
  playerNames.forEach((name, idx) => { desiredMatches[name] = baseMatches + (idx < extraMatches ? 1 : 0); });

  for (let round = 0; round < numRounds; round++){
    const playersAssignedThisRound = new Set();

    let needyPlayers = playerNames.filter(p => playerMatchCount[p] < (desiredMatches[p] || 0));
    const comparator = (a,b) => {
      const aPlayedPrev = lastPlayedRound[a] === round - 1 ? 1 : 0;
      const bPlayedPrev = lastPlayedRound[b] === round - 1 ? 1 : 0;
      if (aPlayedPrev !== bPlayedPrev) return aPlayedPrev - bPlayedPrev;
      if (playerMatchCount[a] !== playerMatchCount[b]) return playerMatchCount[a] - playerMatchCount[b];
      return lastPlayedRound[a] - lastPlayedRound[b];
    };
    needyPlayers.sort(comparator);

    const playersPerRound = numFields * playersPerMatch;
    if (needyPlayers.length < playersPerRound) needyPlayers = playerNames.filter(p => !playersAssignedThisRound.has(p)).sort(comparator);
    const selectedThisRound = needyPlayers.slice(0, playersPerRound);

    let success = false; let attempts = 0; const maxAttempts = 50;
    while(!success && attempts < maxAttempts){
      attempts++;
      const pool = shuffle(selectedThisRound);
      const tentativeFields = [];
      const tempTeammates = {};
      playerNames.forEach(n => tempTeammates[n] = new Set(playerTeammates[n]));
      let ok = true;

      const pickForTeam = (team, poolLocal) => {
        let bestIdx = 0; let bestScore = Infinity; const lookahead = Math.min(8, poolLocal.length);
        for (let j=0;j<lookahead;j++){ const candidate = poolLocal[j]; const shared = team.filter(t => tempTeammates[candidate]?.has(t)).length; if (shared < bestScore){ bestScore = shared; bestIdx = j; } }
        return poolLocal.splice(bestIdx,1)[0];
      };

      for (let f = 0; f < numFields; f++){
        const team1 = []; const team2 = [];
        for (let i=0;i<playersPerTeam;i++){ if (pool.length===0){ ok=false; break; } team1.push(pickForTeam(team1, pool)); }
        for (let i=0;i<playersPerTeam;i++){ if (pool.length===0){ ok=false; break; } team2.push(pickForTeam(team2, pool)); }
        if (!ok) break;
        team1.forEach(p1 => team1.forEach(p2 => { if (p1!==p2) tempTeammates[p1].add(p2); }));
        team2.forEach(p1 => team2.forEach(p2 => { if (p1!==p2) tempTeammates[p1].add(p2); }));
        tentativeFields.push({team1, team2});
      }

      if (ok && tentativeFields.length === numFields){
        tentativeFields.forEach((f, idx) => {
          const fieldNum = idx+1;
          [...f.team1, ...f.team2].forEach(p => { playersAssignedThisRound.add(p); playerMatchCount[p] = (playerMatchCount[p]||0)+1; lastPlayedRound[p] = round; });
          f.team1.forEach(p1 => f.team1.forEach(p2 => { if (p1!==p2) playerTeammates[p1].add(p2); }));
          f.team2.forEach(p1 => f.team2.forEach(p2 => { if (p1!==p2) playerTeammates[p1].add(p2); }));
          allMatches.push({id:`r${round+1}f${fieldNum}`, round: round+1, field: fieldNum, team1: f.team1, team2: f.team2});
        });
        success = true;
      } else {
        selectedThisRound.push(selectedThisRound.shift());
      }
    }

    if (!success){
      // Conservative fallback: try sequentially but only pick players who still need matches
      for (let field = 0; field < numFields; field++){
        let candidates = playerNames.filter(p => !playersAssignedThisRound.has(p) && playerMatchCount[p] < (desiredMatches[p] || 0)).sort(comparator);
        if (candidates.length < playersPerMatch) candidates = playerNames.filter(p => !playersAssignedThisRound.has(p)).sort(comparator);
        const pickPlayerForTeam = (team, pool) => {
          let bestIdx = 0; let bestScore = Infinity; const lookahead = Math.min(8, pool.length);
          for (let j=0;j<lookahead;j++){ const candidate = pool[j]; const shared = team.filter(t => playerTeammates[candidate]?.has(t)).length; if (shared < bestScore){ bestScore = shared; bestIdx = j; } }
          return pool.splice(bestIdx,1)[0];
        };
        const pool = [...candidates]; const team1=[]; const team2=[];
        for (let i=0;i<playersPerTeam;i++){ if (pool.length===0) break; team1.push(pickPlayerForTeam(team1, pool)); }
        for (let i=0;i<playersPerTeam;i++){ if (pool.length===0) break; team2.push(pickPlayerForTeam(team2, pool)); }
        if (team1.length + team2.length < playersPerMatch){ const remaining = playerNames.filter(p => !playersAssignedThisRound.has(p) && !team1.includes(p) && !team2.includes(p)); while (team1.length + team2.length < playersPerMatch && remaining.length>0){ remaining.sort((a,b)=> playerMatchCount[a] - playerMatchCount[b]); const pick = remaining.shift(); if (team1.length < playersPerTeam) team1.push(pick); else team2.push(pick); } }
        if (team1.length !== playersPerTeam || team2.length !== playersPerTeam) continue;
        [...team1, ...team2].forEach(p => { playersAssignedThisRound.add(p); playerMatchCount[p] = (playerMatchCount[p]||0)+1; lastPlayedRound[p] = round; });
        team1.forEach(p1 => team1.forEach(p2 => { if (p1!==p2) playerTeammates[p1].add(p2); }));
        team2.forEach(p1 => team2.forEach(p2 => { if (p1!==p2) playerTeammates[p1].add(p2); }));
        allMatches.push({id:`r${round+1}f${field+1}`, round: round+1, field: field+1, team1, team2});
      }
    }
  }

  return { allMatches, playerMatchCount, desiredMatches };
}

function run(){
  const params = { numPlayers: 39, numFields: 3, playersPerTeam: 6, numRounds: 13 };
  const { allMatches, playerMatchCount, desiredMatches } = simulate(params);
  const names = Object.keys(playerMatchCount);
  const mismatches = names.filter(n => playerMatchCount[n] !== desiredMatches[n]);
  console.log('Total matches generated:', allMatches.length);
  console.log('Mismatched players count:', mismatches.length);
  mismatches.forEach(n => console.log(n, 'has', playerMatchCount[n], 'desired', desiredMatches[n]));
  const byCount = {};
  names.forEach(n => { const c = playerMatchCount[n]; byCount[c] = (byCount[c]||0)+1; });
  console.log('Distribution:', byCount);
}

run();
