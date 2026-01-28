'use client';

import { useAppSelector } from '@/hooks/useRedux';
import { useState } from 'react';

interface AgentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AgentSidebar({ isOpen, onClose }: AgentSidebarProps) {
  const { agentWallet } = useAppSelector((state) => state.wallet);
  const [copied, setCopied] = useState(false);

  // 格式化地址
  const shortenAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(agentWallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-[400px] bg-zinc-950 border-l border-white/10 shadow-2xl z-[100] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full overflow-y-auto p-6 flex flex-col">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-lg font-bold text-white">Agent Smart Account Details</h2>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <span className="material-icons-outlined text-sm">close</span>
            </button>
          </div>
          
          <p className="text-[11px] text-slate-500 mb-8 leading-relaxed">
            A smart contract controlled by your wallet so the Agent can execute transactions on your behalf.{' '}
            <a href="#" className="underline hover:text-slate-300">Learn More</a>
          </p>

          {/* Account Info Card */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 mb-6">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 block">Path Agent Account</span>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary via-purple-500 to-blue-500 opacity-80" />
              <span className="font-mono text-white text-sm font-medium tracking-wide">
                {shortenAddress(agentWallet.address)}
              </span>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-slate-300 transition-colors border border-white/5"
              >
                <span className="material-icons-outlined text-[14px]">
                  {copied ? 'check' : 'content_copy'}
                </span>
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button className="flex items-center justify-center px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-slate-300 transition-colors border border-white/5">
                <span className="material-icons-outlined text-[14px]">open_in_new</span>
              </button>
            </div>
          </div>

          {/* Balance Section */}
          <div className="mb-2">
            <h3 className="text-sm font-medium text-white mb-3">Agent Account Balance</h3>
            
            <div className="bg-zinc-900 border border-white/10 rounded-xl p-4 mb-3">
              <h4 className="text-sm font-medium text-white mb-4">1 Token Available</h4>
              
              <div className="space-y-2">
                 <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Deposit Tokens</span>
                 <div className="bg-zinc-800/50 rounded-lg p-3 flex items-center gap-3 border border-white/5">
                   <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                     <span className="material-icons-outlined text-white text-[14px]">attach_money</span>
                   </div>
                   <span className="text-sm font-mono text-white">
                     {agentWallet.virtualBalance.toFixed(5)} USDC
                   </span>
                 </div>
              </div>
            </div>

            <button className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 mb-3">
              <span className="material-icons-outlined text-[18px]">output</span>
              Withdraw Balance
            </button>

            <div className="bg-amber-900/10 border border-amber-500/20 rounded-xl p-3 flex gap-3">
              <span className="material-icons-outlined text-amber-500 text-sm mt-0.5">info</span>
              <p className="text-[10px] text-amber-200/70 leading-relaxed">
                Your Agent Account contains assets. Withdrawing will transfer all tokens to your connected wallet in a single transaction.
              </p>
            </div>
          </div>

          <div className="h-px bg-white/10 my-6" />

          {/* Permissions Section */}
          <div>
            <h3 className="text-sm font-medium text-white mb-2">Account Permissions</h3>
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
              These are the default conditions under which the Agent can act on your behalf, using <a href="#" className="underline">Session Keys</a>
            </p>

            <div className="space-y-2">
              {[
                { icon: 'toll', title: 'Token Access', desc: 'USDC within approved markets' },
                { icon: 'timer', title: 'Time Limit', desc: 'Until agent deactivation' },
                { icon: 'description', title: 'Contract Interactions', desc: 'Limited to integrated protocols (8)' },
              ].map((item, idx) => (
                <div key={idx} className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 flex items-start gap-4 hover:bg-zinc-900/60 transition-colors cursor-default">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mt-0.5">
                    <span className="material-icons-outlined text-primary text-sm">{item.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-white mb-0.5">{item.title}</h4>
                    <p className="text-[10px] text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
