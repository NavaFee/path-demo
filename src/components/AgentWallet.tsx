'use client';

import { useAppSelector } from '@/hooks/useRedux';
import { displayUSDC } from '@/utils/usdcContract';
import { WalletOutlined, RiseOutlined } from '@ant-design/icons';
import styles from './AgentWallet.module.scss';

export default function AgentWallet() {
  const { agentWallet } = useAppSelector((state) => state.wallet);
  const { totalEarnings, protocols } = useAppSelector((state) => state.strategy);

  // 计算加权平均 APR
  const weightedAPR = protocols.reduce((acc, protocol) => {
    return acc + (protocol.apr * protocol.allocation) / 100;
  }, 0);

  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className={`${styles.card} glass-card`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <WalletOutlined className={styles.icon} />
          <span>Agent Wallet</span>
        </div>
        <span className={styles.badge}>Mock AA</span>
      </div>

      <div className={styles.address}>
        {formatAddress(agentWallet.address)}
      </div>

      <div className={styles.balance}>
        <span className={styles.label}>Total Balance</span>
        <span className={styles.value}>{displayUSDC(agentWallet.virtualBalance)}</span>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>
            <RiseOutlined /> APR
          </span>
          <span className={styles.statValue}>{weightedAPR.toFixed(2)}%</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Earnings</span>
          <span className={`${styles.statValue} ${styles.earnings}`}>
            +{displayUSDC(totalEarnings)}
          </span>
        </div>
      </div>
    </div>
  );
}
