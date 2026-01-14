import { cn } from "@/lib/utils";

interface AccessibilityProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'destructive' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
  ariaDescribedby?: string;
  'aria-expanded'?: boolean;
}

export function AccessibleButton({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  disabled = false,
  ariaLabel,
  ariaDescribedby,
  'aria-expanded' = false,
  ...props
}: AccessibilityProps) {
  return (
    <button
      className={cn(
        // Base button styles
        "inline-flex items-center justify-center",
        "font-medium",
        "transition-colors",
        "focus-visible:outline-none",
        "focus:ring-2",
        "focus:ring-primary",
        "disabled:opacity-50",
        "disabled:cursor-not-allowed",
        "hover:bg-opacity-90",
        "px-4 py-2",
        "rounded-md",
        "text-sm font-medium",
        variant === 'default' && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === 'outline' && "border border-input bg-background hover:bg-muted hover:text-foreground",
        variant === 'destructive' && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        variant === 'secondary' && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        // Accessibility
        "focus:ring-offset-2 focus:ring-ring-primary focus:ring-offset-2",
        "disabled:focus-visible:outline-none",
        className
      )}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={props['aria-describedby']}
      aria-expanded={ariaExpanded}
      {...props}
    >
      {children}
    </button>
  );
}

// Skip Link for accessibility
interface SkipLinkProps {
  href?: string;
  className?: string;
  children: React.ReactNode;
}

export function SkipLink({ href = "#", className = "", children }: SkipLinkProps) {
  return (
    <a 
      href={href} 
      className={cn(
        "sr-only focus:outline-none absolute top-4 left-6 z-50",
        "bg-primary text-white p-2 rounded-md",
        "focus:bg-primary/90",
        "hover:bg-primary/100"
      )}
    >
      {children}
      <span className="sr-only">Skip to main content</span>
    </a>
  );
}

// Focus Trap
interface FocusTrapProps {
  children: React.ReactNode;
  className?: string;
}

export function FocusTrap({ children, className = "" }: FocusTrapProps) {
  return (
    <div 
      className={cn(
        "relative",
        className
      )}
    >
      {children}
    </div>
  );
}

// Live Region for dynamic content
interface LiveRegionProps {
  children: React.ReactNode;
  className?: string;
  'aria-live'?: 'polite' | 'assertive' | 'off';
}

export function LiveRegion({ 
  children, 
  'aria-live': 'polite' = 'polite',
  className = ""
}: LiveRegionProps) {
  return (
    <div 
      role="region" 
      aria-live={ariaLive}
      aria-label="Dynamic content"
      className={cn("relative", className)}
    >
      {children}
    </div>
  );
}

// Screen Reader Only Content
interface ScreenReaderOnlyProps {
  children: React.ReactNode;
}

export function ScreenReaderOnly({ children }: ScreenReaderOnlyProps) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}