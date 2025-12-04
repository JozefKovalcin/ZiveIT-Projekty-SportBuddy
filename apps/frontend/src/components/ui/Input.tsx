import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-3
          bg-black/30
          backdrop-blur-xl
          border border-white/10
          rounded-xl
          text-white
          placeholder-gray-500
          focus:outline-none
          focus:border-emerald-500/50
          focus:ring-2
          focus:ring-emerald-500/20
          hover:border-white/20
          transition-all duration-200 ease-out
          disabled:opacity-50 disabled:cursor-not-allowed
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : ""
          }
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-400 font-medium">{error}</p>
      )}
    </div>
  );
};

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-4 py-3
          bg-black/30
          backdrop-blur-xl
          border border-white/10
          rounded-xl
          text-white
          placeholder-gray-500
          focus:outline-none
          focus:border-emerald-500/50
          focus:ring-2
          focus:ring-emerald-500/20
          hover:border-white/20
          transition-all duration-200 ease-out
          resize-vertical
          disabled:opacity-50 disabled:cursor-not-allowed
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : ""
          }
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-400 font-medium">{error}</p>
      )}
    </div>
  );
};
