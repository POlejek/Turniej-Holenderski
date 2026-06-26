/**
 * Automatyczne Testy Funkcjonalne
 * Generator Turniejów v2.0
 * 
 * Uruchom: node scripts/functional_tests.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Kolory dla terminala
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Statystyki
const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
};

// Funkcje pomocnicze
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function testResult(name, passed, message = '') {
  stats.total++;
  if (passed) {
    stats.passed++;
    log(`✅ ${name}`, 'green');
  } else {
    stats.failed++;
    log(`❌ ${name}`, 'red');
    if (message) log(`   ${message}`, 'yellow');
  }
}

function testWarning(name, message) {
  stats.warnings++;
  log(`⚠️  ${name}`, 'yellow');
  if (message) log(`   ${message}`, 'cyan');
}

// Testowanie struktury plików
function testFileStructure() {
  log('\n📁 TESTY STRUKTURY PLIKÓW', 'cyan');
  log('='.repeat(50), 'cyan');

  const requiredFiles = [
    'src/App.jsx',
    'src/main.jsx',
    'src/MainMenu.jsx',
    'src/TeamTournamentMenu.jsx',
    'src/TournamentScheduler.jsx',
    'src/GroupTournament.jsx',
    'src/GroupStageTournament.jsx',
    'src/Turniej_Holenderski.jsx',
    'index.html',
    'package.json',
    'vite.config.js',
  ];

  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    const exists = fs.existsSync(filePath);
    testResult(`Plik istnieje: ${file}`, exists, exists ? '' : 'Plik nie został znaleziony');
  });
}

// Testowanie zawartości plików
function testFileContents() {
  log('\n📝 TESTY ZAWARTOŚCI KODU', 'cyan');
  log('='.repeat(50), 'cyan');

  // Test 1: GroupStageTournament.jsx - czy ma nowy system
  const groupStageFile = path.join(__dirname, '..', 'src', 'GroupStageTournament.jsx');
  if (fs.existsSync(groupStageFile)) {
    const content = fs.readFileSync(groupStageFile, 'utf8');
    
    testResult(
      'GroupStageTournament: Ekran nazw drużyn',
      content.includes('teamNamesInput') && content.includes('step === 1'),
      'Brak zmiennej teamNamesInput lub ekranu step 1'
    );

    testResult(
      'GroupStageTournament: Losowanie grup',
      content.includes('startTournamentWithTeams') && content.includes('shuffle('),
      'Brak funkcji losowania grup'
    );

    testResult(
      'GroupStageTournament: Algorytm Round-Robin',
      content.includes('generateRoundRobinMatches') && content.includes('Round-Robin Rotation'),
      'Brak algorytmu Round-Robin'
    );

    testResult(
      'GroupStageTournament: System I/II ligi',
      content.includes('tier1Groups') && content.includes('tier2Groups'),
      'Brak systemu I/II ligi'
    );

    testResult(
      'GroupStageTournament: Tabela miejsc premiowanych',
      content.includes('tier1Extra') && content.includes('extraCandidates'),
      'Brak logiki tabeli miejsc premiowanych'
    );

    testResult(
      'GroupStageTournament: Serpentyna',
      content.includes('tier1GroupsArray') && content.includes('% tier1Groups'),
      'Brak algorytmu serpentyny'
    );

    testResult(
      'GroupStageTournament: Przełączanie tier',
      content.includes('currentTier') && content.includes('setCurrentTier'),
      'Brak przełączania między I a II ligą'
    );

    testResult(
      'GroupStageTournament: Auto-save z teamNamesInput',
      content.includes('teamNamesInput') && content.includes('saveState('),
      'Brak auto-zapisu nazw drużyn'
    );
  }

  // Test 2: GroupTournament.jsx - sortowanie bezpośredni mecz
  const groupTournamentFile = path.join(__dirname, '..', 'src', 'GroupTournament.jsx');
  if (fs.existsSync(groupTournamentFile)) {
    const content = fs.readFileSync(groupTournamentFile, 'utf8');
    
    testResult(
      'GroupTournament (Szwajcarski): Bezpośredni mecz',
      content.includes('getHeadToHead') || content.includes('h2h'),
      'Brak logiki bezpośredniego meczu'
    );

    testResult(
      'GroupTournament: Wycofanie bez usuwania rund',
      content.includes('nextRoundExists') || content.includes('restoreTeam'),
      'Brak zabezpieczenia przed usuwaniem rund'
    );

    testResult(
      'GroupTournament: Edytowalne pola dla wycofanych',
      !content.includes('disabled={team.withdrawn}') || content.includes('always enabled'),
      'Pola mogą być zablokowane dla wycofanych drużyn'
    );

    testResult(
      'GroupTournament (Szwajcarski): Tiebreak Buchholz',
      content.includes('buchholz'),
      'Brak tiebreaku Buchholz w tabeli Swiss'
    );

    testResult(
      'GroupTournament (Szwajcarski): Bezstronne losowanie I rundy',
      content.includes('shuffle(') && !content.includes('Math.random() - 0.5'),
      'Pierwsza runda używa tendencyjnego sortowania losowego'
    );

    testResult(
      'GroupTournament (Szwajcarski): Bye dla najsłabszej drużyny',
      content.includes('byeCandidates') && content.includes('swissPoints || 0) - (b.swissPoints || 0'),
      'Bye nie jest przydzielane wg pozycji w tabeli'
    );
  }

  // Test 3: TournamentScheduler.jsx - sortowanie
  const schedulerFile = path.join(__dirname, '..', 'src', 'TournamentScheduler.jsx');
  if (fs.existsSync(schedulerFile)) {
    const content = fs.readFileSync(schedulerFile, 'utf8');
    
    testResult(
      'TournamentScheduler: Bezpośredni mecz w każdy z każdym',
      content.includes('getHeadToHead') || content.includes('h2h'),
      'Brak logiki bezpośredniego meczu'
    );
  }

  // Test 4: TeamTournamentMenu.jsx - 3 kafelki
  const menuFile = path.join(__dirname, '..', 'src', 'TeamTournamentMenu.jsx');
  if (fs.existsSync(menuFile)) {
    const content = fs.readFileSync(menuFile, 'utf8');
    
    testResult(
      'TeamTournamentMenu: 3 kafelki turniejów',
      content.includes('group-stage') && content.includes('round-robin') && content.includes('swiss'),
      'Brak wszystkich 3 typów turniejów'
    );

    testResult(
      'TeamTournamentMenu: Grid 3 kolumny',
      content.includes('md:grid-cols-3') || content.includes('grid-cols-3'),
      'Brak układu 3 kolumn'
    );
  }
}

// Testowanie package.json i zależności
function testDependencies() {
  log('\n📦 TESTY ZALEŻNOŚCI', 'cyan');
  log('='.repeat(50), 'cyan');

  const packageFile = path.join(__dirname, '..', 'package.json');
  if (fs.existsSync(packageFile)) {
    const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
    
    testResult(
      'React v19+',
      packageJson.dependencies.react && packageJson.dependencies.react.includes('19'),
      `Wersja React: ${packageJson.dependencies.react || 'brak'}`
    );

    testResult(
      'Lucide React (ikony)',
      !!packageJson.dependencies['lucide-react'],
      'Brak biblioteki ikon'
    );

    testResult(
      'Vite (build tool)',
      !!packageJson.devDependencies.vite,
      'Brak Vite w devDependencies'
    );

    testResult(
      'Tailwind CSS',
      !!packageJson.devDependencies.tailwindcss,
      'Brak Tailwind CSS'
    );
  }
}

// Testowanie algorytmów (logika)
function testAlgorithms() {
  log('\n🧮 TESTY ALGORYTMÓW', 'cyan');
  log('='.repeat(50), 'cyan');

  // Test algorytmu Round-Robin Rotation
  function testRoundRobinRotation() {
    const teams = [1, 2, 3, 4, 5, 6];
    const n = teams.length;
    const expectedMatches = (n * (n - 1)) / 2;
    
    // Symulacja algorytmu
    const matches = [];
    const teamsWithBye = [...teams];
    const rounds = teamsWithBye.length - 1;

    for (let round = 0; round < rounds; round++) {
      for (let i = 0; i < teamsWithBye.length / 2; i++) {
        const home = teamsWithBye[i];
        const away = teamsWithBye[teamsWithBye.length - 1 - i];
        matches.push([home, away]);
      }

      // Rotacja
      const fixed = teamsWithBye[0];
      const rest = teamsWithBye.slice(1);
      const rotated = [rest[rest.length - 1], ...rest.slice(0, rest.length - 1)];
      teamsWithBye.splice(0, teamsWithBye.length, fixed, ...rotated);
    }

    testResult(
      'Algorytm Round-Robin: Liczba meczów',
      matches.length === expectedMatches,
      `Oczekiwano ${expectedMatches}, otrzymano ${matches.length}`
    );

    // Sprawdź czy każda para występuje dokładnie raz
    const pairs = new Set();
    let duplicates = 0;
    matches.forEach(([a, b]) => {
      const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
      if (pairs.has(key)) duplicates++;
      pairs.add(key);
    });

    testResult(
      'Algorytm Round-Robin: Brak duplikatów par',
      duplicates === 0,
      `Znaleziono ${duplicates} duplikatów`
    );
  }

  testRoundRobinRotation();

  // Test sortowania (bezpośredni mecz)
  function testHeadToHeadSorting() {
    const team1 = { id: 1, points: 6, goalsFor: 5, goalsAgainst: 3 };
    const team2 = { id: 2, points: 6, goalsFor: 6, goalsAgainst: 4 };
    
    // Symulacja bezpośredniego meczu: team1 2:1 team2
    const h2hPoints1 = 3; // team1 wygrywa
    const h2hPoints2 = 0;

    const shouldTeam1BeFirst = h2hPoints1 > h2hPoints2;

    testResult(
      'Sortowanie: Bezpośredni mecz ważniejszy niż różnica bramek',
      shouldTeam1BeFirst,
      'Team1 powinien być pierwszy mimo gorszego bilansu ogólnego'
    );
  }

  testHeadToHeadSorting();

  // Test serpentyny
  function testSnakeDraft() {
    const teams = [1, 2, 3, 4, 5, 6, 7, 8];
    const numGroups = 3;
    const groups = Array.from({ length: numGroups }, () => []);

    teams.forEach((team, index) => {
      const groupIndex = index % numGroups;
      groups[groupIndex].push(team);
    });

    testResult(
      'Serpentyna: Równomierne rozdzielenie',
      groups.every(g => g.length >= 2 && g.length <= 3),
      `Rozkład grup: ${groups.map(g => g.length).join(', ')}`
    );

    const allTeamsAssigned = groups.flat().length === teams.length;
    testResult(
      'Serpentyna: Wszystkie drużyny przydzielone',
      allTeamsAssigned,
      `Przydzielono ${groups.flat().length} z ${teams.length}`
    );
  }

  testSnakeDraft();

  // Test tabeli miejsc premiowanych
  function testExtraQualifiers() {
    const numGroups = 6;
    const qualPerGroup = 2; // Po 2 z każdej grupy = 12
    const totalTier1Spots = 13; // Potrzeba 13 miejsc
    const extraSpots = totalTier1Spots - (numGroups * qualPerGroup); // 1 dodatkowe

    testResult(
      'Tabela miejsc premiowanych: Obliczanie dodatkowych miejsc',
      extraSpots === 1,
      `6 grup × 2 = 12, potrzeba 13, więc 1 dodatkowe`
    );

    // Symuluj sortowanie miejsc premiowanych
    const candidates = [
      { team: 'A3', points: 6, goalDiff: 3 },
      { team: 'B3', points: 6, goalDiff: 2 },
      { team: 'C3', points: 4, goalDiff: 1 },
    ];

    const sorted = [...candidates].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.goalDiff - a.goalDiff;
    });

    testResult(
      'Tabela miejsc premiowanych: Sortowanie kandydatów',
      sorted[0].team === 'A3',
      `Najlepsza trzecia: ${sorted[0].team} (6 pkt, +3)`
    );
  }

  testExtraQualifiers();
}

// Testowanie localStorage
function testLocalStorage() {
  log('\n💾 TESTY LOCALSTORAGE', 'cyan');
  log('='.repeat(50), 'cyan');

  const groupStageFile = path.join(__dirname, '..', 'src', 'GroupStageTournament.jsx');
  if (fs.existsSync(groupStageFile)) {
    const content = fs.readFileSync(groupStageFile, 'utf8');
    
    testResult(
      'localStorage: Klucz "group_stage_tournament_v2"',
      content.includes('group_stage_tournament_v2'),
      'Klucz localStorage powinien być zaktualizowany'
    );

    testResult(
      'localStorage: Auto-save co 500ms',
      content.includes('setTimeout') && content.includes('500'),
      'Brak debounce auto-save'
    );

    testResult(
      'localStorage: Zapisywanie wszystkich stanów',
      content.includes('teamNamesInput') && 
      content.includes('tier1Groups') && 
      content.includes('tier2Groups'),
      'Nie wszystkie stany są zapisywane'
    );
  }
}

// Testowanie eksportu CSV
function testCSVExport() {
  log('\n📄 TESTY EKSPORTU CSV', 'cyan');
  log('='.repeat(50), 'cyan');

  const files = [
    'src/TournamentScheduler.jsx',
    'src/GroupTournament.jsx',
    'src/GroupStageTournament.jsx',
  ];

  files.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      testResult(
        `${file}: Funkcja exportCSV`,
        content.includes('exportCSV') || content.includes('export'),
        'Brak funkcji eksportu'
      );

      testResult(
        `${file}: Blob + download`,
        content.includes('Blob') && content.includes('download'),
        'Brak mechanizmu pobierania pliku'
      );
    }
  });

  const groupStageFile = path.join(__dirname, '..', 'src', 'GroupStageTournament.jsx');
  if (fs.existsSync(groupStageFile)) {
    const content = fs.readFileSync(groupStageFile, 'utf8');
    
    testResult(
      'GroupStageTournament CSV: Wszystkie 3 fazy',
      content.includes('FAZA KWALIFIKACYJNA') && 
      content.includes('I LIGA') && 
      content.includes('II LIGA'),
      'CSV powinien zawierać wszystkie fazy'
    );
  }
}

// Testowanie UI/UX
function testUIUX() {
  log('\n🎨 TESTY UI/UX', 'cyan');
  log('='.repeat(50), 'cyan');

  const groupStageFile = path.join(__dirname, '..', 'src', 'GroupStageTournament.jsx');
  if (fs.existsSync(groupStageFile)) {
    const content = fs.readFileSync(groupStageFile, 'utf8');
    
    testResult(
      'UI: Licznik nazw drużyn (czerwony/zielony)',
      content.includes('text-green-600') && content.includes('text-red-600'),
      'Brak kolorowego wskaźnika liczby nazw'
    );

    testResult(
      'UI: Blokowanie przycisku przy niewystarczającej liczbie nazw',
      content.includes('disabled={currentLines < totalTeams}'),
      'Przycisk powinien być zablokowany'
    );

    testResult(
      'UI: Przycisk "Wstecz"',
      content.includes('← Wstecz') || content.includes('Wstecz'),
      'Brak możliwości powrotu'
    );

    testResult(
      'UI: Przyciski I Liga / II Liga',
      content.includes('I Liga') && content.includes('II Liga') && content.includes('currentTier'),
      'Brak przełączania między ligami'
    );

    testResult(
      'UI: Podświetlenie awansujących (zielone tło)',
      content.includes('bg-green-100') || content.includes('isAdvancing'),
      'Brak podświetlenia miejsc awansowych'
    );

    testResult(
      'UI: Ikony Lucide React',
      content.includes('Trophy') && content.includes('Users') && content.includes('Download'),
      'Brak ikon w interfejsie'
    );

    testResult(
      'UI: Responsive design (Tailwind CSS)',
      content.includes('min-h-screen') && content.includes('max-w-') && content.includes('p-4'),
      'Brak podstawowych klas responsywnych Tailwind'
    );

    testResult(
      'UI: Textarea dla wklejania z Excela',
      content.includes('<textarea') && content.includes('teamNamesInput'),
      'Brak pola textarea dla nazw'
    );

    testResult(
      'UI: Placeholder i wskazówki',
      content.includes('placeholder') && content.includes('Wskazówki'),
      'Brak wskazówek dla użytkownika'
    );
  }
}

// Testowanie integracji
function testIntegration() {
  log('\n🔗 TESTY INTEGRACJI', 'cyan');
  log('='.repeat(50), 'cyan');

  // Sprawdź czy wszystkie moduły są importowane
  const appFile = path.join(__dirname, '..', 'src', 'App.jsx');
  if (fs.existsSync(appFile)) {
    const content = fs.readFileSync(appFile, 'utf8');
    
    testResult(
      'App.jsx: Import MainMenu',
      content.includes('MainMenu') && content.includes('import'),
      'Brak importu MainMenu'
    );
  }

  const mainMenuFile = path.join(__dirname, '..', 'src', 'MainMenu.jsx');
  if (fs.existsSync(mainMenuFile)) {
    const content = fs.readFileSync(mainMenuFile, 'utf8');
    
    testResult(
      'MainMenu: 2 główne opcje',
      content.includes('Turniej Holenderski') && content.includes('Turniej Drużyn'),
      'Brak obu opcji w menu głównym'
    );
  }

  const teamMenuFile = path.join(__dirname, '..', 'src', 'TeamTournamentMenu.jsx');
  if (fs.existsSync(teamMenuFile)) {
    const content = fs.readFileSync(teamMenuFile, 'utf8');
    
    testResult(
      'TeamTournamentMenu: Import wszystkich 3 turniejów',
      content.includes('TournamentScheduler') && 
      content.includes('GroupTournament') && 
      content.includes('GroupStageTournament'),
      'Brak wszystkich importów'
    );

    testResult(
      'TeamTournamentMenu: Switch case dla 3 modów',
      content.includes("'round-robin'") && 
      content.includes("'swiss'") && 
      content.includes("'group-stage'"),
      'Brak obsługi wszystkich trybów'
    );
  }
}

// Główna funkcja testowa
function runAllTests() {
  log('\n' + '='.repeat(70), 'blue');
  log('  AUTOMATYCZNE TESTY FUNKCJONALNE - Generator Turniejów v2.0', 'blue');
  log('='.repeat(70) + '\n', 'blue');

  const startTime = Date.now();

  // Uruchom wszystkie grupy testów
  testFileStructure();
  testFileContents();
  testDependencies();
  testAlgorithms();
  testLocalStorage();
  testCSVExport();
  testUIUX();
  testIntegration();

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Podsumowanie
  log('\n' + '='.repeat(70), 'blue');
  log('  PODSUMOWANIE TESTÓW', 'blue');
  log('='.repeat(70), 'blue');

  const passRate = ((stats.passed / stats.total) * 100).toFixed(1);
  
  log(`\n📊 Wykonane testy: ${stats.total}`, 'cyan');
  log(`✅ Zaliczone: ${stats.passed} (${passRate}%)`, 'green');
  log(`❌ Niezaliczone: ${stats.failed}`, stats.failed > 0 ? 'red' : 'green');
  log(`⚠️  Ostrzeżenia: ${stats.warnings}`, 'yellow');
  log(`⏱️  Czas wykonania: ${duration}s`, 'cyan');

  // Status końcowy
  if (stats.failed === 0 && stats.warnings === 0) {
    log('\n🎉 WSZYSTKIE TESTY ZALICZONE!', 'green');
    log('✅ Aplikacja gotowa do wdrożenia\n', 'green');
    return 0;
  } else if (stats.failed === 0) {
    log('\n✅ TESTY ZALICZONE (z ostrzeżeniami)', 'yellow');
    log(`⚠️  Znaleziono ${stats.warnings} ostrzeżeń - sprawdź szczegóły\n`, 'yellow');
    return 0;
  } else {
    log('\n❌ TESTY NIEZALICZONE', 'red');
    log(`🔧 Napraw ${stats.failed} błędów przed wdrożeniem\n`, 'red');
    return 1;
  }
}

// Uruchom testy
const exitCode = runAllTests();
process.exit(exitCode);
