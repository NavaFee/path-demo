'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAppDispatch } from '@/hooks/useRedux';
import { setEOAConnected, disconnectEOA } from '@/store/walletSlice';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LandingPage from '@/components/LandingPage';
import DepositPage from '@/components/DepositPage';
import DashboardPage from '@/components/DashboardPage';

type ViewType = 'landing' | 'deposit' | 'dashboard';

export default function Home() {
  const { ready, authenticated, user } = usePrivy();
  const dispatch = useAppDispatch();
  const [currentView, setCurrentView] = useState<ViewType>('landing');

  // Sync EOA wallet state with Redux
  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      dispatch(setEOAConnected({ address: user.wallet.address, isConnected: true }));
    } else if (!authenticated) {
      dispatch(disconnectEOA());
      setCurrentView('landing');
    }
  }, [authenticated, user, dispatch]);

  const handleNavigate = (view: ViewType) => {
    if (view === 'deposit' && !authenticated) {
      return; // Don't navigate to deposit if not authenticated
    }
    setCurrentView(view);
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm uppercase tracking-widest">Initializing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header currentView={currentView} onNavigate={handleNavigate} />
      <main className="flex-grow pt-24 pb-12 px-6 max-w-7xl mx-auto w-full">
        {currentView === 'landing' && (
          <LandingPage onNavigate={handleNavigate} />
        )}
        {currentView === 'deposit' && (
          <DepositPage onNavigate={handleNavigate} />
        )}
        {currentView === 'dashboard' && (
          <DashboardPage />
        )}
      </main>
      <Footer />
    </div>
  );
}
