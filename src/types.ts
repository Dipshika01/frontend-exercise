export type BoardKey = `${number}x${number}`;

export interface GameResult {
  id: string; // uuid
  board: BoardKey; // e.g. "4x4"
  timeMs: number; // total milliseconds
  moves: number; // optional: how many flips/pairs
  finishedAt: string; // ISO date
}

export interface UserProfile {
  id: string; // uuid
  name: string;
  createdAt: string;
  lastSeenAt: string;
  games: GameResult[];
  // best time (ms) per board key
  bestTimes: Record<BoardKey, number>;
}
