import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Props = {
  brandText?: string;
  center?: ReactNode;
  right?: ReactNode;
  toHomeHref?: string;
  className?: string;
};

export default function Navbar({
  brandText = 'MemoryGame',
  center,
  right,
  toHomeHref = '/',
  className = '',
}: Props) {
  return (
    <header
      role='banner'
      className={`sticky top-0 z-10 w-full bg-[#32317a] text-white shadow ${className}`}
    >
      <div className='relative h-14 px-3'>
        <div className='flex h-full items-center'>
          {/* LEFT: brand — link to home */}
          <Link
            to={toHomeHref}
            className='text-base md:text-lg font-extrabold tracking-wide text-white'
          >
            {brandText}
          </Link>

          {/* RIGHT */}
          <div className='ml-auto flex items-center gap-4 text-sm text-white'>{right}</div>
        </div>

        {/* CENTER (overlay) — let clicks pass through except its own children */}
        <div className='pointer-events-none absolute inset-0 flex items-center justify-center text-white'>
          <div className='pointer-events-auto'>{center}</div>
        </div>
      </div>
    </header>
  );
}

export const navUx = {
  label: 'text-white',
  input:
    'rounded border border-white/40 bg-white/10 px-2 py-1 text-white ' +
    'placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/80 ' +
    '[&>option]:text-black',
  btn:
    'h-7 w-7 rounded border border-white/40 bg-white/10 text-white ' +
    'focus:outline-none focus:ring-2 focus:ring-white/80',
};
