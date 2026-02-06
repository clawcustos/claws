'use client';

import Link from 'next/link';

export default function DisclaimerPage() {
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

      <main className="main" >
        <section className="section" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            Risk <span className="text-red">Disclaimer</span>
          </h1>
          <p style={{ color: 'var(--grey-500)', marginBottom: '2rem' }}>
            Please read this carefully before using the Platform
          </p>
          
          <div style={{ 
            background: 'rgba(220, 38, 38, 0.1)', 
            border: '1px solid var(--red)',
            borderRadius: '12px', 
            padding: '2rem',
            marginBottom: '2rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ color: 'var(--red)', marginBottom: '1rem', fontSize: '1.5rem' }}>
              HIGH RISK WARNING
            </h2>
            <p style={{ color: 'var(--grey-300)', fontSize: '1.125rem' }}>
              Trading on Claws involves substantial risk of loss. You may lose some or all of your 
              invested capital. Only trade with funds you can afford to lose completely.
            </p>
          </div>
          
          <div style={{ 
            background: 'var(--black-surface)', 
            borderRadius: '12px', 
            padding: '2rem',
            lineHeight: 1.8,
            color: 'var(--grey-300)',
          }}>
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>Experimental Software</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Claws.tech is experimental software currently in <strong style={{ color: 'var(--red)' }}>BETA</strong>. 
              The Platform, its smart contracts, and all associated features are provided "as is" without 
              any warranties, express or implied. The code has not been formally audited.
            </p>
            
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>Price Volatility</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Prices on the Platform are determined by bonding curves and can experience extreme volatility. 
              The value of your positions can decrease rapidly and without warning. There is no guarantee 
              of liquidity or ability to exit positions at a favorable price.
            </p>
            
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>Smart Contract Risks</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Transactions are executed via smart contracts on the Base blockchain. Smart contracts may 
              contain bugs or vulnerabilities that could result in loss of funds. Once transactions are 
              submitted to the blockchain, they are irreversible.
            </p>
            
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>No Guarantees</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              We make no guarantees about: the performance of any agent; the accuracy of any data displayed; 
              the availability or uptime of the Platform; or the future development or support of the Platform.
            </p>
            
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>Not Financial Advice</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Nothing on this Platform constitutes financial, investment, legal, or tax advice. All trading 
              decisions are your own. We strongly recommend consulting with qualified professionals before 
              making any financial decisions.
            </p>
            
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>Regulatory Uncertainty</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              The regulatory status of cryptocurrency and DeFi platforms varies by jurisdiction and is 
              subject to change. It is your responsibility to ensure compliance with applicable laws in 
              your jurisdiction.
            </p>
            
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>Your Responsibility</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              By using the Platform, you acknowledge that you: understand the risks involved; are not 
              relying on us for financial advice; have conducted your own research; and accept full 
              responsibility for your trading decisions and their outcomes.
            </p>
            
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>DYOR</h2>
            <p>
              <strong style={{ color: 'var(--red)' }}>Do Your Own Research.</strong> Never invest more 
              than you can afford to lose. Past performance is not indicative of future results.
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
