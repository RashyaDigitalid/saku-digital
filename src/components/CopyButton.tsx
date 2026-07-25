import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
}

export default function CopyButton({
  textToCopy,
  label = 'Salin',
  copiedLabel = 'Tersalin!',
  className = '',
  variant = 'secondary',
  size = 'md',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Gagal menyalin:', fallbackErr);
      }
      document.body.removeChild(textarea);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        title={copied ? copiedLabel : label}
        className={`p-2 rounded-xl transition-all duration-200 flex items-center justify-center shrink-0 ${
          copied
            ? 'bg-emerald-500 text-white dark:bg-emerald-600'
            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
        } ${className}`}
      >
        {copied ? (
          <Check className="w-4 h-4 animate-in zoom-in-50 duration-200" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    );
  }

  // Base sizing
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5 rounded-lg',
    md: 'px-3.5 py-2 text-xs font-bold gap-2 rounded-xl',
    lg: 'px-4 py-2.5 text-sm font-extrabold gap-2 rounded-xl',
  }[size];

  // Variants styling
  const variantClasses = {
    primary: copied
      ? 'bg-emerald-600 text-white shadow-sm'
      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-95',
    secondary: copied
      ? 'bg-emerald-500 text-white dark:bg-emerald-600'
      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 active:scale-95',
    outline: copied
      ? 'border border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30'
      : 'border border-slate-300 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 active:scale-95',
    ghost: copied
      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30'
      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95',
    icon: '',
  }[variant];

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center justify-center font-bold transition-all duration-200 select-none ${sizeClasses} ${variantClasses} ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-white dark:text-emerald-300 animate-in zoom-in-50 duration-200" />
          <span>{copiedLabel}</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 opacity-80" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
