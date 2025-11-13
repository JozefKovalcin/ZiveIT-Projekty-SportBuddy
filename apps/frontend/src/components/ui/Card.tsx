import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false
}) => {
  return (
    <div
      className={`
        acrylic
        border border-[color:var(--fluent-border)]
        rounded-xl
        p-10
        transition-all duration-200 ease-out
        ${hover ? 'cursor-pointer hover-glow reveal-effect hover:border-[color:var(--fluent-border-strong)]' : ''}
        ${className}
      `}
      style={{
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  onClick
}) => {
  return (
    <div className={`mb-5 ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = ''
}) => {
  return (
    <h3 className={`text-2xl font-semibold text-[color:var(--fluent-text)] ${className}`}>
      {children}
    </h3>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`text-base text-[color:var(--fluent-text-secondary)] leading-relaxed ${className}`}>
      {children}
    </div>
  );
};
