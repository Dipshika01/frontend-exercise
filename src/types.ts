export type BoardKey = `${number}x${number}`;

export interface GameResult {
  id: string; // uuid
  board: BoardKey; 
  timeMs: number; 
  moves: number; 
  finishedAt: string; 
}

export interface UserProfile {
  id: string; 
  name: string;
  createdAt: string;
  lastSeenAt: string;
  games: GameResult[];
  bestTimes: Record<BoardKey, number>;
}
