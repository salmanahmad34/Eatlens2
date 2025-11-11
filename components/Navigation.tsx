import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export type View = 'analyze' | 'recipe' | 'planner' | 'foodchat' | 'myplan' | 'admin';

interface NavItem {
  id: View;
  label: string;
  icon: React.ReactNode;
}

const AnalyzeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>;
const RecipeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>;
const PlannerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>;
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v6a2 2 0 01-2 2H9.414a1 1 0 00-.707.293L4 17.586V13a1 1 0 00-1-1H4a2 2 0 01-2-2V5z" /><path d="M15 4a1 1 0 11-2 0 1 1 0 012 0zM9 4a1 1 0 11-2 0 1 1 0 012 0zM5 4a1 1 0 11-2 0 1 1 0 012 0z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const AdminIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;

const baseNavItems: NavItem[] = [
    { id: 'analyze', label: 'Analyze Meal', icon: <AnalyzeIcon /> },
    { id: 'recipe', label: 'Get Recipe', icon: <RecipeIcon /> },
    { id: 'planner', label: 'Plan My Week', icon: <PlannerIcon /> },
    { id: 'foodchat', label: 'Food Chat', icon: <ChatIcon /> },
    { id: 'myplan', label: 'My Plan', icon: <UserIcon /> },
];


interface NavigationProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeView, setActiveView }) => {
  const { user } = useAuth();
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const navRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  
  const navItems = [...baseNavItems];
  if (user?.role === 'admin') {
      navItems.push({ id: 'admin', label: 'Admin Panel', icon: <AdminIcon /> });
  }

  useEffect(() => {
    const activeIndex = navItems.findIndex(item => item.id === activeView);
    const activeButton = buttonRefs.current[activeIndex];
    
    if (activeButton && navRef.current) {
        const navRect = navRef.current.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();
        setIndicatorStyle({
            left: buttonRect.left - navRect.left,
            width: buttonRect.width,
        });
    }
  }, [activeView, navItems]);

  return (
    <nav 
        ref={navRef}
        className="relative w-full max-w-5xl p-2 bg-white/70 backdrop-blur-lg rounded-xl border border-gray-200 shadow-sm"
    >
      <div className="flex items-center justify-center gap-2">
        {navItems.map((item, index) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                ref={el => { buttonRefs.current[index] = el }}
                onClick={() => setActiveView(item.id)}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 p-3 text-sm font-medium rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-primary-500 ${isActive ? 'text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            )
        })}
      </div>
       <div 
        className="absolute top-2 bottom-2 bg-primary-600 rounded-lg transition-all duration-300 ease-in-out"
        style={{...indicatorStyle, backgroundColor: 'var(--color-primary-600)'}}
       />
    </nav>
  );
};
