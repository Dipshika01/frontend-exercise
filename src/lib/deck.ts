export function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type Card = {
  id: string;       // unique tile id
  pairId: string;   // same for the two matching tiles
  img: string;      
  isFlipped: boolean;
  isMatched: boolean;
};

export function buildDeck(images: string[], pairsNeeded: number): Card[] {
  // first N images, duplicating them, giving ids, then shuffling
  const picked = images.slice(0, pairsNeeded);
  const raw = picked.flatMap((img, i) => {
    const pairId = `p${i}`;
    return [
      { id: `${pairId}-a`, pairId, img, isFlipped: false, isMatched: false },
      { id: `${pairId}-b`, pairId, img, isFlipped: false, isMatched: false },
    ];
  });
  return shuffle(raw);
}
