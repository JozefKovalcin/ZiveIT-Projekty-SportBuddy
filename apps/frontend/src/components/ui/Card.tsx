import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hover = false,
}) => {
  return (
    <div
      className={`
        bg-white/[0.03]
        backdrop-blur-xl
        border border-white/10
        rounded-3xl
        p-8
        shadow-xl shadow-black/20
        transition-all duration-300 ease-out
        ${
          hover
            ? "cursor-pointer hover:bg-white/[0.06] hover:border-white/20 hover:shadow-2xl hover:scale-[1.02]"
            : ""
        }
        ${className}
      `}
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
  className = "",
  onClick,
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
  className = "",
}) => {
  return (
    <h3 className={`text-2xl font-bold text-white ${className}`}>{children}</h3>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`text-base text-gray-300 leading-relaxed ${className}`}>
      {children}
    </div>
  );
};
