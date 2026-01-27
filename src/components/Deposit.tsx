'use client';

import { useState, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { base } from 'viem/chains';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setDepositStatus, addVirtualBalance, resetDeposit } from '@/store/walletSlice';
import { 
  USDC_ADDRESS, 
  ERC20_ABI, 
  parseUSDC, 
  displayUSDC 
} from '@/utils/usdcContract';
import { 
  SendOutlined, 
  LoadingOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined 
} from '@ant-design/icons';
import { message } from 'antd';
import type { DepositStatus } from '@/types';
import styles from './Deposit.module.scss';

export default function Deposit() {
  const [amount, setAmount] = useState('');
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const dispatch = useAppDispatch();
  const { agentWallet, pendingDeposit } = useAppSelector((state) => state.wallet);

  const isLoading = pendingDeposit.status === 'pending' || pendingDeposit.status === 'confirming';
  const isDisabled = !authenticated || isLoading || !amount || parseFloat(amount) <= 0;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 只允许数字和小数点
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleDeposit = useCallback(async () => {
    if (!authenticated || !amount) return;

    const depositAmount = parseFloat(amount);
    if (depositAmount <= 0) {
      message.error('Please enter a valid amount');
      return;
    }

    // 获取用户的外部钱包
    const externalWallet = wallets.find((wallet) => wallet.walletClientType !== 'privy');
    if (!externalWallet) {
      message.error('Please connect an external wallet');
      return;
    }

    try {
      // 开始存款流程
      dispatch(setDepositStatus({ status: 'pending', amount: depositAmount }));
      message.loading({ content: 'Preparing transaction...', key: 'deposit' });

      // 获取 EIP-1193 provider
      const provider = await externalWallet.getEthereumProvider();
      
      // 创建 viem 客户端
      const walletClient = createWalletClient({
        chain: base,
        transport: custom(provider),
      });

      const publicClient = createPublicClient({
        chain: base,
        transport: http(),
      });

      // 获取当前账户地址
      const [address] = await walletClient.getAddresses();
      if (!address) {
        throw new Error('No wallet address found');
      }

      // 构建 USDC transfer 交易
      const usdcAmount = parseUSDC(depositAmount);

      message.loading({ content: 'Please confirm in wallet...', key: 'deposit' });

      // 发送交易
      const hash = await walletClient.writeContract({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [agentWallet.address as `0x${string}`, usdcAmount],
        account: address,
      });

      dispatch(setDepositStatus({ status: 'confirming', txHash: hash }));
      message.loading({ content: 'Waiting for confirmation...', key: 'deposit' });

      // 等待交易确认
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        // 交易成功，更新 Mock 余额
        dispatch(addVirtualBalance(depositAmount));
        message.success({ 
          content: `Successfully deposited ${displayUSDC(depositAmount)}`, 
          key: 'deposit',
          duration: 5 
        });
        setAmount(''); // 清空输入
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      // 检测用户拒绝签名的情况，静默处理
      const isUserRejection = 
        error instanceof Error && 
        (error.message.includes('User rejected') || 
         error.message.includes('User denied') ||
         error.message.includes('user rejected'));
      
      if (isUserRejection) {
        // 用户拒绝，静默重置状态
        message.destroy('deposit');
        dispatch(resetDeposit());
        return;
      }

      console.error('Deposit error:', error);
      dispatch(setDepositStatus({ status: 'failed' }));
      
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      message.error({ content: errorMessage, key: 'deposit', duration: 5 });
      
      // 5 秒后重置状态
      setTimeout(() => {
        dispatch(resetDeposit());
      }, 5000);
    }
  }, [authenticated, amount, wallets, dispatch, agentWallet.address]);

  const getStatusIcon = (status: DepositStatus) => {
    switch (status) {
      case 'pending':
      case 'confirming':
        return <LoadingOutlined className="animate-spin" />;
      case 'success':
        return <CheckCircleOutlined style={{ color: '#10B981' }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#EF4444' }} />;
      default:
        return <SendOutlined />;
    }
  };

  const getButtonText = (status: DepositStatus): string => {
    switch (status) {
      case 'pending':
        return 'Waiting for signature...';
      case 'confirming':
        return 'Confirming...';
      case 'success':
        return 'Deposit Successful!';
      case 'failed':
        return 'Deposit Failed';
      default:
        return 'Deposit USDC';
    }
  };

  return (
    <div className={`${styles.card} glass-card`}>
      <div className={styles.header}>
        <h3>Deposit</h3>
        <span className={styles.network}>Base • USDC</span>
      </div>

      <div className={styles.inputGroup}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.00"
            disabled={isLoading}
            className={styles.input}
          />
          <span className={styles.currency}>USDC</span>
        </div>
        <div className={styles.quickAmounts}>
          {['10', '50', '100', '500'].map((quickAmount) => (
            <button
              key={quickAmount}
              className={styles.quickBtn}
              onClick={() => setAmount(quickAmount)}
              disabled={isLoading}
            >
              ${quickAmount}
            </button>
          ))}
        </div>
      </div>

      <button
        className={`${styles.depositBtn} btn-gold`}
        onClick={handleDeposit}
        disabled={isDisabled}
      >
        {getStatusIcon(pendingDeposit.status)}
        <span>{getButtonText(pendingDeposit.status)}</span>
      </button>

      {pendingDeposit.txHash && (
        <div className={styles.txInfo}>
          <span>Transaction:</span>
          <a
            href={`https://basescan.org/tx/${pendingDeposit.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {pendingDeposit.txHash.slice(0, 10)}...{pendingDeposit.txHash.slice(-8)}
          </a>
        </div>
      )}

      <p className={styles.notice}>
        ⚠️ This will execute a real USDC transfer on Base mainnet
      </p>
    </div>
  );
}
