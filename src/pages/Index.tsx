import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DownloadForm } from "@/components/DownloadForm";
import { PageScroll } from "@/components/PageScroll";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { useEpaperDownload } from "@/hooks/useEpaperDownload";
import { NewspaperId } from "@/data/newspapers";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { isLoading, pages, downloadUrl, progress, totalPages, city, date, newspaper, download, reset } = useEpaperDownload();

  const handleDownload = (
    newspaper: NewspaperId,
    city: string,
    date: string,
    paperType?: string,
    state?: string,
    subCity?: string
  ) => {
    download(newspaper, city, date, paperType, state, subCity);
  };

  const handleBack = () => {
    reset();
  };

  // Show scroll view when pages are loaded
  if (pages.length > 0) {
    return (
      <>
        <PageScroll pages={pages} onBack={handleBack} city={city} date={date} newspaper={newspaper} />
        {isLoading && totalPages > 0 && (
          <LoadingOverlay progress={progress} totalPages={totalPages} />
        )}
      </>
    );
  }

  if (downloadUrl) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#050814]">
        <div className="ambient-glow" />
        <Header onPaperChange={reset} />
        <main className="flex-1 flex items-center justify-center px-4 z-10">
          <div className="glass-card rounded-2xl p-8 text-center max-w-md w-full animate-scale-in">
            <h1 className="text-2xl font-bold text-foreground mb-3">Hindustan E-Paper Ready</h1>
            <p className="text-muted-foreground mb-6">Your PDF download is ready.</p>
            <Button asChild className="w-full h-12">
              <a href={downloadUrl} target="_blank" rel="noreferrer" download>
                <Download className="w-4 h-4 mr-2" />
                Download E-Paper
              </a>
            </Button>
            <Button variant="ghost" onClick={reset} className="mt-3 text-muted-foreground">
              Back to Selection
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#050814]">
      {/* Floating dynamic brand ambient glow */}
      <div className="ambient-glow" />
      
      <Header onPaperChange={reset} />

      <main className="flex-1 py-12 px-4 flex flex-col justify-center items-center z-10">
        <div className="animate-fade-up w-full">
          <div className="text-center mb-10">
            <p className="text-slate-400 text-lg max-w-md mx-auto font-sans font-light tracking-wide leading-relaxed">
              Select your city and date to instantly view and download your daily newspaper
            </p>
          </div>
          <DownloadForm onDownload={handleDownload} isLoading={isLoading} />
        </div>
      </main>

      <Footer />

      {/* Loading Overlay */}
      {isLoading && totalPages > 0 && (
        <LoadingOverlay progress={progress} totalPages={totalPages} />
      )}
    </div>
  );
};

export default Index;
