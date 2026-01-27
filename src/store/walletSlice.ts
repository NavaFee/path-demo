import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { WalletState, DepositStatus } from '@/types';

// Agent Wallet 默认地址
const AGENT_WALLET_ADDRESS = process.env.NEXT_PUBLIC_AGENT_WALLET_ADDRESS || '0xDA20fE7B606E04d8b4b978012094C4f672d82C2B';

const initialState: WalletState = {
  eoaWallet: {
    address: '',
    isConnected: false,
  },
  agentWallet: {
    address: AGENT_WALLET_ADDRESS,
    virtualBalance: 0,
  },
  pendingDeposit: {
    amount: 0,
    txHash: '',
    status: 'idle',
  },
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    // EOA 钱包连接
    setEOAConnected: (state, action: PayloadAction<{ address: string; isConnected: boolean }>) => {
      state.eoaWallet.address = action.payload.address;
      state.eoaWallet.isConnected = action.payload.isConnected;
    },

    // 断开连接
    disconnectEOA: (state) => {
      state.eoaWallet.address = '';
      state.eoaWallet.isConnected = false;
    },

    // 设置存款状态
    setDepositStatus: (state, action: PayloadAction<{ status: DepositStatus; txHash?: string; amount?: number }>) => {
      state.pendingDeposit.status = action.payload.status;
      if (action.payload.txHash) {
        state.pendingDeposit.txHash = action.payload.txHash;
      }
      if (action.payload.amount !== undefined) {
        state.pendingDeposit.amount = action.payload.amount;
      }
    },

    // 存款成功后增加虚拟余额
    addVirtualBalance: (state, action: PayloadAction<number>) => {
      state.agentWallet.virtualBalance += action.payload;
      // 重置 pending 状态
      state.pendingDeposit = {
        amount: 0,
        txHash: '',
        status: 'idle',
      };
    },

    // 设置虚拟余额（用于收益累加）
    setVirtualBalance: (state, action: PayloadAction<number>) => {
      state.agentWallet.virtualBalance = action.payload;
    },

    // 重置存款状态
    resetDeposit: (state) => {
      state.pendingDeposit = {
        amount: 0,
        txHash: '',
        status: 'idle',
      };
    },
  },
});

export const {
  setEOAConnected,
  disconnectEOA,
  setDepositStatus,
  addVirtualBalance,
  setVirtualBalance,
  resetDeposit,
} = walletSlice.actions;

export default walletSlice.reducer;
