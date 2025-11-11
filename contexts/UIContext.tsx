import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { UIContextType } from '../types';

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const openUpgradeModal = () => setIsUpgradeModalOpen(true);
    const closeUpgradeModal = () => setIsUpgradeModalOpen(false);

    return (
        <UIContext.Provider value={{ isUpgradeModalOpen, openUpgradeModal, closeUpgradeModal }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = (): UIContextType => {
    const context = useContext(UIContext);
    if (context === undefined) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};
