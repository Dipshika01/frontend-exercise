import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = {
  brandText?: string;     // left
  center?: ReactNode;     // middle (Board dropdown, zoom)
  right?: ReactNode;      // right (name · time · moves)
  toHomeHref?: string;
  className?: string;
};

export default function Navbar({
  brandText = "MemoryGame",
  center,
  right,
  toHomeHref = "/",
  className = "",
}: Props) {
  return (
    <header
      role="banner"
      className={`sticky top-0 z-10 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow ${className}`}
    >
      {/* RELATIVE container: lets us truly center the middle controls */}
      <div className="relative h-14 px-3">
        {/* Left + Right share a flex row */}
        <div className="flex h-full items-center">
          {/* LEFT: brand — bigger + link to home */}
          <Link
            to={toHomeHref}
            className="text-base md:text-lg font-extrabold tracking-wide text-white"
          >
            {brandText}
          </Link>

          {/* RIGHT: stats (forced white) */}
          <div className="ml-auto flex items-center gap-4 text-sm text-white">
            {right}
          </div>
        </div>

        {/* CENTER: absolutely centered, independent of left/right widths */}
        <div className="pointer-events-auto absolute inset-0 flex items-center justify-center text-white">
          {center}
        </div>
      </div>
    </header>
  );
}

/* controls styled for a gradient navbar */
export const navUx = {
  label: "text-white", // “Board”
  input:
    "rounded border border-white/40 bg-white/10 px-2 py-1 text-white " +
    "placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/80 " +
    "[&>option]:text-black", // <-- options in the native dropdown are black
  btn:
    "h-7 w-7 rounded border border-white/40 bg-white/10 text-white " +
    "focus:outline-none focus:ring-2 focus:ring-white/80",
};
