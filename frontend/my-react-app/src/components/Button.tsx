import React from 'react';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ type = 'button', fullWidth, size = 'md', disabled, onClick, children }) => {
  const baseClasses = 'rounded-md shadow-sm focus:outline-none';
  const sizeClasses = size === 'sm' ? 'py-1 px-3 text-sm' : size === 'lg' ? 'py-3 px-6 text-lg' : 'py-2 px-4';
  const fullWidthClass = fullWidth ? 'w-full' : 'w-auto';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500';

  return (
    <button
      type={type}
      className={`${baseClasses} ${sizeClasses} ${fullWidthClass} bg-blue-600 text-white ${disabledClass}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;