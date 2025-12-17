import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}) => {
  const baseStyles =
    "acrylic text-center transition-all duration-300 border border-white/10 font-bold tracking-wide text-gray-200 inline-flex items-center justify-center !rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  // Match the two reference buttons:
  // - Primary: emerald accent on hover
  // - Secondary: neutral hover (no green border)
  const variantStyles = {
    primary:
      "hover:border-emerald-500/40 hover:text-emerald-400 focus:ring-emerald-500/40",
    secondary: "hover:border-white/20 hover:text-white focus:ring-white/30",
    outline:
      "border-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500 focus:ring-emerald-500/40",
  };

  const sizeStyles = {
    sm: "px-6 py-3 text-sm",
    md: "px-10 py-3.5 text-base",
    lg: "px-12 py-4 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
