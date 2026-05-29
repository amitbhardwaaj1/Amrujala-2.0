import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PagePreviewProps {
  pages: string[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onClose: () => void;
}

export function PagePreview({ pages, currentPage, onPageChange, onClose }: PagePreviewProps) {
  const [zoom, setZoom] = useState(1);

  const handlePrev = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
      setZoom(1);
    }
  };

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      onPageChange(currentPage + 1);
      setZoom(1);
    }
  };

  const handleZoomIn = () => {
    setZoom((z) => Math.min(z + 0.25, 2));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(z - 0.25, 0.5));
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-foreground hover:bg-muted"
        >
          <X className="w-5 h-5 mr-1" />
          Close
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-foreground">
            Page <span className="gradient-text">{currentPage + 1}</span>
            <span className="text-muted-foreground"> / {pages.length}</span>
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="text-foreground hover:bg-muted"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoom >= 2}
            className="text-foreground hover:bg-muted"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div
          className="max-w-4xl mx-auto transition-transform duration-300"
          style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
        >
          <div
            className="rounded-xl overflow-hidden shadow-2xl animate-scale-in bg-card"
            dangerouslySetInnerHTML={{ __html: pages[currentPage] }}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 px-4 py-4 border-t border-slate-800 bg-slate-950">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentPage === 0}
          className="h-12 px-6 border-border text-foreground hover:bg-muted disabled:opacity-40"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Previous
        </Button>

        {/* Page dots */}
        <div className="hidden md:flex items-center gap-1.5 max-w-xs overflow-auto">
          {pages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                onPageChange(idx);
                setZoom(1);
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                idx === currentPage
                  ? "bg-primary w-6"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentPage === pages.length - 1}
          className="h-12 px-6 border-border text-foreground hover:bg-muted disabled:opacity-40"
        >
          Next
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
