'use client';

import { useState, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { base } from 'viem/chains';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setDepositStatus, addVirtualBalance, resetDeposit } from '@/store/walletSlice';
import { 
  USDC_ADDRESS, 
  ERC20_ABI, 
  parseUSDC, 
} from '@/utils/usdcContract';

const MOCK_AGENT_WALLET = '0xDA20fE7B606E04d8b4b978012094C4f672d82C2B';

interface ProtocolConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  apr: number;
  enabled: boolean;
  maxAllocation: number; // %
  minAPR: number;        // %
  minTVL: number;        // Millions
}

const INITIAL_PROTOCOLS: ProtocolConfig[] = [
  { id: 'aave', name: 'AAVE', icon: 'A', color: 'bg-cyan-500', apr: 3.79, enabled: true, maxAllocation: 40, minAPR: 2.0, minTVL: 100 },
  { id: 'compound', name: 'Compound', icon: 'C', color: 'bg-green-500', apr: 3.21, enabled: true, maxAllocation: 35, minAPR: 2.5, minTVL: 80 },
  { id: 'euler', name: 'Euler USDC', icon: 'E', color: 'bg-blue-600', apr: 2.85, enabled: true, maxAllocation: 30, minAPR: 2.0, minTVL: 50 },
  { id: 'fluid', name: 'Fluid', icon: 'F', color: 'bg-purple-500', apr: 3.86, enabled: true, maxAllocation: 25, minAPR: 3.0, minTVL: 30 },
  { id: 'moonwell', name: 'Moonwell', icon: 'M', color: 'bg-indigo-500', apr: 2.94, enabled: true, maxAllocation: 30, minAPR: 2.0, minTVL: 40 },
  { id: 'morpho-gauntlet', name: 'Morpho Gauntlet USDC Prime', icon: 'MG', color: 'bg-blue-500', apr: 4.35, enabled: true, maxAllocation: 40, minAPR: 3.5, minTVL: 100 },
  { id: 'morpho-moonwell', name: 'Morpho Moonwell Flagship USDC', icon: 'MM', color: 'bg-blue-500', apr: 4.40, enabled: true, maxAllocation: 35, minAPR: 3.0, minTVL: 80 },
  { id: 'morpho-seamless', name: 'Morpho Seamless USDC Vault', icon: 'MS', color: 'bg-blue-500', apr: 3.93, enabled: true, maxAllocation: 30, minAPR: 2.5, minTVL: 60 },
  { id: 'morpho-steakhouse', name: 'Morpho Steakhouse USDC', icon: 'MSt', color: 'bg-blue-500', apr: 3.26, enabled: false, maxAllocation: 25, minAPR: 2.0, minTVL: 50 },
];

interface DepositPageProps {
  onNavigate?: (view: 'dashboard') => void;
}

