'use client';

import { useState, useRef, useEffect } from 'react';
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
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formatAddress = (address: string): string => {
    if (!address) return 'Not Connected';
    return `0x${address.slice(2, 6)} ... ${address.slice(-4)}`;
  };

  const displayAddress = eoaWallet.address || user?.wallet?.address || '';

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">
                Made By AIXVC
              </span>
            </div>
            <button 
              onClick={() => authenticated ? onNavigate?.('dashboard') : login()}
              className={`text-[11px] font-bold uppercase tracking-widest hover:text-white transition-colors ${
                currentView === 'dashboard' ? 'text-primary' : 'text-slate-400'
              }`}
            >
              Dashboard
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Network Badge - 始终显示 */}
          <div className="flex items-center gap-2 bg-zinc-900/80 px-3 py-1.5 rounded-full border border-white/5 text-[11px] font-bold text-slate-300">
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-[8px] font-black text-white">B</span>
            </div>
            <span>Base <span className="text-slate-500 font-medium">USDC</span></span>
            <span className="material-icons-outlined text-[14px] opacity-40 cursor-pointer">expand_more</span>
          </div>

          {authenticated ? (
            <>
              {/* Wallet Display - 已登录时显示钱包地址 */}
              <div className="flex items-center gap-2 bg-zinc-900/80 px-3 py-1.5 rounded-full border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_#A3E635]" />
                <img 
                  src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${displayAddress || 'guest'}`} 
                  alt="avatar" 
                  className="w-5 h-5 rounded-full bg-zinc-700" 
                />
                <span className="text-[11px] font-mono font-bold text-white">
                  {formatAddress(displayAddress)}
                </span>
              </div>

              {/* More Options Button with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-900/80 border border-white/5 hover:bg-white/5 transition-colors"
                >
                  <span className="material-icons-outlined text-[16px] text-slate-400">more_horiz</span>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
                    <button 
                      onClick={() => {
                        onNavigate?.('dashboard');
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                    >
                      <span className="material-icons-outlined text-[18px] text-slate-400">account_balance_wallet</span>
                      <span className="text-[13px] font-medium text-white">Agent Account Details</span>
                    </button>
                    <button 
                      onClick={() => {
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left border-t border-white/5"
                    >
                      <span className="material-icons-outlined text-[18px] text-slate-400">tune</span>
                      <span className="text-[13px] font-medium text-white">Personalization</span>
                    </button>
                    <button 
                      onClick={() => {
                        logout();
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left border-t border-white/5"
                    >
                      <span className="material-icons-outlined text-[18px] text-red-400">logout</span>
                      <span className="text-[13px] font-medium text-red-400">Disconnect</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Connect Wallet Button - 未登录时显示，样式类似 Get Started */
            <button 
              onClick={() => login()}
              className="bg-primary text-background-dark px-5 py-2 rounded-full font-bold text-[11px] uppercase tracking-wider hover:scale-[1.02] transition-transform flex items-center gap-2"
            >
              <span className="material-icons-outlined text-[16px]">account_balance_wallet</span>
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
