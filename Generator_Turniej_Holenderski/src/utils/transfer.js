// Helpery do zapisu/odczytu stanu turnieju jako pliku JSON,
// dzięki czemu można wznowić turniej na innym urządzeniu lub go udostępnić.

export const exportStateToFile = (filename, state) => {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: 'application/json;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// Wczytuje plik (File) i zwraca sparsowany obiekt JSON.
// Odrzuca Promise z czytelnym komunikatem, gdy plik jest niepoprawny.
export const readStateFromFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          reject(new Error('Plik nie zawiera poprawnego stanu turnieju.'));
          return;
        }
        resolve(parsed);
      } catch {
        reject(new Error('Nie udało się odczytać pliku — to nie jest poprawny plik JSON.'));
      }
    };
    reader.onerror = () => reject(new Error('Błąd odczytu pliku.'));
    reader.readAsText(file);
  });
