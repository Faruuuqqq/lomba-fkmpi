import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const spinnerSize = sizeClasses[size];

  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <div className={cn("animate-spin", spinnerSize)}>
        <div className="border-2 border-t-transparent border-current border-r-transparent rounded-full animate-spin" />
      </div>
      {text && (
        <span className="text-sm text-muted-foreground animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
}

export function FullPageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-lg text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

export function CardLoader() {
  return (
    <div className="p-8 flex items-center justify-center min-h-[200px]">
      <LoadingSpinner text="Loading data..." />
    </div>
  );
}