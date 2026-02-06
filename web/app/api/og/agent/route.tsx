import { ImageResponse } from 'next/og';
import { AGENTS } from '@/lib/agents';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get('handle') || 'unknown';
  const agent = AGENTS[handle.toLowerCase()];

  const agentName = agent?.name || `@${handle}`;
  const agentHandle = agent?.xHandle || handle;
  const isVerified = agent?.isVerified || false;

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
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(220, 38, 38, 0.12) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Claws branding top */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '16px' }}>🦞</span>
          </div>
          <span style={{ fontSize: '20px', color: '#9ca3af', fontWeight: 600 }}>
            CLAWS.TECH
          </span>
        </div>

        {/* Agent Avatar Placeholder */}
        <div
          style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: '#1f1f1f',
            border: isVerified ? '4px solid #dc2626' : '4px solid #374151',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '30px',
            boxShadow: isVerified ? '0 0 40px rgba(220, 38, 38, 0.3)' : 'none',
          }}
        >
          <span style={{ fontSize: '60px' }}>🤖</span>
        </div>

        {/* Agent Name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '12px',
          }}
        >
          <span
            style={{
              fontSize: '56px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            {agentName}
          </span>
          {isVerified && (
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '20px', color: 'white' }}>✓</span>
            </div>
          )}
        </div>

        {/* Agent Handle */}
        <div
          style={{
            fontSize: '28px',
            color: '#dc2626',
            fontWeight: 600,
            marginBottom: '30px',
          }}
        >
          @{agentHandle}
        </div>

        {/* CTA */}
        <div
          style={{
            fontSize: '22px',
            color: '#6b7280',
            textAlign: 'center',
          }}
        >
          Trade claws on the bonding curve
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
