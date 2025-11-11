import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Page } from '../MainApp';
import { Logo } from './ui/Logo';

interface HeaderProps {
    onNavigate: (page: Page, targetId?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const { user, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
        setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    onNavigate('landing', id);
  };

  return (
    <header className={`sticky top-0 z-50 w-full p-4 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-lg border-b border-slate-200/60' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
            className="flex items-center cursor-pointer group" 
            onClick={() => onNavigate(user ? 'app' : 'landing')}
        >
            <Logo />
            <span className="text-2xl font-extrabold ml-2 text-slate-800 tracking-tight group-hover:text-slate-900 transition-colors">EatLens</span>
        </div>
        <nav className="flex items-center gap-4">
            {user ? (
                <>
                    <span className="text-sm text-slate-600 hidden sm:inline">Welcome, {user.name}</span>
                    <button 
                        onClick={signOut}
                        className="px-4 py-2 text-sm font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                        Sign Out
                    </button>
                </>
            ) : (
                <>
                    <a href="#features" onClick={(e) => handleScrollTo(e, 'features')} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden md:inline">Features</a>
                    <a href="#pricing" onClick={(e) => handleScrollTo(e, 'pricing')} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden md:inline">Pricing</a>
                    <button 
                        onClick={() => onNavigate('auth')}
                        className="px-4 py-2 text-sm font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
                        style={{backgroundColor: 'var(--color-primary-600)'}}
                    >
                        Sign In
                    </button>
                </>
            )}
        </nav>
      </div>
    </header>
  );
};