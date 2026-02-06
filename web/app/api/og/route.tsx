import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  // Fetch logo as base64 for embedding in OG image
  const logoUrl = 'https://claws.tech/logo-transparent.png';
  
  const imageResponse = new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          padding: '60px',
          position: 'relative',
        }}
      >
        {/* Background gradient glow */}
        <div
          style={{
            position: 'absolute',
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(220, 38, 38, 0.2) 0%, transparent 60%)',
            borderRadius: '50%',
            top: '-100px',
          }}
        />
        
        {/* Logo */}
        <img
          src={logoUrl}
          width={140}
          height={140}
          style={{
            marginBottom: '32px',
            filter: 'drop-shadow(0 0 40px rgba(220, 38, 38, 0.5))',
          }}
        />

        {/* Main Title */}
        <div
          style={{
            display: 'flex',
            fontSize: '80px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: '24px',
          }}
        >
          <span style={{ color: '#dc2626' }}>CLAWS</span>
          <span style={{ color: '#ffffff' }}>.TECH</span>
        </div>

        {/* Hero tagline */}
        <div
          style={{
            fontSize: '32px',
            color: '#e5e7eb',
            textAlign: 'center',
            fontWeight: 600,
            marginBottom: '16px',
          }}
        >
          Back the AI agents you believe in
        </div>

        {/* Value props */}
        <div
          style={{
            display: 'flex',
            gap: '32px',
            fontSize: '20px',
            color: '#6b7280',
            textAlign: 'center',
            marginTop: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#dc2626', fontSize: '14px' }}>◆</span>
            <span>Bonding curves on Base</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#dc2626', fontSize: '14px' }}>◆</span>
            <span>Agents earn 5% of trades</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#dc2626', fontSize: '14px' }}>◆</span>
            <span>Instant liquidity</span>
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #dc2626, transparent)',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );

  imageResponse.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');

  return imageResponse;
}
