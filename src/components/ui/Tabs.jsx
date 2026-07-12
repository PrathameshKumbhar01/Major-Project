import { createContext, useContext, useState, forwardRef } from 'react';
import { cn } from '../../utils/cn';

const TabsContext = createContext(null);

const Tabs = ({ children, defaultValue, value, onValueChange, className, ...props }) => {
  const [activeTab, setActiveTab] = useState(defaultValue || value);
  const controlled = value !== undefined;
  const currentTab = controlled ? value : activeTab;

  const handleTabClick = (tabValue) => {
    if (!controlled) setActiveTab(tabValue);
    onValueChange?.(tabValue);
  };

  return (
    <div className={cn('w-full', className)} {...props}>
      <TabsContext.Provider value={{ value: currentTab, onValueChange: handleTabClick }}>
        {children}
      </TabsContext.Provider>
    </div>
  );
};

const TabsList = forwardRef(({ children, variant = 'default', className, ...props }, ref) => {
  const variants = {
    default: 'bg-gray-100 dark:bg-gray-800 p-1 rounded-xl',
    underline: 'border-b border-gray-200 dark:border-gray-700',
    pills: 'gap-1',
    cards: 'gap-2',
  };

  return (
    <div ref={ref} role="tablist" className={cn('flex items-center', variants[variant], className)} {...props}>
      {children}
    </div>
  );
});
TabsList.displayName = 'TabsList';

const TabTrigger = forwardRef(({ children, value, disabled = false, className, ...props }, ref) => {
  const context = useContext(TabsContext);
  const isSelected = context?.value === value;

  const handleClick = () => {
    if (!disabled && context?.onValueChange) context.onValueChange(value);
  };

  return (
    <button
      ref={ref}
      role="tab"
      aria-selected={isSelected}
      aria-disabled={disabled}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm',
        isSelected
          ? 'bg-white dark:bg-gray-900 shadow-sm text-primary-600 dark:text-primary-400'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
TabTrigger.displayName = 'TabTrigger';

const TabContent = forwardRef(({ children, value, forceMount = false, className, ...props }, ref) => {
  const context = useContext(TabsContext);
  const isSelected = context?.value === value;

  if (!isSelected && !forceMount) return null;

  return (
    <div
      ref={ref}
      role="tabpanel"
      hidden={!isSelected}
      className={cn('mt-4 animate-fade-in', className)}
      {...props}
    >
      {children}
    </div>
  );
});
TabContent.displayName = 'TabContent';

export { Tabs, TabsList, TabTrigger, TabContent };
