import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DownloadForm } from "@/components/DownloadForm";
import { PageScroll } from "@/components/PageScroll";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { useEpaperDownload } from "@/hooks/useEpaperDownload";
import { NewspaperId } from "@/data/newspapers";

const Index = () => {
  const { isLoading, pages, progress, totalPages, city, date, newspaper, download, reset } = useEpaperDownload();

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
