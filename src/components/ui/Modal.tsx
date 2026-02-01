import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showClose?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        className={`relative bg-white border-2 border-black shadow-retro-lg w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between p-4 border-b-2 border-black">
            {title && <h2 className="text-xl font-mono font-bold">{title}</h2>}
            {showClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-nostalgic-100 transition-colors"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export function ModalFooter({ children, className = '' }: ModalFooterProps) {
  return (
    <div className={`flex items-center justify-end gap-2 pt-4 border-t-2 border-nostalgic-200 ${className}`}>
      {children}
    </div>
  );
}
