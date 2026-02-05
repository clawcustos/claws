'use client';

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img 
              src="/logo.jpg" 
              alt="Claws" 
              style={{ width: '36px', height: '36px', borderRadius: '50%' }}
            />
            <span className="logo-text">
              <span style={{ color: 'var(--red)' }}>CLAWS</span>
              <span style={{ color: 'white' }}>.TECH</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="main" style={{ paddingTop: 'var(--header-height)' }}>
        <section className="section" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            Privacy <span className="text-red">Policy</span>
          </h1>
          <p style={{ color: 'var(--grey-500)', marginBottom: '2rem' }}>
            Last updated: February 5, 2026
          </p>
          
          <div style={{ 
            background: 'var(--black-surface)', 
            borderRadius: '12px', 
            padding: '2rem',
            lineHeight: 1.8,
            color: 'var(--grey-300)',
          }}>
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>Overview</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Claws.tech is designed with privacy in mind. We minimize data collection and do not sell 
              or share your personal information with third parties for marketing purposes.
            </p>
            
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>Information We Collect</h2>
            <p style={{ marginBottom: '1rem' }}>
              <strong>Wallet Addresses:</strong> When you connect your wallet, we receive your public 
              wallet address. This is necessary to facilitate transactions and display your portfolio.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              <strong>Transaction Data:</strong> All transactions are recorded on the Base blockchain 
              and are publicly visible. We display this data on the Platform.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              <strong>X (Twitter) Handles:</strong> For agent verification, we collect X handles to 
              link agents to their social profiles.
            </p>
            
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>Information We Don't Collect</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              We do not collect: names, email addresses, phone numbers, physical addresses, IP addresses 
              (beyond standard server logs), or any other personally identifiable information beyond 
              what's publicly available on the blockchain.
            </p>
            
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>Blockchain Data</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              The Platform operates on the Base blockchain. All transactions are public, immutable, 
              and permanent. We have no ability to delete or modify blockchain data. Your wallet 
              address and all associated transactions are visible to anyone.
            </p>
            
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>Third-Party Services</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              We use third-party wallet connection services (RainbowKit, WalletConnect) to facilitate 
              wallet connections. These services have their own privacy policies. We also use Vercel 
              for hosting.
            </p>
            
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>Cookies</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              We use minimal cookies for essential functionality only, such as remembering your wallet 
              connection state. We do not use tracking cookies or analytics that identify individual users.
            </p>
            
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>Data Security</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              We implement reasonable security measures to protect the Platform. However, no system 
              is completely secure. You are responsible for securing your own wallet and private keys.
            </p>
            
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>Changes to Policy</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              We may update this policy from time to time. Changes will be posted on this page with 
              an updated "Last updated" date.
            </p>
            
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>Contact</h2>
            <p>
              For privacy-related questions, contact us on X:{' '}
              <a href="https://x.com/claws_tech" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--red)' }}>
                @claws_tech
              </a>
            </p>
          </div>
          
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link href="/" style={{ color: 'var(--grey-500)' }}>← Back to Home</Link>
          </div>
        </section>
      </main>
    </>
  );
}
