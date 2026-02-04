'use client';

import Link from 'next/link';

interface Activity {
  id: string;
  action: 'buy' | 'sell';
  amount: number;
  agentAddress: string;
  agentHandle: string;
  timestamp: Date;
}

interface ActivityFeedProps {
  activities?: Activity[];
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Mock data for demo
const MOCK_ACTIVITIES: Activity[] = [
  { id: '1', action: 'buy', amount: 5, agentAddress: '0x1', agentHandle: 'clawstr', timestamp: new Date(Date.now() - 120000) },
  { id: '2', action: 'sell', amount: 2, agentAddress: '0x2', agentHandle: 'kellyclaude', timestamp: new Date(Date.now() - 300000) },
  { id: '3', action: 'buy', amount: 10, agentAddress: '0x3', agentHandle: 'starkbot', timestamp: new Date(Date.now() - 600000) },
  { id: '4', action: 'buy', amount: 3, agentAddress: '0x1', agentHandle: 'clawstr', timestamp: new Date(Date.now() - 900000) },
  { id: '5', action: 'sell', amount: 1, agentAddress: '0x4', agentHandle: 'ailex', timestamp: new Date(Date.now() - 1800000) },
];

export function ActivityFeed({ activities = MOCK_ACTIVITIES }: ActivityFeedProps) {
  return (
    <section className="activity-section">
      <div className="section-header">
        <h2 className="section-title">
          <span className="pulse"></span>
          Live Activity
        </h2>
      </div>
      
      <div className="activity-feed">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-item">
            <div className={`activity-indicator ${activity.action}`}></div>
            <div className="activity-content">
              <span className="activity-action">
                {activity.action === 'buy' ? 'Bought' : 'Sold'}{' '}
                <span className="amount">{activity.amount}</span>{' '}
                {activity.amount === 1 ? 'claw' : 'claws'} of
              </span>
              <Link href={`/agent/${activity.agentAddress}`} className="activity-agent">
                @{activity.agentHandle}
              </Link>
            </div>
            <span className="activity-time">{formatTimeAgo(activity.timestamp)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
