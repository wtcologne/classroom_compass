/**
 * Modal Context
 * Globaler Context für Login/Register Modal-Management
 */

'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
  showLoginModal: boolean;
  showRegisterModal: boolean;
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeLoginModal: () => void;
  closeRegisterModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const openLoginModal = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const openRegisterModal = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const closeLoginModal = () => setShowLoginModal(false);
  const closeRegisterModal = () => setShowRegisterModal(false);

  return (
    <ModalContext.Provider
      value={{
        showLoginModal,
        showRegisterModal,
        openLoginModal,
        openRegisterModal,
        closeLoginModal,
        closeRegisterModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

