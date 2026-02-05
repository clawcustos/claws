'use client';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ 
  className = '', 
  width, 
  height, 
  borderRadius = 'var(--radius-sm)',
  style,
}: SkeletonProps) {
  return (
    <div 
      className={`skeleton ${className}`}
      style={{ 
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius,
        ...style,
      }}
    />
  );
}

export function AgentCardSkeleton() {
  return (
    <div className="agent-card" style={{ pointerEvents: 'none' }}>
      <div className="agent-card-top">
        <Skeleton width={44} height={44} borderRadius="var(--radius-md)" />
        
        <div className="agent-info" style={{ flex: 1 }}>
          <div className="agent-name-row">
            <Skeleton width={100} height={18} />
          </div>
          <div style={{ marginTop: '0.25rem' }}>
            <Skeleton width={80} height={14} />
          </div>
        </div>
        
        <div className="agent-price" style={{ textAlign: 'right' }}>
          <Skeleton width={60} height={18} />
          <div style={{ marginTop: '0.25rem' }}>
            <Skeleton width={40} height={14} />
          </div>
        </div>
      </div>
      
      <div className="agent-card-stats">
        <div className="agent-stat">
          <Skeleton width={40} height={16} />
          <Skeleton width={50} height={12} style={{ marginTop: '0.25rem' }} />
        </div>
        <div className="agent-stat">
          <Skeleton width={40} height={16} />
          <Skeleton width={50} height={12} style={{ marginTop: '0.25rem' }} />
        </div>
        <div className="agent-stat">
          <Skeleton width={40} height={16} />
          <Skeleton width={50} height={12} style={{ marginTop: '0.25rem' }} />
        </div>
      </div>
    </div>
  );
}

export function ActivityItemSkeleton() {
  return (
    <div className="activity-item" style={{ pointerEvents: 'none' }}>
      <Skeleton width={32} height={32} borderRadius="var(--radius-sm)" />
      <Skeleton width={32} height={32} borderRadius="var(--radius-sm)" />
      
      <div className="activity-content" style={{ flex: 1 }}>
        <Skeleton width="80%" height={14} />
        <Skeleton width={50} height={12} style={{ marginTop: '0.25rem' }} />
      </div>
      
      <Skeleton width={60} height={16} />
    </div>
  );
}

export function LeaderboardRowSkeleton() {
  return (
    <div className="leaderboard-item" style={{ pointerEvents: 'none' }}>
      <div className="leaderboard-rank">
        <Skeleton width={24} height={24} borderRadius="var(--radius-sm)" />
      </div>
      
      <div className="leaderboard-agent" style={{ flex: 1 }}>
        <Skeleton width={32} height={32} borderRadius="var(--radius-sm)" />
        <div style={{ marginLeft: '0.625rem' }}>
          <Skeleton width={80} height={14} />
          <Skeleton width={60} height={12} style={{ marginTop: '0.25rem' }} />
        </div>
      </div>
      
      <Skeleton width={60} height={14} />
      <Skeleton width={40} height={14} />
      <Skeleton width={50} height={14} />
    </div>
  );
}

export function ProfileStatSkeleton() {
  return (
    <div className="profile-stat">
      <Skeleton width={60} height={24} />
      <Skeleton width={80} height={12} style={{ marginTop: '0.25rem' }} />
    </div>
  );
}

export function AgentGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="agent-grid">
      {Array.from({ length: count }).map((_, i) => (
        <AgentCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ActivityFeedSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="activity-list">
      {Array.from({ length: count }).map((_, i) => (
        <ActivityItemSkeleton key={i} />
      ))}
    </div>
  );
}
