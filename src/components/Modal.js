// src/components/Modal.js

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM

const Modal = ({ isOpen, onClose, children }) => {
  const [isBrowser, setIsBrowser] = useState(false);

  // This useEffect ensures the code only runs on the client, where the portal can be created.
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  if (!isOpen || !isBrowser) return null;

  // Use ReactDOM.createPortal to render the modal into the '#modal-root' div
  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default Modal;