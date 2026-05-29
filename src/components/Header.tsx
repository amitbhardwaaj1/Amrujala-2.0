import { Newspaper } from "lucide-react";
import { useNewspaper } from "@/contexts/NewspaperContext";
import { NewspaperSwitcher } from "@/components/NewspaperSwitcher";

interface HeaderProps {
  onPaperChange?: () => void;
}

export function Header({ onPaperChange }: HeaderProps) {
  const { currentPaper } = useNewspaper();

  return (
    <header className="w-full py-4 px-6 bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 glow-primary flex items-center justify-center">
            <Newspaper className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight font-display flex items-center">
            <span className="gradient-text tracking-tight">{currentPaper.name}</span>
            <span className="text-slate-400 font-normal text-xs uppercase tracking-widest hidden sm:inline border-l border-white/10 pl-3 ml-3">ePaper</span>
          </h1>
        </div>

        <NewspaperSwitcher onPaperChange={onPaperChange} />
      </div>
    </header>
  );
}
