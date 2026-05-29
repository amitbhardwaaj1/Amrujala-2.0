export interface City {
  title: string;
  slug: string;
  is_mycity: string | null;
}

export const citiesData: Record<string, City> = {
  "agra-city": { title: "Agra City", slug: "agra-city", is_mycity: "Y" },
  "agra-dehat": { title: "Agra Dehat", slug: "agra-dehat", is_mycity: "Y" },
  "mathura": { title: "Mathura", slug: "mathura", is_mycity: null },
  "hathras": { title: "Hathras", slug: "hathras", is_mycity: "Y" },
  "aligarh-city": { title: "Aligarh City", slug: "aligarh-city", is_mycity: null },
  "aligarh-dehat": { title: "Aligarh Dehat", slug: "aligarh-dehat", is_mycity: null },
  "ambala": { title: "Ambala", slug: "ambala", is_mycity: "Y" },
  "lucknow-city": { title: "Lucknow City", slug: "lucknow-city", is_mycity: "Y" },
  "meerut-city": { title: "Meerut City", slug: "meerut-city", is_mycity: "Y" },
  "noida": { title: "Noida", slug: "noida", is_mycity: "Y" },
  "varanasi-city": { title: "Varanasi City", slug: "varanasi-city", is_mycity: "Y" },
  "kanpur-city": { title: "Kanpur City", slug: "kanpur-city", is_mycity: "Y" },
  "ghaziabad": { title: "Ghaziabad", slug: "ghaziabad", is_mycity: "Y" },
  "haridwar": { title: "Haridwar", slug: "haridwar", is_mycity: "Y" },
  "dehradun-city": { title: "Dehradun City", slug: "dehradun-city", is_mycity: "Y" },
  "mohali": { title: "Mohali", slug: "mohali", is_mycity: "Y" },
  "sitapur": { title: "Sitapur", slug: "sitapur", is_mycity: "Y" },
  "sultanpur": { title: "Sultanpur", slug: "sultanpur", is_mycity: "Y" },
  "rishikesh": { title: "Rishikesh", slug: "rishikesh", is_mycity: "Y" },
  "bareilly": { title: "Bareilly", slug: "bareilly", is_mycity: null },
  "bijnor": { title: "Bijnor", slug: "bijnor", is_mycity: null },
  "moradabad": { title: "Moradabad", slug: "moradabad", is_mycity: null },
  "allahabad": { title: "Allahabad", slug: "allahabad", is_mycity: null },
};

const specialOrder = ["agra-dehat", "agra-city", "mathura", "hathras"];

export function getOrderedCities(): City[] {
  const all = Object.values(citiesData);
  const specials: City[] = [];
  const remaining: City[] = [];

  for (const slug of specialOrder) {
    const found = all.find((x) => x.slug === slug);
    if (found) specials.push(found);
  }

  all.forEach((c) => {
    if (!specials.some((s) => s.slug === c.slug)) remaining.push(c);
  });

  remaining.sort((a, b) => a.title.localeCompare(b.title, "hi"));

  return [...specials, ...remaining];
}
