// Simple Node simulation of the generateTournament algorithm from Turniej_Holenderski.jsx

function simulate({numPlayers, numFields, playersPerTeam, numRounds}){
  const playerNames = Array.from({length: numPlayers}, (_, i) => `Zawodnik ${i+1}`);
  const allMatches = [];
  const playerMatchCount = {};
  console.log('\nNow testing balanced assigner...');
  const res2 = simulateBalanced(params);
  const pm2 = res2.playerMatchCount;
  const byCount2 = {};
  Object.keys(pm2).forEach(n => { const c = pm2[n]; byCount2[c] = (byCount2[c]||0)+1; });
  console.log('Total matches generated (balanced):', res2.allMatches.length);
  console.log('Distribution (balanced):', byCount2);
  const desiredMatches = {};
  playerNames.forEach((name, idx) => { desiredMatches[name] = baseMatches + (idx < extraMatches ? 1 : 0); });

  for (let round=0; round<numRounds; round++){
    const playersAssignedThisRound = new Set();
    for (let field=0; field<numFields; field++){
      let candidates = playerNames.filter(p => !playersAssignedThisRound.has(p) && playerMatchCount[p] < (desiredMatches[p] || 0))
        .sort((a,b)=>{
          const aPlayedPrev = lastPlayedRound[a] === round-1 ? 1:0;
          const bPlayedPrev = lastPlayedRound[b] === round-1 ? 1:0;
          if (aPlayedPrev !== bPlayedPrev) return aPlayedPrev - bPlayedPrev;
          if (playerMatchCount[a] !== playerMatchCount[b]) return playerMatchCount[a] - playerMatchCount[b];
          return lastPlayedRound[a] - lastPlayedRound[b];
        });

      if (candidates.length < playersPerMatch){
        candidates = playerNames.filter(p => !playersAssignedThisRound.has(p))
          .sort((a,b)=>{
            const aPlayedPrev = lastPlayedRound[a] === round-1 ? 1:0;
            const bPlayedPrev = lastPlayedRound[b] === round-1 ? 1:0;
            if (aPlayedPrev !== bPlayedPrev) return aPlayedPrev - bPlayedPrev;
            if (playerMatchCount[a] !== playerMatchCount[b]) return playerMatchCount[a] - playerMatchCount[b];
            return lastPlayedRound[a] - lastPlayedRound[b];
          });
      }

      const pickPlayerForTeam = (team, pool) => {
        let bestIdx = 0; let bestScore = Infinity; const lookahead = Math.min(8, pool.length);
        for (let j=0;j<lookahead;j++){
          const candidate = pool[j];
          const shared = team.filter(t=> playerTeammates[candidate] && playerTeammates[candidate].has(t)).length;
          if (shared < bestScore){ bestScore = shared; bestIdx = j; }
        }
        return pool.splice(bestIdx,1)[0];
      };

      const pool = [...candidates];
      const team1 = [];
      const team2 = [];
      for (let i=0;i<playersPerTeam;i++){
        if (pool.length===0) break; const p = pickPlayerForTeam(team1, pool); team1.push(p);
      }
      for (let i=0;i<playersPerTeam;i++){
        if (pool.length===0) break; const p = pickPlayerForTeam(team2, pool); team2.push(p);
      }

      if (team1.length + team2.length < playersPerMatch){
        const remaining = playerNames.filter(p => !playersAssignedThisRound.has(p) && !team1.includes(p) && !team2.includes(p));
        while (team1.length + team2.length < playersPerMatch && remaining.length>0){
          remaining.sort((a,b)=> playerMatchCount[a] - playerMatchCount[b]);
          const pick = remaining.shift();
          if (team1.length < playersPerTeam) team1.push(pick); else team2.push(pick);
        }
      }

      if (team1.length !== playersPerTeam || team2.length !== playersPerTeam) continue;

      [...team1, ...team2].forEach(p => {
        playersAssignedThisRound.add(p);
        playerMatchCount[p] = (playerMatchCount[p] || 0) + 1;
        lastPlayedRound[p] = round;
      });

      team1.forEach(p1 => team1.forEach(p2 => { if (p1 !== p2) playerTeammates[p1].add(p2); }));
      team2.forEach(p1 => team2.forEach(p2 => { if (p1 !== p2) playerTeammates[p1].add(p2); }));

      allMatches.push({id:`r${round+1}f${field+1}`, round: round+1, field: field+1, team1, team2});
    }
  }

  return {allMatches, playerMatchCount, desiredMatches};
}

function run(){
  const params = {numPlayers:39, numFields:3, playersPerTeam:6, numRounds:13};
  const {allMatches, playerMatchCount, desiredMatches} = simulate(params);
  const names = Object.keys(playerMatchCount);
  const counts = names.map(n=>playerMatchCount[n]);
  counts.sort((a,b)=>b-a);
  console.log('Total matches generated:', allMatches.length);
  // Print players with counts not equal to desired
  const mismatches = names.filter(n => playerMatchCount[n] !== desiredMatches[n]);
  console.log('Mismatched players count:', mismatches.length);
  mismatches.forEach(n => console.log(n, 'has', playerMatchCount[n], 'desired', desiredMatches[n]));
  // Print distribution summary
  const byCount = {};
  names.forEach(n => { const c = playerMatchCount[n]; byCount[c] = (byCount[c]||0)+1; });
  console.log('Distribution:', byCount);
}

run();
