'use client';

import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { toggleAutoRebalancing } from '@/store/strategySlice';
import { displayUSDC } from '@/utils/usdcContract';
import { 
  RiseOutlined, 
  SwapOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';
import { Switch } from 'antd';
import styles from './Strategy.module.scss';

export default function Strategy() {
  const dispatch = useAppDispatch();
  const { protocols, isAutoRebalancing, lastRebalanceTime, rebalanceHistory } = useAppSelector(
    (state) => state.strategy
  );
  const { agentWallet } = useAppSelector((state) => state.wallet);

  const formatTime = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getAPRColor = (apr: number): string => {
    if (apr >= 5) return '#10B981'; // 高收益 - 绿色
    if (apr >= 3) return '#F59E0B'; // 中等 - 金色
    return '#EF4444'; // 低 - 红色
  };

  return (
    <div className={styles.container}>
      {/* 策略控制面板 */}
      <div className={`${styles.controlPanel} glass-card`}>
        <div className={styles.controlHeader}>
          <h3>
            <SwapOutlined /> Auto-Rebalance
          </h3>
          <Switch
            checked={isAutoRebalancing}
            onChange={() => dispatch(toggleAutoRebalancing())}
            className={styles.switch}
          />
        </div>
        <p className={styles.controlDesc}>
          Automatically reallocate funds to the highest-yielding protocol
        </p>
        <div className={styles.lastRebalance}>
          <ClockCircleOutlined />
          <span>Last rebalance: {formatTime(lastRebalanceTime)}</span>
        </div>
      </div>

      {/* 协议分配 */}
      <div className={`${styles.protocolsCard} glass-card`}>
        <h3 className={styles.sectionTitle}>Protocol Allocation</h3>
        <div className={styles.protocols}>
          {protocols.map((protocol) => {
            const allocatedAmount = (agentWallet.virtualBalance * protocol.allocation) / 100;
            return (
              <div key={protocol.id} className={styles.protocol}>
                <div className={styles.protocolHeader}>
                  <div className={styles.protocolInfo}>
                    <div
                      className={styles.protocolIcon}
                      style={{ backgroundColor: protocol.color }}
                    >
                      {protocol.name.charAt(0)}
                    </div>
                    <div>
                      <span className={styles.protocolName}>{protocol.name}</span>
                      <span className={styles.protocolTVL}>
                        TVL: ${(protocol.tvl / 1e9).toFixed(2)}B
                      </span>
                    </div>
                  </div>
                  <div className={styles.protocolAPR} style={{ color: getAPRColor(protocol.apr) }}>
                    <RiseOutlined />
                    {protocol.apr.toFixed(2)}%
                  </div>
                </div>

                <div className={styles.allocationBar}>
                  <div
                    className={styles.allocationFill}
                    style={{
                      width: `${protocol.allocation}%`,
                      backgroundColor: protocol.color,
                    }}
                  />
                </div>

                <div className={styles.protocolFooter}>
                  <span className={styles.allocation}>{protocol.allocation}% allocated</span>
                  <span className={styles.amount}>{displayUSDC(allocatedAmount)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 再平衡历史 */}
      {rebalanceHistory.length > 0 && (
        <div className={`${styles.historyCard} glass-card`}>
          <h3 className={styles.sectionTitle}>Rebalance History</h3>
          <div className={styles.history}>
            {rebalanceHistory.slice(0, 5).map((event) => (
              <div key={event.id} className={styles.historyItem}>
                <div className={styles.historyIcon}>
                  <CheckCircleOutlined />
                </div>
                <div className={styles.historyContent}>
                  <span className={styles.historyAction}>
                    {event.fromProtocol} → {event.toProtocol}
                  </span>
                  <span className={styles.historyTime}>{formatTime(event.timestamp)}</span>
                </div>
                <span className={styles.historyAmount}>+{event.amount}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
