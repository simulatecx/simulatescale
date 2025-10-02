import { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [isDiscountModalOpen, setDiscountModalOpen] = useState(false);
  const [submissionToEdit, setSubmissionToEdit] = useState(null);

  // --- NEW STATE AND FUNCTIONS FOR THE VIEW MODAL ---
  const [isSubmissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [submissionToView, setSubmissionToView] = useState(null);

  const openSubmissionModal = (submission) => {
    setSubmissionToView(submission);
    setSubmissionModalOpen(true);
  };

  const closeSubmissionModal = () => {
    setSubmissionModalOpen(false);
    setSubmissionToView(null);
  };
  // --- END OF NEW CODE ---

  const openDiscountModal = (submission = null) => {
    setSubmissionToEdit(submission);
    setDiscountModalOpen(true);
  };
  
  const closeDiscountModal = () => {
    setDiscountModalOpen(false);
    setSubmissionToEdit(null);
  };

  const value = {
    isDiscountModalOpen,
    openDiscountModal,
    closeDiscountModal,
    submissionToEdit,
    setSubmissionToEdit,
    // --- EXPOSE NEW STATE AND FUNCTIONS ---
    isSubmissionModalOpen,
    openSubmissionModal,
    closeSubmissionModal,
    submissionToView,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => useContext(UIContext);