export type BoardKey = "2x2" | "4x4" | "6x6";

export type BestByBoard = Partial<Record<BoardKey, number>>; 

export interface GameResult {
  board: BoardKey;
  seconds: number;
  moves: number;
  finishedAt: number; 
}

export interface Player {
  id: string;
  name: string;
  email?: string;
  createdAt: number;
  lastPlayedAt?: number;
  gamesPlayed: number;
  best: BestByBoard;       
  history: GameResult[];     
}
