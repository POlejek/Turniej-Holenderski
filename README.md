# Turniej-Holenderski

Demo strony (GitHub Pages): https://POlejek.github.io/Turniej-Holenderski/

Jeżeli chcesz otworzyć stronę bezpośrednio z repozytorium, użyj tego linku powyżej.

Jak zbudować i opublikować lokalnie:

1. Przejdź do katalogu generatora:

```bash
cd Generator_Turniej_Holenderski
```

2. Zainstaluj zależności (jeśli jeszcze nie):

```bash
npm install
```

3. Zbuduj aplikację:

```bash
npm run build
```

4. Opublikuj na GitHub Pages (używa `gh-pages`):

```bash
npm run deploy
```

5. Lokalne podglądanie z gotowego `dist`:

```bash
npm run preview
# domyślnie dostępne pod http://localhost:4173
```

Link do strony jest też ustawiony w `Generator_Turniej_Holenderski/package.json` jako pole `homepage`.
