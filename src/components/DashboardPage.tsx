'use client';

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { toggleAutoRebalancing, simulateAPRFluctuation, autoRebalance, addEarnings } from '@/store/strategySlice';

const PROTOCOLS = [
  { id: 'morpho', name: 'Morpho', description: 'Institutional Vault', icon: 'bolt', color: 'bg-blue-600' },
  { id: 'aave', name: 'Aave V3', description: 'Lending Market', icon: 'savings', color: 'bg-purple-600' },
  { id: 'moonwell', name: 'Moonwell', description: 'Base Native', icon: 'account_balance', color: 'bg-indigo-600' },
  { id: 'euler', name: 'Euler', description: 'Modular Lending', icon: 'view_agenda', color: 'bg-cyan-600' },
];

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { agentWallet } = useAppSelector((state) => state.wallet);
  const { protocols, isAutoRebalancing, totalEarnings, rebalanceHistory } = useAppSelector((state) => state.strategy);
  const [activeTab, setActiveTab] = useState('Position Value');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({ 'default-1': true });

  const toggleItem = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Strategy Simulation Engine
  useEffect(() => {
    if (!isAutoRebalancing) return;

    const aprInterval = setInterval(() => {
      dispatch(simulateAPRFluctuation());
    }, 5000);

    const rebalanceInterval = setInterval(() => {
      dispatch(autoRebalance());
    }, 15000);

    const earningsInterval = setInterval(() => {
      if (agentWallet.virtualBalance > 0) {
        const weightedApr = protocols.reduce(
          (sum, p) => sum + (p.apr * p.allocation) / 100, 0
        );
        const secondlyEarning = (agentWallet.virtualBalance * (weightedApr / 100)) / (365 * 24 * 60 * 60);
        dispatch(addEarnings(secondlyEarning));
      }
    }, 1000);

    return () => {
      clearInterval(aprInterval);
      clearInterval(rebalanceInterval);
      clearInterval(earningsInterval);
    };
  }, [isAutoRebalancing, agentWallet.virtualBalance, protocols, dispatch]);

  const currentApr = protocols.reduce((sum, p) => sum + (p.apr * p.allocation) / 100, 0);

  // Demo chart data
  const positionData = [
    { name: 'Jan 1', value: 3.5 },
    { name: 'Jan 7', value: 4.2 },
    { name: 'Jan 14', value: 3.8 },
    { name: 'Jan 21', value: 5.2 },
    { name: 'Jan 28', value: 8.4 },
    { name: 'Jan 30', value: agentWallet.virtualBalance > 0 ? agentWallet.virtualBalance : 8.5 },
  ];

  return (
    <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-8 pt-4">
      {/* Main Content */}
      <div className="col-span-12 lg:col-span-8 space-y-8">
        {/* Main Chart Card */}
        <div className="bg-card-dark/40 border border-white/5 rounded-[24px] p-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 w-fit">
              {['Position Value', 'Yield Projection'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === tab ? 'bg-zinc-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-zinc-900/50 hover:bg-zinc-800 text-xs font-bold transition-all text-slate-400">
                <span className="material-icons-outlined text-sm">power_settings_new</span>
                Deactivate
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-background-dark font-black text-xs shadow-[0_0_20px_rgba(163,230,53,0.15)] hover:scale-105 transition-all">
                <span className="material-icons-outlined text-sm">add_box</span>
                Add funds
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-10">
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-2">Total balance</p>
              <h2 className="text-4xl font-display font-black text-white leading-none">
                {agentWallet.virtualBalance.toFixed(2)} <span className="text-xl text-slate-500 font-bold ml-1">USDC</span>
              </h2>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-2">Total deposited</p>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-slate-300">{agentWallet.virtualBalance.toFixed(2)} USDC</span>
              </div>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-2">Lifetime earnings</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">
                  {totalEarnings.toFixed(4)} USDC ({((totalEarnings / Math.max(agentWallet.virtualBalance, 1)) * 100).toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Simple Chart Placeholder */}
          <div className="h-[280px] w-full bg-zinc-900/30 rounded-xl flex items-center justify-center">
            <div className="text-center text-slate-500">
              <span className="material-icons-outlined text-4xl mb-2">show_chart</span>
              <p className="text-sm">Position Value Chart</p>
              <p className="text-xs opacity-60 mt-1">Recharts integration available</p>
            </div>
          </div>
        </div>

        {/* Execution History */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display text-white">Agent Execution History</h2>
            <div className="flex items-center gap-4">
              <span className="text-[11px] text-slate-500 font-bold uppercase">{rebalanceHistory.length} events</span>
            </div>
          </div>

          <div className="space-y-4">
            {rebalanceHistory.length === 0 ? (
              <div className="bg-card-dark/40 border border-white/5 rounded-[20px] p-8 text-center">
                <span className="material-icons-outlined text-slate-600 text-3xl mb-2">history</span>
                <p className="text-slate-500">No rebalancing events yet</p>
                <p className="text-xs text-slate-600 mt-1">Auto-rebalancing will occur when APR shifts detected</p>
              </div>
            ) : (
              rebalanceHistory.slice(-3).reverse().map((event, index) => (
                <div key={event.timestamp} className="bg-card-dark/40 border border-white/5 rounded-[20px] overflow-hidden">
                  <div 
                    onClick={() => toggleItem(`event-${index}`)}
                    className="p-6 border-b border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center gap-6">
                      <span 
                        className="material-icons-outlined text-slate-600 text-[20px] transition-transform duration-300"
                        style={{ transform: expandedItems[`event-${index}`] ? 'rotate(0deg)' : 'rotate(-180deg)' }}
                      >
                        expand_less
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="material-icons-outlined text-primary text-[20px]">account_tree</span>
                      </div>
                      <div>
                        <h4 className="text-[14px] font-bold text-white">Position reallocated to higher-yield lending market</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {event.fromProtocol} → {event.toProtocol}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] font-bold text-white">
                        {new Date(event.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 uppercase tracking-wider">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        {/* Promo Card */}
        <div className="p-1 rounded-[24px] bg-linear-to-br from-primary/30 to-background-dark border border-white/5 overflow-hidden">
          <div className="p-6 space-y-4 relative">
            <div className="absolute top-0 right-0 p-8 opacity-40">
              <div className="w-16 h-16 rounded-full border-2 border-primary animate-pulse" />
            </div>
            <span className="bg-primary/20 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-primary/10">
              New 15% APR
            </span>
            <h3 className="text-2xl font-display font-black text-white leading-tight pr-12">
              Earn smarter with PATH rewards
            </h3>
            
            <div className="pt-2">
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-2">Total PATH Rewards</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-[10px]">P</div>
                <span className="text-lg font-black text-white">0 <span className="text-slate-500 font-bold">PATH</span></span>
              </div>
            </div>

            <button className="w-full bg-primary text-background-dark py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all mt-4">
              Stake PATH
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="p-8 bg-card-dark/40 border border-white/5 rounded-[24px] space-y-8">
          <div className="space-y-4">
            <h4 className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">PATH Net APR</h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-icons-outlined text-[20px]">layers</span>
              </div>
              <span className="text-2xl font-black text-white font-mono">{currentApr.toFixed(2)}%</span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Current Allocations</p>
            {protocols.filter(p => p.allocation > 0).map(protocol => {
              const protoInfo = PROTOCOLS.find(pp => pp.id === protocol.id);
              return (
                <div key={protocol.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${protoInfo?.color || 'bg-blue-600'}/20 flex items-center justify-center`}>
                    <span className="text-[10px] font-black uppercase">{protocol.name[0]}</span>
                  </div>
                  <span className="text-[14px] font-bold text-white">
                    {protocol.name} <span className="text-slate-400 ml-1">{protocol.apr.toFixed(2)}%</span>
                  </span>
                  <span className="ml-auto text-xs text-slate-500">{protocol.allocation}%</span>
                </div>
              );
            })}
          </div>

          <div className="pt-6 border-t border-white/5 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 uppercase tracking-widest font-bold">Auto-Rebalance</span>
              <button 
                onClick={() => dispatch(toggleAutoRebalancing())}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  isAutoRebalancing 
                    ? 'bg-primary/20 text-primary border border-primary/20'
                    : 'bg-zinc-800 text-slate-400 border border-white/5'
                }`}
              >
                {isAutoRebalancing ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>
        </div>

        {/* Mini Bot Card */}
        <div className="p-6 bg-card-dark/40 border border-white/5 rounded-[24px] space-y-4">
          <div className="flex items-center gap-3">
            <span className="material-icons-outlined text-blue-400">send</span>
            <h4 className="text-[14px] font-bold text-white uppercase tracking-widest">Path Mini</h4>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium uppercase tracking-tight">
            Path Mini is your Telegram companion that allows you to interact with your Path Agent.
          </p>
          <button className="w-full bg-primary/90 text-background-dark py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2">
            Open Path Mini
          </button>
        </div>
      </div>
    </div>
  );
}
