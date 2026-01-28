import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { StrategyState, Protocol, RebalanceEvent } from '@/types';
import { PROTOCOLS as ICON_PROTOCOLS } from '@/config/icons';

// 获取协议图标的辅助函数
const getProtocolIcon = (id: string, fallback: string): string => {
  const protocol = ICON_PROTOCOLS.find((p) => p.id === id || p.id.includes(id) || p.name.toLowerCase().includes(id));
  return protocol?.icon || fallback;
};

// 初始协议配置
const initialProtocols: Protocol[] = [
  {
    id: 'aave',
    name: 'Aave V3',
    apr: 4.2,
    allocation: 40,
    tvl: 1200000000,
    icon: getProtocolIcon('aave', 'https://cryptologos.cc/logos/aave-aave-logo.svg'),
    color: '#B6509E',
  },
  {
    id: 'compound',
    name: 'Compound',
    apr: 3.8,
    allocation: 35,
    tvl: 850000000,
    icon: getProtocolIcon('compound', 'https://cryptologos.cc/logos/compound-comp-logo.svg'),
    color: '#00D395',
  },
  {
    id: 'morpho',
    name: 'Morpho Blue',
    apr: 5.1,
    allocation: 25,
    tvl: 420000000,
    icon: getProtocolIcon('morpho', 'https://assets.coingecko.com/coins/images/29837/standard/Morpho-token-icon.png?1726771230'),
    color: '#4B82FF',
  },
];

const initialState: StrategyState = {
  protocols: initialProtocols,
  totalEarnings: 0,
  isAutoRebalancing: true,
  lastRebalanceTime: Date.now(),
  rebalanceHistory: [],
};

const strategySlice = createSlice({
  name: 'strategy',
  initialState,
  reducers: {
    // 更新单个协议的 APR
    updateProtocolAPR: (state, action: PayloadAction<{ protocolId: string; apr: number }>) => {
      const protocol = state.protocols.find((p) => p.id === action.payload.protocolId);
      if (protocol) {
        protocol.apr = action.payload.apr;
      }
    },

    // 批量更新所有协议 APR（模拟市场波动）
    simulateAPRFluctuation: (state) => {
      state.protocols.forEach((protocol) => {
        // 随机波动 -0.5% 到 +0.5%
        const fluctuation = (Math.random() - 0.5) * 1;
        protocol.apr = Math.max(0.5, Math.min(15, protocol.apr + fluctuation));
        protocol.apr = Math.round(protocol.apr * 100) / 100;
      });
    },

    // 执行再平衡
    rebalance: (state, action: PayloadAction<{ fromId: string; toId: string; percentage: number }>) => {
      const { fromId, toId, percentage } = action.payload;
      const fromProtocol = state.protocols.find((p) => p.id === fromId);
      const toProtocol = state.protocols.find((p) => p.id === toId);

      if (fromProtocol && toProtocol && fromProtocol.allocation >= percentage) {
        fromProtocol.allocation -= percentage;
        toProtocol.allocation += percentage;
        state.lastRebalanceTime = Date.now();

        // 记录再平衡历史
        const event: RebalanceEvent = {
          id: `rb-${Date.now()}`,
          fromProtocol: fromProtocol.name,
          toProtocol: toProtocol.name,
          amount: percentage,
          reason: `APR optimization: ${fromProtocol.name} (${fromProtocol.apr}%) → ${toProtocol.name} (${toProtocol.apr}%)`,
          timestamp: Date.now(),
        };
        state.rebalanceHistory.unshift(event);

        // 保留最近 10 条记录
        if (state.rebalanceHistory.length > 10) {
          state.rebalanceHistory = state.rebalanceHistory.slice(0, 10);
        }
      }
    },

    // 自动再平衡逻辑：将资金从低 APR 转移到高 APR
    autoRebalance: (state) => {
      if (!state.isAutoRebalancing) return;

      // 找到 APR 最高和最低的协议
      const sortedByAPR = [...state.protocols].sort((a, b) => b.apr - a.apr);
      const highest = sortedByAPR[0];
      const lowest = sortedByAPR[sortedByAPR.length - 1];

      // 如果差异超过 1%，执行再平衡
      if (highest && lowest && highest.apr - lowest.apr > 1 && lowest.allocation >= 5) {
        lowest.allocation -= 5;
        highest.allocation += 5;
        state.lastRebalanceTime = Date.now();

        const event: RebalanceEvent = {
          id: `rb-${Date.now()}`,
          fromProtocol: lowest.name,
          toProtocol: highest.name,
          amount: 5,
          reason: `Auto-rebalance: ${lowest.name} (${lowest.apr}%) → ${highest.name} (${highest.apr}%)`,
          timestamp: Date.now(),
        };
        state.rebalanceHistory.unshift(event);

        if (state.rebalanceHistory.length > 10) {
          state.rebalanceHistory = state.rebalanceHistory.slice(0, 10);
        }
      }
    },

    // 累加收益
    addEarnings: (state, action: PayloadAction<number>) => {
      state.totalEarnings += action.payload;
      state.totalEarnings = Math.round(state.totalEarnings * 1000000) / 1000000;
    },

    // 切换自动再平衡
    toggleAutoRebalancing: (state) => {
      state.isAutoRebalancing = !state.isAutoRebalancing;
    },

    // 重置策略
    resetStrategy: () => initialState,
  },
});

export const {
  updateProtocolAPR,
  simulateAPRFluctuation,
  rebalance,
  autoRebalance,
  addEarnings,
  toggleAutoRebalancing,
  resetStrategy,
} = strategySlice.actions;

export default strategySlice.reducer;
