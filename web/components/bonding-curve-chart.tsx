'use client';

import { useState, useMemo } from 'react';
import { useETHPrice } from '@/hooks/useETHPrice';

// Bonding curve: price = supply² / 16000 ETH
function getPrice(supply: number): number {
  return (supply * supply) / 16000;
}

// Generate curve points
function generatePoints(maxSupply: number, steps: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const supply = (i / steps) * maxSupply;
    points.push({ x: supply, y: getPrice(supply) });
  }
  return points;
}

export function BondingCurveChart() {
  const [hoverSupply, setHoverSupply] = useState<number | null>(null);
  const [maxRange, setMaxRange] = useState(100); // Default view: 0-100 claws
  const { ethPrice } = useETHPrice();
  
  const ranges = [
    { label: '50', value: 50 },
    { label: '100', value: 100 },
    { label: '250', value: 250 },
    { label: '500', value: 500 },
  ];
  
  // Chart dimensions
  const W = 600;
  const H = 280;
  const PAD = { top: 20, right: 20, bottom: 40, left: 65 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  
  const points = useMemo(() => generatePoints(maxRange, 200), [maxRange]);
  const maxPrice = getPrice(maxRange);
  
  // Scale functions
  const scaleX = (supply: number) => PAD.left + (supply / maxRange) * plotW;
  const scaleY = (price: number) => PAD.top + plotH - (price / maxPrice) * plotH;
  
  // SVG path
  const pathD = useMemo(() => {
    return points.map((p, i) => {
      const x = scaleX(p.x);
      const y = scaleY(p.y);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }, [points, maxRange]);
  
  // Fill path (area under curve)
  const fillD = useMemo(() => {
    const last = points[points.length - 1];
    return `${pathD} L${scaleX(last.x).toFixed(1)},${scaleY(0).toFixed(1)} L${scaleX(0).toFixed(1)},${scaleY(0).toFixed(1)} Z`;
  }, [pathD, points]);
  
  // Y-axis ticks
  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = maxPrice <= 0.1 ? 0.02 : maxPrice <= 1 ? 0.2 : maxPrice <= 5 ? 1 : 5;
    for (let v = 0; v <= maxPrice; v += step) {
      ticks.push(v);
    }
    return ticks;
  }, [maxPrice]);
  
  // X-axis ticks
  const xTicks = useMemo(() => {
    const step = maxRange <= 50 ? 10 : maxRange <= 100 ? 20 : maxRange <= 250 ? 50 : 100;
    const ticks: number[] = [];
    for (let v = 0; v <= maxRange; v += step) {
      ticks.push(v);
    }
    return ticks;
  }, [maxRange]);
  
  // Hover info
  const hoverPrice = hoverSupply !== null ? getPrice(hoverSupply) : null;
  const hoverUSD = hoverPrice !== null ? hoverPrice * ethPrice : null;
  
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgX = (mouseX / rect.width) * W;
    const supply = Math.round(((svgX - PAD.left) / plotW) * maxRange);
    if (supply >= 0 && supply <= maxRange) {
      setHoverSupply(supply);
    } else {
      setHoverSupply(null);
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const mouseX = touch.clientX - rect.left;
    const svgX = (mouseX / rect.width) * W;
    const supply = Math.round(((svgX - PAD.left) / plotW) * maxRange);
    if (supply >= 0 && supply <= maxRange) {
      setHoverSupply(supply);
    } else {
      setHoverSupply(null);
    }
  };
  
  const formatPrice = (p: number) => {
    if (p === 0) return '0';
    if (p < 0.001) return p.toFixed(4);
    if (p < 0.01) return p.toFixed(3);
    if (p < 1) return p.toFixed(2);
    return p.toFixed(1);
  };
  
  return (
    <div>
      {/* Range selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.8125rem', color: 'var(--grey-400)' }}>
          Supply range
        </div>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setMaxRange(r.value)}
              style={{
                padding: '0.25rem 0.625rem', borderRadius: '6px', fontSize: '0.75rem',
                fontWeight: 600, cursor: 'pointer', border: 'none',
                background: maxRange === r.value ? 'var(--red)' : 'var(--grey-800)',
                color: maxRange === r.value ? 'white' : 'var(--grey-400)',
                transition: 'all 0.15s',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Chart */}
      <div style={{ position: 'relative' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverSupply(null)}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => setHoverSupply(null)}
        >
          {/* Grid lines */}
          {yTicks.map((v) => (
            <g key={`y-${v}`}>
              <line
                x1={PAD.left} y1={scaleY(v)} x2={W - PAD.right} y2={scaleY(v)}
                stroke="rgba(255,255,255,0.06)" strokeWidth="1"
              />
              <text x={PAD.left - 8} y={scaleY(v) + 4} textAnchor="end" fill="#666" fontSize="10" fontFamily="monospace">
                {formatPrice(v)}
              </text>
            </g>
          ))}
          {xTicks.map((v) => (
            <g key={`x-${v}`}>
              <line
                x1={scaleX(v)} y1={PAD.top} x2={scaleX(v)} y2={H - PAD.bottom}
                stroke="rgba(255,255,255,0.06)" strokeWidth="1"
              />
              <text x={scaleX(v)} y={H - PAD.bottom + 16} textAnchor="middle" fill="#666" fontSize="10" fontFamily="monospace">
                {v}
              </text>
            </g>
          ))}
          
          {/* Axis labels */}
          <text x={W / 2} y={H - 4} textAnchor="middle" fill="#888" fontSize="11">
            Supply (claws)
          </text>
          <text x={14} y={H / 2} textAnchor="middle" fill="#888" fontSize="11" transform={`rotate(-90, 14, ${H / 2})`}>
            Price (ETH)
          </text>
          
          {/* Area fill */}
          <path d={fillD} fill="url(#curveGradient)" />
          
          {/* Curve line */}
          <path d={pathD} fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(220, 38, 38, 0.3)" />
              <stop offset="100%" stopColor="rgba(220, 38, 38, 0)" />
            </linearGradient>
          </defs>
          
          {/* Hover crosshair */}
          {hoverSupply !== null && hoverPrice !== null && (
            <g>
              <line
                x1={scaleX(hoverSupply)} y1={PAD.top} x2={scaleX(hoverSupply)} y2={H - PAD.bottom}
                stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4,4"
              />
              <line
                x1={PAD.left} y1={scaleY(hoverPrice)} x2={W - PAD.right} y2={scaleY(hoverPrice)}
                stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4,4"
              />
              <circle cx={scaleX(hoverSupply)} cy={scaleY(hoverPrice)} r="5" fill="#dc2626" stroke="white" strokeWidth="2" />
            </g>
          )}
        </svg>
        
        {/* Hover tooltip */}
        {hoverSupply !== null && hoverPrice !== null && (
          <div style={{
            position: 'absolute', top: '0.5rem', right: '0.5rem',
            background: 'rgba(0,0,0,0.85)', border: '1px solid var(--grey-700)',
            borderRadius: '8px', padding: '0.5rem 0.75rem',
            fontSize: '0.8125rem', lineHeight: 1.5,
            pointerEvents: 'none',
          }}>
            <div style={{ color: 'var(--grey-400)' }}>
              Supply: <span style={{ color: 'white', fontWeight: 600 }}>{hoverSupply}</span>
            </div>
            <div style={{ color: 'var(--grey-400)' }}>
              Price: <span style={{ color: '#dc2626', fontWeight: 600 }}>{formatPrice(hoverPrice)} ETH</span>
            </div>
            <div style={{ color: 'var(--grey-400)' }}>
              ≈ <span style={{ color: 'white' }}>{hoverUSD !== null ? (hoverUSD < 0.01 ? '<$0.01' : `$${hoverUSD.toFixed(2)}`) : '...'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
