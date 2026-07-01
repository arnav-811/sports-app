import { ReactNode } from 'react';
import { TopNav } from './TopNav';
import { ModeBar } from './ModeBar';
import { LiveTicker } from './LiveTicker';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { MobileBottomNav } from './MobileBottomNav';

interface AppShellProps { children: ReactNode }

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface-0">
      <TopNav />
      {/* ModeBar only on desktop */}
      <ModeBar />
      <LiveTicker />
      <LeftSidebar />
      <RightSidebar />
      <MobileBottomNav />

      {/*
       * Padding-top:
       *   mobile  → 76px  (TopNav 50 + LiveTicker 26)
       *   desktop → 118px (TopNav 50 + ModeBar 42 + LiveTicker 26)
       *
       * Padding-bottom:
       *   mobile  → 64px  (bottom nav h-14 + breathing room)
       *   desktop → 0
       */}
      <main className="pt-[76px] pb-20 px-3 lg:ml-48 lg:mr-[252px] lg:pt-[118px] lg:pb-4 lg:px-6 min-h-screen">
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
