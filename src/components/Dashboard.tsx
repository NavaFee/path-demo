'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { simulateAPRFluctuation, autoRebalance, addEarnings } from '@/store/strategySlice';
import AgentWallet from './AgentWallet';
import Deposit from './Deposit';
import Strategy from './Strategy';
import styles from './Dashboard.module.scss';

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { agentWallet } = useAppSelector((state) => state.wallet);
  const { protocols, isAutoRebalancing } = useAppSelector((state) => state.strategy);

  // 策略模拟引擎
  useEffect(() => {
    // 每 5 秒模拟 APR 波动
    const aprInterval = setInterval(() => {
      dispatch(simulateAPRFluctuation());
    }, 5000);

    // 每 15 秒尝试自动再平衡
    const rebalanceInterval = setInterval(() => {
      if (isAutoRebalancing) {
        dispatch(autoRebalance());
      }
    }, 15000);

    // 每秒计算收益（如果有余额）
    const earningsInterval = setInterval(() => {
      if (agentWallet.virtualBalance > 0) {
        // 计算加权平均 APR
        const weightedAPR = protocols.reduce((acc, protocol) => {
          return acc + (protocol.apr * protocol.allocation) / 100;
        }, 0);

        // 每秒收益 = 余额 * (年化/365天/24小时/60分/60秒)
        const secondlyYield = (agentWallet.virtualBalance * weightedAPR) / 100 / 365 / 24 / 60 / 60;
        if (secondlyYield > 0) {
          dispatch(addEarnings(secondlyYield));
        }
      }
    }, 1000);

    return () => {
      clearInterval(aprInterval);
      clearInterval(rebalanceInterval);
      clearInterval(earningsInterval);
    };
  }, [dispatch, isAutoRebalancing, agentWallet.virtualBalance, protocols]);

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Dashboard</h1>
          <p className={styles.subtitle}>Manage your DeFi positions and strategies</p>
        </header>

        <div className={styles.grid}>
          {/* 左侧：钱包信息 + 入金 */}
          <div className={styles.leftPanel}>
            <AgentWallet />
            <Deposit />
          </div>

          {/* 右侧：策略展示 */}
          <div className={styles.rightPanel}>
            <Strategy />
          </div>
        </div>
      </div>
    </div>
  );
}
