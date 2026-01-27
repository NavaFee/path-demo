/**
 * Base Chain USDC 合约配置
 * Type-safe ERC20 ABI for viem
 */

// Base Mainnet USDC 地址
export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;

// USDC Decimals
export const USDC_DECIMALS = 6 as const;

// Base Chain ID
export const BASE_CHAIN_ID = 8453 as const;

// ERC20 标准 ABI (仅包含需要的方法)
export const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  // Events
  {
    name: 'Transfer',
    type: 'event',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'Approval',
    type: 'event',
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'spender', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
  },
] as const;

/**
 * 将 USDC 数量转换为 Wei (6 decimals)
 */
export function parseUSDC(amount: string | number): bigint {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return BigInt(Math.floor(numAmount * 10 ** USDC_DECIMALS));
}

/**
 * 将 Wei 转换为 USDC 数量 (6 decimals)
 */
export function formatUSDC(wei: bigint): number {
  return Number(wei) / 10 ** USDC_DECIMALS;
}

/**
 * 格式化显示 USDC 金额
 */
export function displayUSDC(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(amount);
}
