import { Newspaper } from "lucide-react";

interface LoadingOverlayProps {
  progress: number;
  totalPages: number;
}

export function LoadingOverlay({ progress, totalPages }: LoadingOverlayProps) {
  const percentage = totalPages > 0 ? Math.round((progress / totalPages) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex items-center justify-center animate-fade-in">
      <div className="text-center">
        {/* Animated Icon */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-slow" />
          <div className="absolute inset-2 rounded-full bg-primary/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Newspaper className="w-10 h-10 text-primary" />
          </div>
          {/* Spinner ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="4"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${percentage * 2.83} 283`}
              className="transition-all duration-300"
            />
          </svg>
        </div>

        {/* Text */}
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Fetching E-Paper
        </h3>
        <p className="text-muted-foreground mb-4">
          Loading page <span className="text-primary font-medium">{progress}</span> of{" "}
          <span className="text-primary font-medium">{totalPages}</span>
        </p>

        {/* Progress bar */}
        <div className="w-48 h-1.5 bg-muted rounded-full mx-auto overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
