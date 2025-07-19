import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  to?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  href,
  to,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  icon,
  iconPosition = 'left',
  fullWidth = false
}) => {
  const baseStyles = 'rounded-full font-medium transition-all inline-flex items-center justify-center';
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg',
    secondary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:text-blue-400 dark:border-blue-400',
    ghost: 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20'
  };
  const sizeStyles = {
    sm: 'text-sm px-4 py-1.5',
    md: 'px-6 py-2.5',
    lg: 'text-lg px-8 py-3'
  };
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'transform hover:-translate-y-0.5 active:translate-y-0';
  const widthStyles = fullWidth ? 'w-full' : '';
  const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${widthStyles} ${className}`;
  const content = <>
      {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </>;
  if (to) {
    return <motion.div whileTap={{
      scale: disabled ? 1 : 0.98
    }}>
        <Link to={to} className={buttonStyles}>
          {content}
        </Link>
      </motion.div>;
  }
  if (href) {
    return <motion.div whileTap={{
      scale: disabled ? 1 : 0.98
    }}>
        <a href={href} className={buttonStyles} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      </motion.div>;
  }
  return <motion.button type={type} onClick={onClick} disabled={disabled} className={buttonStyles} whileTap={{
    scale: disabled ? 1 : 0.98
  }}>
      {content}
    </motion.button>;
};
export default Button;