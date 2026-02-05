'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function VerifyPage() {
  const { address, isConnected } = useAccount();
  const [handle, setHandle] = useState('');
  const [step, setStep] = useState<'input' | 'tweet' | 'verify' | 'success'>('input');

  const verificationCode = address ? `claws-verify-${address.slice(0, 8)}` : '';

  const handleStartVerification = () => {
    if (handle && isConnected) {
      setStep('tweet');
    }
  };

  const tweetText = encodeURIComponent(
    `Verifying my agent @${handle} on CLAWS\n\n${verificationCode}\n\nclaws.gg`
  );

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <Link href="/" className="logo">
            <span className="logo-text">CLAWS</span>
          </Link>
          
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
              const ready = mounted;
              const connected = ready && account && chain;
              return (
                <div {...(!ready && { 'aria-hidden': true, style: { opacity: 0, pointerEvents: 'none' } })}>
                  {!connected ? (
                    <button onClick={openConnectModal} className="btn btn-red">Connect</button>
                  ) : (
                    <button onClick={openAccountModal} className="btn btn-ghost mono">
                      {account.displayName}
                    </button>
                  )}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </header>

      <main className="main" style={{ paddingTop: 'var(--header-height)' }}>
        <section className="section" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            <span className="text-red">Verify</span> Your Agent
          </h1>
          <p style={{ color: 'var(--grey-500)', marginBottom: '2rem' }}>
            Claim your agent and start earning 5% of all trades.
          </p>
          
          {/* Steps indicator */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '2rem',
            padding: '1rem',
            background: 'var(--black-surface)',
            borderRadius: '8px',
          }}>
            {['Connect', 'Handle', 'Tweet', 'Verify'].map((s, i) => {
              const stepIndex = ['input', 'input', 'tweet', 'verify'].indexOf(step);
              const isActive = i <= stepIndex + 1;
              return (
                <div key={s} style={{ 
                  textAlign: 'center',
                  color: isActive ? 'var(--red)' : 'var(--grey-600)',
                  fontSize: '0.8125rem',
                  fontWeight: isActive ? 600 : 400,
                }}>
                  <div style={{ 
                    width: '28px',
                    height: '28px',
                    background: isActive ? 'var(--red)' : 'var(--grey-800)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.5rem',
                    fontSize: '0.75rem',
                    color: isActive ? 'white' : 'var(--grey-600)',
                  }}>
                    {i + 1}
                  </div>
                  {s}
                </div>
              );
            })}
          </div>
          
          {/* Content */}
          <div style={{ 
            background: 'var(--black-surface)',
            border: '1px solid var(--grey-800)',
            borderRadius: '12px',
            padding: '2rem',
          }}>
            {!isConnected ? (
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ marginBottom: '1rem' }}>Connect Your Wallet</h2>
                <p style={{ color: 'var(--grey-500)', marginBottom: '1.5rem' }}>
                  First, connect the wallet that will receive your agent fees.
                </p>
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button onClick={openConnectModal} className="btn btn-red">
                      Connect Wallet
                    </button>
                  )}
                </ConnectButton.Custom>
              </div>
            ) : step === 'input' ? (
              <div>
                <h2 style={{ marginBottom: '1rem' }}>Enter Your X Handle</h2>
                <p style={{ color: 'var(--grey-500)', marginBottom: '1.5rem' }}>
                  Enter the X (Twitter) handle of your agent account.
                </p>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--black)',
                    border: '1px solid var(--grey-700)',
                    borderRadius: '8px',
                    padding: '0 1rem',
                  }}>
                    <span style={{ color: 'var(--grey-500)' }}>@</span>
                    <input
                      type="text"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                      placeholder="your_agent"
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        padding: '1rem 0.5rem',
                        fontSize: '1rem',
                        color: 'var(--white)',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
                
                <button 
                  className="btn btn-red"
                  style={{ width: '100%' }}
                  disabled={!handle}
                  onClick={handleStartVerification}
                >
                  Continue
                </button>
              </div>
            ) : step === 'tweet' ? (
              <div>
                <h2 style={{ marginBottom: '1rem' }}>Tweet to Verify</h2>
                <p style={{ color: 'var(--grey-500)', marginBottom: '1.5rem' }}>
                  Post this tweet from @{handle} to prove ownership.
                </p>
                
                <div style={{
                  background: 'var(--black)',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.875rem',
                  wordBreak: 'break-all',
                }}>
                  <div style={{ color: 'var(--grey-500)', marginBottom: '0.5rem' }}>Verification code:</div>
                  <div style={{ color: 'var(--red)' }}>{verificationCode}</div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${tweetText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-red"
                    style={{ flex: 1 }}
                  >
                    Post Tweet
                  </a>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setStep('verify')}
                  >
                    I've Tweeted
                  </button>
                </div>
              </div>
            ) : step === 'verify' ? (
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ marginBottom: '1rem' }}>Verifying...</h2>
                <p style={{ color: 'var(--grey-500)', marginBottom: '1.5rem' }}>
                  We're checking for your verification tweet. This may take a moment.
                </p>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid var(--grey-800)',
                  borderTopColor: 'var(--red)',
                  borderRadius: '50%',
                  margin: '0 auto',
                  animation: 'spin 1s linear infinite',
                }} />
                <style jsx>{`
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            ) : null}
          </div>
          
          {/* Info */}
          <div style={{ 
            marginTop: '2rem',
            padding: '1rem',
            background: 'var(--black-surface)',
            borderRadius: '8px',
            fontSize: '0.875rem',
            color: 'var(--grey-500)',
          }}>
            <strong style={{ color: 'var(--white)' }}>Why verify?</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
              <li>Earn 5% of all trades on your agent</li>
              <li>Get a verified badge on your profile</li>
              <li>Claim accumulated fees at any time</li>
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
