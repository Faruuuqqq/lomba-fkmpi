import * as React from 'react';
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = 'default', size = 'md', children, disabled = false, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center font-black uppercase tracking-wider transition-colors focus-visible:outline-none focus:ring-4 focus:ring-bauhaus-red focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 px-4 py-3 rounded-none border-4 border-bauhaus shadow-bauhaus btn-press min-h-[44px]";
    
    const variantClasses = {
      default: "bg-bauhaus-red text-white hover:bg-bauhaus-red/90",
      destructive: "bg-black text-white hover:bg-gray-800",
      outline: "bg-white text-foreground hover:bg-bauhaus-yellow",
      secondary: "bg-white text-bauhaus-blue hover:bg-bauhaus-blue/10",
      ghost: "bg-transparent text-bauhaus-blue hover:bg-bauhaus-yellow hover:text-bauhaus",
      link: "bg-transparent text-bauhaus-blue hover:text-bauhaus-blue underline hover:underline-offset-4",
      muted: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    };
    
    const sizeClasses = {
      xs: "h-12 px-3 text-sm min-h-[44px]",
      sm: "h-14 px-4 text-base min-h-[44px]",
      md: "h-16 px-6 text-lg min-h-[44px]",
      lg: "h-18 px-8 text-xl min-h-[44px]",
      xl: "h-20 px-10 text-2xl min-h-[44px]",
      '2xl': "h-24 px-12 text-3xl min-h-[44px]",
      '3xl': "h-28 px-14 text-4xl min-h-[44px]",
    };

    return (
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={disabled}
        ref={ref}
        {...props}
        aria-label={props['aria-label']}
        aria-describedby={props['aria-describedby']}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };