import manifest from "../../public/projects-opt/manifest.json";

export type WorkImage = {
  /** Full-resolution WebP for lightbox */
  src: string;
  /** Low-res WebP for gallery strip */
  thumb: string;
  width: number;
  height: number;
  thumbWidth: number;
  thumbHeight: number;
};

export type Work = {
  id: string;
  title: string;
  year: string;
  medium: string;
  dimensions?: string;
  tags: string;
  images: WorkImage[];
};

type ManifestImage = {
  webp: string;
  thumb: string;
  width: number;
  height: number;
  thumbWidth: number;
  thumbHeight: number;
};

type ManifestEntry = {
  id: string;
  images: ManifestImage[];
};

const entries = Object.fromEntries(
  (manifest as ManifestEntry[]).map((m) => [m.id, m.images])
);

function imagesFor(id: string): WorkImage[] {
  const list = entries[id] ?? [];
  return list.map((img) => ({
    src: img.webp,
    thumb: img.thumb ?? img.webp,
    width: img.width,
    height: img.height,
    thumbWidth: img.thumbWidth ?? img.width,
    thumbHeight: img.thumbHeight ?? img.height,
  }));
}

/**
 * Static seed content. Used as a fallback when Sanity has no published works
 * yet (and as the source for the one-time import into Sanity).
 */
export const staticWorks: Work[] = [
  {
    id: "01",
    title: "Bone Fish",
    year: "2025",
    medium: "Steel, thread, paper",
    dimensions: "24 × 18 × 18 in",
    tags: "Sculpture",
    images: imagesFor("01"),
  },
  {
    id: "02",
    title: "Cloud Ladder",
    year: "2026",
    medium: "Bronze, paper, thread",
    dimensions: "16 × 16 × 42 in",
    tags: "Sculpture",
    images: imagesFor("02"),
  },
  {
    id: "03",
    title: "Jay's Backyard",
    year: "2026",
    medium: "",
    tags: "Gardens",
    images: imagesFor("03"),
  },
  {
    id: "04",
    title: "Monoroc",
    year: "2022",
    medium: "Monobloc, mahogany",
    dimensions: "40 × 24 × 32 in",
    tags: "Furniture",
    images: imagesFor("04"),
  },
  {
    id: "05",
    title: "Moon Ladder",
    year: "2026",
    medium: "Steel, thread, wood",
    dimensions: "18 × 16 × 30 in",
    tags: "Sculpture",
    images: imagesFor("05"),
  },
  {
    id: "06",
    title: "Stones",
    year: "2026",
    medium: "Stoneware, wild clay",
    dimensions: "4 × 4 × 3 in",
    tags: "Objects",
    images: imagesFor("06"),
  },
  {
    id: "07",
    title: "Untitled",
    year: "2026",
    medium: "Stones, bike wheel",
    dimensions: "27 × 27 × 5 in",
    tags: "Sculpture",
    images: imagesFor("07"),
  },
  {
    id: "08",
    title: "Wedged Bench",
    year: "2022",
    medium: "Stone, redwood",
    dimensions: "70 × 16 × 24 in",
    tags: "Furniture",
    images: imagesFor("08"),
  },
  {
    id: "09",
    title: "Untitled",
    year: "2026",
    medium: "Stone, driftwood, thread",
    dimensions: "Variable",
    tags: "Installation",
    images: imagesFor("09"),
  },
  {
    id: "10",
    title: "Untitled",
    year: "2023",
    medium: "Bittersweet branch, stainless steel, thread",
    dimensions: "9 × 9 × 32 in",
    tags: "Sculpture",
    images: imagesFor("10"),
  },
];
