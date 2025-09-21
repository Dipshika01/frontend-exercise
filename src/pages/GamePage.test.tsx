import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

// for real timers
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface MockCardProps {
  card: { id: string; pairId: string };
  onFlip: (id: string) => void;
}
vi.mock('../components/Card', () => ({
  default: ({ card, onFlip }: MockCardProps) => (
    <button
      data-testid={`card-${card.id}`}
      onClick={() => onFlip(card.id)}
      aria-label={`card ${card.id} pair ${card.pairId}`}
    >
      CARD
    </button>
  ),
}));

interface MockNavbarProps {
  right?: ReactNode;
  center?: ReactNode;
  brandText?: string;
}
vi.mock('../components/Navbar', () => ({
  default: ({ right, center }: MockNavbarProps) => (
    <header data-testid='navbar' style={{ height: '56px' }}>
      <div>{center}</div>
      <div>{right}</div>
    </header>
  ),
}));

vi.mock('../lib/deck', () => {
  type Card = {
    id: string;
    pairId: string;
    isMatched: boolean;
    isFlipped: boolean;
    frontSrc: string;
  };
  const pair = (pid: string, a: string, b: string): Card[] => [
    { id: a, pairId: pid, isMatched: false, isFlipped: false, frontSrc: '/A.jpg' },
    { id: b, pairId: pid, isMatched: false, isFlipped: false, frontSrc: '/A.jpg' },
  ];
  const buildDeck = () => [...pair('P1', 'c1', 'c2'), ...pair('P2', 'c3', 'c4')];
  const shuffle = <T,>(arr: T[]) => arr;
  return { buildDeck, shuffle };
});

// only the hooks that GamePage is using
const navigateMock = vi.fn();
let searchQuery = '?name=Dips&rows=2&cols=2&id=demo';
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
  useLocation: () => ({ search: searchQuery }),
}));

import GamePage from './GamePage';

// Tests
describe('GamePage (real timers)', () => {
  beforeEach(() => {
    vi.useRealTimers();
    navigateMock.mockReset();
    searchQuery = '?name=Dips&rows=2&cols=2&id=demo';
  });

  it('renders a 2x2 board (4 cards) and shows initial time/moves', () => {
    render(<GamePage />);
    expect(screen.getAllByRole('button', { name: /card/i })).toHaveLength(4);
    expect(screen.getByText(/Time:/i)).toBeInTheDocument();
    expect(screen.getByText(/Moves:/i)).toBeInTheDocument();
    expect(screen.getByText(/00:00/)).toBeInTheDocument();
  });

  it('matches all pairs and navigates to /end with results', async () => {
    render(<GamePage />);

    // pair 1
    await userEvent.click(screen.getByTestId('card-c1'));
    await userEvent.click(screen.getByTestId('card-c2'));
    await sleep(700);

    // pair 2
    await userEvent.click(screen.getByTestId('card-c3'));
    await userEvent.click(screen.getByTestId('card-c4'));
    await sleep(700);

    expect(navigateMock).toHaveBeenCalled();
    const dest = String(navigateMock.mock.calls[0][0]);
    expect(dest).toContain('/end?');
    expect(dest).toContain('name=Dips');
    expect(dest).toContain('rows=2');
    expect(dest).toContain('cols=2');
    expect(dest).toMatch(/seconds=\d+/);
    expect(dest).toMatch(/moves=\d+/);
  });

  it('changing board size triggers navigation to /game with new rows/cols', async () => {
    render(<GamePage />);
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, '4x4');

    expect(navigateMock).toHaveBeenCalled();
    const next = String(navigateMock.mock.calls.find(([p]) => String(p).startsWith('/game?'))?.[0]);
    expect(next).toContain('rows=4');
    expect(next).toContain('cols=4');
  });
});
