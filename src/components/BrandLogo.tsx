import React from "react";
import { NewspaperId } from "@/data/newspapers";

interface BrandLogoProps {
  id: NewspaperId;
  className?: string;
  isCompact?: boolean;
}

export function BrandLogo({ id, className = "", isCompact = false }: BrandLogoProps) {
  switch (id) {
    case "amar-ujala":
      return (
        <div className={`flex flex-col items-center justify-center bg-white border border-slate-300 text-slate-900 rounded shadow-sm px-2.5 py-1 ${className}`}>
          <span className="font-devanagari text-xs md:text-sm leading-none font-black tracking-tight text-black font-semibold">अमर</span>
          <span className="font-devanagari text-xs md:text-sm leading-tight font-black tracking-tight text-black font-semibold">उजाला</span>
        </div>
      );

    case "dainik-jagran":
      return (
        <div className={`flex items-center gap-1.5 bg-slate-900 border border-amber-500/20 px-2 py-1 rounded-md ${className}`}>
          {/* Stylized Sunburst Icon */}
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-white text-xs select-none shadow-sm shadow-orange-500/20 font-bold">
            ☀
          </div>
          <span className="font-devanagari text-sm md:text-base font-bold text-[#f43f5e] leading-none min-h-fit">जागरण</span>
        </div>
      );

    case "hindustan":
      return (
        <div className={`flex items-center px-2.5 py-1.5 bg-slate-900 border border-sky-500/20 rounded-md ${className}`}>
          <span className="font-devanagari text-xs md:text-sm font-extrabold text-[#00b7ff] leading-none">हिन्दुस्तान</span>
        </div>
      );

    case "hindustan-times":
      return (
        <div className={`flex flex-col justify-center border-l-2 border-[#1380f2] pl-2.5 leading-none py-0.5 ${className}`}>
          <span className="font-sans font-black text-[11px] md:text-xs tracking-wider text-[#1380f2] uppercase font-extrabold">Hindustan</span>
          <span className="font-sans font-light text-[9px] md:text-[10px] tracking-widest text-slate-400 uppercase font-medium">Times</span>
        </div>
      );

    case "times-of-india":
      return (
        <div className={`flex flex-col justify-center border-l-2 border-yellow-500 pl-2.5 leading-none py-0.5 ${className}`}>
          <span className="font-serif font-black text-[11px] md:text-xs tracking-wide text-yellow-500 uppercase font-extrabold">THE TIMES</span>
          <span className="font-serif font-light text-[9px] md:text-[10px] tracking-widest text-slate-400 uppercase">Of India</span>
        </div>
      );

    default:
      return null;
  }
}
