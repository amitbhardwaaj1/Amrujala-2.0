// Newspaper configuration with branding, cities, and API details

export type NewspaperId = "amar-ujala" | "dainik-jagran" | "hindustan-times" | "times-of-india" | "hindustan";

export interface NewspaperConfig {
  id: NewspaperId;
  name: string;
  shortName: string;
  primaryColor: string; // HSL format for CSS variables
  accentColor: string;
  hasStates: boolean; // Jagran has state -> city hierarchy
  hasDynamicCities: boolean; // HT fetches cities from API
  hasSubEditions: boolean; // HT has city -> sub-edition hierarchy
  hasPaperType: boolean; // Amar Ujala has main/mycity editions
}

export const newspapers: Record<NewspaperId, NewspaperConfig> = {
  "amar-ujala": {
    id: "amar-ujala",
    name: "Amar Ujala",
    shortName: "AU",
    primaryColor: "12 100% 64%",
    accentColor: "25 100% 60%",
    hasStates: false,
    hasDynamicCities: false,
    hasSubEditions: false,
    hasPaperType: true,
  },
  "dainik-jagran": {
    id: "dainik-jagran",
    name: "Dainik Jagran",
    shortName: "DJ",
    primaryColor: "0 85% 55%",
    accentColor: "30 90% 55%",
    hasStates: true,
    hasDynamicCities: false,
    hasSubEditions: false,
    hasPaperType: false,
  },
  "hindustan-times": {
    id: "hindustan-times",
    name: "Hindustan Times",
    shortName: "HT",
    primaryColor: "210 90% 50%",
    accentColor: "200 85% 60%",
    hasStates: false,
    hasDynamicCities: true,
    hasSubEditions: true,
    hasPaperType: false,
  },
  "times-of-india": {
    id: "times-of-india",
    name: "Times of India",
    shortName: "TOI",
    primaryColor: "0 0% 20%",
    accentColor: "45 100% 50%",
    hasStates: false,
    hasDynamicCities: false,
    hasSubEditions: false,
    hasPaperType: false,
  },
  "hindustan": {
    id: "hindustan",
    name: "Hindustan",
    shortName: "HTN",
    primaryColor: "196 100% 50%",
    accentColor: "200 85% 60%",
    hasStates: true,
    hasDynamicCities: true,
    hasSubEditions: false,
    hasPaperType: false,
  },
};

export const newspaperList = Object.values(newspapers);