export default function DepositPage({ onNavigate }: DepositPageProps) {
  const [amount, setAmount] = useState<string>('100.00');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Deposit, 2: Personalization, 3: Activate Agent, 4: Success
  const [protocols, setProtocols] = useState<ProtocolConfig[]>(INITIAL_PROTOCOLS);
  const [expandedProtocol, setExpandedProtocol] = useState<string | null>(null);
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const dispatch = useAppDispatch();
  const { eoaWallet } = useAppSelector((state) => state.wallet);

  const toggleProtocol = (id: string) => {
    setProtocols(prev => 
      prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p)
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedProtocol(prev => prev === id ? null : id);
  };

  const updateProtocolConfig = (id: string, field: keyof ProtocolConfig, value: number) => {
    setProtocols(prev =>
      prev.map(p => p.id === id ? { ...p, [field]: value } : p)
    );
  };

  const handleDeposit = useCallback(async () => {
    if (!authenticated || !amount) return;

    const depositAmount = parseFloat(amount);
    if (depositAmount <= 0) return;

    const externalWallet = wallets.find((wallet) => wallet.walletClientType !== 'privy');
    if (!externalWallet) return;

    setLoading(true);
    dispatch(setDepositStatus({ status: 'pending', amount: depositAmount }));

    try {
      const provider = await externalWallet.getEthereumProvider();
      
      const walletClient = createWalletClient({
        chain: base,
        transport: custom(provider),
      });

      const publicClient = createPublicClient({
        chain: base,
        transport: http(),
      });

      const [address] = await walletClient.getAddresses();
      if (!address) throw new Error('No wallet address found');

      const usdcAmount = parseUSDC(depositAmount);

      const hash = await walletClient.writeContract({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [MOCK_AGENT_WALLET as `0x${string}`, usdcAmount],
        account: address,
      });

      dispatch(setDepositStatus({ status: 'confirming', txHash: hash }));

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        dispatch(addVirtualBalance(depositAmount));
        setStep(4); // Success
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      const isUserRejection = 
        error instanceof Error && 
        (error.message.includes('User rejected') || 
         error.message.includes('User denied') ||
         error.message.includes('user rejected'));
      
      if (isUserRejection) {
        dispatch(resetDeposit());
      } else {
        console.error('Deposit error:', error);
        dispatch(setDepositStatus({ status: 'failed' }));
        setTimeout(() => dispatch(resetDeposit()), 5000);
      }
    } finally {
      setLoading(false);
    }
  }, [authenticated, amount, wallets, dispatch]);

  const handleActivate = () => {
    onNavigate?.('dashboard');
  };

  const enabledProtocolsCount = protocols.filter(p => p.enabled).length;

  // Deposit Later link component
  const DepositLaterLink = () => (
    <button
      onClick={() => onNavigate?.('dashboard')}
      className="w-full text-center text-slate-400 hover:text-white text-sm font-medium py-2 transition-colors"
    >
      Deposit later
    </button>
  );

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Step Progress */}
      <div className="flex items-center w-full max-w-xl mb-12">
        <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-primary' : 'text-slate-500'}`}>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${step >= 1 ? 'border-primary' : 'border-slate-800'}`}>
            {step > 1 ? (
              <span className="material-icons-outlined text-sm">check</span>
            ) : (
              <div className="w-2 h-2 bg-primary rounded-full" />
            )}
          </div>
          <span className="text-sm font-semibold">Deposit</span>
        </div>
        <div className="h-[1px] bg-border-dark flex-grow mx-4" />
        <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-primary' : 'text-slate-500'}`}>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${step >= 2 ? 'border-primary' : 'border-slate-800'}`}>
            {step > 2 ? <span className="material-icons-outlined text-sm">check</span> : null}
          </div>
          <span className="text-sm font-medium">Personalization</span>
        </div>
        <div className="h-[1px] bg-border-dark flex-grow mx-4" />
        <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-primary' : 'text-slate-500'}`}>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${step >= 3 ? 'border-primary' : 'border-slate-800'}`}>
            {step > 3 ? <span className="material-icons-outlined text-sm">check</span> : null}
          </div>
          <span className="text-sm font-medium">Activate Agent</span>
        </div>
      </div>

      <div className="w-full max-w-2xl bg-card-dark border border-border-dark p-10 rounded-[24px] shadow-2xl">
        
        {/* Step 1: Deposit */}
        {step === 1 && (
          <>
            <h1 className="text-2xl font-semibold mb-8 font-display">Fund your Autonomous Agent</h1>
            <div className="space-y-6">
              {/* Network Selector */}
              <div>
                <label className="block text-sm text-slate-500 mb-2">From network</label>
                <div className="flex items-center justify-between bg-zinc-900/50 border border-border-dark p-4 rounded-xl cursor-not-allowed">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">B</span>
                    </div>
                    <span className="font-medium">Base</span>
                  </div>
                  <span className="material-icons-outlined text-slate-500">expand_more</span>
                </div>
              </div>

              {/* Amount Input */}
              <div className="grid grid-cols-12 gap-1 border border-border-dark rounded-xl overflow-hidden">
                <div className="col-span-4 bg-zinc-900/80 p-4 border-r border-border-dark">
                  <label className="block text-xs text-slate-500 mb-1 uppercase">Using</label>
                  <div className="flex items-center space-x-3 mt-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                      <span className="material-icons-outlined text-sm">attach_money</span>
                    </div>
                    <span className="font-medium uppercase">USDC</span>
                  </div>
                </div>
                <div className="col-span-8 bg-zinc-900/30 p-4 flex flex-col justify-center">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-slate-500 uppercase">Amount</label>
                    <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded uppercase font-bold cursor-pointer">
                      Max
                    </span>
                  </div>
                  <input 
                    className="w-full bg-transparent border-none focus:ring-0 text-3xl font-medium mt-1 p-0 placeholder:text-zinc-700 text-white outline-none" 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex justify-between text-xs px-1">
                <span className="text-slate-500">Min. deposit: <span className="text-white font-medium">$10</span></span>
                <span className="text-slate-500">
                  Sender: <span className="text-white font-medium">{eoaWallet.address?.slice(0, 8)}...</span>
                </span>
              </div>

              {/* Strategy Parameters */}
              <div className="pt-4 mt-4 border-t border-border-dark">
                <h3 className="text-sm font-semibold mb-4 text-slate-400 uppercase tracking-wider">Strategy Parameters</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-900/50 p-4 rounded-xl border border-border-dark">
                    <label className="block text-xs text-slate-500 mb-1">Rebalance Interval</label>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Every 6 Hours</span>
                      <span className="material-icons-outlined text-sm text-primary">schedule</span>
                    </div>
                  </div>
                  <div className="bg-zinc-900/50 p-4 rounded-xl border border-border-dark">
                    <label className="block text-xs text-slate-500 mb-1">APR Threshold</label>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">0.50% Shift</span>
                      <span className="material-icons-outlined text-sm text-primary">trending_up</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                onClick={() => setStep(2)}
                disabled={!authenticated || parseFloat(amount) < 10}
                className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>

              <DepositLaterLink />
            </div>
          </>
        )}

        {/* Step 2: Personalization */}
        {step === 2 && (
          <>
            <h1 className="text-2xl font-semibold mb-2 font-display">Personalization</h1>
            <p className="text-slate-500 text-sm mb-8">Select which protocols your agent can use for yield optimization. Click a protocol to configure details.</p>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {protocols.map((protocol) => (
                <div 
                  key={protocol.id} 
                  className="bg-zinc-900/60 border border-white/5 rounded-xl overflow-hidden"
                >
                  {/* Protocol Row */}
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => toggleExpand(protocol.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${protocol.color} flex items-center justify-center`}>
                        <span className="text-white text-xs font-bold">{protocol.icon}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{protocol.name}</span>
                          <span className="material-icons-outlined text-slate-500 text-[14px]">open_in_new</span>
                        </div>
                        <span className="text-[11px] text-slate-500">{protocol.apr.toFixed(2)}% APR</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Expand indicator */}
                      <span className={`material-icons-outlined text-slate-500 text-sm transition-transform ${expandedProtocol === protocol.id ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                      
                      {/* Toggle Switch */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleProtocol(protocol.id);
                        }}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          protocol.enabled ? 'bg-primary' : 'bg-zinc-700'
                        }`}
                      >
                        <div 
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform ${
                            protocol.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Config */}
                  {expandedProtocol === protocol.id && (
                    <div className="px-4 pb-4 pt-2 border-t border-white/5 space-y-4 animate-fade-in">
                      {/* Max Allocation */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[11px] text-slate-400">Max Allocation</span>
                          <span className="text-[11px] text-primary font-mono">{protocol.maxAllocation}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={protocol.maxAllocation}
                          onChange={(e) => updateProtocolConfig(protocol.id, 'maxAllocation', Number(e.target.value))}
                          className="w-full h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-primary"
                        />
                      </div>

                      {/* Min APR */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[11px] text-slate-400">Min APR Threshold</span>
                          <span className="text-[11px] text-primary font-mono">{protocol.minAPR.toFixed(1)}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="10" 
                          step="0.1"
                          value={protocol.minAPR}
                          onChange={(e) => updateProtocolConfig(protocol.id, 'minAPR', Number(e.target.value))}
                          className="w-full h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-primary"
                        />
                      </div>

                      {/* Min TVL */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[11px] text-slate-400">Min TVL (Millions)</span>
                          <span className="text-[11px] text-primary font-mono">${protocol.minTVL}M</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="500" 
                          step="10"
                          value={protocol.minTVL}
                          onChange={(e) => updateProtocolConfig(protocol.id, 'minTVL', Number(e.target.value))}
                          className="w-full h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Info Note */}
            <div className="mt-6 bg-zinc-900/40 border border-white/5 rounded-xl p-4 flex gap-3">
              <span className="material-icons-outlined text-slate-500 text-sm mt-0.5">info</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Note: the more protocols are enabled, the more <span className="text-primary">performant</span> the agent will be. ({enabledProtocolsCount} enabled)
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setStep(1)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl transition-all"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(3)}
                className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold py-4 rounded-xl transition-all"
              >
                Continue
              </button>
            </div>

            <DepositLaterLink />
          </>
        )}

        {/* Step 3: Activate Agent */}
        {step === 3 && (
          <>
            <h1 className="text-2xl font-semibold mb-2 font-display">Activate Your Agent</h1>
            <p className="text-slate-500 text-sm mb-8">Review your configuration and activate your autonomous agent.</p>
            
            <div className="space-y-4">
              {/* Summary Card */}
              <div className="bg-zinc-900/50 p-6 rounded-2xl border border-border-dark">
                <div className="flex justify-between mb-4 pb-4 border-b border-border-dark">
                  <span className="text-slate-400">Deposit Amount</span>
                  <span className="font-bold text-primary font-mono">{amount} USDC</span>
                </div>
                <div className="flex justify-between mb-4 pb-4 border-b border-border-dark">
                  <span className="text-slate-400">Enabled Protocols</span>
                  <span className="font-bold text-white">{enabledProtocolsCount} protocols</span>
                </div>
                <div className="flex justify-between mb-4 pb-4 border-b border-border-dark">
                  <span className="text-slate-400">Agent Address</span>
                  <span className="font-mono text-xs text-white">{MOCK_AGENT_WALLET.slice(0, 10)}...{MOCK_AGENT_WALLET.slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Network</span>
                  <span className="font-medium text-white">Base</span>
                </div>
              </div>

              {/* Info Banner */}
              <div className="flex items-start space-x-3 bg-primary/5 border border-primary/20 p-4 rounded-xl">
                <span className="material-icons-outlined text-primary text-xl mt-0.5">info</span>
                <div className="text-xs leading-relaxed text-slate-300">
                  Clicking &quot;Activate Agent&quot; will transfer <span className="text-primary font-bold">{amount} USDC</span> to your agent wallet and start yield optimization.
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4 mt-4">
                <button 
                  onClick={() => setStep(2)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl transition-all"
                >
                  Back
                </button>
                <button 
                  onClick={handleDeposit}
                  disabled={loading || !authenticated}
                  className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin material-icons-outlined">refresh</span>
                      Processing...
                    </>
                  ) : 'Activate Agent'}
                </button>
              </div>

              <DepositLaterLink />
            </div>
          </>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="text-center space-y-8 py-8 animate-fade-in">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-icons-outlined text-primary text-4xl">check_circle</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2 font-display">Agent Activated!</h2>
              <p className="text-slate-400">Your funds are now managed by your Path Agent on-chain.</p>
            </div>
            
            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-border-dark text-left">
              <div className="flex justify-between mb-4">
                <span className="text-slate-400">Total Managed</span>
                <span className="font-bold text-primary font-mono">{amount} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Agent Address</span>
                <span className="font-mono text-xs">{MOCK_AGENT_WALLET.slice(0, 10)}...{MOCK_AGENT_WALLET.slice(-4)}</span>
              </div>
            </div>

            <button 
              onClick={handleActivate}
              className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-5 rounded-2xl text-xl transition-all font-display"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
