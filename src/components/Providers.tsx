'use client';

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { PrivyProvider } from '@privy-io/react-auth';
import { base } from 'viem/chains';
import { store } from '@/store';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!privyAppId) {
    console.error('Missing NEXT_PUBLIC_PRIVY_APP_ID environment variable');
    return (
      <Provider store={store}>
        <div style={{ padding: '20px', color: '#ff6b6b', textAlign: 'center' }}>
          ⚠️ Missing Privy App ID. Please configure NEXT_PUBLIC_PRIVY_APP_ID in .env.local
        </div>
        {children}
      </Provider>
    );
  }

  return (
    <Provider store={store}>
      <PrivyProvider
        appId={privyAppId}
        config={{
          // 外观配置
          appearance: {
            theme: 'dark',
            accentColor: '#8B5CF6', // 紫色 CTA
            logo: '/icons/logo/path-icon.svg',
            showWalletLoginFirst: true,
          },
          // 登录方式
          loginMethods: ['wallet', 'email'],
          // 链配置 - Base Mainnet
          defaultChain: base,
          supportedChains: [base],
          // 嵌入式钱包配置
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
        }}
      >
        {children}
      </PrivyProvider>
    </Provider>
  );
}
