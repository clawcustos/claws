'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';

type Step = 'connect' | 'handle' | 'tweet' | 'verify' | 'complete';

interface VerificationState {
  xHandle: string;
  verificationCode: string;
  tweetUrl: string;
}

export default function VerifyPage() {
  const { address, isConnected } = useAccount();
  const [currentStep, setCurrentStep] = useState<Step>('connect');
  const [state, setState] = useState<VerificationState>({
    xHandle: '',
    verificationCode: '',
    tweetUrl: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Determine step based on state
  const getActiveStep = (): Step => {
    if (!isConnected) return 'connect';
    if (!state.verificationCode) return 'handle';
    if (!state.tweetUrl) return 'tweet';
    return 'verify';
  };

  const activeStep = currentStep === 'complete' ? 'complete' : getActiveStep();

  const handleRequestCode = async () => {
    if (!state.xHandle.trim()) {
      setError('Please enter your X handle');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/verify/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          xHandle: state.xHandle.replace('@', ''),
          wallet: address,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate verification code');
      }
      
      setState(prev => ({ ...prev, verificationCode: data.code }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!state.tweetUrl.trim()) {
      setError('Please enter the tweet URL');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/verify/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          xHandle: state.xHandle.replace('@', ''),
          wallet: address,
          tweetUrl: state.tweetUrl,
          code: state.verificationCode,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }
      
      setCurrentStep('complete');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const tweetText = `Verifying my agent identity on @claws_tech

Code: ${state.verificationCode || 'XXXX-XXXX-XXXX'}
Wallet: ${address?.slice(0, 10)}...${address?.slice(-8) || ''}

#Claws #AIAgents`;

  const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  return (
    <div className="page-wrapper">
      <Header />
      
      <main className="main-content">
        <div className="verify-container">
          {activeStep === 'complete' ? (
            <div className="verify-card" style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: 'var(--positive-muted)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                margin: '0 auto 1.5rem',
              }}>
                ✓
              </div>
              
              <h1 className="verify-title" style={{ color: 'var(--positive)' }}>
                Verified!
              </h1>
              <p className="verify-subtitle">
                Your agent @{state.xHandle} is now verified on Claws.
                You can now claim fees from your market.
              </p>
              
              <Link 
                href={`/agent/${state.xHandle}`} 
                className="btn btn-primary btn-lg"
                style={{ marginTop: '1rem' }}
              >
                View Your Market
              </Link>
            </div>
          ) : (
            <div className="verify-card">
              <h1 className="verify-title">Agent Verification</h1>
              <p className="verify-subtitle">
                Prove ownership of your X account to claim your market and earn trading fees.
              </p>
              
              {error && (
                <div 
                  style={{ 
                    padding: '0.75rem 1rem',
                    background: 'var(--negative-muted)',
                    border: '1px solid var(--negative)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--negative)',
                    fontSize: '0.875rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  {error}
                </div>
              )}
              
              <div className="verify-steps">
                {/* Step 1: Connect Wallet */}
                <div className={`verify-step ${activeStep === 'connect' ? 'active' : isConnected ? 'completed' : ''}`}>
                  <div className="verify-step-number">
                    {isConnected ? '✓' : '1'}
                  </div>
                  <div className="verify-step-content">
                    <div className="verify-step-title">Connect Wallet</div>
                    <div className="verify-step-desc">
                      {isConnected 
                        ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}`
                        : 'Connect the wallet you want to bind to your agent'
                      }
                    </div>
                    
                    {!isConnected && (
                      <div style={{ marginTop: '0.75rem' }}>
                        <ConnectButton.Custom>
                          {({ openConnectModal }) => (
                            <button 
                              onClick={openConnectModal}
                              className="btn btn-primary"
                            >
                              Connect Wallet
                            </button>
                          )}
                        </ConnectButton.Custom>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Step 2: Enter Handle */}
                <div className={`verify-step ${activeStep === 'handle' ? 'active' : state.verificationCode ? 'completed' : ''}`}>
                  <div className="verify-step-number">
                    {state.verificationCode ? '✓' : '2'}
                  </div>
                  <div className="verify-step-content">
                    <div className="verify-step-title">Enter X Handle</div>
                    <div className="verify-step-desc">
                      Enter the X handle for the agent you're verifying
                    </div>
                    
                    {activeStep === 'handle' && (
                      <>
                        <input
                          type="text"
                          className="verify-input"
                          placeholder="@your_agent_handle"
                          value={state.xHandle}
                          onChange={(e) => setState(prev => ({ ...prev, xHandle: e.target.value }))}
                        />
                        <button 
                          className="btn btn-primary"
                          style={{ marginTop: '0.75rem', width: '100%' }}
                          onClick={handleRequestCode}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Generating...' : 'Get Verification Code'}
                        </button>
                      </>
                    )}
                    
                    {state.verificationCode && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        @{state.xHandle}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Step 3: Post Tweet */}
                <div className={`verify-step ${activeStep === 'tweet' ? 'active' : state.tweetUrl ? 'completed' : ''}`}>
                  <div className="verify-step-number">
                    {state.tweetUrl ? '✓' : '3'}
                  </div>
                  <div className="verify-step-content">
                    <div className="verify-step-title">Post Verification Tweet</div>
                    <div className="verify-step-desc">
                      Post a tweet containing your verification code
                    </div>
                    
                    {activeStep === 'tweet' && state.verificationCode && (
                      <>
                        <div className="verify-code-box">
                          {state.verificationCode}
                        </div>
                        
                        <a
                          href={tweetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                          style={{ marginTop: '0.75rem', width: '100%', display: 'flex' }}
                        >
                          Open Tweet Composer →
                        </a>
                        
                        <div style={{ marginTop: '1rem' }}>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            Paste your tweet URL:
                          </div>
                          <input
                            type="text"
                            className="verify-input"
                            placeholder="https://x.com/your_agent/status/..."
                            value={state.tweetUrl}
                            onChange={(e) => setState(prev => ({ ...prev, tweetUrl: e.target.value }))}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Step 4: Complete Verification */}
                <div className={`verify-step ${activeStep === 'verify' ? 'active' : ''}`}>
                  <div className="verify-step-number">4</div>
                  <div className="verify-step-content">
                    <div className="verify-step-title">Complete Verification</div>
                    <div className="verify-step-desc">
                      We'll verify your tweet and bind your wallet
                    </div>
                    
                    {activeStep === 'verify' && (
                      <button 
                        className="btn btn-primary"
                        style={{ marginTop: '0.75rem', width: '100%' }}
                        onClick={handleVerify}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Verifying...' : 'Complete Verification'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Help Section */}
          <div 
            style={{ 
              marginTop: '2rem',
              padding: '1.5rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
              Why Verify?
            </h3>
            
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}>
              <li style={{ display: 'flex', gap: '0.75rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--positive)' }}>💰</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Earn 5% fees</strong> on every trade of your claws
                </span>
              </li>
              <li style={{ display: 'flex', gap: '0.75rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--positive)' }}>✓</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Verified badge</strong> shows traders you're authentic
                </span>
              </li>
              <li style={{ display: 'flex', gap: '0.75rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--positive)' }}>🔒</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Wallet binding</strong> ensures only you can claim your fees
                </span>
              </li>
            </ul>
          </div>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
