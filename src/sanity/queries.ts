import { sanityClient, sanityConfigured } from "./client";
import { staticWorks, type Work, type WorkImage } from "@/data/works";
import { staticAbout, type AboutContent } from "@/data/about";

const REVALIDATE_SECONDS = 60;
const THUMB_WIDTH = 520;
const FULL_WIDTH = 1400;

type SanityImage = {
  url: string | null;
  w: number | null;
  h: number | null;
  alt: string | null;
};

type SanityWork = {
  _id: string;
  title: string | null;
  year: string | null;
  medium: string | null;
  dimensions: string | null;
  tags: string | null;
  images: SanityImage[] | null;
};

const WORKS_QUERY = `*[_type == "work"] | order(order asc, _createdAt asc){
  _id,
  title,
  year,
  medium,
  dimensions,
  tags,
  "images": images[]{
    "url": asset->url,
    "w": asset->metadata.dimensions.width,
    "h": asset->metadata.dimensions.height,
    alt
  }
}`;

const ABOUT_QUERY = `*[_type == "about"][0]{
  eyebrow,
  title,
  bio,
  statement,
  enquiriesEmail,
  instagramLabel,
  instagramUrl
}`;

/** Sanity CDN supports on-the-fly resizing via query params. */
function sized(url: string, width: number, quality: number): string {
  return `${url}?w=${width}&q=${quality}&auto=format&fit=max`;
}

function mapImage(img: SanityImage): WorkImage | null {
  if (!img.url) return null;
  const width = img.w ?? FULL_WIDTH;
  const height = img.h ?? FULL_WIDTH;
  const ratio = width > 0 ? height / width : 1;
  const thumbWidth = Math.min(THUMB_WIDTH, width);
  const thumbHeight = Math.round(thumbWidth * ratio);

  return {
    src: sized(img.url, FULL_WIDTH, 80),
    thumb: sized(img.url, THUMB_WIDTH, 55),
    width,
    height,
    thumbWidth,
    thumbHeight,
  };
}

function mapWork(doc: SanityWork, index: number): Work {
  const images = (doc.images ?? [])
    .map(mapImage)
    .filter((img): img is WorkImage => img !== null);

  return {
    id: doc._id ?? `work-${index}`,
    title: doc.title ?? "Untitled",
    year: doc.year ?? "",
    medium: doc.medium ?? "",
    dimensions: doc.dimensions ?? undefined,
    tags: doc.tags ?? "",
    images,
  };
}

/** Works from Sanity, falling back to the static seed when none are published. */
export async function getWorks(): Promise<Work[]> {
  if (!sanityConfigured) return staticWorks;

  try {
    const docs = await sanityClient.fetch<SanityWork[]>(
      WORKS_QUERY,
      {},
      { next: { revalidate: REVALIDATE_SECONDS } }
    );
    const mapped = (docs ?? [])
      .map(mapWork)
      .filter((work) => work.images.length > 0);
    return mapped.length > 0 ? mapped : staticWorks;
  } catch {
    return staticWorks;
  }
}

export async function getAbout(): Promise<AboutContent> {
  if (!sanityConfigured) return staticAbout;

  try {
    const doc = await sanityClient.fetch<Partial<AboutContent> | null>(
      ABOUT_QUERY,
      {},
      { next: { revalidate: REVALIDATE_SECONDS } }
    );
    if (!doc || !doc.title) return staticAbout;

    return {
      eyebrow: doc.eyebrow ?? staticAbout.eyebrow,
      title: doc.title,
      bio: doc.bio && doc.bio.length > 0 ? doc.bio : staticAbout.bio,
      statement:
        doc.statement && doc.statement.length > 0
          ? doc.statement
          : staticAbout.statement,
      enquiriesEmail: doc.enquiriesEmail ?? staticAbout.enquiriesEmail,
      instagramLabel: doc.instagramLabel ?? staticAbout.instagramLabel,
      instagramUrl: doc.instagramUrl ?? staticAbout.instagramUrl,
    };
  } catch {
    return staticAbout;
  }
}
