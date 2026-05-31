import React, { useState, useRef, useCallback, useEffect } from "react";
import { useDrag } from "@use-gesture/react";
import { jsPDF } from "jspdf";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Rows3,
  Columns3,
  LayoutGrid,
  Hash,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { NewspaperId, newspapers } from "@/data/newspapers";

interface PageScrollProps {
  pages: string[];
  onBack: () => void;
  city?: string;
  date?: string;
  newspaper?: NewspaperId;
}

type ScrollMode = "vertical" | "horizontal" | "grid";

export function PageScroll({ pages, onBack, city, date, newspaper = "amar-ujala" }: PageScrollProps) {
  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [scrollMode, setScrollMode] = useState<ScrollMode>("vertical");
  const [jumpToPage, setJumpToPage] = useState("");
  const [isJumpOpen, setIsJumpOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);

  // Handle browser back button - push state when component mounts
  useEffect(() => {
    // Push a state so back button doesn't close the window
    window.history.pushState({ viewingPages: true }, "");

    const handlePopState = (event: PopStateEvent) => {
      // User pressed back button, go back to form
      onBack();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [onBack]);

  // Download all pages as PDF
  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const extractImageSrc = (html: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const images = Array.from(doc.querySelectorAll("img"));

        for (const img of images) {
          const src = img.getAttribute("src")?.trim();
          const dataSrc = img.getAttribute("data-src")?.trim();
          const lazySrc = img.getAttribute("data-lazy-src")?.trim();
          const original = img.getAttribute("data-original")?.trim();
          const srcset = img.getAttribute("srcset")?.trim();

          const candidate = src || dataSrc || lazySrc || original;
          if (candidate) return candidate;

          if (srcset) {
            const parts = srcset.split(",").map((item) => item.trim().split(" ")[0]);
            const last = parts[parts.length - 1];
            if (last) return last;
          }
        }

        const fallbackMatch = html.match(/src=["']([^"']+)["']/) || html.match(/data-src=["']([^"']+)["']/);
        return fallbackMatch?.[1] || "";
      };

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage();

        const imgSrc = extractImageSrc(pages[i]);
        if (!imgSrc) {
          pdf.setFontSize(12);
          pdf.setTextColor(255, 255, 255);
          pdf.text(`Page ${i + 1} image unavailable`, 20, 30);
          pdf.setFontSize(9);
          pdf.setTextColor(100);
          pdf.text("@amitbhardwaaj1", 10, pageHeight - 10);
          continue;
        }

        const normalizedSrc = imgSrc.startsWith("//") ? `https:${imgSrc}` : imgSrc;
        const img = new Image();
        img.crossOrigin = "anonymous";

        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            const width = img.naturalWidth || img.width;
            const height = img.naturalHeight || img.height;
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");

            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const imgData = canvas.toDataURL("image/jpeg", 0.9);

              const imgRatio = width / height;
              const pageRatio = pageWidth / pageHeight;
              let finalWidth = pageWidth;
              let finalHeight = pageHeight;

              if (imgRatio > pageRatio) {
                finalHeight = pageWidth / imgRatio;
              } else {
                finalWidth = pageHeight * imgRatio;
              }

              const x = (pageWidth - finalWidth) / 2;
              const y = (pageHeight - finalHeight) / 2;

              pdf.addImage(imgData, "JPEG", x, y, finalWidth, finalHeight);
            }

            pdf.setFontSize(9);
            pdf.setTextColor(100);
            pdf.text("@amitbhardwaaj1", 10, pageHeight - 10);
            resolve();
          };
          img.onerror = () => reject(new Error(`Failed to load image for page ${i + 1}`));
          img.src = normalizedSrc;
        });
      }

      const paperName = newspapers[newspaper]?.id || "epaper";
      const fileName = `@amitbhardwaaj1-${paperName}-${city || "edition"}-${date || new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);

      toast({
        title: "Download Complete! 📄",
        description: `${pages.length} pages saved as PDF`,
      });
    } catch (error) {
      console.error("PDF creation failed:", error);
      toast({
        title: "Download Failed",
        description: "Could not create PDF file",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));

  const goToPage = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(0, Math.min(pages.length - 1, index));
      setCurrentPage(clampedIndex);

      if (scrollMode === "vertical") {
        const container = scrollRef.current;
        if (!container) return;
        const pageElements = container.querySelectorAll("[data-page]");
        if (pageElements[clampedIndex]) {
          pageElements[clampedIndex].scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      } else {
        const container = horizontalRef.current;
        if (!container) return;
        container.scrollTo({
          left: clampedIndex * container.offsetWidth,
          behavior: "smooth",
        });
      }
    },
    [scrollMode, pages.length]
  );

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpToPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pages.length) {
      goToPage(pageNum - 1);
      setIsJumpOpen(false);
      setJumpToPage("");
    }
  };

  const handleVerticalScroll = () => {
    if (scrollMode !== "vertical") return;
    const container = scrollRef.current;
    if (!container) return;
    const pageElements = container.querySelectorAll("[data-page]");
    let closestPage = 0;
    let minDistance = Infinity;

    pageElements.forEach((el, idx) => {
      const rect = el.getBoundingClientRect();
      const distance = Math.abs(rect.top - 100);
      if (distance < minDistance) {
        minDistance = distance;
        closestPage = idx;
      }
    });

    setCurrentPage(closestPage);
  };

  const handleHorizontalScroll = () => {
    if (scrollMode !== "horizontal") return;
    const container = horizontalRef.current;
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    const pageWidth = container.offsetWidth;
    const newPage = Math.round(scrollLeft / pageWidth);
    setCurrentPage(Math.max(0, Math.min(pages.length - 1, newPage)));
  };

  // Swipe gesture for horizontal mode
  const bind = useDrag(
    ({ direction: [dx], velocity: [vx], last }) => {
      if (scrollMode !== "horizontal" || !last) return;
      if (Math.abs(vx) > 0.2) {
        if (dx > 0) {
          goToPage(currentPage - 1);
        } else {
          goToPage(currentPage + 1);
        }
      }
    },
    { axis: "x", filterTaps: true }
  );

  const toggleMode = () => {
    setScrollMode((m) => (m === "vertical" ? "horizontal" : m === "horizontal" ? "grid" : "vertical"));
    setZoom(1);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-[#050814] text-slate-100 font-sans relative">
      {/* Floating dynamic brand ambient glow */}
      <div className="ambient-glow" />

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 px-3 py-2.5 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-foreground hover:bg-muted h-9 px-2 animate-fade-in"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <div className="flex items-center gap-1.5">
            {/* Jump to page */}
            <Popover open={isJumpOpen} onOpenChange={setIsJumpOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:bg-muted h-9 px-2"
                >
                  <Hash className="w-4 h-4" />
                  <span className="ml-1 text-sm">
                    <span className="gradient-text font-semibold">{currentPage + 1}</span>
                    <span className="text-muted-foreground">/{pages.length}</span>
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-3" align="center">
                <form onSubmit={handleJumpSubmit} className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    Jump to page (1-{pages.length})
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={pages.length}
                      value={jumpToPage}
                      onChange={(e) => setJumpToPage(e.target.value)}
                      placeholder="Page #"
                      className="h-9"
                      autoFocus
                    />
                    <Button type="submit" size="sm" className="h-9 px-3">
                      Go
                    </Button>
                  </div>
                </form>
              </PopoverContent>
            </Popover>

            {/* Segmented Viewer Switches */}
            <div className="flex bg-slate-950/80 p-0.5 rounded-lg border border-slate-800/80">
              <Button
                variant={scrollMode === "vertical" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => { setScrollMode("vertical"); setZoom(1); }}
                className={`h-8 px-2.5 text-xs rounded-md font-medium transition-all cursor-pointer ${
                  scrollMode === "vertical" ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20" : "text-slate-400 hover:text-slate-250 border border-transparent"
                }`}
                title="Vertical scroll list"
              >
                <Rows3 className="w-3.5 h-3.5 sm:mr-1" />
                <span className="hidden md:inline">List</span>
              </Button>
              <Button
                variant={scrollMode === "horizontal" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => { setScrollMode("horizontal"); setZoom(1); }}
                className={`h-8 px-2.5 text-xs rounded-md font-medium transition-all cursor-pointer ${
                  scrollMode === "horizontal" ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20" : "text-slate-400 hover:text-slate-255 border border-transparent"
                }`}
                title="Horizontal swipe viewer"
              >
                <Columns3 className="w-3.5 h-3.5 sm:mr-1" />
                <span className="hidden md:inline">Swipe</span>
              </Button>
              <Button
                variant={scrollMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => { setScrollMode("grid"); setZoom(1); }}
                className={`h-8 px-2.5 text-xs rounded-md font-medium transition-all cursor-pointer ${
                  scrollMode === "grid" ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20" : "text-slate-400 hover:text-slate-255 border border-transparent"
                }`}
                title="Grid index overview"
              >
                <LayoutGrid className="w-3.5 h-3.5 sm:mr-1" />
                <span className="hidden md:inline">Grid</span>
              </Button>
            </div>

            {/* Download PDF */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="text-foreground hover:bg-muted h-9 w-9"
              title="Download as PDF"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 spinner" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="text-foreground hover:bg-muted h-9 w-9"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground w-9 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 2}
              className="text-foreground hover:bg-muted h-9 w-9"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {scrollMode === "vertical" ? (
        /* Vertical Scroll */
        <div
          ref={scrollRef}
          onScroll={handleVerticalScroll}
          className="flex-1 overflow-auto px-4 py-6 z-10"
        >
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {pages.map((page, idx) => (
              <div
                key={idx}
                data-page={idx}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(idx * 0.08, 0.4)}s` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-foreground font-display">
                    Page <span className="gradient-text font-bold text-lg">{idx + 1}</span>
                    <span className="text-muted-foreground text-sm font-normal ml-1">
                      / {pages.length}
                    </span>
                  </h3>
                </div>
                <div
                  className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden transition-all duration-350 shadow-2xl origin-top"
                  style={{
                    transform: `scale(${zoom})`,
                    marginBottom: zoom > 1 ? `${(zoom - 1) * 100}%` : 0,
                  }}
                >
                  <div className="w-full" dangerouslySetInnerHTML={{ __html: page }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : scrollMode === "horizontal" ? (
        /* Horizontal Scroll */
        <div
          ref={horizontalRef}
          onScroll={handleHorizontalScroll}
          {...bind()}
          className="flex-1 overflow-x-auto overflow-y-hidden snap-x snap-mandatory touch-pan-x z-10"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex h-full" style={{ width: `${pages.length * 100}%` }}>
            {pages.map((page, idx) => (
              <div
                key={idx}
                data-page={idx}
                className="flex-shrink-0 h-full snap-center flex flex-col p-4 animate-fade-in"
                style={{ width: `${100 / pages.length}%` }}
              >
                <div className="text-center mb-3">
                  <span className="text-base font-semibold text-foreground font-display">
                    Page <span className="gradient-text font-bold text-lg">{idx + 1}</span>
                    <span className="text-muted-foreground text-sm font-normal ml-1">
                      / {pages.length}
                    </span>
                  </span>
                </div>
                <div
                  className="flex-1 overflow-auto flex justify-center"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  <div
                    className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden transition-all duration-350 shadow-2xl h-fit max-w-4xl w-full origin-top"
                    style={{ transform: `scale(${zoom})` }}
                  >
                    <div className="w-full" dangerouslySetInnerHTML={{ __html: page }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Grid Index Overview Mode */
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 bg-slate-900/40 p-6 rounded-2xl border border-slate-800/40 backdrop-blur animate-fade-in">
              <h2 className="text-xl md:text-2xl font-bold font-display text-white mb-2">
                E-Paper Index Map
              </h2>
              <p className="text-slate-400 text-sm font-sans">
                Total <span className="gradient-text font-bold text-lg">{pages.length} Pages</span> loaded • Tap any page thumbnail snapshot to open that page directly
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {pages.map((page, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentPage(idx);
                    setScrollMode("vertical");
                  }}
                  className="group relative bg-slate-950/90 rounded-xl overflow-hidden aspect-[3/4] cursor-pointer hover:scale-[1.03] transition-all duration-300 animate-fade-up text-left border border-slate-800/80 hover:border-primary/40 block w-full focus:outline-none shadow-xl"
                  style={{ animationDelay: `${Math.min(idx * 0.04, 0.4)}s` }}
                >
                  {/* Miniature Snapshot container */}
                  <div className="absolute inset-0 p-1.5 overflow-hidden select-none pointer-events-none brightness-[0.7] group-hover:brightness-95 group-hover:scale-105 transition-all duration-500 rounded-t-xl">
                    <div
                      className="w-[400%] h-[400%] origin-top-left scale-[0.25] pointer-events-none"
                      dangerouslySetInnerHTML={{ __html: page }}
                    />
                  </div>

                  {/* Aesthetic gradient shadow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent group-hover:via-slate-950/30 transition-all duration-300" />

                  {/* Float Page Badge */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                    <span className="px-2.5 py-1 text-xs font-semibold text-slate-100 bg-slate-900/90 border border-slate-850 rounded-lg shadow-lg">
                      Page {idx + 1}
                    </span>
                    <span className="text-[10px] tracking-wider uppercase font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Read →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      {scrollMode !== "grid" && (
        <div className="sticky bottom-0 z-40 bg-slate-950/95 backdrop-blur border-t border-slate-850 px-3 py-2.5 shadow-2xl animate-fade-in">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="h-9 px-3 border-border text-foreground hover:bg-muted disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 mr-0.5" />
              <span className="hidden sm:inline">Prev</span>
            </Button>

            {/* Page dots */}
            <div className="flex items-center gap-1 max-w-[180px] sm:max-w-[240px] overflow-x-auto scrollbar-none py-1">
              {pages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToPage(idx)}
                  className={`flex-shrink-0 w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === currentPage
                      ? "bg-primary w-5"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50 animate-pulse-slow"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === pages.length - 1}
              className="h-9 px-3 border-border text-foreground hover:bg-muted disabled:opacity-40 cursor-pointer"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
