import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-1.5">
            {label}
            {props.required && <span className="text-red-600 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3 py-2 border-2 ${
            error ? 'border-red-600' : 'border-black'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            error ? 'focus:ring-red-600' : 'focus:ring-black'
          } transition-all ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-nostalgic-600">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
