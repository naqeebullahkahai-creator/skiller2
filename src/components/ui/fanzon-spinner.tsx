import { cn } from "@/lib/utils";

interface FanzonSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const FanzonSpinner = ({ size = "md", className }: FanzonSpinnerProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        {/* Outer spinning ring */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
        {/* Inner pulsing dot */}
        <div className="absolute inset-2 rounded-full bg-primary/10 animate-pulse" />
      </div>
    </div>
  );
};

interface PageLoaderProps {
  message?: string;
}

export const PageLoader = ({ message = "Loading..." }: PageLoaderProps) => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Logo */}
        <div className="text-2xl font-bold text-primary tracking-tight mb-4 text-center">
          FANZOON
        </div>
        <FanzonSpinner size="lg" />
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
    </div>
  );
};

export const FullPageLoader = ({ message }: PageLoaderProps) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <PageLoader message={message} />
    </div>
  );
};

export default FanzonSpinner;
