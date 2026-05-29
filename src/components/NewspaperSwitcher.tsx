import { useState } from "react";
import { Newspaper, ChevronDown } from "lucide-react";
import { useNewspaper } from "@/data/contexts/NewspaperContext";
import { newspaperList, NewspaperId } from "@/data/newspapers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface NewspaperSwitcherProps {
  onPaperChange?: () => void;
}

export function NewspaperSwitcher({ onPaperChange }: NewspaperSwitcherProps) {
  const { currentPaper, setCurrentPaper } = useNewspaper();
  const [open, setOpen] = useState(false);

  const handleSelect = (id: NewspaperId) => {
    setCurrentPaper(id);
    setOpen(false);
    onPaperChange?.();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-slate-950 border-slate-900 hover:bg-slate-900 text-slate-100 hover:text-slate-100 border h-10 px-3.5 gap-2"
        >
          <Newspaper className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{currentPaper.name}</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-slate-950 border border-slate-900 text-slate-100 z-50 shadow-2xl p-1.5"
      >
        {newspaperList.map((paper) => (
          <DropdownMenuItem
            key={paper.id}
            onClick={() => handleSelect(paper.id)}
            className={`cursor-pointer rounded-lg py-2.5 px-3.5 flex items-center justify-between transition-all ${
              paper.id === currentPaper.id
                ? "bg-primary/10 text-primary font-medium"
                : "text-slate-300 hover:bg-white/5 hover:text-slate-100"
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-sm">{paper.name}</span>
              <span className="text-[11px] text-slate-500">{paper.shortName} ePaper</span>
            </div>
            {paper.id === currentPaper.id && <span className="w-1.5 h-1.5 rounded-full bg-primary glow-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
