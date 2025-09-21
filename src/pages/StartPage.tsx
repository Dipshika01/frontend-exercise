// src/pages/StartPage.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { getPlayers, upsertPlayer, findByNameOrEmail } from "../lib/playerStorage";
import type { Player, BoardKey } from "../models/player";

/* ---------- config ---------- */

const BOARD_SIZES = [
  { label: "2 × 2 (easy)", rows: 2, cols: 2 },
  { label: "4 × 4 (normal)", rows: 4, cols: 4 },
  { label: "6 × 6 (hard)", rows: 6, cols: 6 },
] as const;

function getDifficulty(label: string) {
  if (/\beasy\b/i.test(label)) return "easy";
  if (/\bnormal|medium\b/i.test(label)) return "medium";
  if (/\bhard\b/i.test(label)) return "hard";
  return "default";
}
function difficultyColors(d: string) {
  switch (d) {
    case "easy":
      return "bg-green-100 text-green-800 border-green-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "hard":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

/* ---------- helpers ---------- */

function bestOverall(p?: Player): { board: BoardKey; secs: number } | null {
  if (!p || !p.best) return null;
  const entries = Object.entries(p.best) as [BoardKey, number][];
  if (entries.length === 0) return null;
  entries.sort((a, b) => a[1] - b[1]); // fastest first
  const [board, secs] = entries[0];
  return { board, secs };
}
function prettyBoardKey(k: BoardKey) {
  const [r, c] = k.split("x");
  return `${r} × ${c}`;
}

/* ---------- page ---------- */

export default function StartPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sizeIdx, setSizeIdx] = useState(1); // default 4×4
  const recent = useMemo(() => getPlayers(), []);

  function startGame(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim() || "Player";

    let player = findByNameOrEmail(trimmed, email.trim() || undefined);
    if (!player) {
      player = {
        id: uuid(),
        name: trimmed,
        email: email.trim() || undefined,
        createdAt: Date.now(),
        gamesPlayed: 0,
        best: {},
        history: [],
      };
    }
    upsertPlayer(player);

    const { rows, cols } = BOARD_SIZES[sizeIdx];
    const params = new URLSearchParams({
      id: player.id,
      name: player.name,
      rows: String(rows),
      cols: String(cols),
    });
    navigate(`/game?${params.toString()}`);
  }

  function quickPlay(p: Player) {
    const { rows, cols } = BOARD_SIZES[sizeIdx];
    const params = new URLSearchParams({
      id: p.id,
      name: p.name,
      rows: String(rows),
      cols: String(cols),
    });
    navigate(`/game?${params.toString()}`);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 transition-transform duration-300 hover:scale-[1.01]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Memory Game</h1>
            <p className="text-gray-600">Test your memory skills!</p>
          </div>

          {/* form */}
          <form onSubmit={startGame} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Player Name</label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Dipsikha"
                required
              />
            </div>

            {/* Board size */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Board size</label>
              <div className="grid grid-cols-1 gap-3">
                {BOARD_SIZES.map((s, i) => {
                  const active = i === sizeIdx;
                  const diff = getDifficulty(s.label);
                  return (
                    <label key={s.label} className="cursor-pointer">
                      <input
                        type="radio"
                        name="board-size"
                        className="sr-only"
                        checked={active}
                        onChange={() => setSizeIdx(i)}
                      />
                      <div
                        className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                          active
                            ? "border-purple-500 bg-purple-50 transform scale-[1.01]"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="font-semibold text-gray-800">{s.label.split(" (")[0]}</span>
                            <span
                              className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${difficultyColors(
                                diff
                              )}`}
                            >
                              {diff}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">{s.rows * s.cols} cards</div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
            >
              Start Game
            </button>
          </form>
        </div>

        {/* recent players */}
        {recent.length > 0 && (
          <section className="mt-6 bg-white/90 backdrop-blur rounded-2xl p-5 shadow-xl">
            <h2 className="mb-3 text-sm font-semibold text-gray-800">Continue as</h2>

            <ul className="grid grid-cols-1 gap-2">
              {recent.slice(0, 5).map((p) => {
                const best = bestOverall(p);
                const value = best ? `${best.secs}s (${prettyBoardKey(best.board)})` : "—";
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => quickPlay(p)}
                      className="flex w-full items-center justify-between rounded-xl border border-gray-200 px-3 py-2 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                    >
                      <div className="truncate">
                        <div className="font-medium text-gray-800">{p.name}</div>
                        <div className="text-xs text-gray-500">games: {p.gamesPlayed ?? 0}</div>
                      </div>

                      <div className="text-right text-xs">
                        <span className="text-gray-500">best: </span>
                        <span className="font-semibold text-purple-600">{value}</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
