'use client';

import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAppDispatch } from '@/hooks/useRedux';
import { setEOAConnected, disconnectEOA } from '@/store/walletSlice';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import styles from './page.module.scss';

export default function Home() {
  const { ready, authenticated, user } = usePrivy();
  const dispatch = useAppDispatch();

  // 同步 Privy 用户状态到 Redux
  useEffect(() => {
    if (ready) {
      if (authenticated && user?.wallet?.address) {
        dispatch(
          setEOAConnected({
            address: user.wallet.address,
            isConnected: true,
          })
        );
      } else {
        dispatch(disconnectEOA());
      }
    }
  }, [ready, authenticated, user, dispatch]);

  return (
    <main className={styles.main}>
      <Header />
      <div className={styles.content}>
        {!ready ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Loading...</p>
          </div>
        ) : authenticated ? (
          <Dashboard />
        ) : (
          <div className={styles.hero}>
            <h1 className={styles.title}>
              <span className="text-gradient">PATH</span> Protocol
            </h1>
            <p className={styles.subtitle}>
              Automated DeFi yield optimization powered by intelligent rebalancing
            </p>
            <div className={styles.features}>
              <div className={`${styles.featureCard} glass-card`}>
                <div className={styles.featureIcon}>🔄</div>
                <h3>Auto-Rebalance</h3>
                <p>AI-driven allocation across top DeFi protocols</p>
              </div>
              <div className={`${styles.featureCard} glass-card`}>
                <div className={styles.featureIcon}>📈</div>
                <h3>Yield Optimize</h3>
                <p>Maximize returns with real-time APR tracking</p>
              </div>
              <div className={`${styles.featureCard} glass-card`}>
                <div className={styles.featureIcon}>🛡️</div>
                <h3>Secure</h3>
                <p>Non-custodial smart contract architecture</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
