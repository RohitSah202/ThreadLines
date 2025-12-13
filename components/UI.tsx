import React, { Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', size = 'md', className = '', isLoading, ...props 
}) => {
  const baseStyles = "rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:active:scale-100";
  
  const variants = {
    primary: "bg-primary-200 text-primary-900 hover:bg-primary-300 shadow-sm hover:shadow-md",
    secondary: "bg-secondary-200 text-secondary-900 hover:bg-secondary-300 shadow-sm hover:shadow-md",
    ghost: "bg-transparent hover:bg-black/5 text-offblack",
    danger: "bg-red-100 text-red-700 hover:bg-red-200",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-8 py-3.5 text-lg",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-stone-600 ml-1">{label}</label>}
      <input 
        className={`w-full px-4 py-3 rounded-2xl border-2 border-stone-100 bg-white focus:outline-none focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
    </div>
  );
};

// --- TextArea ---
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-stone-600 ml-1">{label}</label>}
      <textarea 
        className={`w-full px-4 py-3 rounded-2xl border-2 border-stone-100 bg-white focus:outline-none focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all resize-none ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
    </div>
  );
};

// --- Modal ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, width = 'md' }) => {
  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-offblack/10 backdrop-blur-sm flex items-center justify-center p-4"
          />
          {/* Modal Content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`bg-white w-full ${widths[width]} rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]`}
            >
              <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                <h3 className="text-lg font-semibold text-stone-800">{title}</h3>
                <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Badge/Chip ---
interface ChipProps {
  label: string;
  color?: 'primary' | 'secondary' | 'stone' | string; // Accept tailwind classes too
  onClick?: () => void;
  active?: boolean;
}

export const Chip: React.FC<ChipProps> = ({ label, color = 'stone', onClick, active }) => {
  const isCustomColor = color.startsWith('bg-');
  
  let styles = "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 border border-transparent";
  
  if (isCustomColor) {
     styles += ` ${color} text-stone-700`;
  } else {
    switch (color) {
        case 'primary':
            styles += active 
            ? " bg-primary-200 text-primary-900 border-primary-300" 
            : " bg-primary-50 text-primary-700 hover:bg-primary-100";
            break;
        case 'secondary':
            styles += active 
            ? " bg-secondary-200 text-secondary-900 border-secondary-300" 
            : " bg-secondary-50 text-secondary-700 hover:bg-secondary-100";
            break;
        case 'stone':
        default:
            styles += active
            ? " bg-stone-800 text-white"
            : " bg-stone-100 text-stone-600 hover:bg-stone-200";
            break;
    }
  }

  if (onClick) styles += " cursor-pointer active:scale-95 select-none";

  return (
    <span onClick={onClick} className={styles}>
      {label}
    </span>
  );
};

// --- Empty State ---
export const EmptyState: React.FC<{ title: string; description: string; icon?: React.ReactNode }> = ({ title, description, icon }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 mb-4">
      {icon || <Loader2 size={32} />}
    </div>
    <h3 className="text-xl font-semibold text-stone-800 mb-2">{title}</h3>
    <p className="text-stone-500 max-w-sm">{description}</p>
  </div>
);