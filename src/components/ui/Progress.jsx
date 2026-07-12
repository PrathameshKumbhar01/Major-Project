import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Progress = forwardRef(({ className, value = 0, max = 100, size = 'md', variant = 'default', showLabel = false, label, rounded = true, animated = false, ...props }, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
  };

  const variants = {
    default: 'bg-primary-600',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    purple: 'bg-purple-500',
    gradient: 'bg-gradient-to-r from-primary-500 to-purple-500',
  };

  const radius = rounded ? 'rounded-full' : 'rounded-md';

  return (
    <div ref={ref} className={cn('w-full', className)} {...props}>
      <div className={cn('relative overflow-hidden bg-gray-200 dark:bg-gray-700', sizes[size], radius)}>
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out',
            variants[variant],
            radius,
            animated && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label || 'Progress'}
        >
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          )}
        </div>
      </div>
      {(showLabel || label) && (
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1.5">
          <span>{label || 'Progress'}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
});

Progress.displayName = 'Progress';

const CircularProgress = forwardRef(({ className, value = 0, max = 100, size = 64, strokeWidth = 6, variant = 'default', showLabel = true, label, progressClassName, ...props }, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const variants = {
    default: 'text-primary-600',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    danger: 'text-red-500',
    info: 'text-blue-500',
    purple: 'text-purple-500',
  };

  return (
    <div
      ref={ref}
      className={cn('relative inline-flex items-center justify-center', className)}
      {...props}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          className="text-gray-200 dark:text-gray-700"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn(
            'transition-all duration-500 ease-out',
            variants[variant],
            progressClassName
          )}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {(showLabel || label) && (
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {label || `${Math.round(percentage)}%`}
          </span>
          {label && <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>}
        </div>
      )}
    </div>
  );
});

CircularProgress.displayName = 'CircularProgress';

export { Progress, CircularProgress };
