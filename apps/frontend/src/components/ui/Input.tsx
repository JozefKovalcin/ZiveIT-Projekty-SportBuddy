import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[color:var(--fluent-text-secondary)] mb-2">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-3
          acrylic
          border-2 border-[color:var(--fluent-border)]
          rounded-lg
          text-[color:var(--fluent-text)]
          placeholder-[color:var(--fluent-text-tertiary)]
          focus:outline-none
          focus:border-[color:var(--fluent-accent)]
          focus:ring-2
          focus:ring-[color:var(--fluent-accent)]/20
          hover:border-[color:var(--fluent-border-strong)]
          transition-all duration-200 ease-out
          disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[color:var(--fluent-surface-secondary)]
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[color:var(--fluent-text)] mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-3 py-2
          acrylic
          border border-[color:var(--fluent-border)]
          rounded-md
          text-[color:var(--fluent-text)]
          placeholder-[color:var(--fluent-text-tertiary)]
          focus:outline-none
          focus:border-[color:var(--fluent-accent)]
          focus:ring-2
          focus:ring-[color:var(--fluent-accent)]/20
          hover:border-[color:var(--fluent-border-strong)]
          transition-all duration-150 ease-out
          resize-vertical
          disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[color:var(--fluent-surface-secondary)]
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
          ${className}
        `}
        style={{
          boxShadow: 'var(--shadow-sm)'
        }}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[color:var(--fluent-text)] mb-2">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-3 py-2
          acrylic
          border border-[color:var(--fluent-border)]
          rounded-md
          text-[color:var(--fluent-text)]
          focus:outline-none
          focus:border-[color:var(--fluent-accent)]
          focus:ring-2
          focus:ring-[color:var(--fluent-accent)]/20
          hover:border-[color:var(--fluent-border-strong)]
          transition-all duration-150 ease-out
          disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[color:var(--fluent-surface-secondary)]
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
          ${className}
        `}
        style={{
          boxShadow: 'var(--shadow-sm)'
        }}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="acrylic text-[color:var(--fluent-text)]">
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
