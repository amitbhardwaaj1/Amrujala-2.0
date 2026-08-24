import React, { useState, useMemo, useEffect } from "react";
import { Calendar, MapPin, FileText, Download, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNewspaper } from "@/data/contexts/NewspaperContext";
import { getOrderedCities, citiesData } from "@/data/cities";
import { getJagranStates, getJagranCitiesByState } from "@/data/jagranCities";
import { getTOICities } from "@/data/toiCities";
import { NewspaperId } from "@/data/newspapers";

interface HTEdition {
  EditionId: number;
  EditionName: string;
  Supplement?: { EditionId: number; EditionDisplayName: string }[];
}

interface HindustanState {
  LocationId: number;
  OrgLocation: string;
  editionlocation: {
    edition: {
      EditionId: number;
      EditionCode?: string;
      EditionDisplayName: string;
      EditionName?: string;
      editionName?: string;
    }[];
  }[];
}

interface DownloadFormProps {
  onDownload: (
    newspaper: NewspaperId,
    city: string,
    date: string,
    paperType?: string,
    state?: string,
    subCity?: string,
    citySlug?: string
  ) => void;
  isLoading: boolean;
}

export function DownloadForm({ onDownload, isLoading }: DownloadFormProps) {
  const { currentPaper } = useNewspaper();

  // Amar Ujala state
  const amarCities = useMemo(() => getOrderedCities(), []);
  const [amarCity, setAmarCity] = useState(amarCities[0]?.slug || "");
  const [paperType, setPaperType] = useState("main");

  // Dainik Jagran state
  const jagranStates = useMemo(() => getJagranStates(), []);
  const [jagranState, setJagranState] = useState(jagranStates[0] || "");
  const jagranCities = useMemo(() => getJagranCitiesByState(jagranState), [jagranState]);
  const [jagranCity, setJagranCity] = useState("");

  // Times of India state
  const toiCities = useMemo(() => getTOICities(), []);
  const [toiCity, setToiCity] = useState("delhi");

  // Hindustan Times state (dynamic)
  const [htEditions, setHtEditions] = useState<HTEdition[]>([]);
  const [htCity, setHtCity] = useState("");
  const [htSubCity, setHtSubCity] = useState("");
  const [htLoading, setHtLoading] = useState(false);

  // Hindustan state (dynamic with states)
  const [hindustanStates, setHindustanStates] = useState<HindustanState[]>([]);
  const [hindustanState, setHindustanState] = useState("");
  const [hindustanCity, setHindustanCity] = useState("");
  const [hindustanCitySlug, setHindustanCitySlug] = useState("");
  const [hindustanLoading, setHindustanLoading] = useState(false);

  // Common date
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  // Reset selections when paper changes
  useEffect(() => {
    if (currentPaper.id === "dainik-jagran" && jagranCities.length > 0 && !jagranCity) {
      setJagranCity(jagranCities[0].slug);
    }
  }, [currentPaper.id, jagranCities, jagranCity]);

  // Fetch HT editions when switching to HT or date changes
  useEffect(() => {
    if (currentPaper.id === "hindustan-times") {
      const fetchHTEditions = async () => {
        setHtLoading(true);
        try {
          const dateObj = new Date(date);
          const formattedDate = `${String(dateObj.getDate()).padStart(2, "0")}/${String(
            dateObj.getMonth() + 1
          ).padStart(2, "0")}/${dateObj.getFullYear()}`;

          const res = await fetch(
            `/api/ht/editions?EditionDate=${formattedDate}`,
            { method: "GET", headers: { "Content-Type": "application/json" } }
          );
          const data = await res.json();
          setHtEditions(data || []);

          if (data && data.length > 0) {
            setHtCity(String(data[0].EditionId));
            if (data[0].Supplement && data[0].Supplement.length > 0) {
              setHtSubCity(String(data[0].Supplement[0].EditionId));
            }
          }
        } catch (error) {
          console.error("Failed to fetch HT editions:", error);
          setHtEditions([]);
        } finally {
          setHtLoading(false);
        }
      };
      fetchHTEditions();
    }
  }, [currentPaper.id, date]);

  // Fetch Hindustan states when switching to Hindustan
  useEffect(() => {
    if (currentPaper.id === "hindustan") {
      const fetchHindustanStates = async () => {
        setHindustanLoading(true);
        try {
          const res = await fetch(
            "/api/hindustan/locations",
            { method: "GET", headers: { "Content-Type": "application/json" } }
          );
          if (!res.ok) {
            throw new Error(`Server responded with code ${res.status}`);
          }
          const data = await res.json();
          
          if (!data || data.length === 0) {
            throw new Error("Empty locations list returned from API");
          }

          // Robustly normalize property casings between camelCase and PascalCase
          const normalizedData = (data || []).map((state: any) => ({
            ...state,
            LocationId: state.locationId || state.LocationId,
            OrgLocation: state.orgLocation || state.OrgLocation,
            editionlocation: (state.editionlocation || []).map((el: any) => ({
              ...el,
              LocationId: el.locationId || el.LocationId,
              OrgLocation: el.orgLocation || el.OrgLocation,
              EditionLocation: el.editionLocation || el.EditionLocation,
              edition: (el.edition || []).map((ed: any) => ({
                ...ed,
                EditionId: ed.editionId || ed.EditionId,
                EditionName: ed.editionName || ed.EditionName,
                EditionCode: ed.editionCode || ed.EditionCode,
                EditionDisplayName: ed.editionDisplayName || ed.EditionDisplayName,
              }))
            }))
          }));
          
          setHindustanStates(normalizedData);

          if (normalizedData.length > 0) {
            setHindustanState(String(normalizedData[0].LocationId));
            const firstEd = (normalizedData[0].editionlocation || [])[0]?.edition?.[0];
            const defaultCityId = firstEd?.EditionCode || firstEd?.EditionId || "";
            const defaultCitySlug = firstEd?.EditionName || firstEd?.editionName || "delhi";
            setHindustanCity(String(defaultCityId));
            setHindustanCitySlug(String(defaultCitySlug).toLowerCase().trim().replace(/\s+/g, "-"));
          }
        } catch (error) {
          console.error("Failed to fetch Hindustan locations, using robust fallback list:", error);
          
          // Ultra-reliable preset of Hindustan regional centers across North India
          const fallbackData = [
            {
              LocationId: 1,
              OrgLocation: "Delhi NCR",
              editionlocation: [
                {
                  edition: [
                    { EditionId: 100, EditionDisplayName: "Delhi", EditionName: "delhi" }
                  ]
                }
              ]
            },
            {
              LocationId: 2,
              OrgLocation: "Bihar",
              editionlocation: [
                {
                  edition: [
                    { EditionId: 201, EditionDisplayName: "Patna", EditionName: "patna-city" },
                    { EditionId: 202, EditionDisplayName: "Bhagalpur", EditionName: "bhagalpur" },
                    { EditionId: 203, EditionDisplayName: "Muzaffarpur", EditionName: "muzaffarpur" },
                    { EditionId: 204, EditionDisplayName: "Gaya", EditionName: "gaya" }
                  ]
                }
              ]
            },
            {
              LocationId: 3,
              OrgLocation: "Uttar Pradesh",
              editionlocation: [
                {
                  edition: [
                    { EditionId: 301, EditionDisplayName: "Lucknow", EditionName: "lucknow" },
                    { EditionId: 302, EditionDisplayName: "Kanpur", EditionName: "kanpur" },
                    { EditionId: 303, EditionDisplayName: "Varanasi", EditionName: "varanasi" },
                    { EditionId: 304, EditionDisplayName: "Gorakhpur", EditionName: "gorakhpur" },
                    { EditionId: 305, EditionDisplayName: "Agra", EditionName: "agra" },
                    { EditionId: 306, EditionDisplayName: "Meerut", EditionName: "meerut" },
                    { EditionId: 307, EditionDisplayName: "Prayagraj", EditionName: "allahabad" }
                  ]
                }
              ]
            },
            {
              LocationId: 4,
              OrgLocation: "Uttarakhand",
              editionlocation: [
                {
                  edition: [
                    { EditionId: 401, EditionDisplayName: "Dehradun", EditionName: "dehradun" },
                    { EditionId: 402, EditionDisplayName: "Haldwani", EditionName: "haldwani" },
                    { EditionId: 403, EditionDisplayName: "Haridwar", EditionName: "haridwar" }
                  ]
                }
              ]
            },
            {
              LocationId: 5,
              OrgLocation: "Jharkhand",
              editionlocation: [
                {
                  edition: [
                    { EditionId: 501, EditionDisplayName: "Ranchi", EditionName: "ranchi" },
                    { EditionId: 502, EditionDisplayName: "Jamshedpur", EditionName: "jamshedpur" }
                  ]
                }
              ]
            }
          ];

          setHindustanStates(fallbackData);
          setHindustanState(String(fallbackData[0].LocationId));
          setHindustanCity(String(fallbackData[0].editionlocation[0].edition[0].EditionId));
          setHindustanCitySlug(String(fallbackData[0].editionlocation[0].edition[0].EditionName || "delhi").toLowerCase().trim().replace(/\s+/g, "-"));
        } finally {
          setHindustanLoading(false);
        }
      };
      fetchHindustanStates();
    }
  }, [currentPaper.id]);

  // Update HT sub-cities when city changes
  const htSubCities = useMemo(() => {
    const edition = htEditions.find((e) => String(e.EditionId) === htCity);
    return edition?.Supplement || [];
  }, [htEditions, htCity]);

  useEffect(() => {
    if (htSubCities.length > 0 && !htSubCities.some((s) => String(s.EditionId) === htSubCity)) {
      setHtSubCity(String(htSubCities[0].EditionId));
    }
  }, [htSubCities, htSubCity]);

  // Update Hindustan cities when state changes
  useEffect(() => {
    if (hindustanState && hindustanStates.length > 0) {
      const stateData = hindustanStates.find((s) => String(s.LocationId) === hindustanState);
      const editionsList = (stateData?.editionlocation || []).flatMap((el) => el?.edition || []);
      if (editionsList.length > 0) {
        const defaultEditionId = editionsList[0].EditionCode || editionsList[0].EditionId || "";
        const defaultEditionSlug = editionsList[0].EditionName || editionsList[0].editionName || "delhi";
        setHindustanCity(String(defaultEditionId));
        setHindustanCitySlug(String(defaultEditionSlug).toLowerCase().trim().replace(/\s+/g, "-"));
      }
    }
  }, [hindustanState, hindustanStates]);

  const hasMycity = useMemo(() => {
    const city = citiesData[amarCity];
    return city?.is_mycity === "Y";
  }, [amarCity]);

  const handleCityChange = (value: string) => {
    setAmarCity(value);
    setPaperType("main");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    if (currentPaper.id === "amar-ujala") {
      onDownload(currentPaper.id, amarCity, date, paperType);
    } else if (currentPaper.id === "dainik-jagran") {
      onDownload(currentPaper.id, jagranCity, date, undefined, jagranState);
    } else if (currentPaper.id === "hindustan-times") {
      onDownload(currentPaper.id, htCity, date, undefined, undefined, htSubCity);
    } else if (currentPaper.id === "times-of-india") {
      onDownload(currentPaper.id, toiCity, date);
    } else if (currentPaper.id === "hindustan") {
      onDownload(currentPaper.id, hindustanCity, date, undefined, undefined, undefined, hindustanCitySlug);
    }
  };

  const maxDate = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="glass-card rounded-2xl p-6 md:p-8 animate-scale-in">
        {/* Amar Ujala Form */}
        {currentPaper.id === "amar-ujala" && (
          <>
            <div className="space-y-2 mb-5">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Select City
              </label>
              <Select value={amarCity} onValueChange={handleCityChange}>
                <SelectTrigger className="w-full h-12 bg-slate-900 border-slate-700 hover:bg-slate-850 text-slate-100 placeholder-slate-400 focus:ring-primary/20 transition-all font-medium rounded-xl border">
                  <SelectValue placeholder="Choose your city" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border border-slate-800 text-slate-100 max-h-64 shadow-2xl">
                  {amarCities.map((city) => (
                    <SelectItem key={city.slug} value={city.slug} className="text-slate-200 focus:bg-white/10 hover:bg-white/5 focus:text-slate-100 py-2.5 cursor-pointer">
                      {city.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 mb-5">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Paper Type
              </label>
              <Select value={paperType} onValueChange={setPaperType}>
                <SelectTrigger className="w-full h-12 bg-slate-900 border-slate-700 hover:bg-slate-850 text-slate-100 placeholder-slate-400 focus:ring-primary/20 transition-all font-medium rounded-xl border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border border-slate-800 text-slate-100 shadow-2xl">
                  <SelectItem value="main" className="text-slate-200 focus:bg-white/10 hover:bg-white/5 focus:text-slate-100 py-2.5 cursor-pointer">
                    Main Edition
                  </SelectItem>
                  {hasMycity && (
                    <SelectItem value="mycity" className="text-slate-200 focus:bg-white/10 hover:bg-white/5 focus:text-slate-100 py-2.5 cursor-pointer">
                      My City
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Dainik Jagran Form */}
        {currentPaper.id === "dainik-jagran" && (
          <>
            <div className="space-y-2 mb-5">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                Select State
              </label>
              <Select value={jagranState} onValueChange={(v) => { setJagranState(v); setJagranCity(""); }}>
                <SelectTrigger className="w-full h-12 bg-slate-900 border-slate-700 hover:bg-slate-850 text-slate-100 placeholder-slate-400 focus:ring-primary/20 transition-all font-medium rounded-xl border">
                  <SelectValue placeholder="Choose state" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border border-slate-800 text-slate-100 max-h-64 shadow-2xl">
                  {jagranStates.map((state) => (
                    <SelectItem key={state} value={state} className="text-slate-200 focus:bg-white/10 hover:bg-white/5 focus:text-slate-100 py-2.5 cursor-pointer">
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 mb-5">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Select City
              </label>
              <Select value={jagranCity} onValueChange={setJagranCity}>
                <SelectTrigger className="w-full h-12 bg-slate-900 border-slate-700 hover:bg-slate-850 text-slate-100 placeholder-slate-400 focus:ring-primary/20 transition-all font-medium rounded-xl border">
                  <SelectValue placeholder="Choose city" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border border-slate-800 text-slate-100 max-h-64 shadow-2xl">
                  {jagranCities.map((city) => (
                    <SelectItem key={city.slug} value={city.slug} className="text-slate-200 focus:bg-white/10 hover:bg-white/5 focus:text-slate-100 py-2.5 cursor-pointer">
                      {city.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Hindustan Times Form */}
        {currentPaper.id === "hindustan-times" && (
          <>
            <div className="space-y-2 mb-5">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Select Edition
              </label>
              <Select value={htCity} onValueChange={setHtCity} disabled={htLoading}>
                <SelectTrigger className="w-full h-12 bg-slate-900 border-slate-700 hover:bg-slate-850 text-slate-100 placeholder-slate-400 focus:ring-primary/20 transition-all font-medium rounded-xl border">
                  <SelectValue placeholder={htLoading ? "Loading..." : "Choose edition"} />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border border-slate-800 text-slate-100 max-h-64 shadow-2xl">
                  {htEditions.map((ed) => (
                    <SelectItem key={ed.EditionId} value={String(ed.EditionId)} className="text-slate-200 focus:bg-white/10 hover:bg-white/5 focus:text-slate-100 py-2.5 cursor-pointer">
                      {ed.EditionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {htSubCities.length > 0 && (
              <div className="space-y-2 mb-5">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  Select Supplement
                </label>
                <Select value={htSubCity} onValueChange={setHtSubCity}>
                  <SelectTrigger className="w-full h-12 bg-slate-900 border-slate-700 hover:bg-slate-850 text-slate-100 placeholder-slate-400 focus:ring-primary/20 transition-all font-medium rounded-xl border">
                    <SelectValue placeholder="Choose supplement" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border border-slate-800 text-slate-100 max-h-64 shadow-2xl">
                    {htSubCities.map((sub) => (
                      <SelectItem key={sub.EditionId} value={String(sub.EditionId)} className="text-slate-200 focus:bg-white/10 hover:bg-white/5 focus:text-slate-100 py-2.5 cursor-pointer">
                        {sub.EditionDisplayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}

        {/* Times of India Form */}
        {currentPaper.id === "times-of-india" && (
          <div className="space-y-2 mb-5">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              Select City
            </label>
            <Select value={toiCity} onValueChange={setToiCity}>
              <SelectTrigger className="w-full h-12 bg-slate-900 border-slate-700 hover:bg-slate-850 text-slate-100 placeholder-slate-400 focus:ring-primary/20 transition-all font-medium rounded-xl border">
                <SelectValue placeholder="Choose your city" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border border-slate-800 text-slate-100 max-h-64 shadow-2xl">
                {toiCities.map((city) => (
                  <SelectItem key={city.slug} value={city.slug} className="text-slate-200 focus:bg-white/10 hover:bg-white/5 focus:text-slate-100 py-2.5 cursor-pointer">
                    {city.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Hindustan Form */}
        {currentPaper.id === "hindustan" && (
          <>
            <div className="space-y-2 mb-5">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                Select State
              </label>
              <Select value={hindustanState} onValueChange={(v) => { setHindustanState(v); setHindustanCity(""); }} disabled={hindustanLoading}>
                <SelectTrigger className="w-full h-12 bg-slate-900 border-slate-700 hover:bg-slate-850 text-slate-100 placeholder-slate-400 focus:ring-primary/20 transition-all font-medium rounded-xl border">
                  <SelectValue placeholder={hindustanLoading ? "Loading..." : "Choose state"} />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border border-slate-800 text-slate-100 max-h-64 shadow-2xl">
                  {hindustanStates.map((state) => (
                    <SelectItem key={state.LocationId} value={String(state.LocationId)} className="text-slate-200 focus:bg-white/10 hover:bg-white/5 focus:text-slate-100 py-2.5 cursor-pointer">
                      {state.OrgLocation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 mb-5">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Select City
              </label>
              <Select
                value={hindustanCity}
                onValueChange={(value) => {
                  const stateData = hindustanStates.find((s) => String(s.LocationId) === hindustanState);
                  const editionsList = (stateData?.editionlocation || []).flatMap((el) => el?.edition || []);
                  const selectedEdition = editionsList.find(
                    (edition) => String(edition.EditionCode || edition.EditionId) === value
                  );

                  setHindustanCity(value);
                  if (selectedEdition) {
                    const slug = String(selectedEdition.EditionName || selectedEdition.editionName || "").toLowerCase().trim().replace(/\s+/g, "-");
                    setHindustanCitySlug(slug);
                  }
                }}
                disabled={hindustanLoading}
              >
                <SelectTrigger className="w-full h-12 bg-slate-900 border-slate-700 hover:bg-slate-850 text-slate-100 placeholder-slate-400 focus:ring-primary/20 transition-all font-medium rounded-xl border">
                  <SelectValue placeholder={hindustanLoading ? "Loading..." : "Choose city"} />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border border-slate-800 text-slate-100 max-h-64 shadow-2xl">
                  {(hindustanStates
                    .find((s) => String(s.LocationId) === hindustanState)
                    ?.editionlocation || [])
                    .flatMap((el) => el?.edition || [])
                    .map((edition) => (
                      <SelectItem key={edition.EditionId} value={String(edition.EditionCode || edition.EditionId)} className="text-slate-200 focus:bg-white/10 hover:bg-white/5 focus:text-slate-100 py-2.5 cursor-pointer">
                        {edition.EditionDisplayName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Date Picker - Common */}
        <div className="space-y-2 mb-6">
          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            Select Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={maxDate}
            className="w-full h-12 px-4 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer font-medium rounded-xl"
          />
        </div>

        {/* Download Button */}
        <Button
          type="submit"
          disabled={isLoading || !date || (currentPaper.id === "hindustan-times" && htLoading) || (currentPaper.id === "hindustan" && hindustanLoading)}
          className="w-full h-14 text-base font-bold rounded-xl bg-primary hover:scale-[1.01] hover:brightness-110 active:scale-[0.98] text-primary-foreground glow-primary transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 border border-primary/20 cursor-pointer shadow-lg shadow-primary/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 spinner" />
              Fetching Pages...
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              Read E-Paper
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
