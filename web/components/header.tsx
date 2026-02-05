'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname?.startsWith(path);
  };

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="logo">
          <div className="logo-icon">🦞</div>
          <span className="logo-text">Claws</span>
        </Link>
        
        <nav className="nav">
          <Link 
            href="/" 
            className={`nav-link ${isActive('/') && pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            href="/explore" 
            className={`nav-link ${isActive('/explore') ? 'active' : ''}`}
          >
            Explore
          </Link>
          <Link 
            href="/leaderboard" 
            className={`nav-link ${isActive('/leaderboard') ? 'active' : ''}`}
          >
            Leaderboard
          </Link>
          <Link 
            href="/verify" 
            className={`nav-link ${isActive('/verify') ? 'active' : ''}`}
          >
            Verify
          </Link>
        </nav>
        
        <div className="header-actions">
          <button className="btn btn-primary">
            Connect
          </button>
        </div>
      </div>
    </header>
  );
}
