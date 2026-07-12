import { forwardRef, useState } from 'react';
import { cn } from '../../utils/cn';

const avatarSizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-2xl',
};

const avatarShapes = {
  circle: 'rounded-full',
  square: 'rounded-xl',
  rounded: 'rounded-lg',
};

const Avatar = forwardRef(({ className, src, alt, fallback, size = 'md', shape = 'circle', ...props }, ref) => {
  const [imageError, setImageError] = useState(false);

  if (src && !imageError) {
    return (
      <img
        ref={ref}
        src={src}
        alt={alt || 'Avatar'}
        className={cn(avatarSizes[size], avatarShapes[shape], 'object-cover', className)}
        onError={() => setImageError(true)}
        {...props}
      />
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        avatarSizes[size],
        avatarShapes[shape],
        'flex items-center justify-center bg-gradient-to-br from-primary-500 to-purple-600',
        'text-white font-medium select-none',
        className
      )}
      {...props}
    >
      {fallback || alt?.charAt(0).toUpperCase() || '?'}
    </div>
  );
});

Avatar.displayName = 'Avatar';

const AvatarGroup = forwardRef(({ className, children, max = 4, overlap = -8, size = 'md', shape = 'circle', ...props }, ref) => {
  const kids = Array.isArray(children) ? children : [children];
  const visible = kids.slice(0, max);
  const remaining = kids.length - max;

  return (
    <div ref={ref} className={cn('flex items-center', className)} {...props}>
      {visible.map((child, index) => (
        <div
          key={index}
          className="relative"
          style={{ zIndex: max - index, marginLeft: index > 0 ? overlap : 0 }}
        >
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div className={cn('ml-2 flex items-center justify-center bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900', avatarSizes[size], avatarShapes[shape])}>
          +{remaining}
        </div>
      )}
    </div>
  );
});

AvatarGroup.displayName = 'AvatarGroup';
export { Avatar, AvatarGroup };
