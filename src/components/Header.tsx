'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useAppSelector } from '@/hooks/useRedux';

type ViewType = 'landing' | 'deposit' | 'dashboard';

interface HeaderProps {
  currentView?: ViewType;
  onNavigate?: (view: ViewType) => void;
}

export default function Header({ currentView = 'landing', onNavigate }: HeaderProps) {
  const { login, logout, authenticated, user } = usePrivy();
  const { eoaWallet } = useAppSelector((state) => state.wallet);

  const formatAddress = (address: string): string => {
    if (!address) return 'Not Connected';
    return `${address.slice(0, 6)} ... ${address.slice(-4)}`;
  };

  const displayAddress = eoaWallet.address || user?.wallet?.address || '';

  return (
    <header className="fixed w-full top-0 z-50 border-b border-white/5 backdrop-blur-md bg-background-dark/80">
      <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => onNavigate?.('landing')}
          >
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <span className="text-background-dark font-display font-black text-xs">P</span>
            </div>
            <span className="text-lg font-display font-bold tracking-tighter uppercase text-white">
              PATH
            </span>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <div className="bg-white/5 px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/5 cursor-default group">
              <span className="material-icons-outlined text-[14px] text-primary">details</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">
                Made By AIXVC
              </span>
            </div>
            <button 
              onClick={() => onNavigate?.('dashboard')}
              className={`text-[11px] font-bold uppercase tracking-widest hover:text-white transition-colors ${
                currentView === 'dashboard' ? 'text-primary' : 'text-slate-400'
              }`}
            >
              Dashboard
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Network Badge */}
          <div className="flex items-center gap-2 bg-zinc-900/80 px-3 py-1.5 rounded-full border border-white/5 text-[10px] font-bold uppercase text-slate-300">
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-[8px] font-black text-white">B</span>
            </div>
            <span>Base <span className="text-slate-500 font-medium">USDC</span></span>
            <span className="material-icons-outlined text-[14px] opacity-40">expand_more</span>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center gap-3 bg-zinc-900/80 pl-2 pr-1 py-1 rounded-full border border-white/5">
            <div className="flex items-center gap-1.5 px-1">
              {authenticated && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_#A3E635]" />
              )}
              <img 
                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${displayAddress || 'guest'}`} 
                alt="avatar" 
                className="w-5 h-5 rounded-full bg-zinc-700" 
              />
              <span className="text-[11px] font-mono font-bold text-white">
                {authenticated ? formatAddress(displayAddress) : 'Not Connected'}
              </span>
            </div>
            <button 
              onClick={() => authenticated ? logout() : login()}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
            >
              <span className="material-icons-outlined text-[16px] text-slate-500">
                {authenticated ? 'logout' : 'login'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
