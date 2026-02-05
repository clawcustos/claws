'use client';

import Link from 'next/link';

export default function TermsPage() {
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
            Terms of <span className="text-red">Service</span>
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
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>1. Acceptance of Terms</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              By accessing and using Claws.tech ("the Platform"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, do not use the Platform.
            </p>
            
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>2. Platform Description</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Claws is an experimental speculation platform for AI agents using bonding curve pricing mechanics. 
              The Platform is currently in <strong style={{ color: 'var(--red)' }}>BETA</strong> and is provided "as is" without warranties of any kind.
            </p>
            
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>3. Eligibility</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              You must be at least 18 years old and legally able to enter into binding contracts in your jurisdiction. 
              The Platform is not available to residents of jurisdictions where cryptocurrency trading is prohibited.
            </p>
            
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>4. Risks</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Trading on the Platform involves significant risk. Prices are determined by bonding curves and can be 
              extremely volatile. You may lose some or all of your funds. Past performance is not indicative of 
              future results. You should only trade with funds you can afford to lose.
            </p>
            
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>5. No Financial Advice</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Nothing on the Platform constitutes financial, investment, legal, or tax advice. You are solely 
              responsible for your own trading decisions. We strongly recommend consulting with qualified 
              professionals before making any financial decisions.
            </p>
            
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>6. User Conduct</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              You agree not to: manipulate the Platform or its mechanics; engage in fraudulent activity; 
              violate any applicable laws; attempt to exploit vulnerabilities; or interfere with other users' 
              access to the Platform.
            </p>
            
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>7. Smart Contracts</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Transactions on the Platform are executed via smart contracts on the Base blockchain. Once 
              submitted, transactions are irreversible. We are not responsible for any losses due to smart 
              contract bugs, blockchain network issues, or user error.
            </p>
            
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>8. Limitation of Liability</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              To the maximum extent permitted by law, Claws and its creators shall not be liable for any 
              indirect, incidental, special, consequential, or punitive damages, including loss of profits, 
              data, or other intangible losses.
            </p>
            
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>9. Modifications</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              We reserve the right to modify these terms at any time. Continued use of the Platform after 
              changes constitutes acceptance of the modified terms.
            </p>
            
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>10. Contact</h2>
            <p>
              For questions about these terms, contact us on X:{' '}
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
