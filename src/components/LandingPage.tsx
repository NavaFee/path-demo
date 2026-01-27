'use client';

import { usePrivy } from '@privy-io/react-auth';

interface LandingPageProps {
  onNavigate?: (view: 'deposit' | 'dashboard') => void;
}

const PROTOCOLS = [
  { id: 'morpho', name: 'Morpho', apr: 7.21, description: 'Institutional Vault', icon: 'bolt' },
  { id: 'aave', name: 'Aave V3', apr: 3.28, description: 'Lending Market', icon: 'savings' },
  { id: 'moonwell', name: 'Moonwell', apr: 4.80, description: 'Base Native', icon: 'account_balance' },
  { id: 'euler', name: 'Euler', apr: 2.82, description: 'Modular Lending', icon: 'view_agenda' },
];

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const { login, authenticated } = usePrivy();

  const handleStart = () => {
    if (!authenticated) {
      login();
    } else {
      onNavigate?.('deposit');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      {/* Left Content */}
      <div className="lg:col-span-7 space-y-8 relative">
        <div className="space-y-4">
          <p className="text-primary font-medium tracking-[0.2em] uppercase text-sm">
            Automated Yield Infrastructure
          </p>
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.1] tracking-tight text-white">
            Welcome to the era of deterministic{' '}
            <span className="text-primary">yield automation.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed">
            Institutional-grade DeFi infrastructure for automated USDC yield optimization on the Base network. No manual farming, just pure efficiency.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4 pt-4">
          <button 
            onClick={handleStart}
            className="bg-primary text-background-dark px-8 py-4 rounded font-bold text-lg hover:scale-[1.02] transition-transform flex items-center gap-2 group"
          >
            Get Started{' '}
            <span className="material-icons-outlined group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
          <button className="px-8 py-4 rounded border border-border-dark bg-card-dark text-white font-bold text-lg hover:bg-neutral-800 transition-colors">
            View Docs
          </button>
        </div>
      </div>

      {/* Right Content - Protocol Cards */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.3em] opacity-40 mb-2">
          Live Yield Environments
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {PROTOCOLS.map((protocol) => (
            <div 
              key={protocol.id} 
              className="bg-card-dark border border-border-dark p-6 rounded-xl hover:border-primary/50 transition-colors group cursor-default"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-neutral-800">
                  <span className="material-icons-outlined text-slate-400 group-hover:text-primary transition-colors">
                    {protocol.icon}
                  </span>
                </div>
                <span className="text-primary text-sm font-bold">{protocol.apr}%</span>
              </div>
              <p className="font-display font-bold text-lg uppercase tracking-wider">
                {protocol.name}
              </p>
              <p className="text-xs opacity-40 uppercase mt-1">{protocol.description}</p>
            </div>
          ))}
        </div>
        
        {/* Active Agents Banner */}
        <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-4">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <img 
                key={i} 
                className="w-8 h-8 rounded-full border-2 border-card-dark bg-neutral-700" 
                src={`https://picsum.photos/seed/${i}/40/40`} 
                alt="agent" 
              />
            ))}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide">14,291 Active Agents</p>
            <p className="text-[10px] opacity-60">Rebalancing every 15 minutes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
