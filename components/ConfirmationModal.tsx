import React, { FC, ReactNode, useEffect, useState } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
  confirmText?: string;
  confirmButtonClass?: string;
}

export const ConfirmationModal: FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  children,
  confirmText = 'Confirm',
  confirmButtonClass = 'bg-red-600 hover:bg-red-500'
}) => {
  const [isRendered, setIsRendered] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    } else {
      const timer = setTimeout(() => setIsRendered(false), 300); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  return (
    <div 
        className={`fixed inset-0 bg-black z-50 flex justify-center items-center transition-opacity duration-300 ease-out ${isOpen ? 'bg-opacity-70' : 'bg-opacity-0'}`}
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className={`bg-white dark:bg-[#2d3748] rounded-2xl shadow-2xl p-6 m-4 w-full max-w-md border dark:border-gray-700 transition-all duration-300 ease-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h2>
        <div className="text-gray-600 dark:text-gray-300 mb-6">
            {children}
        </div>
        <div className="flex justify-end gap-4">
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-gray-800 dark:text-white"
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className={`px-4 py-2 rounded-xl text-white transition-colors ${confirmButtonClass}`}
            aria-label={confirmText}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};