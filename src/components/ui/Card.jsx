import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Card = forwardRef(({ className, variant = 'default', children, ...props }, ref) => {
  const variants = {
    default: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-card',
    glass: 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-glass',
    clay: 'bg-gray-100 dark:bg-gray-800 shadow-clay border-0',
    elevated: 'bg-white dark:bg-gray-900 shadow-elevated border border-gray-100 dark:border-gray-800',
    outline: 'bg-transparent border-2 border-gray-200 dark:border-gray-700',
    gradient: 'bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-primary-500/20 dark:border-primary-500/10',
  };

  return (
    <div
      ref={ref}
      className={cn('rounded-2xl transition-all duration-300', variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

const CardHeader = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('px-6 py-4 border-b border-gray-200 dark:border-gray-700', className)} {...props} />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn('text-xl font-semibold text-gray-900 dark:text-gray-100', className)} {...props} />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-gray-500 dark:text-gray-400 mt-1', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('px-6 py-4', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center', className)} {...props} />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };