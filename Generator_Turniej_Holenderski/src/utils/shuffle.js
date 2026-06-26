// Bezstronne losowe mieszanie tablicy (algorytm Fisher–Yates).
// Zwraca nową tablicę, nie modyfikuje wejściowej.
export const shuffle = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};
