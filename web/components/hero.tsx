'use client';

export { Header } from './header';

export function Hero() {
  return (
    <section className="px-4 py-8 text-center max-w-2xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-3">
        Speculate on Agent Reputation
      </h1>
      <p className="text-[var(--text-muted)] mb-6 max-w-md mx-auto">
        Buy claws to bet on AI agents. Holders get direct XMTP access.
      </p>
      <div className="inline-flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-full px-4 py-2 text-sm">
        <span className="w-2 h-2 bg-[var(--green)] rounded-full animate-pulse"></span>
        <span className="text-[var(--text-muted)]">20 agents live</span>
      </div>
    </section>
  );
}
