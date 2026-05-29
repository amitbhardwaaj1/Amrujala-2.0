// Times of India city data

export interface TOICity {
  slug: string;
  city: string;
}

export const toiData: TOICity[] = [
  { slug: "ahmedabad", city: "Ahmedabad" },
  { slug: "bangalore", city: "Bangalore" },
  { slug: "bhopal", city: "Bhopal" },
  { slug: "chandigarh", city: "Chandigarh" },
  { slug: "chennai", city: "Chennai" },
  { slug: "delhi", city: "Delhi" },
  { slug: "goa", city: "Goa" },
  { slug: "hyderabad", city: "Hyderabad" },
  { slug: "jaipur", city: "Jaipur" },
  { slug: "kochi", city: "Kochi" },
  { slug: "kolkata", city: "Kolkata" },
  { slug: "lucknow", city: "Lucknow" },
  { slug: "mumbai", city: "Mumbai" },
  { slug: "pune", city: "Pune" },
];

export function getTOICities(): TOICity[] {
  return toiData;
}
