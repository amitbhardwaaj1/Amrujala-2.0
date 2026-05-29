import { useState } from "react";
import { Newspaper, ChevronDown } from "lucide-react";
import { useNewspaper } from "@/contexts/NewspaperContext";
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
          className="bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-100 hover:text-slate-100 border h-9 px-3 gap-2"
        >
          <Newspaper className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium hidden sm:inline">{currentPaper.shortName}</span>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 bg-popover border-border z-50"
      >
        {newspaperList.map((paper) => (
          <DropdownMenuItem
            key={paper.id}
            onClick={() => handleSelect(paper.id)}
            className={`cursor-pointer ${
              paper.id === currentPaper.id
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-muted"
            }`}
          >
            <span className="font-medium">{paper.shortName}</span>
            <span className="ml-2 text-muted-foreground text-sm">{paper.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
