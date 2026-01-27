// ===== Wallet Types =====
export interface EOAWallet {
  address: string;
  isConnected: boolean;
}

export interface AgentWallet {
  address: string;
  virtualBalance: number; // USDC 余额 (6 decimals 标准化后的数值)
}

export type DepositStatus = 'idle' | 'pending' | 'confirming' | 'success' | 'failed';

export interface PendingDeposit {
  amount: number;
  txHash: string;
  status: DepositStatus;
}

export interface WalletState {
  eoaWallet: EOAWallet;
  agentWallet: AgentWallet;
  pendingDeposit: PendingDeposit;
}

// ===== Strategy Types =====
export interface Protocol {
  id: string;
  name: string;
  apr: number; // 年化收益率百分比，如 5.5 表示 5.5%
  allocation: number; // 分配百分比，如 30 表示 30%
  tvl: number; // Total Value Locked (USD)
  icon: string; // 图标 URL 或标识
  color: string; // 品牌色
}

export interface StrategyState {
  protocols: Protocol[];
  totalEarnings: number; // 累计收益 (USDC)
  isAutoRebalancing: boolean;
  lastRebalanceTime: number; // Unix timestamp
  rebalanceHistory: RebalanceEvent[];
}

export interface RebalanceEvent {
  id: string;
  fromProtocol: string;
  toProtocol: string;
  amount: number;
  reason: string;
  timestamp: number;
}

// ===== Contract Types (Type-safe) =====
export interface TransferParams {
  to: `0x${string}`;
  amount: bigint;
}

// ===== UI Types =====
export interface DepositFormValues {
  amount: string;
}

// ===== API Response Types =====
export interface MockAPIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
