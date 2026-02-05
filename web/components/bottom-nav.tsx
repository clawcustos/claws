'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNav() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname?.startsWith(path);
  };

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        <Link 
          href="/" 
          className={`bottom-nav-item ${pathname === '/' ? 'active' : ''}`}
        >
          <span className="bottom-nav-icon">🏠</span>
          <span className="bottom-nav-label">Home</span>
        </Link>
        
        <Link 
          href="/explore" 
          className={`bottom-nav-item ${isActive('/explore') ? 'active' : ''}`}
        >
          <span className="bottom-nav-icon">🔍</span>
          <span className="bottom-nav-label">Explore</span>
        </Link>
        
        <Link 
          href="/leaderboard" 
          className={`bottom-nav-item ${isActive('/leaderboard') ? 'active' : ''}`}
        >
          <span className="bottom-nav-icon">🏆</span>
          <span className="bottom-nav-label">Leaders</span>
        </Link>
        
        <Link 
          href="/clawfolio" 
          className={`bottom-nav-item ${isActive('/clawfolio') ? 'active' : ''}`}
        >
          <span className="bottom-nav-icon">💼</span>
          <span className="bottom-nav-label">Portfolio</span>
        </Link>
      </div>
    </nav>
  );
}
