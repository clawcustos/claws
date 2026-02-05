'use client';

import { useEffect, useState } from 'react';

interface Activity {
  id: string;
  type: 'buy' | 'sell';
  user: string;
  agent: string;
  agentName: string;
  amount: number;
  price: string;
  timestamp: Date;
}

// Mock activity data matching our whitelist
const MOCK_ACTIVITIES: Omit<Activity, 'id' | 'timestamp'>[] = [
  { type: 'buy', user: '0x7a3d...f821', agent: 'clawcustos', agentName: 'Custos', amount: 5, price: '2.34' },
  { type: 'buy', user: '0x2b4e...a903', agent: 'bankrbot', agentName: 'Bankr', amount: 2, price: '12.45' },
  { type: 'sell', user: '0x9c1f...d456', agent: 'kellyclaudeai', agentName: 'KellyClaude', amount: 3, price: '8.91' },
  { type: 'buy', user: '0x4d8a...b789', agent: 'moltbook', agentName: 'Moltbook', amount: 10, price: '4.56' },
  { type: 'buy', user: '0x6e2c...c012', agent: 'clawdbotatg', agentName: 'Clawd ATG', amount: 1, price: '15.23' },
  { type: 'sell', user: '0x1f3d...e345', agent: 'starkbotai', agentName: 'StarkBot', amount: 4, price: '3.78' },
  { type: 'buy', user: '0x8b5e...f678', agent: 'clawstr', agentName: 'Clawstr', amount: 7, price: '1.92' },
];

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // Initialize with some activities
    const initial = MOCK_ACTIVITIES.slice(0, 5).map((a, i) => ({
      ...a,
      id: `activity-${i}`,
      timestamp: new Date(Date.now() - i * 45000 - Math.random() * 30000),
    }));
    setActivities(initial);

    // Simulate new activities
    const interval = setInterval(() => {
      if (!isLive) return;
      
      const randomActivity = MOCK_ACTIVITIES[Math.floor(Math.random() * MOCK_ACTIVITIES.length)];
      const newActivity: Activity = {
        ...randomActivity,
        id: `activity-${Date.now()}`,
        timestamp: new Date(),
        amount: Math.floor(Math.random() * 10) + 1,
      };
      
      setActivities(prev => [newActivity, ...prev.slice(0, 5)]);
    }, 6000 + Math.random() * 4000);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">
          <span style={{ 
            display: 'inline-block',
            width: '8px',
            height: '8px',
            background: isLive ? 'var(--positive)' : 'var(--text-muted)',
            borderRadius: '50%',
            marginRight: '8px',
            animation: isLive ? 'pulse 2s ease-in-out infinite' : 'none',
          }} />
          Live Activity
        </h2>
        <button 
          onClick={() => setIsLive(!isLive)}
          className="section-action"
          style={{ cursor: 'pointer', background: 'none', border: 'none' }}
        >
          {isLive ? 'Pause' : 'Resume'}
        </button>
      </div>
      
      <div className="activity-list">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-item">
            <div className={`activity-icon ${activity.type}`}>
              {activity.type === 'buy' ? '↑' : '↓'}
            </div>
            
            <div className="activity-content">
              <div className="activity-text">
                <strong>{activity.user}</strong>
                {activity.type === 'buy' ? ' bought ' : ' sold '}
                <strong>{activity.amount}</strong>
                {activity.amount === 1 ? ' claw' : ' claws'}
                {' of '}
                <strong>{activity.agentName}</strong>
              </div>
              <div className="activity-time">{formatTimeAgo(activity.timestamp)}</div>
            </div>
            
            <div className="activity-amount">
              ${(parseFloat(activity.price) * activity.amount).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
      `}</style>
    </section>
  );
}
