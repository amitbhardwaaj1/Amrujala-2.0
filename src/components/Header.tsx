import { Newspaper } from "lucide-react";
import { useNewspaper } from "@/data/contexts/NewspaperContext";
import { NewspaperSwitcher } from "@/components/NewspaperSwitcher";
import { BrandLogo } from "@/components/BrandLogo";

interface HeaderProps {
  onPaperChange?: () => void;
}

export function Header({ onPaperChange }: HeaderProps) {
  const { currentPaper } = useNewspaper();

  return (
    <header className="w-full py-4 px-6 bg-slate-950/85 backdrop-blur-md border-b border-slate-900 sticky top-0 z-30 shadow-xl">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 glow-primary flex items-center justify-center shadow-lg">
            <Newspaper className="w-[22px] h-[22px] text-primary" />
          </div>
          <div className="flex items-center gap-2.5">
            <BrandLogo id={currentPaper.id} />
            <span className="text-slate-500 font-normal text-xs uppercase tracking-widest hidden sm:inline border-l border-slate-850 pl-3">
              ePaper Hub
            </span>
          </div>
        </div>

        <NewspaperSwitcher onPaperChange={onPaperChange} />
      </div>
    </header>
  );
}
