/**
 * Asset Icons Configuration
 * ==========================
 * 
 * 如何替换图标：
 * 1. 将图标文件放入 /public/icons/ 目录
 * 2. 更新下方对应的路径为 '/icons/your-icon.svg'
 * 3. 或者使用外部 CDN URL
 * 
 * 目录结构建议：
 * public/
 * ├── icons/
 * │   ├── tokens/       # 代币图标
 * │   │   ├── usdc.svg
 * │   │   ├── eth.svg
 * │   │   └── ...
 * │   ├── protocols/    # 协议图标
 * │   │   ├── aave.svg
 * │   │   ├── compound.svg
 * │   │   └── ...
 * │   ├── chains/       # 链图标
 * │   │   ├── base.svg
 * │   │   ├── ethereum.svg
 * │   │   └── ...
 * │   └── logo/         # 项目 Logo
 * │       ├── path-logo.svg
 * │       └── path-logo-full.svg
 */

// ============================================
// 代币 (Tokens) 图标
// ============================================
export const TOKEN_ICONS = {
  USDC: '/icons/tokens/usdc.svg',
  ETH: '/icons/tokens/eth.svg',
  WETH: '/icons/tokens/weth.svg',
  USDT: '/icons/tokens/usdt.svg',
  DAI: '/icons/tokens/dai.svg',
  WBTC: '/icons/tokens/wbtc.svg',
} as const;

// CDN 备选方案（如果本地图标不可用）
export const TOKEN_ICONS_CDN = {
  USDC: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg',
  ETH: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  WETH: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  USDT: 'https://cryptologos.cc/logos/tether-usdt-logo.svg',
  DAI: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg',
  WBTC: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.svg',
} as const;

// ============================================
// 协议 (Protocols) 图标
// ============================================
export const PROTOCOL_ICONS = {
  AAVE: '/icons/protocols/aave.svg',
  COMPOUND: '/icons/protocols/compound.svg',
  EULER: '/icons/protocols/euler.svg',
  FLUID: '/icons/protocols/fluid.svg',
  MOONWELL: '/icons/protocols/moonwell.svg',
  MORPHO: '/icons/protocols/morpho.svg',
  UNISWAP: '/icons/protocols/uniswap.svg',
  CURVE: '/icons/protocols/curve.svg',
} as const;

// CDN 备选方案
export const PROTOCOL_ICONS_CDN = {
  AAVE: 'https://cryptologos.cc/logos/aave-aave-logo.svg',
  COMPOUND: 'https://cryptologos.cc/logos/compound-comp-logo.svg',
  EULER: 'https://assets.coingecko.com/coins/images/26149/standard/euler.png',
  FLUID: 'https://assets.coingecko.com/coins/images/35285/standard/fluid.png',
  MOONWELL: 'https://assets.coingecko.com/coins/images/26133/standard/WELL.png',
  MORPHO: 'https://assets.coingecko.com/coins/images/29837/standard/Morpho-token-icon.png?1726771230',
  UNISWAP: 'https://cryptologos.cc/logos/uniswap-uni-logo.svg',
  CURVE: 'https://cryptologos.cc/logos/curve-dao-token-crv-logo.svg',
} as const;

// ============================================
// 链 (Chains) 图标
// ============================================
export const CHAIN_ICONS = {
  BASE: '/icons/chains/base.svg',
  ETHEREUM: '/icons/chains/ethereum.svg',
  ARBITRUM: '/icons/chains/arbitrum.svg',
  OPTIMISM: '/icons/chains/optimism.svg',
  POLYGON: '/icons/chains/polygon.svg',
} as const;

// CDN 备选方案
export const CHAIN_ICONS_CDN = {
  BASE: 'https://raw.githubusercontent.com/base/brand-kit/main/logo/TheSquare/Digital/Base_square_blue.svg',
  ETHEREUM: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  ARBITRUM: 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg',
  OPTIMISM: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.svg',
  POLYGON: 'https://cryptologos.cc/logos/polygon-matic-logo.svg',
} as const;

// ============================================
// 项目 Logo
// ============================================
export const PROJECT_LOGO = {
  ICON: '/icons/logo/path-icon.svg',       // 小图标
  FULL: '/icons/logo/path-logo-full.svg',  // 完整 Logo
  WORDMARK: '/icons/logo/path-wordmark.svg', // 文字标识
} as const;

// ============================================
// 工具函数
// ============================================

/**
 * 获取代币图标，优先使用本地图标，失败时回退到 CDN
 */
export function getTokenIcon(token: keyof typeof TOKEN_ICONS): string {
  return TOKEN_ICONS[token] || TOKEN_ICONS_CDN[token] || '';
}

