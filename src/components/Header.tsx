'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useAppSelector } from '@/hooks/useRedux';
import { WalletOutlined, LogoutOutlined, LoadingOutlined } from '@ant-design/icons';
import styles from './Header.module.scss';

export default function Header() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { eoaWallet } = useAppSelector((state) => state.wallet);

  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>◇</span>
          <span className={styles.logoText}>PATH</span>
        </div>

        <nav className={styles.nav}>
          <a href="#dashboard" className={styles.navLink}>
            Dashboard
          </a>
          <a href="#strategies" className={styles.navLink}>
            Strategies
          </a>
          <a href="#docs" className={styles.navLink}>
            Docs
          </a>
        </nav>

        <div className={styles.actions}>
          {!ready ? (
            <button className="btn-secondary" disabled>
              <LoadingOutlined className="animate-spin" />
              Loading...
            </button>
          ) : authenticated ? (
            <div className={styles.wallet}>
              <div className={`${styles.walletInfo} glass-card-light`}>
                <WalletOutlined />
                <span>{formatAddress(eoaWallet.address)}</span>
                <span className={styles.chain}>Base</span>
              </div>
              <button className="btn-secondary" onClick={logout}>
                <LogoutOutlined />
                Disconnect
              </button>
            </div>
          ) : (
            <button className="btn-primary" onClick={login}>
              <WalletOutlined />
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
