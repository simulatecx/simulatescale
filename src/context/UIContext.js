// src/context/UIContext.js

import React, { createContext, useState, useContext } from 'react';

// Create the context with a default value of null
const UIContext = createContext(null);

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === null) {
    // This error will be thrown if you forget the provider
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
};

export const UIProvider = ({ children }) => {
  const [isDiscountModalOpen, setDiscountModalOpen] = useState(false);

  const openDiscountModal = () => setDiscountModalOpen(true);
  const closeDiscountModal = () => setDiscountModalOpen(false);

  const value = {
    isDiscountModalOpen,
    openDiscountModal,
    closeDiscountModal,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};