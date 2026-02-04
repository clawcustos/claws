'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from './icons';

const navItems = [
  { href: '/', icon: Icons.Home, label: 'Home' },
  { href: '/search', icon: Icons.Search, label: 'Search' },
  { href: '/leaderboard', icon: Icons.Trophy, label: 'Top' },
  { href: '/portfolio', icon: Icons.Wallet, label: 'Portfolio' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--surface)] border-t border-[var(--border)] md:hidden z-50">
      <div className="flex justify-around items-center h-16 px-4 pb-safe">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 p-2 ${
                isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
              }`}
            >
              <Icon size={24} />
              <span className="text-[10px]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
