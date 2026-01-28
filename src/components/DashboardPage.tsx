'use client';

import { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { createPublicClient, createWalletClient, custom, http, formatUnits, parseUnits } from 'viem';
import { base } from 'viem/chains';
import { USDC_ADDRESS, ERC20_ABI } from '@/utils/usdcContract';

import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { setDepositStatus, addVirtualBalance, resetDeposit } from '@/store/walletSlice';
import { toggleAutoRebalancing, simulateAPRFluctuation, autoRebalance, addEarnings } from '@/store/strategySlice';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { PROTOCOLS as ICON_PROTOCOLS } from '@/config/icons';
import IconImage from './IconImage';


// 协议配置（带图标URL）
const PROTOCOLS = [
  { id: 'morpho-gauntlet', name: 'Morpho', description: 'Institutional Vault', icon: 'https://assets.coingecko.com/coins/images/29837/standard/Morpho-token-icon.png?1726771230', iconFallback: 'M', color: 'bg-blue-600' },
  { id: 'aave', name: 'Aave V3', description: 'Lending Market', icon: 'https://cryptologos.cc/logos/aave-aave-logo.svg', iconFallback: 'A', color: 'bg-purple-600' },
  { id: 'moonwell', name: 'Moonwell', description: 'Base Native', icon: 'https://assets.coingecko.com/coins/images/26133/standard/WELL.png', iconFallback: 'MW', color: 'bg-indigo-600' },
  { id: 'euler', name: 'Euler', description: 'Modular Lending', icon: '/icons/protocols/euler.svg', iconFallback: 'E', color: 'bg-cyan-600' },
  { id: 'compound', name: 'Compound', description: 'DeFi Lending', icon: 'https://cryptologos.cc/logos/compound-comp-logo.svg', iconFallback: 'C', color: 'bg-green-500' },
];

// Mock 数据
const MOCK_DEPOSITED = 100; // 总存款 100 USDC
const MOCK_EARNINGS = 0.1;  // 收益 0.1 USDC
const MOCK_TOTAL_BALANCE = MOCK_DEPOSITED + MOCK_EARNINGS; // 总余额 100.1 USDC
const MOCK_AGENT_WALLET = '0xDA20fE7B606E04d8b4b978012094C4f672d82C2B';

// Mock 执行历史数据 (5 条) - 扩展结构
const MOCK_EXECUTION_HISTORY = [
  {
    id: 'rb-1',
    title: 'Position reallocated to higher-yield lending market',
    subtitle: '10.10 USDC reallocated to 4.38% lending yield',
    fromProtocol: 'Morpho',
    fromSymbol: 'M',
    fromIcon: 'https://assets.coingecko.com/coins/images/29837/standard/Morpho-token-icon.png?1726771230',
    fromColor: 'bg-blue-600',
    fromAmount: 10.1009,
    fromApr: 4.29,
    fromTxHash: '0x1234...5678',
    toProtocol: 'Moonwell',
    toSymbol: 'MW',
    toIcon: 'https://assets.coingecko.com/coins/images/26133/standard/WELL.png',
    toColor: 'bg-purple-600',
    toAmount: 10.1009,
    toApr: 4.38,
    toTxHash: '0xabcd...ef01',
    timestamp: Date.now() - 1000 * 60 * 30,
  },
  {
    id: 'rb-2',
    title: 'Position allocated to the best available lending market',
    subtitle: '10.10 USDC allocated to 4.26% lending yield',
    fromProtocol: 'Aave V3',
    fromSymbol: 'A',
    fromIcon: 'https://cryptologos.cc/logos/aave-aave-logo.svg',
    fromColor: 'bg-purple-500',
    fromAmount: 10.10,
    fromApr: 3.85,
    fromTxHash: '0x2345...6789',
    toProtocol: 'Morpho',
    toSymbol: 'M',
    toIcon: 'https://assets.coingecko.com/coins/images/29837/standard/Morpho-token-icon.png?1726771230',
    toColor: 'bg-blue-600',
    toAmount: 10.10,
    toApr: 4.26,
    toTxHash: '0xbcde...f012',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: 'rb-3',
    title: 'Position reallocated to higher-yield lending market',
    subtitle: '15.50 USDC reallocated to 5.12% lending yield',
    fromProtocol: 'Euler',
    fromSymbol: 'E',
    fromIcon: '/icons/protocols/euler.svg',
    fromColor: 'bg-cyan-600',
    fromAmount: 15.50,
    fromApr: 3.21,
    fromTxHash: '0x3456...7890',
    toProtocol: 'Aave V3',
    toSymbol: 'A',
    toIcon: 'https://cryptologos.cc/logos/aave-aave-logo.svg',
    toColor: 'bg-purple-500',
    toAmount: 15.50,
    toApr: 5.12,
    toTxHash: '0xcdef...0123',
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
  },
  {
    id: 'rb-4',
    title: 'Position allocated to the best available lending market',
    subtitle: '25.00 USDC allocated to 6.45% lending yield',
    fromProtocol: 'Moonwell',
    fromSymbol: 'MW',
    fromIcon: 'https://assets.coingecko.com/coins/images/26133/standard/WELL.png',
    fromColor: 'bg-purple-600',
    fromAmount: 25.00,
    fromApr: 4.80,
    fromTxHash: '0x4567...8901',
    toProtocol: 'Morpho',
    toSymbol: 'M',
    toIcon: 'https://assets.coingecko.com/coins/images/29837/standard/Morpho-token-icon.png?1726771230',
    toColor: 'bg-blue-600',
    toAmount: 25.00,
    toApr: 6.45,
    toTxHash: '0xdef0...1234',
    timestamp: Date.now() - 1000 * 60 * 60 * 12,
  },
  {
    id: 'rb-5',
    title: 'Position reallocated to higher-yield lending market',
    subtitle: '20.00 USDC reallocated to 7.21% lending yield',
    fromProtocol: 'Compound',
    fromSymbol: 'C',
    fromIcon: 'https://cryptologos.cc/logos/compound-comp-logo.svg',
    fromColor: 'bg-green-500',
    fromAmount: 20.00,
    fromApr: 3.80,
    fromTxHash: '0x5678...9012',
    toProtocol: 'Morpho',
    toSymbol: 'M',
    toIcon: 'https://assets.coingecko.com/coins/images/29837/standard/Morpho-token-icon.png?1726771230',
    toColor: 'bg-blue-600',
    toAmount: 20.00,
    toApr: 7.21,
    toTxHash: '0xef01...2345',
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
  },
];

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { agentWallet, eoaWallet } = useAppSelector((state) => state.wallet);
  const { protocols, isAutoRebalancing, totalEarnings, rebalanceHistory } = useAppSelector((state) => state.strategy);
  const [activeTab, setActiveTab] = useState('Position Value');

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({ 'default-1': true });
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [eoaBalance, setEoaBalance] = useState('0.00');
  const [isDepositing, setIsDepositing] = useState(false);
  const { wallets } = useWallets();

  // Fetch EOA Balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!eoaWallet.isConnected || !eoaWallet.address || !showAddFundsModal) return;

      try {
        const publicClient = createPublicClient({
          chain: base,
          transport: http()
        });

        const balance = await publicClient.readContract({
          address: USDC_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [eoaWallet.address as `0x${string}`],
        });

        setEoaBalance(formatUnits(balance, 6));
      } catch (error) {
        console.error('Failed to fetch balance:', error);
        setEoaBalance('0.00');
      }
    };

    fetchBalance();
  }, [eoaWallet.address, eoaWallet.isConnected, showAddFundsModal]);

  const handleDeposit = async () => {
    if (!addFundsAmount || parseFloat(addFundsAmount) <= 0) return;
    
    // 查找外部钱包 (非 embedded wallet)
    const externalWallet = wallets.find((wallet) => wallet.walletClientType !== 'privy');
    if (!externalWallet) {
      alert('Please connect an external wallet first');
      return;
    }

    setIsDepositing(true);
    dispatch(setDepositStatus({ status: 'pending', amount: parseFloat(addFundsAmount) }));

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

      // 使用 6 decimals (USDC 标准)
      const usdcAmount = parseUnits(addFundsAmount, 6);

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
        dispatch(addVirtualBalance(parseFloat(addFundsAmount)));
        dispatch(setDepositStatus({ status: 'success' }));
        setShowAddFundsModal(false);
        setAddFundsAmount('');
        alert('Deposit successful!');
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Deposit error:', error);
      const isUserRejection = 
        error instanceof Error && 
        (error.message.includes('User rejected') || 
         error.message.includes('User denied') ||
         error.message.includes('user rejected'));
      
      if (isUserRejection) {
        dispatch(resetDeposit());
      } else {
        dispatch(setDepositStatus({ status: 'failed' }));
        alert('Deposit failed. Please try again.');
      }
    } finally {
      setIsDepositing(false);
    }
  };

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

  // Position Value 图表数据 - 展示账户余额随时间的变化
  const positionValueData = [
    { name: 'Jan 1', value: 0 },
    { name: 'Jan 5', value: 2.5 },
    { name: 'Jan 10', value: 5.8 },
    { name: 'Jan 15', value: 8.2 },
    { name: 'Jan 20', value: 9.5 },
    { name: 'Jan 25', value: 10.0 },
    { name: 'Jan 30', value: MOCK_TOTAL_BALANCE },
  ];

  // Yield Projection 图表数据 - 展示 APR 预测曲线（基准 100 USDC）
  const yieldProjectionData = [
    { name: 'Jan', totalProjection: 100.10, agentProjection: 100.00 },
    { name: 'Feb', totalProjection: 100.95, agentProjection: 100.35 },
    { name: 'Mar', totalProjection: 101.80, agentProjection: 100.70 },
    { name: 'Apr', totalProjection: 102.70, agentProjection: 101.05 },
    { name: 'May', totalProjection: 103.60, agentProjection: 101.40 },
    { name: 'Jun', totalProjection: 104.55, agentProjection: 101.80 },
    { name: 'Jul', totalProjection: 105.50, agentProjection: 102.15 },
    { name: 'Aug', totalProjection: 106.50, agentProjection: 102.55 },
    { name: 'Sep', totalProjection: 107.50, agentProjection: 102.95 },
    { name: 'Oct', totalProjection: 108.55, agentProjection: 103.35 },
    { name: 'Nov', totalProjection: 109.60, agentProjection: 103.75 },
    { name: 'Dec', totalProjection: 110.70, agentProjection: 104.20 },
  ];

  // Yield Projection 统计数据
  const agentApr = 4.30;
  const swarmApr = 10.70;
  const annualProjection = 15.2;

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
              <button 
                onClick={() => setShowAddFundsModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-background-dark font-black text-xs shadow-[0_0_20px_rgba(163,230,53,0.15)] hover:scale-105 transition-all"
              >
                <span className="material-icons-outlined text-sm">add_box</span>
                Add funds
              </button>
            </div>
          </div>

          {/* 根据 Tab 切换统计信息 */}
          {activeTab === 'Position Value' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-10">
              <div>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-2">Total balance</p>
                <h2 className="text-4xl font-display font-black text-white leading-none">
                  {MOCK_TOTAL_BALANCE.toFixed(2)} <span className="text-xl text-slate-500 font-bold ml-1">USDC</span>
                </h2>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-2">Total deposited</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-slate-300">{MOCK_DEPOSITED.toFixed(2)} USDC</span>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-2">Lifetime earnings</p>
                <div className="flex items-center gap-2">
                  <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-bold">
                    {MOCK_EARNINGS.toFixed(2)} USDC ({((MOCK_EARNINGS / MOCK_DEPOSITED) * 100).toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-10">
              <div>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-2">Agent APR</p>
                <h2 className="text-4xl font-display font-black text-white leading-none">
                  {agentApr.toFixed(2)}%
                </h2>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-2">Swarm Finance APR</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">{swarmApr.toFixed(2)}%</span>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-2">Annual projection</p>
                <div className="flex items-center gap-2">
                  <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                    +{annualProjection.toFixed(2)} USDC per year
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 图表区域 */}
          <div className="h-[280px] w-full">
            {activeTab === 'Position Value' ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={positionValueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="positionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A3E635" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#A3E635" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748b" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                    width={45}
                    tickCount={5}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#18181b', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                    labelStyle={{ color: '#a1a1aa' }}
                    formatter={(value) => [`${Number(value).toFixed(2)} USDC`, 'Value']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#A3E635" 
                    strokeWidth={2}
                    fill="url(#positionGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <>
                {/* 图例 */}
                <div className="flex items-center justify-end gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-sm" />
                    <span className="text-[11px] text-slate-400">Total APR Projection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                    <span className="text-[11px] text-slate-400">Agent APR Projection</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={yieldProjectionData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A3E635" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#A3E635" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="agentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="name" 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `$${v}`}
                      width={45}
                      tickCount={5}
                      domain={['dataMin - 0.5', 'dataMax + 0.5']}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#18181b', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                      labelStyle={{ color: '#a1a1aa' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalProjection" 
                      stroke="#A3E635" 
                      strokeWidth={2}
                      dot={false}
                      name="Total APR"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="agentProjection" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={false}
                      name="Agent APR"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </>
            )}
          </div>

          {/* Yield Projection 的说明文字 */}
          {activeTab === 'Yield Projection' && (
            <p className="text-[10px] text-slate-500 leading-relaxed mt-4">
              Disclosure: Projection assumes 12-month holding period with 15% minimum APR guarantee. Base APR reflects current protocol performance, with GIZA rewards automatically bridging any gap to reach the 15% minimum. Actual results may vary depending on market conditions, protocol performance, and reward availability. Past performance does not guarantee future results.
            </p>
          )}
        </div>

        {/* Execution History */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display text-white">Agent Execution History</h2>
            <div className="flex items-center gap-4">
              <span className="text-[11px] text-slate-500 font-bold uppercase">{MOCK_EXECUTION_HISTORY.length} events</span>
            </div>
          </div>

          <div className="space-y-4">
            {MOCK_EXECUTION_HISTORY.slice(0, 5).map((event, index) => {
              const isExpanded = expandedItems[`event-${index}`];
              return (
                <div key={event.id} className="bg-card-dark/40 border border-white/5 rounded-[20px] overflow-hidden">
                  {/* Header - 可点击展开 */}
                  <div 
                    onClick={() => toggleItem(`event-${index}`)}
                    className={`p-5 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all ${isExpanded ? 'border-b border-white/5' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <span 
                        className="material-icons-outlined text-slate-600 text-[18px] transition-transform duration-300"
                        style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                      >
                        expand_more
                      </span>
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="material-icons-outlined text-primary text-[18px]">account_tree</span>
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-white">{event.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{event.subtitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] font-bold text-white">
                        {new Date(event.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">
                        EXECUTED AT {new Date(event.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}H
                      </p>
                    </div>
                  </div>

                  {/* 展开详情 */}
                  {isExpanded && (
                    <div className="p-5 bg-zinc-900/30">
                      <div className="flex items-center justify-between gap-4">
                        {/* WITHDRAW FROM */}
                        <div className="flex-1">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Withdraw from:</p>
                          <div className="flex items-center gap-3">
                            <IconImage 
                              src={event.fromIcon}
                              fallbackText={event.fromSymbol}
                              fallbackColor={event.fromColor}
                              alt={event.fromProtocol}
                              size={32}
                            />
                            <span className="text-[14px] font-bold text-white">{event.fromAmount.toFixed(4)} USDC</span>
                            <span className="text-[12px] text-slate-400">{event.fromApr}%</span>
                            <button className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded text-[10px] font-bold text-slate-300 transition-colors">
                              <span className="material-icons-outlined text-[12px]">open_in_new</span>
                              TX
                            </button>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex-shrink-0">
                          <span className="material-icons-outlined text-primary text-[20px]">arrow_forward</span>
                        </div>

                        {/* DEPOSIT TO */}
                        <div className="flex-1 text-right">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Deposit to:</p>
                          <div className="flex items-center justify-end gap-3">
                            <IconImage 
                              src={event.toIcon}
                              fallbackText={event.toSymbol}
                              fallbackColor={event.toColor}
                              alt={event.toProtocol}
                              size={32}
                            />
                            <span className="text-[14px] font-bold text-white">{event.toAmount.toFixed(4)} USDC</span>
                            <span className="text-[12px] text-primary font-bold">{event.toApr}%</span>
                            <button className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded text-[10px] font-bold text-slate-300 transition-colors">
                              <span className="material-icons-outlined text-[12px]">open_in_new</span>
                              TX
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        {/* Promo Card */}
        <div className="p-1 rounded-[24px] bg-linear-to-br from-primary/30 to-background-dark border border-white/5 overflow-hidden">
          <div className="p-6 space-y-4 relative">
            <div className="absolute -top-4 -right-4 opacity-40">
              <div className="w-20 h-20 rounded-full border-2 border-primary animate-pulse" />
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
                <span className="text-lg font-black text-white">17.92 <span className="text-slate-500 font-bold">PATH</span></span>
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
              const protoInfo = PROTOCOLS.find(pp => pp.id === protocol.id || pp.name === protocol.name);
              return (
                <div key={protocol.id} className="flex items-center gap-3">
                  <IconImage 
                    src={protoInfo?.icon}
                    fallbackText={protoInfo?.iconFallback || protocol.name[0]}
                    fallbackColor={protoInfo?.color || 'bg-blue-600'}
                    alt={protocol.name}
                    size={32}
                  />
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

      {/* Add Funds Modal */}
      {showAddFundsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            {/* Close Button */}
            <button 
              onClick={() => setShowAddFundsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <span className="material-icons-outlined">close</span>
            </button>

            {/* Header */}
            <div className="mb-6">
              <span className="text-primary text-xs font-bold uppercase tracking-widest">Top Up</span>
              <h2 className="text-xl font-bold text-white mt-1">Add funds to Path Agent</h2>
            </div>

            {/* Input Section */}
            <div className="space-y-4">
              <div className="flex gap-2">
                {/* Token Selector - Fixed Layout */}
                <div className="bg-zinc-800 border border-white/10 rounded-xl p-4 flex flex-col justify-center gap-1 min-w-[140px]">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Using</span>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="material-icons-outlined text-white text-sm">attach_money</span>
                    </div>
                    <span className="font-bold text-white">USDC</span>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="flex-1 bg-zinc-800 border border-white/10 rounded-xl p-4">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Amount</span>
                  <input 
                    type="number"
                    value={addFundsAmount}
                    onChange={(e) => setAddFundsAmount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-transparent text-2xl font-bold text-white outline-none placeholder:text-zinc-600"
                  />
                </div>
              </div>

              {/* Balance Info */}
              <div className="text-right text-sm text-slate-400">
                Balance: <span className="text-white font-medium">{parseFloat(eoaBalance).toFixed(4)} USDC</span>
              </div>

              {/* Submit Button */}
              <button 
                onClick={handleDeposit}
                disabled={!addFundsAmount || parseFloat(addFundsAmount) <= 0 || isDepositing}
                className="w-full bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isDepositing ? (
                  <>
                    <span className="animate-spin material-icons-outlined text-sm">refresh</span>
                    Processing...
                  </>
                ) : 'Add funds'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
