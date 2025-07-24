import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning';
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Item',
  description = 'Are you sure you want to delete this ticket? This action cannot be undone.',
  itemName,
  isLoading = false,
  variant = 'danger'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleConfirm = () => {
    onConfirm();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: <Trash2 className="w-6 h-6 text-red-500" />,
      iconBg: 'bg-red-100',
      confirmButton: 'bg-red-500 hover:bg-red-600 focus:ring-red-500/20',
      confirmText: 'Delete'
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
      iconBg: 'bg-yellow-100',
      confirmButton: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500/20',
      confirmText: 'Confirm'
    }
  };

  const currentVariant = variantStyles[variant];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0'
      }`}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className={`relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="cursor-pointer absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="p-6">
          {/* Icon */}
          <div className={`w-12 h-12 ${currentVariant.iconBg} rounded-full flex items-center justify-center mb-4`}>
            {currentVariant.icon}
          </div>

          {/* Title */}
          <h2 id="modal-title" className="text-xl font-semibold text-gray-900 mb-2">
            {title}
          </h2>

          {/* Description */}
          <div id="modal-description" className="text-gray-600 mb-6">
            <p className="mb-2">{description}</p>
            {itemName && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-3">
                <p className="text-sm font-medium text-gray-700">
                  Item: <span className="font-normal">{itemName}</span>
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="cursor-pointer flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`cursor-pointer flex-1 px-4 py-2.5 text-white rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${currentVariant.confirmButton}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Deleting...</span>
                </div>
              ) : (
                currentVariant.confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};