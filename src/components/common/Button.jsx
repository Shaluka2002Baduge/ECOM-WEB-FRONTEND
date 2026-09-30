import React from 'react';

/**
 * Accessible, ultra-luxury styled Button component
 * Complies with WCAG 2.1 Contrast & State requirements
 */
const Button = ({
  children,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'danger', 'ghost'
  size = 'md',        // 'sm', 'md', 'lg'
  isLoading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ariaLabel,
  style = {},
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-7 py-3.5 text-sm md:text-base'
  };

  const variantClasses = {
    primary:
      'relative inline-flex items-center justify-center gap-2 rounded-full font-serif font-semibold tracking-wider uppercase bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 bg-[length:200%_auto] hover:bg-right text-neutral-950 shadow-lg shadow-amber-500/25 hover:shadow-amber-400/40 hover:scale-[1.03] active:scale-95 transition-all duration-500 cursor-pointer overflow-hidden group',
    outline:
      'relative inline-flex items-center justify-center gap-2 rounded-full font-serif text-sm tracking-wide text-amber-700 dark:text-amber-200 bg-stone-100/90 dark:bg-neutral-950/60 hover:bg-amber-500/10 border border-amber-600/40 dark:border-amber-400/40 hover:border-amber-600 dark:hover:border-amber-400 backdrop-blur-md hover:text-amber-800 dark:hover:text-amber-100 hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer',
    secondary:
      'relative inline-flex items-center justify-center gap-2 rounded-full font-serif text-sm tracking-wide text-stone-800 dark:text-neutral-200 bg-stone-200/90 dark:bg-neutral-900/80 hover:bg-stone-300 dark:hover:bg-neutral-800 border border-stone-300 dark:border-neutral-700/60 hover:border-amber-600/40 dark:hover:border-amber-500/40 backdrop-blur-md hover:text-stone-950 dark:hover:text-white hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer shadow-md',
    danger:
      'relative inline-flex items-center justify-center gap-2 rounded-full font-serif font-semibold tracking-wider uppercase bg-gradient-to-r from-red-600 via-rose-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-[1.03] active:scale-95 transition-all duration-300 cursor-pointer',
    ghost:
      'relative inline-flex items-center justify-center gap-2 rounded-full font-serif tracking-wide text-stone-600 dark:text-neutral-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-500/10 transition-all duration-200 cursor-pointer'
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;
  const currentVariantClass = variantClasses[variant] || variantClasses.primary;
  const stateClass = (disabled || isLoading) ? 'opacity-60 cursor-not-allowed pointer-events-none' : '';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading ? 'true' : 'false'}
      aria-label={ariaLabel}
      onClick={onClick}
      className={`ralahami-btn ${currentVariantClass} ${currentSizeClass} ${stateClass} ${className}`}
      style={style}
      {...props}
    >
      {/* Subtle Shimmer Streak for Primary CTA */}
      {variant === 'primary' && !disabled && (
        <span
          className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none"
          aria-hidden="true"
        />
      )}

      {isLoading ? (
        <>
          <span
            className="w-4 h-4 border-2 border-current border-r-transparent rounded-full inline-block animate-spin"
            aria-hidden="true"
          />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
