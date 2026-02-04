'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Simple inline SVG icons
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const TrendingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

// Lobster claw icon for Clawfolio
const ClawIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Upper pincer */}
    <path d="M4 8c4-4 10-4 12 0"></path>
    {/* Lower pincer */}
    <path d="M4 16c4 4 10 4 12 0"></path>
    {/* Claw arm */}
    <path d="M16 8v8"></path>
    <path d="M16 12h5"></path>
  </svg>
);

const navItems = [
  { href: '/', icon: HomeIcon, label: 'Home' },
  { href: '/leaderboard', icon: TrendingIcon, label: 'Trending' },
  { href: '/clawfolio', icon: ClawIcon, label: 'Clawfolio' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
