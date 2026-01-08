# Instrukcja Turniejów - Generator Turniejów

## Spis treści
1. [Turniej "Każdy z Każdym"](#turniej-każdy-z-każdym)
2. [Turniej Holenderski (Swiss System)](#turniej-holenderski-swiss-system)
3. [Turniej Grupowy (Swiss + Playoff)](#turniej-grupowy-swiss--playoff)
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

## Turniej Holenderski (Swiss System)

### Opis
System szwajcarski to format, w którym drużyny nie grają ze wszystkimi, ale są parowane na podstawie aktualnej pozycji w tabeli. Drużyny z podobną liczbą punktów grają ze sobą.

### Jak działa?

#### Krok 1: Ustawienia turnieju
- **Liczba drużyn** (min. 4)
- **Liczba rund Swiss** - zwykle log₂(liczba drużyn), np.:
  - 8 drużyn → 3-4 rundy
  - 16 drużyn → 4-5 rund
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
- Najlepsze drużyny kwalifikują się do fazy finałowej

### Funkcje specjalne
- **Wycofanie drużyny** - automatyczne walkowery 3:0 dla przeciwników
- **Przywrócenie drużyny** - możliwość uzupełnienia wyników
- **Reset** - cofnij do wybranego etapu

---

## Turniej Grupowy (Swiss + Playoff)

### Opis
Kombinacja systemu szwajcarskiego z fazą pucharową (playoff). Najlepsze drużyny z fazy Swiss awansują do drabinki playoff.

### Jak działa?

#### FAZA 1: Swiss System
- Działa identycznie jak w "Turniej Holenderski"
- Wszystkie drużyny grają określoną liczbę rund
- Zbierają punkty i statystyki

#### FAZA 2: Playoff
**Ustawienia:**
- **Liczba drużyn w playoff** - musi być potęgą 2 (2, 4, 8, 16)
- Najlepsze drużyny z tabeli Swiss awansują

**Drabinka playoff:**
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

**Wizualizacja:**
- Drabinka pokazuje awans zwycięzców
- Oznaczenie miejsc kwalifikacyjnych w tabeli Swiss (zielone tło)

### Funkcje specjalne
- **Wycofanie/przywrócenie drużyny** w fazie Swiss
- **Edycja nazw drużyn**
- **Eksport CSV** - pełne dane turnieju
- **Reset** - cofnij do wybranego etapu (setup/Swiss/playoff)

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

### Turniej Swiss
- ✅ Dobry dla dużych grup (8-32+ drużyn)
- ✅ Znacznie mniej meczów niż "każdy z każdym"
- ✅ Sprawiedliwy - silni grają z silnymi
- ❌ Nie wszystkie drużyny grają ze sobą

### Turniej Grupowy (Swiss + Playoff)
- ✅ Najlepszy dla turniejów mistrzowskich
- ✅ Faza grupowa (Swiss) + emocje finałów (playoff)
- ✅ Elastyczny - możesz dostosować liczbę rund i drużyn w playoff
- ⚠️ Wymaga więcej czasu niż sam Swiss

---

## Pomoc techniczna

Jeśli masz pytania lub problemy:
1. Sprawdź czy wszystkie wyniki są wprowadzone
2. Użyj przycisku "Reset" aby cofnąć zmiany
3. Eksportuj dane do Excel/CSV jako backup

**Wersja instrukcji:** 1.0 (Styczeń 2026)
