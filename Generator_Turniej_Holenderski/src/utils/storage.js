// Wspólne helpery do persystencji stanu w localStorage.
// Każdy generator turnieju używa własnego klucza (przekazywanego jako argument),
// dzięki czemu logika zapisu/odczytu jest w jednym miejscu.

export const loadState = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load state from storage', e);
    return null;
  }
};

export const saveState = (key, state) => {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save state to storage', e);
  }
};
