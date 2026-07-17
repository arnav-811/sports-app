import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from './components/layout/AppShell';
import { AuthModal } from './components/auth/AuthModal';
import { ToastContainer } from './components/ui/Toast';
import { FeedPage } from './pages/FeedPage';
import { LivePage } from './pages/LivePage';
import { ThreadPage } from './pages/ThreadPage';
import { AuthPage } from './pages/AuthPage';
import DraftWarsPage from './pages/DraftWarsPage';
import GroundsPage from './pages/GroundsPage';
import GroundDetailPage from './pages/GroundDetailPage';
import FanCardPage from './pages/FanCardPage';
import ScoutRoomPage from './pages/ScoutRoomPage';
import QuestPage from './pages/QuestPage';
import DebatesPage from './pages/DebatesPage';
import SettingsPage from './pages/SettingsPage';
import CoinStorePage from './pages/CoinStorePage';
import SportingDirectorPage from './pages/SportingDirectorPage';
import GoneDarkAlert from './components/economy/GoneDarkAlert';
import SessionSummary from './components/economy/SessionSummary';
import { useAuthStore } from './store/authStore';
import { useSocketStore } from './store/socketStore';
import { useToast } from './hooks/useToast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
    },
  },
});

function AppContent() {
  const { accessToken, user, fetchMe } = useAuthStore();
  const { connect, socket, subscribeUser } = useSocketStore();
  const { success, info } = useToast();

  useEffect(() => {
    connect();
    if (accessToken) {
      fetchMe();
    }
  }, [accessToken, connect, fetchMe]);

  useEffect(() => {
    if (!socket || !user) return;
    subscribeUser(user.id);

    const onLevelUp = (data: { newLevel: number; unlocks: { tier: string }; bonus: number }) => {
      success(`Level ${data.newLevel}! You're now a ${data.unlocks.tier}. +${data.bonus} ⚡`);
      fetchMe();
    };
    const onQuestComplete = (data: { coinReward: number }) => {
      info(`Quest complete! +${data.coinReward} ⚡`);
      fetchMe();
    };
    const onCoinUpdate = () => fetchMe();

    socket.on('level:up', onLevelUp);
    socket.on('quest:complete', onQuestComplete);
    socket.on('coin:update', onCoinUpdate);
    return () => {
      socket.off('level:up', onLevelUp);
      socket.off('quest:complete', onQuestComplete);
      socket.off('coin:update', onCoinUpdate);
    };
  }, [socket, user, subscribeUser, success, info, fetchMe]);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/*"
            element={
              <AppShell>
                <Routes>
                  <Route index element={<FeedPage />} />
                  <Route path="live" element={<LivePage />} />
                  <Route path="draftwars" element={<DraftWarsPage />} />
                  <Route path="grounds" element={<GroundsPage />} />
                  <Route path="g/:name" element={<GroundDetailPage />} />
                  <Route path="bunker/:id" element={<ThreadPage />} />
                  <Route path="scout-room" element={<ScoutRoomPage />} />
                  <Route path="fancard/:username" element={<FanCardPage />} />
                  <Route path="quests" element={<QuestPage />} />
                  <Route path="store" element={<CoinStorePage />} />
                  <Route path="debates" element={<DebatesPage />} />
                  <Route path="director" element={<SportingDirectorPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  {/* Legacy redirects */}
                  <Route path="community" element={<GroundsPage />} />
                  <Route path="r/:name" element={<GroundDetailPage />} />
                  <Route path="fantasy" element={<DraftWarsPage />} />
                  <Route path="features" element={<ScoutRoomPage />} />
                  <Route path="post/:id" element={<ThreadPage />} />
                  <Route path="u/:username" element={<FanCardPage />} />
                  <Route path="*" element={<div className="card p-8 text-center text-text-muted">Page not found</div>} />
                </Routes>
              </AppShell>
            }
          />
        </Routes>
      </BrowserRouter>
      <AuthModal />
      <ToastContainer />
      <GoneDarkAlert />
      <SessionSummary />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
