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
    const baseClasses = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 px-3 py-2 rounded-md";
    
    const variantClasses = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-input bg-background hover:bg-muted hover:text-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "border-transparent bg-transparent hover:bg-gray-100 hover:text-gray-700",
      link: "border-transparent bg-transparent hover:text-primary hover:underline",
      muted: "bg-muted text-muted-foreground hover:bg-muted/80",
    };
    
    const sizeClasses = {
      xs: "h-6 px-2 text-xs min-h-[44px]",
      sm: "h-8 px-3 text-sm min-h-[44px]",
      md: "h-10 px-4 text-base min-h-[44px]",
      lg: "h-12 px-6 text-lg min-h-[44px]",
      xl: "h-16 px-8 text-xl min-h-[44px]",
      '2xl': "h-20 px-10 text-2xl min-h-[44px]",
      '3xl': "h-20 px-12 text-3xl min-h-[44px]",
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