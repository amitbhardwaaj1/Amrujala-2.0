import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageGridProps {
  pages: string[];
  onPageClick: (index: number) => void;
  onBack: () => void;
}

export function PageGrid({ pages, onPageClick, onBack }: PageGridProps) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 animate-fade-up">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="h-11 px-5 border-border text-foreground hover:bg-muted"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Selection
        </Button>
      </div>

      {/* Summary */}
      <div className="text-center mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
          E-Paper Loaded Successfully
        </h2>
        <p className="text-muted-foreground">
          Total <span className="text-primary font-semibold">{pages.length}</span> pages • Tap any page to view
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {pages.map((page, idx) => (
          <button
            key={idx}
            onClick={() => onPageClick(idx)}
            className="group relative glass-card rounded-xl overflow-hidden aspect-[3/4] hover:scale-[1.02] hover:glow-primary transition-all duration-300 animate-fade-up"
            style={{ animationDelay: `${Math.min(idx * 0.05, 0.5)}s` }}
          >
            {/* Thumbnail */}
            <div
              className="absolute inset-0 p-2 overflow-hidden"
              dangerouslySetInnerHTML={{ __html: page }}
              style={{ transform: "scale(0.25)", transformOrigin: "top left", width: "400%", height: "400%" }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Page Number Badge */}
            <div className="absolute bottom-2 left-2 right-2 flex justify-center">
              <span className="px-3 py-1.5 bg-primary/90 text-primary-foreground text-sm font-semibold rounded-full">
                Page {idx + 1}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
