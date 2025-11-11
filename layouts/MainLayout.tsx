import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import type { Page } from '../MainApp';

interface MainLayoutProps {
  children: React.ReactNode;
  onNavigate: (page: Page, targetId?: string) => void;
  isAppView: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, onNavigate, isAppView }) => {
  return (
    <div className="min-h-screen flex flex-col" style={{backgroundColor: 'var(--color-gray-50)'}}>
      <Header onNavigate={onNavigate} />
      <main className={`flex-grow w-full flex flex-col items-center ${isAppView ? 'p-4 md:p-6' : ''}`}>
        {children}
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};
