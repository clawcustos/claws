'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { 
    href: '/', 
    label: 'Home',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    ),
  },
  { 
    href: '/explore', 
    label: 'Explore',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  { 
    href: '/create', 
    label: 'Create',
    highlight: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    ),
  },
  { 
    href: '/leaderboard', 
    label: 'Ranks',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
        <polyline points="17,6 23,6 23,12"/>
      </svg>
    ),
  },
  { 
    href: '/clawfolio', 
    label: 'Portfolio',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="M6 8h.01M6 12h.01M6 16h.01"/>
        <path d="M10 8h8M10 12h8M10 16h8"/>
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--black-surface)',
      borderTop: '1px solid var(--grey-800)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom))',
      zIndex: 100,
    }}>
      {NAV_ITEMS.map((item) => {
        const isActive = 
          item.href === '/' 
            ? pathname === '/'
            : pathname.startsWith(item.href);
        const isHighlight = 'highlight' in item && item.highlight;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              color: isHighlight ? 'white' : isActive ? 'var(--red)' : 'var(--grey-400)',
              textDecoration: 'none',
              fontSize: '0.6875rem',
              padding: '0.25rem',
              transition: 'color 0.15s',
              ...(isHighlight ? {
                background: 'var(--red)',
                borderRadius: '12px',
                padding: '0.375rem 0.75rem',
                marginTop: '-0.25rem',
              } : {}),
            }}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
