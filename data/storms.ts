
export interface StormData {
  city: string;
  date: string;
  hailSize: string;
  description: string;
  radarImage?: string;
  stormPhotos: string[];
  videoEmbed?: string;
  affectedAreas: string[];
  slug: string;
}

export const STORMS: StormData[] = [
  {
    city: "Jenison / Hudsonville",
    date: "March 10, 2026",
    hailSize: "2\"+",
    description: "A severe hailstorm producing 2\"+ hail moved through Jenison and Hudsonville, causing significant property damage to roofs, siding, and vehicles.",
    radarImage: "/images/storms/jenison-radar.png",
    stormPhotos: ["/images/storms/jenison-hail-1.jpg", "/images/storms/jenison-hail-2.jpg"],
    videoEmbed: "dQw4w9WgXcQ", 
    affectedAreas: ["Jenison", "Hudsonville", "Georgetown Township"],
    slug: "jenison-hail-march-2026",
  },
  {
    city: "Three Rivers",
    date: "March 2026",
    hailSize: "1.5\"+",
    description: "Large hail was reported in the Three Rivers area, impacting residential and commercial structures.",
    stormPhotos: [],
    affectedAreas: ["Three Rivers", "Fabius Township", "Park Township"],
    slug: "three-rivers-hail-march-2026",
  }
];
