'use client';

import { useMemo } from 'react';

interface PriceChartProps {
  currentPrice: number;
  priceChange24h: number;
  height?: number;
}

// Generate mock price data that looks realistic
function generateMockPriceData(currentPrice: number, change24h: number, points: number = 48) {
  const data: number[] = [];
  const startPrice = currentPrice / (1 + change24h / 100);
  const volatility = currentPrice * 0.02; // 2% volatility
  
  let price = startPrice;
  
  for (let i = 0; i < points; i++) {
    // Trend towards current price
    const trendStrength = i / points;
    const targetPrice = startPrice + (currentPrice - startPrice) * trendStrength;
    
    // Add some randomness
    const noise = (Math.random() - 0.5) * volatility;
    price = targetPrice + noise;
    
    // Ensure price stays positive
    data.push(Math.max(price, startPrice * 0.8));
  }
  
  // Ensure last point is current price
  data[data.length - 1] = currentPrice;
  
  return data;
}

function generatePath(data: number[], width: number, height: number, padding: number = 20): string {
  if (data.length === 0) return '';
  
  const minPrice = Math.min(...data) * 0.98;
  const maxPrice = Math.max(...data) * 1.02;
  const priceRange = maxPrice - minPrice;
  
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  const points = data.map((price, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
    return `${x},${y}`;
  });
  
  return `M${points.join(' L')}`;
}

function generateAreaPath(data: number[], width: number, height: number, padding: number = 20): string {
  if (data.length === 0) return '';
  
  const linePath = generatePath(data, width, height, padding);
  const chartWidth = width - padding * 2;
  
  // Close the path to create an area
  return `${linePath} L${padding + chartWidth},${height - padding} L${padding},${height - padding} Z`;
}

export function PriceChart({ currentPrice, priceChange24h, height = 200 }: PriceChartProps) {
  const isPositive = priceChange24h >= 0;
  const color = isPositive ? '#22c55e' : '#ef4444';
  const width = 400; // Will be scaled by viewBox
  
  const priceData = useMemo(
    () => generateMockPriceData(currentPrice, priceChange24h),
    [currentPrice, priceChange24h]
  );
  
  const linePath = useMemo(
    () => generatePath(priceData, width, height),
    [priceData, width, height]
  );
  
  const areaPath = useMemo(
    () => generateAreaPath(priceData, width, height),
    [priceData, width, height]
  );
  
  return (
    <div className="price-chart">
      <div className="price-chart-header">
        <div className="price-chart-range">
          <button className="price-chart-btn active">24H</button>
          <button className="price-chart-btn">7D</button>
          <button className="price-chart-btn">30D</button>
          <button className="price-chart-btn">All</button>
        </div>
      </div>
      
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="price-chart-svg"
      >
        <defs>
          <linearGradient id={`gradient-${isPositive ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        <g className="price-chart-grid">
          {[0.25, 0.5, 0.75].map((y) => (
            <line
              key={y}
              x1={20}
              y1={height * y}
              x2={width - 20}
              y2={height * y}
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="4,4"
            />
          ))}
        </g>
        
        {/* Area fill */}
        <path
          d={areaPath}
          fill={`url(#gradient-${isPositive ? 'up' : 'down'})`}
        />
        
        {/* Price line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Current price dot */}
        <circle
          cx={width - 20}
          cy={20 + (height - 40) - ((currentPrice - Math.min(...priceData) * 0.98) / ((Math.max(...priceData) * 1.02) - (Math.min(...priceData) * 0.98))) * (height - 40)}
          r="4"
          fill={color}
        />
      </svg>
      
      <style jsx>{`
        .price-chart {
          background: var(--bg-elevated);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        
        .price-chart-header {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border);
        }
        
        .price-chart-range {
          display: flex;
          gap: 0.25rem;
        }
        
        .price-chart-btn {
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 500;
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        
        .price-chart-btn:hover {
          color: var(--text-secondary);
        }
        
        .price-chart-btn.active {
          background: var(--bg-surface);
          color: var(--text-primary);
        }
        
        .price-chart-svg {
          display: block;
          width: 100%;
          height: ${height}px;
        }
      `}</style>
    </div>
  );
}
