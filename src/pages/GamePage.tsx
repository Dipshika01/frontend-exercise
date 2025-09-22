import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Navbar from '../components/Navbar';
import { buildDeck, shuffle, type Card as CardType } from '../lib/deck';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const FRONT_IMAGES = [
  '/plant01.jpg',
  '/plant02.jpg',
  '/plant03.jpg',
  '/plant04.jpg',
  '/plant05.jpg',
  '/plant06.jpg',
  '/plant07.jpg',
  '/plant08.jpg',
];

const BACK_IMAGE = '/growy_logo.svg';

const SIZE_OPTIONS = [
  { label: '2 × 2', r: 2, c: 2 },
  { label: '4 × 4', r: 4, c: 4 },
  { label: '4 × 5', r: 4, c: 5 },
  { label: '6 × 6', r: 6, c: 6 },
];

export default function GamePage() {
  const q = useQuery();
  const navigate = useNavigate();

  const id = q.get('id') || '';
  const name = q.get('name') || 'Player';
  const rows = Number(q.get('rows') || 4);
  const cols = Number(q.get('cols') || 4);
  const total = rows * cols;
  const pairsNeeded = Math.floor(total / 2);

  const [deck, setDeck] = useState<CardType[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const timerRef = useRef<number | null>(null);

  const [zoomPct, setZoomPct] = useState(100);

  const [cellPx, setCellPx] = useState(96);

  const isDense = rows >= 6 || cols >= 6;
  const gapPx = isDense ? 8 : 12;

  useEffect(() => {
    function computeCell() {
      const header = document.querySelector('header');
      const headerH = header?.getBoundingClientRect().height ?? 56;
      const sidePad = 32;
      const topPad = 16;
      const bottomPad = 24;
      const availWScaled = Math.max(360, window.innerWidth - sidePad * 2);
      const availHScaled = Math.max(320, window.innerHeight - headerH - topPad - bottomPad);
      const zoom = Math.max(0.5, Math.min(2, zoomPct / 100));
      const availW = availWScaled / zoom;
      const availH = availHScaled / zoom;
      const freeW = Math.max(0, availW - gapPx * (cols - 1));
      const freeH = Math.max(0, availH - gapPx * (rows - 1));
      const byW = freeW / cols;
      const byH = freeH / rows;

      const maxPx = rows >= 6 || cols >= 6 ? 92 : rows >= 5 || cols >= 5 ? 108 : 140;

      const px = Math.floor(Math.max(64, Math.min(maxPx, Math.min(byW, byH))));
      setCellPx(px);
    }

    computeCell();
    window.addEventListener('resize', computeCell);
    return () => window.removeEventListener('resize', computeCell);
  }, [rows, cols, zoomPct, gapPx]);

  useEffect(() => {
    const unique = shuffle([...FRONT_IMAGES]);
    const pool =
      pairsNeeded <= unique.length
        ? unique.slice(0, pairsNeeded)
        : Array.from({ length: pairsNeeded }, (_, i) => unique[i % unique.length]);

    const newDeck = buildDeck(pool, pairsNeeded);
    setDeck(newDeck);
    setFlipped([]);
    setMoves(0);
    setIsLocked(false);
    setSeconds(0);
    setStarted(false);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [rows, cols, pairsNeeded]);

  useEffect(() => {
    if (!started && flipped.length > 0) {
      setStarted(true);
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
  }, [started, flipped.length]);

  function stopTimer() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function handleFlip(cid: string) {
    if (isLocked) return;

    const card = deck.find((c) => c.id === cid);
    if (!card || card.isMatched || card.isFlipped) return;

    const nextDeck = deck.map((c) => (c.id === cid ? { ...c, isFlipped: true } : c));
    const nextFlipped = [...flipped, cid];

    setDeck(nextDeck);
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setIsLocked(true);
      setMoves((m) => m + 1);

      window.setTimeout(() => {
        const [aId, bId] = nextFlipped;
        const a = nextDeck.find((c) => c.id === aId)!;
        const b = nextDeck.find((c) => c.id === bId)!;

        if (a.pairId === b.pairId) {
          setDeck((prev) =>
            prev.map((c) => (c.pairId === a.pairId ? { ...c, isMatched: true } : c)),
          );
        } else {
          setDeck((prev) =>
            prev.map((c) => (c.id === aId || c.id === bId ? { ...c, isFlipped: false } : c)),
          );
        }

        setFlipped([]);
        setIsLocked(false);
      }, 650);
    }
  }

  useEffect(() => {
    if (deck.length > 0 && deck.every((c) => c.isMatched)) {
      stopTimer();
      const params = new URLSearchParams({
        id,
        name,
        rows: String(rows),
        cols: String(cols),
        seconds: String(seconds),
        moves: String(moves),
      });
      navigate(`/end?${params.toString()}`);
    }
  }, [deck, moves, seconds, id, name, rows, cols, navigate]);

  function restart() {
    const unique = shuffle([...FRONT_IMAGES]);
    const pool =
      pairsNeeded <= unique.length
        ? unique.slice(0, pairsNeeded)
        : Array.from({ length: pairsNeeded }, (_, i) => unique[i % unique.length]);

    const fresh = buildDeck(pool, pairsNeeded);
    setDeck(fresh);
    setFlipped([]);
    setMoves(0);
    setIsLocked(false);
    setSeconds(0);
    setStarted(false);
    stopTimer();
  }

  function changeZoom(delta: number) {
    setZoomPct((z) => Math.max(50, Math.min(200, z + delta)));
  }

  function onSizeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const [r, c] = e.target.value.split('x').map(Number);
    const params = new URLSearchParams({
      id,
      name,
      rows: String(r),
      cols: String(c),
    });
    navigate(`/game?${params.toString()}`);
  }

  const currentLabel =
    SIZE_OPTIONS.find((s) => s.r === rows && s.c === cols)?.label || `${rows} × ${cols}`;

  const boardStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${cols}, ${cellPx}px)`,
    gridAutoRows: `${cellPx}px`,
    transform: `scale(${zoomPct / 100})`,
    transformOrigin: 'center top',
  };

  return (
    <div className='min-h-screen '>
      <Navbar
        brandText='MemoryGame'
        center={
          <div className='flex items-center gap-3 text-sm text-white'>
            <label className='flex items-center gap-2'>
              <span>Board</span>
              <select
                className='rounded border border-white/40 bg-white/10 px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-white/80 [&>option]:text-black'
                value={`${rows}x${cols}`}
                onChange={onSizeChange}
              >
                {SIZE_OPTIONS.map((s) => (
                  <option key={`${s.r}x${s.c}`} value={`${s.r}x${s.c}`} className='text-black'>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>

            <div className='flex items-center gap-2'>
              <button
                className='h-7 w-7 rounded border border-white/40 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/80'
                onClick={() => changeZoom(-10)}
                aria-label='Zoom out'
              >
                –
              </button>
              <span className='tabular-nums text-white'>{zoomPct}%</span>
              <button
                className='h-7 w-7 rounded border border-white/40 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/80'
                onClick={() => changeZoom(10)}
                aria-label='Zoom in'
              >
                +
              </button>
            </div>
          </div>
        }
        right={
          <div className='flex items-center gap-4 text-sm text-white'>
            <span className='hidden sm:inline'>{name}</span>
            <span>
              Time: <span className='tabular-nums text-white'>{formatTime(seconds)}</span>
            </span>
            <span>
              Moves: <span className='tabular-nums text-white'>{moves}</span>
            </span>
            <span className='hidden sm:inline'>Board: {currentLabel}</span>
          </div>
        }
      />

      <main className='mx-auto flex w-full max-w-6xl flex-col items-center p-5'>
        <section className='rounded-2xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-md'>
          <div
            className={`grid ${isDense ? 'gap-2' : 'gap-3'}`}
            style={boardStyle}
            aria-label='game-board'
          >
            {deck.map((card) => (
              <Card key={card.id} card={card} backSrc={BACK_IMAGE} onFlip={handleFlip} />
            ))}
          </div>
        </section>

        <button
          onClick={restart}
          className='mt-4 rounded-lg px-5 py-2 font-medium text-white shadow-lg shadow-black/20 bg-[#32317a] hover:brightness-110'
        >
          Restart
        </button>
      </main>
    </div>
  );
}

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
