import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UIProvider, useUI } from './contexts/UIContext';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { AppPage } from './pages/AppPage';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { ContactPage } from './pages/ContactPage';
import { MainLayout } from './layouts/MainLayout';
import { UpgradeModal } from './components/UpgradeModal';

export type Page = 'landing' | 'auth' | 'app' | 'privacy' | 'terms' | 'contact';

const AppFlow: React.FC = () => {
    const { user } = useAuth();
    const { isUpgradeModalOpen, closeUpgradeModal } = useUI();
    
    const [currentPage, setCurrentPage] = useState<Page>(user ? 'app' : 'landing');
    const [scrollTarget, setScrollTarget] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            // If user is logged in, but not on a legal/contact page, default to app
            if (['landing', 'auth'].includes(currentPage)) {
                 setCurrentPage('app');
            }
        } else {
            // If user logs out, go back to landing page
            if (currentPage === 'app') {
                setCurrentPage('landing');
            }
        }
    }, [user, currentPage]);

    useEffect(() => {
        if (currentPage === 'landing' && scrollTarget) {
            const element = document.getElementById(scrollTarget);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            setScrollTarget(null);
        } else {
             window.scrollTo({ top: 0, behavior: 'auto' });
        }
    }, [currentPage, scrollTarget]);

    const navigateTo = (page: Page, targetId?: string) => {
        if (targetId) {
            if (currentPage !== 'landing') {
                setScrollTarget(targetId);
                setCurrentPage('landing');
            } else {
                const element = document.getElementById(targetId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        } else {
            setCurrentPage(page);
        }
    };
    
    const renderPage = () => {
        switch (currentPage) {
            case 'app': return <AppPage />;
            case 'auth': return <AuthPage onBack={() => navigateTo('landing')} />;
            case 'privacy': return <PrivacyPolicy />;
            case 'terms': return <TermsOfService />;
            case 'contact': return <ContactPage />;
            case 'landing':
            default:
                return <LandingPage onGetStartedClick={() => navigateTo('auth')} />;
        }
    }

    return (
        <>
            <MainLayout onNavigate={navigateTo} isAppView={currentPage === 'app'}>
                {renderPage()}
            </MainLayout>
            <UpgradeModal isOpen={isUpgradeModalOpen} onClose={closeUpgradeModal} />
        </>
    );
};

const MainApp: React.FC = () => {
  return (
    <AuthProvider>
        <UIProvider>
            <AppFlow />
        </UIProvider>
    </AuthProvider>
  );
};

export default MainApp;