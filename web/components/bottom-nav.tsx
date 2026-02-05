'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', icon: '🏠', label: 'Home' },
  { href: '/explore', icon: '🔍', label: 'Explore' },
  { href: '/leaderboard', icon: '🏆', label: 'Ranks' },
  { href: '/clawfolio', icon: '💼', label: 'Portfolio' },
];

export function BottomNav() {
  const pathname = usePathname();
  
  return (
    <nav className="bottom-nav">
      <div className="nav-items">
        {NAV_ITEMS.map((item) => {
          const isActive = 
            item.href === '/' 
              ? pathname === '/'
              : pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
