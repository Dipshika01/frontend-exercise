# Frontend Coding Exercise – Memory Game

A small React, TypeScript, Tailwind app that implements a classic memory (pairs) game with a Start page, Game page, and End page. It saves players locally so you can “Continue as …”, tracks best times per board.

## Features

- React app with three pages:
  1. **Start Page** – enter your name (and optional email), pick a board size, or continue as a recent player.
  2. **Game Page** – flip cards, match pairs, see time and moves, restart, change board size, and adjust zoom.
  3. **End Page** – see results (time, moves), best for this board, total games played, and buttons for Home / Play again.

- Tiles:
  - **Back side**: `growy_logo.svg` from the public folder.
  - **Front side**: 8 plant images from public folder.

- Board Sizes: 2×2, 4×4, 4×5, 6×6

## State and UX

1. Timer starts on first flip; game ends when all pairs are matched.
2. Prevents clicking extra cards while resolving a pair.
3. Responsive board with dynamic cell size and zoom controls (bonus feature).
4. Players' best times (per board), and game history stored in localStorage.

## Quality

1. Unit tests with Vitest + React Testing Library (3 passing tests).
2. ESLint + Prettier configured, repo passes lint/format checks.
