import * as React from 'react';
import { cn } from "@/lib/utils";
import { useFocusManagement } from '@/hooks/useFocusManagement';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-describedby' | string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = 'default', size = 'md', children, disabled = false, ...props }, ref) => {
    const { registerFocusable, unregisterFocusable } = useFocusManagement();
  
    return (
    <button
      ref={ref}
      className={cn(
        // Base styles
        "inline-flex items-center justify-center",
        "font-medium",
        "transition-colors",
        "focus-visible:outline-none",
        "focus:ring-2",
        "focus:ring-primary",
        "focus:ring-offset-2",
        "disabled:opacity-50",
        "disabled:cursor-not-allowed",
        "hover:opacity-90",
        "px-3 py-2",
        "rounded-md",
        
        // Variant styles
        variant === 'default' && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === 'outline' && "border border-input bg-background hover:bg-muted hover:text-foreground",
        variant === 'ghost' && "border-transparent bg-transparent hover:bg-gray-100 hover:text-gray-700",
        variant === 'link' && "border-transparent bg-transparent hover:text-primary hover:underline",
        variant === 'destructive' && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        variant === 'secondary' && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        variant === 'muted' && "bg-muted text-muted-foreground hover:bg-muted/80",
        
        // Size styles
        size === 'xs' && "h-6 px-2 text-xs",
        size === 'sm' && "h-8 px-3 text-sm",
        size === 'md' && "h-10 px-4 text-base",
        size === 'lg' && "h-12 px-6 text-lg",
        size === 'xl' && "h-16 px-8 text-xl",
        size === '2xl' && "h-20 px-10 text-2xl",
        size === '3xl' && "h-20 px-12 text-3xl",
        
        // Touch-friendly sizes
        size === 'xs' && "min-h-[44px]",
        size === 'sm' && "min-h-[44px]",
        size === 'md' && "min-h-[44px]",
        size === 'lg' && "min-h-[44px]",
        size === 'xl' && "min-h-[44px]",
        size === '2xl' && "min-h-[44px]",
        
        className
      )}
      
      disabled={disabled}
      ref={ref}
      {...props}
      aria-label={props['aria-label']}
      aria-describedby={props['aria-describedby']}
      onFocus={() => {
        registerFocusable(ref.current!);
      }}
      onBlur={() => {
        if (ref.current) {
          unregisterFocusable(ref.current);
        }
      }}
    </button>
  );
};

Button.displayName = 'Button';

export { Button };