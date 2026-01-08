# Instrukcja Turniejów - Generator Turniejów

## Spis treści
1. [Turniej "Każdy z Każdym"](#turniej-każdy-z-każdym)
2. [Turniej Szwajcarski (Swiss System)](#turniej-szwajcarski-swiss-system)
3. [Turniej Grupowy (Przechodzenie wyników)](#turniej-grupowy-przechodzenie-wyników)
4. [Metodologia sortowania](#metodologia-sortowania)

---

## Turniej "Każdy z Każdym"

### Opis
Turniej w systemie "Każdy z Każdym" (Round-Robin) to format, w którym każda drużyna gra z każdą inną drużyną określoną liczbę razy (1 lub 2 mecze).

### Jak działa?
1. **Generowanie harmonogramu**
   - Algorytm tworzy pary wszystkich drużyn
   - Można wybrać:
     - **1 mecz** - każda para gra raz
     - **2 mecze** - każda para gra dwa razy (rewanż, zamiana gospodarza)
   - Mecze są dzielone na rundy
   - System automatycznie rozmieszcza drużyny tak, aby minimalizować czas oczekiwania

2. **Wprowadzanie wyników**
   - Po każdym meczu wprowadza się wynik (gole gospodarza : gole gościa)
   - System automatycznie aktualizuje tabelę

3. **Tabela klasyfikacyjna**
   - Wyświetla:
     - Miejsce
     - Nazwa drużyny
     - Rozegrane mecze
     - Wygrane / Remisy / Przegrane
     - Bramki strzelone / Bramki stracone
     - Bilans bramek
     - Punkty

4. **Punktacja**
   - Wygrana: **3 punkty**
   - Remis: **1 punkt**
   - Przegrana: **0 punktów**

### Funkcje dodatkowe
- **Eksport do Excel** - zapisz harmonogram i tabelę
- **Pauza** - dodaj "drużynę" PAUZA dla nieparzystej liczby drużyn
- **Edycja nazw drużyn** w trakcie turnieju
- **Reset turnieju** - rozpocznij od nowa

---

## Turniej Szwajcarski (Swiss System)

### Opis
System szwajcarski to format, w którym drużyny nie grają ze wszystkimi, ale są parowane na podstawie aktualnej pozycji w tabeli. Drużyny z podobną liczbą punktów grają ze sobą. Po fazie grupowej następuje faza playoff.

### Jak działa?

#### Krok 1: Ustawienia turnieju
- **Liczba drużyn** (min. 4)
- **Liczba rund Swiss** - zwykle log₂(liczba drużyn), np.:
  - 8 drużyn → 3-4 rundy
  - 16 drużyn → 4-5 rund
- **Drużyny w playoff** - musi być potęgą 2 (2, 4, 8, 16)
- **Punktacja**:
  - Wygrana (domyślnie 3)
  - Remis (domyślnie 1)
  - Przegrana (0)

#### Krok 2: Faza Swiss - Parowanie drużyn

**Runda 1:**
- Losowe parowanie wszystkich drużyn
- Jeśli nieparzysta liczba drużyn → jedna dostaje BYE (walkower 3 pkt)

**Rundy kolejne (2, 3, ...):**
- Drużyny są sortowane według punktów
- Parowanie "podobnych" - drużyny z tej samej części tabeli grają ze sobą
- **Zasada: Drużyny NIE mogą grać ze sobą ponownie**
- Jeśli niemożliwe uniknięcie rewanżu → oznaczenie ⚠️
- BYE dostaje drużyna z najmniejszą liczbą BYE, z najniższej części tabeli

#### Krok 3: Wprowadzanie wyników
- Po każdym meczu wprowadź wynik
- System aktualizuje statystyki (punkty, bramki, bilans)
- **Zatwierdź rundę** - generuje następną rundę z nowymi parowaniami

#### Krok 4: Tabela końcowa
- Po wszystkich rundach Swiss generowana jest klasyfikacja
- Najlepsze drużyny kwalifikują się do fazy playoff

#### Krok 5: Faza Playoff
- **Parowanie według miejsc:**
  - 1. miejsce vs ostatnie miejsce kwalifikujące
  - 2. miejsce vs przedostatnie
  - itd.
- **Format:** 
  - Mecze pucharowe (wygrana = awans)
  - Brak remisów - wprowadź wynik z dogrywką/karnych
- **Struktura:**
  - Półfinały (jeśli 4+ drużyn)
  - Finał
  - Mecz o 3. miejsce (opcjonalnie)

### Funkcje specjalne
- **Wycofanie drużyny** - automatyczne walkowery 3:0 dla przeciwników
- **Przywrócenie drużyny** - możliwość uzupełnienia wyników
- **Eksport CSV** - pełne dane turnieju
- **Reset** - cofnij do wybranego etapu

---

## Turniej Grupowy (Przechodzenie wyników)

### Opis
System grupowy z dwoma fazami: kwalifikacyjną i finałową. Drużyny grają najpierw w grupach kwalifikacyjnych (każdy z każdym), a następnie najlepsze awansują do grup finałowych. System wykorzystuje **przechodzenie wyników** - rezultaty z fazy kwalifikacyjnej są brane pod uwagę w klasyfikacji końcowej.

### Jak działa?

#### Krok 1: Ustawienia turnieju
- **Liczba grup kwalifikacyjnych** (2-8)
- **Drużyn w grupie kwalifikacyjnej** (3-8)
- **Ile drużyn awansuje z grupy** (1 do n-1)
- **Liczba grup finałowych** (1-4)
- **Mecze między drużynami:**
  - 1 mecz - każda para gra raz
  - 2 mecze - rewanż (zamiana gospodarza)
- **Punktacja:**
  - Wygrana (domyślnie 3)
  - Remis (domyślnie 1)

#### Krok 2: Faza kwalifikacyjna
**System "Każdy z Każdym" w grupach:**
- Każda grupa gra osobno
- W każdej grupie drużyny grają ze sobą raz lub dwa razy
- System generuje tabele dla każdej grupy
- Wprowadzasz wyniki meczów
- Tabele sortowane według kryteriów klasyfikacji

**Przykład:**
```
4 grupy × 4 drużyny = 16 drużyn
Awansuje 2 z każdej grupy = 8 drużyn do finałów
```

#### Krok 3: Awans do finałów
**Klucz rozstawienia - system "serpentyna" (snake draft):**
- Zapewnia sprawiedliwy podział drużyn do grup finałowych
- Unika sytuacji gdzie wszystkie najlepsze drużyny trafiają do jednej grupy

**Przykład rozstawienia:**
```
Grupy kwalifikacyjne (po 2 awansują):
Grupa A: 1. Team A1, 2. Team A2
Grupa B: 1. Team B1, 2. Team B2
Grupa C: 1. Team C1, 2. Team C2
Grupa D: 1. Team D1, 2. Team D2

Podział do 2 grup finałowych (serpentyna):
Grupa Finałowa I:  Team A1, Team B2, Team C1, Team D2
Grupa Finałowa II: Team A2, Team B1, Team C2, Team D1
```

#### Krok 4: Faza finałowa
- Drużyny w nowych grupach grają ponownie "każdy z każdym"
- **Ważne:** Statystyki z fazy kwalifikacyjnej są zachowane, ale nie wpływają na tabelę finałową
- Każda grupa generuje swoją tabelę finałową
- Zwycięzca grupy finałowej = najwyższe miejsce w turnieju

### Przechodzenie wyników
System przechowuje dwie osobne statystyki dla każdej drużyny:
- **Statystyki kwalifikacyjne** - mecze z fazy grupowej
- **Statystyki finałowe** - mecze z fazy finałowej

### Funkcje specjalne
- **Zarządzanie drużynami** - edycja nazw w trakcie turnieju
- **Eksport CSV** - pełny raport z obu faz
- **Przełączanie między grupami** - szybki podgląd wszystkich grup
- **Reset turnieju** - rozpocznij od nowa

### Strategia organizacji

**Dla małych turniejów (16-24 drużyn):**
```
4 grupy × 4 drużyny = 16 drużyn
2 awansują z każdej → 2 grupy finałowe po 4
```

**Dla średnich turniejów (24-32 drużyn):**
```
6 grup × 4 drużyny = 24 drużyny
2 awansują z każdej → 3 grupy finałowe po 4
```

**Dla dużych turniejów (32+ drużyn):**
```
8 grup × 4 drużyny = 32 drużyny
2 awansują z każdej → 4 grupy finałowe po 4
```

---

## Metodologia Sortowania

### Kolejność kryteriów klasyfikacji (WSZYSTKIE TURNIEJE)

#### 1. **Punkty** (najważniejsze)
- Najwięcej punktów = wyższe miejsce
- Wygrana: 3 pkt, Remis: 1 pkt, Przegrana: 0 pkt

#### 2. **Bezpośredni mecz / Mała tabela**
- **Tylko jeśli drużyny grały ze sobą!**
- Porównanie wyników z meczu/meczów między tymi dwiema drużynami:
  - **a)** Punkty z bezpośrednich meczów
  - **b)** Bilans bramek z bezpośrednich meczów
  - **c)** Bramki strzelone w bezpośrednich meczach

**Przykład:**
```
Drużyna A: 9 punktów (ogólnie)
Drużyna B: 9 punktów (ogólnie)

Bezpośredni mecz:
A vs B = 2:1 (A wygrywa, 3 pkt)
B vs A = 1:0 (B wygrywa, 3 pkt)

Bezpośrednia tabela:
A: 3 pkt, bilans 2:2 (0)
B: 3 pkt, bilans 1:3 (-2)

→ Drużyna A wyżej (lepszy bilans w bezpośrednim meczu)
```

#### 3. **Bilans bramek** (ogólny)
- Różnica: Bramki strzelone - Bramki stracone
- Wyższy bilans = wyższe miejsce

**Przykład:**
```
Drużyna A: 15 bramek strzelonych, 8 straconych = +7
Drużyna B: 12 bramek strzelonych, 6 straconych = +6

→ Drużyna A wyżej
```

#### 4. **Bramki strzelone** (ogólne)
- Więcej bramek strzelonych = wyższe miejsce
- Ostateczne kryterium rozstrzygające

**Przykład:**
```
Drużyna A: bilans +5 (10 strzelonych, 5 straconych)
Drużyna B: bilans +5 (12 strzelonych, 7 straconych)

→ Drużyna B wyżej (więcej bramek strzelonych)
```

### Podsumowanie kryteriów
1. ⭐ Punkty
2. ⚔️ Bezpośredni mecz (jeśli się odbył)
3. 📊 Bilans bramek (ogólny)
4. ⚽ Bramki strzelone (ogólne)

---

## Legenda symboli w aplikacji

- ✓ - Runda/mecz zakończony
- ⚠️ - Rewanż (drużyny już grały)
- 🔴 - Drużyna wycofana [WYCOFANA]
- (BYE) - Wolny los (automatyczne 3 punkty)
- 🟢 - Miejsce kwalifikacyjne do playoff

---

## Wskazówki

### Turniej "Każdy z Każdym"
- ✅ Dobry dla małych grup (4-12 drużyn)
- ✅ Każda drużyna gra ze wszystkimi
- ❌ Długi dla dużych grup (np. 16 drużyn = 120 meczów przy rewanżach)

### Turniej Szwajcarski
- ✅ Dobry dla dużych grup (8-32+ drużyn)
- ✅ Znacznie mniej meczów niż "każdy z każdym"
- ✅ Sprawiedliwy - silni grają z silnymi
- ✅ Emocjonująca faza playoff
- ❌ Nie wszystkie drużyny grają ze sobą

### Turniej Grupowy
- ✅ Idealny dla turniejów 16-32+ drużyn
- ✅ Każdy gra ze wszystkimi w swojej grupie (kwalifikacje i finały)
- ✅ Sprawiedliwy system awansu (serpentyna)
- ✅ Dwie fazy - każda drużyna ma szansę na poprawę
- ⚠️ Wymaga więcej czasu niż sam Swiss
- ⚠️ Najlepszy dla turniejów wielodniowych

---

## Pomoc techniczna

Jeśli masz pytania lub problemy:
1. Sprawdź czy wszystkie wyniki są wprowadzone
2. Użyj przycisku "Reset" aby cofnąć zmiany
3. Eksportuj dane do Excel/CSV jako backup

**Wersja instrukcji:** 1.0 (Styczeń 2026)
