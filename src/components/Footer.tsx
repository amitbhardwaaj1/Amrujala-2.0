import { Heart, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full py-4 mt-auto bg-slate-950 border-t border-slate-850 text-[11px] text-slate-500 font-medium z-10">
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <span className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Connection: Secure (Cloudfront SSL)
          </span>
          <span className="h-3 w-[1px] bg-slate-800 hidden md:inline"></span>
          <span className="flex items-center gap-1.5 text-emerald-550 font-semibold">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Cloud Storage Sync
          </span>
        </div>
        
        <div className="flex items-center gap-4 uppercase tracking-wider text-[10px]">
          <span className="flex items-center gap-1 text-slate-400 font-sans">
            © 2026 E-Paper Downloader • Developed with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> by Amit
          </span>
          <span className="bg-slate-900 py-0.5 px-2 rounded-md text-slate-400 border border-slate-800">
            Build 2.0.26
          </span>
        </div>
      </div>
    </footer>
  );
}