/**
 * 获取协议图标
 */
export function getProtocolIcon(protocol: keyof typeof PROTOCOL_ICONS): string {
  return PROTOCOL_ICONS[protocol] || PROTOCOL_ICONS_CDN[protocol] || '';
}

/**
 * 获取链图标
 */
export function getChainIcon(chain: keyof typeof CHAIN_ICONS): string {
  return CHAIN_ICONS[chain] || CHAIN_ICONS_CDN[chain] || '';
}

// ============================================
// 协议配置（带图标）- 供 DepositPage/PersonalizationSidebar 使用
// ============================================
export interface ProtocolInfo {
  id: string;
  name: string;
  icon: string;      // 图标路径
  iconFallback: string; // 备用图标（字母）
  color: string;     // 背景色（当图标加载失败时使用）
  apr: number;
  enabled: boolean;
  maxAllocation: number;
  minAPR: number;
  minTVL: number;
}

export const PROTOCOLS: ProtocolInfo[] = [
  { 
    id: 'aave', 
    name: 'AAVE', 
    icon: 'https://cryptologos.cc/logos/aave-aave-logo.svg',
    iconFallback: 'A',
    color: 'bg-cyan-500', 
    apr: 3.79, 
    enabled: true, 
    maxAllocation: 40, 
    minAPR: 2.0, 
    minTVL: 100 
  },
  { 
    id: 'compound', 
    name: 'Compound', 
    icon: 'https://cryptologos.cc/logos/compound-comp-logo.svg',
    iconFallback: 'C',
    color: 'bg-green-500', 
    apr: 3.21, 
    enabled: true, 
    maxAllocation: 35, 
    minAPR: 2.5, 
    minTVL: 80 
  },
  { 
    id: 'euler', 
    name: 'Euler USDC', 
    icon: '/icons/protocols/euler.svg',
    iconFallback: 'E',
    color: 'bg-blue-600', 
    apr: 2.85, 
    enabled: true, 
    maxAllocation: 30, 
    minAPR: 2.0, 
    minTVL: 50 
  },
  { 
    id: 'fluid', 
    name: 'Fluid', 
    icon: 'https://assets.coingecko.com/coins/images/14688/standard/Logo_1_%28brighter%29.png?1734430693',
    iconFallback: 'F',
    color: 'bg-purple-500', 
    apr: 3.86, 
    enabled: true, 
    maxAllocation: 25, 
    minAPR: 3.0, 
    minTVL: 30 
  },
  { 
    id: 'moonwell', 
    name: 'Moonwell', 
    icon: 'https://assets.coingecko.com/coins/images/26133/standard/WELL.png',
    iconFallback: 'M',
    color: 'bg-indigo-500', 
    apr: 2.94, 
    enabled: true, 
    maxAllocation: 30, 
    minAPR: 2.0, 
    minTVL: 40 
  },
  { 
    id: 'morpho-gauntlet', 
    name: 'Morpho Gauntlet USDC Prime', 
    icon: 'https://assets.coingecko.com/coins/images/29837/standard/Morpho-token-icon.png?1726771230',
    iconFallback: 'MG',
    color: 'bg-blue-500', 
    apr: 4.35, 
    enabled: true, 
    maxAllocation: 40, 
    minAPR: 3.5, 
    minTVL: 100 
  },
  { 
    id: 'morpho-moonwell', 
    name: 'Morpho Moonwell Flagship USDC', 
    icon: 'https://assets.coingecko.com/coins/images/29837/standard/Morpho-token-icon.png?1726771230',
    iconFallback: 'MM',
    color: 'bg-blue-500', 
    apr: 4.40, 
    enabled: true, 
    maxAllocation: 35, 
    minAPR: 3.0, 
    minTVL: 80 
  },
  { 
    id: 'morpho-seamless', 
    name: 'Morpho Seamless USDC Vault', 
    icon: 'https://assets.coingecko.com/coins/images/29837/standard/Morpho-token-icon.png?1726771230',
    iconFallback: 'MS',
    color: 'bg-blue-500', 
    apr: 3.93, 
    enabled: true, 
    maxAllocation: 30, 
    minAPR: 2.5, 
    minTVL: 60 
  },
  { 
    id: 'morpho-steakhouse', 
    name: 'Morpho Steakhouse USDC', 
    icon: 'https://assets.coingecko.com/coins/images/29837/standard/Morpho-token-icon.png?1726771230',
    iconFallback: 'MSt',
    color: 'bg-blue-500', 
    apr: 3.26, 
    enabled: false, 
    maxAllocation: 25, 
    minAPR: 2.0, 
    minTVL: 50 
  },
];
