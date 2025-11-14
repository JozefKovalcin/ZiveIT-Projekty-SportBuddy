import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-[color:var(--fluent-accent)] text-white hover:bg-[color:var(--fluent-accent-hover)] focus:ring-[color:var(--fluent-accent)] active:scale-[0.98]',
    secondary: 'bg-[color:var(--fluent-surface-secondary)] border border-[color:var(--fluent-border)] text-[color:var(--fluent-text)] hover:bg-[color:var(--fluent-border)] hover:border-[color:var(--fluent-border-strong)] focus:ring-[color:var(--fluent-border-strong)] active:scale-[0.98]',
    outline: 'border-2 border-[color:var(--fluent-accent)] text-[color:var(--fluent-accent)] hover:bg-[color:var(--fluent-accent-light)] focus:ring-[color:var(--fluent-accent)] active:scale-[0.98]',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-base',
  };

  const shadowStyles = {
    primary: 'shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]',
    secondary: 'shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]',
    outline: '',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${shadowStyles[variant as keyof typeof shadowStyles]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
