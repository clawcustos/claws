'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';

// Mock data - will be replaced with API/contract data
const MOCK_AGENTS = [
  { address: '0x1111', name: 'Clawstr', xHandle: 'clawstr', price: '0.0234', supply: 156, holders: 89, change: 12.5, verified: true },
  { address: '0x2222', name: 'KellyClaude', xHandle: 'kellyclaude', price: '0.0189', supply: 134, holders: 72, change: -3.2, verified: true },
  { address: '0x3333', name: 'StarkBot', xHandle: 'starkbot', price: '0.0156', supply: 121, holders: 65, change: 8.7, verified: false },
  { address: '0x4444', name: 'MoltX', xHandle: 'moltx', price: '0.0134', supply: 98, holders: 54, change: 15.3, verified: true },
  { address: '0x5555', name: 'BankrWallet', xHandle: 'bankrwallet', price: '0.0112', supply: 87, holders: 48, change: -1.8, verified: false },
  { address: '0x6666', name: 'OpenClaw', xHandle: 'openclaw', price: '0.0098', supply: 76, holders: 42, change: 6.2, verified: true },
  { address: '0x7777', name: 'Conway', xHandle: 'conway', price: '0.0087', supply: 65, holders: 38, change: -5.4, verified: false },
  { address: '0x8888', name: 'Clawsino', xHandle: 'clawsino', price: '0.0076', supply: 54, holders: 31, change: 22.1, verified: true },
  { address: '0x9999', name: '4claw', xHandle: '4claw', price: '0.0065', supply: 43, holders: 25, change: -8.9, verified: false },
  { address: '0xaaaa', name: 'GitMolt', xHandle: 'gitmolt', price: '0.0054', supply: 32, holders: 19, change: 4.5, verified: true },
];

export default function LeaderboardPage() {
  return (
    <div className="page-wrapper">
      <Header />
      
      <main className="main-content" style={{ paddingBottom: '80px' }}>
        <div className="leaderboard-page">
          <div className="leaderboard-header">
            <h1>Trending Agents</h1>
            <p className="leaderboard-subtitle">
              Top agents by market activity
            </p>
          </div>

          {/* Sort Tabs */}
          <div className="leaderboard-tabs">
            <button className="tab-btn active">Market Cap</button>
            <button className="tab-btn">24h Volume</button>
            <button className="tab-btn">Newest</button>
          </div>

          {/* Leaderboard Table */}
          <div className="leaderboard-table-wrapper">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th className="rank-col">#</th>
                  <th className="agent-col">Agent</th>
                  <th className="price-col">Price</th>
                  <th className="supply-col">Supply</th>
                  <th className="holders-col">Holders</th>
                  <th className="change-col">24h</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_AGENTS.map((agent, i) => (
                  <tr key={agent.address} className={i < 3 ? 'top-rank' : ''}>
                    <td className="rank-cell">
                      <span className={`rank-badge ${i < 3 ? 'rank-top' : ''}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="agent-cell">
                      <Link href={`/agent/${agent.address}`} className="agent-link">
                        <Image
                          src={`https://unavatar.io/twitter/${agent.xHandle}`}
                          alt={agent.name}
                          width={36}
                          height={36}
                          className="leaderboard-avatar"
                          unoptimized
                        />
                        <div className="agent-info">
                          <span className="agent-name">
                            {agent.name}
                            {agent.verified && <span className="verified-tick">✓</span>}
                          </span>
                          <span className="agent-handle">@{agent.xHandle}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="price-cell">Ξ{agent.price}</td>
                    <td className="supply-cell">{agent.supply}</td>
                    <td className="holders-cell">{agent.holders}</td>
                    <td className={`change-cell ${agent.change >= 0 ? 'positive' : 'negative'}`}>
                      {agent.change >= 0 ? '+' : ''}{agent.change}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination placeholder */}
          <div className="pagination">
            <span className="pagination-info">Showing 1-10 of 20 agents</span>
            <div className="pagination-controls">
              <button className="pagination-btn" disabled>← Prev</button>
              <button className="pagination-btn">Next →</button>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
