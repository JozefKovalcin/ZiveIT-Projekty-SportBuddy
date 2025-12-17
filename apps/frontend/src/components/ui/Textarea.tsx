import React, { useState } from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className = "",
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-200 mb-2.5 tracking-wide">
          {label}
        </label>
      )}
      <div
        className="relative rounded-3xl overflow-hidden transition-all duration-300 ease-out"
        style={{
          background: isFocused
            ? "rgba(16, 185, 129, 0.05)"
            : "rgba(0, 0, 0, 0.25)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: error
            ? "1px solid rgba(239, 68, 68, 0.5)"
            : isFocused
            ? "1px solid rgba(16, 185, 129, 0.5)"
            : "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: error
            ? "0 0 20px rgba(239, 68, 68, 0.2), 0 8px 32px rgba(0, 0, 0, 0.3)"
            : isFocused
            ? "0 0 20px rgba(16, 185, 129, 0.2), 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
            : "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
      >
        <textarea
          className={`
            w-full px-5 py-3.5
            bg-transparent
            text-white text-[15px]
            placeholder-gray-500
            focus:outline-none
            border-0
            transition-all duration-200 ease-out
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-none
            ${className}
          `}
          style={{
            background: "transparent",
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2.5 text-sm text-red-400 font-medium flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};
