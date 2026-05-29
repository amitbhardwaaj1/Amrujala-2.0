import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { NewspaperId, newspapers, NewspaperConfig } from "@/data/newspapers";

interface NewspaperContextType {
  currentPaper: NewspaperConfig;
  setCurrentPaper: (id: NewspaperId) => void;
}

const NewspaperContext = createContext<NewspaperContextType | undefined>(undefined);

export function NewspaperProvider({ children }: { children: ReactNode }) {
  const [paperId, setPaperId] = useState<NewspaperId>("amar-ujala");

  // Update CSS variables for dynamic theming whenever paperId changes
  useEffect(() => {
    const root = document.documentElement;
    const paper = newspapers[paperId];
    root.style.setProperty("--primary", paper.primaryColor);
    root.style.setProperty("--accent", paper.accentColor);
    root.style.setProperty("--ring", paper.primaryColor);
    root.style.setProperty("--sidebar-primary", paper.primaryColor);
    
    // Map HSL to RGB approximations for glassy glow effects
    const rgbMap: Record<NewspaperId, string> = {
      "amar-ujala": "255, 96, 61",
      "dainik-jagran": "238, 43, 43",
      "hindustan-times": "13, 128, 242",
      "times-of-india": "234, 179, 8", // Amber accent color
      "hindustan": "0, 183, 255",
    };
    root.style.setProperty("--primary-rgb", rgbMap[paperId] || "255, 96, 61");
  }, [paperId]);

  const setCurrentPaper = useCallback((id: NewspaperId) => {
    setPaperId(id);
  }, []);

  return (
    <NewspaperContext.Provider value={{ currentPaper: newspapers[paperId], setCurrentPaper }}>
      {children}
    </NewspaperContext.Provider>
  );
}

export function useNewspaper() {
  const ctx = useContext(NewspaperContext);
  if (!ctx) throw new Error("useNewspaper must be used within NewspaperProvider");
  return ctx;
}
