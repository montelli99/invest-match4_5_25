import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface Props {
  message?: string;
  className?: string;
}

export function LoadingOverlay({ message = "Loading...", className }: Props) {
  // Animation classes for text fade-in
  const fadeInClasses = "animate-[fadeIn_0.5s_ease-out_forwards] opacity-0";
  // Delayed fade-in for subtitle
  const fadeInDelayedClasses = "animate-[fadeIn_0.5s_ease-out_0.3s_forwards] opacity-0";
  return (
    <div
      className={cn(
        "fixed inset-0 bg-background/80 backdrop-blur-sm z-[90] flex flex-col items-center justify-center gap-6 transition-all duration-300 ease-in-out",
        className,
      )}
    >
      <div className="relative">
        {/* Outer ring animation */}
        <div className="absolute inset-0 rounded-full border-4 border-t-primary/40 border-r-primary/30 border-b-primary/20 border-l-primary/10 animate-[spin_4s_cubic-bezier(0.4,0,0.2,1)_infinite]" />
        {/* Middle ring animation */}
        <div className="absolute inset-2 rounded-full border-4 border-t-accent/40 border-r-accent/30 border-b-accent/20 border-l-accent/10 animate-[spin_3s_cubic-bezier(0.4,0,0.2,1)_infinite_reverse]" />
        {/* Additional ring for more depth */}
        <div className="absolute inset-4 rounded-full border-4 border-t-secondary/40 border-r-secondary/30 border-b-secondary/20 border-l-secondary/10 animate-[spin_2s_cubic-bezier(0.4,0,0.2,1)_infinite]" />
        {/* Inner loader */}
        <div className="h-24 w-24 rounded-full bg-card flex items-center justify-center shadow-lg animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
          <Loader2 className="h-12 w-12 text-primary animate-[spin_1.5s_linear_infinite] transition-all duration-200 ease-in-out hover:scale-110" />
        </div>
      </div>
      {message && (
        <div className="text-center space-y-2 select-none">
          <p className={`text-lg font-medium text-foreground ${fadeInClasses}`}>{message}</p>
          <p className={`text-sm text-muted-foreground ${fadeInDelayedClasses}`}>
            This will only take a moment
          </p>
        </div>
      )}
    </div>
  );
}
