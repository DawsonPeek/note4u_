import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleItemProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'default' | 'gradient' | 'glow';
  defaultOpen?: boolean;
}

const CollapsibleItem: React.FC<CollapsibleItemProps> = ({
  title,
  children,
  icon,
  variant = 'default',
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const variantStyles = {
    default: 'bg-white border-gray-200 hover:shadow-sm',
    gradient: 'bg-gradient-to-r from-blue-500 to-purple-600 border-blue-300 text-white hover:shadow-md',
    glow: 'bg-gradient-to-r from-purple-500 to-pink-600 border-purple-300 hover:shadow-lg hover:shadow-purple-500/15',
  };

  return (
    <div className={cn(
      'rounded-lg border backdrop-blur-sm transition-all duration-300 overflow-hidden',
      variantStyles[variant]
    )}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full px-6 py-4 text-left transition-all duration-300 flex items-center justify-between',
          'hover:bg-white/10 focus:outline-none',
          variant === 'default' && 'hover:bg-gray-50'
        )}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex-shrink-0 transition-transform duration-300 hover:scale-110">
              {icon}
            </div>
          )}
          <span className={cn(
            "font-medium text-lg",
            variant === 'default' ? 'text-gray-900' : 'text-white'
          )}>
            {title}
          </span>
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 transition-transform duration-300 ease-out',
            isOpen ? 'rotate-180' : 'rotate-0',
            variant === 'default' ? 'text-gray-600' : 'text-white'
          )}
        />
      </button>

      <div
          className={cn(
              'transition-all duration-300 ease-out',
              isOpen
                  ? 'opacity-100 overflow-y-auto max-h-screen'
                  : 'max-h-0 opacity-0 overflow-hidden'
          )}
      >
        <div className="px-6 pb-4">
          <div className="border-t border-gray-200 mb-4" />
          <div className={cn(
            'transition-all duration-300 ease-out',
            isOpen
              ? 'transform translate-y-0 opacity-100'
              : 'transform translate-y-1 opacity-0'
          )}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export { CollapsibleItem };
