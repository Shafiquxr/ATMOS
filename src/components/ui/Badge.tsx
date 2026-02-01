import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  const variantClasses = {
    default: 'bg-nostalgic-100 text-black border-nostalgic-400',
    success: 'bg-green-100 text-green-800 border-green-600',
    error: 'bg-red-100 text-red-800 border-red-600',
    warning: 'bg-amber-100 text-amber-800 border-amber-600',
    info: 'bg-blue-100 text-blue-800 border-blue-600'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm'
  };

  return (
    <span
      className={`inline-flex items-center font-medium border ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {children}
    </span>
  );
}
