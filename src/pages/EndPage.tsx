import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { getPlayer, recordResult, findByNameOrEmail } from '../lib/playerStorage';
import type { BoardKey } from '../models/player';

export default function EndPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // from GamePage
  const idParam = params.get('id') ?? '';
  const name = params.get('name') ?? 'Player';
  const rows = Number(params.get('rows') ?? 4);
  const cols = Number(params.get('cols') ?? 4);
  const seconds = Number(params.get('seconds') ?? 0);
  const moves = Number(params.get('moves') ?? 0);

  const boardKey = useMemo(() => `${rows}x${cols}` as BoardKey, [rows, cols]);

  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [bestForBoard, setBestForBoard] = useState<number | undefined>(undefined);

  // Strict Mode guard: ensure we record only once in dev
  const savedRef = useRef(false);

  // record + read stats, then celebrate 🎉
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;

    let pid = idParam;
    if (!pid) {
      const byName = findByNameOrEmail(name);
      if (byName) pid = byName.id;
    }

    if (pid) {
      recordResult(pid, boardKey, seconds, moves);
      const p = getPlayer(pid);
      if (p) {
        setGamesPlayed(p.gamesPlayed ?? 0);
        setBestForBoard(p.best?.[boardKey]);
      }
    }

    // small, cheerful confetti on page load
    party(1100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idParam, name, boardKey, seconds, moves]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 transition-transform duration-300 hover:scale-[1.01]">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-1">Congratulations, {name}!</h1>
            <p className="text-gray-600">
              Board: {rows}×{cols}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Stat label="Time" value={`${seconds}s`} />
            <Stat label="Moves" value={String(moves)} />
            <Stat label="Games played" value={String(gamesPlayed)} />
            <Stat
              label={`Best ${rows}×${cols}`}
              value={bestForBoard != null ? `${bestForBoard}s` : '—'}
            />
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-800 hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/game?${new URLSearchParams({
                    id: idParam,
                    name,
                    rows: String(rows),
                    cols: String(cols),
                  }).toString()}`,
                )
              }
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
            >
              Play again
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 text-center">
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className="mt-1 text-xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

/** A tiny, tasteful confetti celebration for the End page. */
function party(durationMs = 1000) {
  const end = Date.now() + durationMs;
  const base = { startVelocity: 28, spread: 360, ticks: 60, zIndex: 9999 };

  const frame = () => {
    confetti({ ...base, particleCount: 60, origin: { x: 0.2, y: 0.15 } });
    confetti({ ...base, particleCount: 60, origin: { x: 0.8, y: 0.15 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}
