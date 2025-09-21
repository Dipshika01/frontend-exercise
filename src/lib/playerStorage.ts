import type { Player, BoardKey, GameResult } from '../models/player';

const KEY = 'memgame.players.v1';

function readAll(): Player[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Player[]) : [];
  } catch {
    return [];
  }
}
function writeAll(players: Player[]) {
  localStorage.setItem(KEY, JSON.stringify(players));
}

export function getPlayers(): Player[] {
  return readAll();
}
export function getPlayer(id: string): Player | undefined {
  return readAll().find((p) => p.id === id);
}
export function findByNameOrEmail(name: string, email?: string) {
  const all = readAll();
  return all.find(
    (p) =>
      p.name.trim().toLowerCase() === name.trim().toLowerCase() ||
      (!!email && p.email?.toLowerCase() === email.toLowerCase()),
  );
}
export function upsertPlayer(p: Player) {
  const all = readAll();
  const i = all.findIndex((x) => x.id === p.id);
  if (i >= 0) all[i] = p;
  else all.unshift(p);
  writeAll(all);
}

/** for EndPage after finishing a game */
export function recordResult(id: string, board: BoardKey, seconds: number, moves: number) {
  const all = readAll();
  const i = all.findIndex((p) => p.id === id);
  if (i < 0) return;

  const player = all[i];
  // best for board
  const currentBest = player.best[board];
  if (currentBest == null || seconds < currentBest) {
    player.best[board] = seconds;
  }
  // counters + history
  player.gamesPlayed = (player.gamesPlayed ?? 0) + 1;
  player.lastPlayedAt = Date.now();
  const entry: GameResult = {
    board,
    seconds,
    moves,
    finishedAt: player.lastPlayedAt,
  };
  player.history = [entry, ...(player.history ?? [])].slice(0, 20);

  all[i] = player;
  writeAll(all);
}
