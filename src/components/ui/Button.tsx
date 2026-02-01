import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-black text-white border-2 border-black hover:bg-nostalgic-800 shadow-retro-sm hover:shadow-retro-md',
    secondary: 'bg-white text-black border-2 border-black hover:bg-nostalgic-50 shadow-retro-sm hover:shadow-retro-md',
    outline: 'bg-transparent text-black border-2 border-black hover:bg-nostalgic-50',
    ghost: 'bg-transparent text-black border-2 border-transparent hover:bg-nostalgic-50',
    danger: 'bg-red-600 text-white border-2 border-red-600 hover:bg-red-700 shadow-retro-sm hover:shadow-retro-md'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
