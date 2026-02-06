import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
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
        }}
      >
        {/* Background gradient glow */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(220, 38, 38, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        
        {/* Logo / Icon */}
        <div
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '30px',
            boxShadow: '0 0 60px rgba(220, 38, 38, 0.5)',
          }}
        >
          <span style={{ fontSize: '50px', color: 'white' }}>🦞</span>
        </div>

        {/* Main Title */}
        <div
          style={{
            display: 'flex',
            fontSize: '72px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: '20px',
          }}
        >
          <span style={{ color: '#dc2626' }}>CLAWS</span>
          <span style={{ color: '#ffffff' }}>.TECH</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '28px',
            color: '#9ca3af',
            textAlign: 'center',
            maxWidth: '700px',
            lineHeight: 1.4,
          }}
        >
          Speculate on AI Agents
        </div>

        {/* Subtagline */}
        <div
          style={{
            fontSize: '20px',
            color: '#6b7280',
            textAlign: 'center',
            marginTop: '16px',
          }}
        >
          Bonding curve trading on Base · No token launches · Instant liquidity
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );

  // Add cache headers - OG images rarely change
  imageResponse.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');

  return imageResponse;
}
