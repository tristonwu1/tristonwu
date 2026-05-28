/**
 * One-time import of the static portfolio content into Sanity.
 *
 * Uploads the original images from public/projects/, then creates a `work`
 * document per project plus the singleton `about` document.
 *
 * Usage:
 *   SANITY_API_WRITE_TOKEN=sk... node scripts/sanity-import.mjs
 *
 * Create the token at https://www.sanity.io/manage → project → API → Tokens
 * (Editor permissions). Re-running replaces the documents (createOrReplace),
 * but re-uploads image assets, so prefer running it once.
 */
import fs from "fs";
import path from "path";
import { createClient } from "@sanity/client";

const ROOT = path.resolve(import.meta.dirname, "..");
const PROJECTS_DIR = path.join(ROOT, "public", "projects");
const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "7hhussty";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!token) {
  console.error(
    "Missing SANITY_API_WRITE_TOKEN. Create an Editor token at\n" +
      "https://www.sanity.io/manage → project → API → Tokens, then run:\n" +
      "  SANITY_API_WRITE_TOKEN=sk... node scripts/sanity-import.mjs"
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-05-01",
  token,
  useCdn: false,
});

/** id → [folder, cover filename]; cover sorts first (mirrors optimize script). */
const PROJECTS = [
  ["01", "Bone Fish", "DSC01226.jpg"],
  ["02", "Cloud Ladder", "DSC01209.jpg"],
  ["03", "Jays Backyard", "IMG_6077.JPG"],
  ["04", "Monoroc", "TristonWu,Monoroc2.jpg"],
  ["05", "Moon Ladder", "DSC01236.jpg"],
  ["06", "Stones", "IMG_6439.JPG"],
  ["07", "Untitled (Bike wheel)", "IMG_6553.JPG"],
  ["08", "Wedged bench", "IMG_8486 2.JPG"],
  ["09", "untitled (stone garden) ", "IMG_0942.JPG"],
  ["10", "untitled(Bittersweet)", "IMG_1863 2.JPG"],
];

/** id → metadata (mirrors src/data/works.ts). */
const META = {
  "01": { title: "Bone Fish", year: "2025", medium: "Steel, thread, paper", dimensions: "24 × 18 × 18 in", tags: "Sculpture" },
  "02": { title: "Cloud Ladder", year: "2026", medium: "Bronze, paper, thread", dimensions: "16 × 16 × 42 in", tags: "Sculpture" },
  "03": { title: "Jay's Backyard", year: "2026", medium: "", dimensions: "", tags: "Gardens" },
  "04": { title: "Monoroc", year: "2022", medium: "Monobloc, mahogany", dimensions: "40 × 24 × 32 in", tags: "Furniture" },
  "05": { title: "Moon Ladder", year: "2026", medium: "Steel, thread, wood", dimensions: "18 × 16 × 30 in", tags: "Sculpture" },
  "06": { title: "Stones", year: "2026", medium: "Stoneware, wild clay", dimensions: "4 × 4 × 3 in", tags: "Objects" },
  "07": { title: "Untitled", year: "2026", medium: "Stones, bike wheel", dimensions: "27 × 27 × 5 in", tags: "Sculpture" },
  "08": { title: "Wedged Bench", year: "2022", medium: "Stone, redwood", dimensions: "70 × 16 × 24 in", tags: "Furniture" },
  "09": { title: "Untitled", year: "2026", medium: "Stone, driftwood, thread", dimensions: "Variable", tags: "Installation" },
  "10": { title: "Untitled", year: "2023", medium: "Bittersweet branch, stainless steel, thread", dimensions: "9 × 9 × 32 in", tags: "Sculpture" },
};

const ABOUT = {
  eyebrow: "About",
  title: "Triston Wu",
  born: "San Diego, CA 2000",
  based: "Lives and works in San Francisco, CA",
  cv: [
    {
      _type: "cvSection",
      _key: "edu",
      heading: "Education",
      entries: [
        { _type: "cvEntry", _key: "e1", year: "2023", detail: "BFA Furniture Design, RISD" },
      ],
    },
    {
      _type: "cvSection",
      _key: "grp",
      heading: "Group Exhibitions",
      entries: [
        { _type: "cvEntry", _key: "g1", year: "2024", detail: "Bent and Borrowed, Gallery 263, Cambridge, MA" },
        { _type: "cvEntry", _key: "g2", year: "2023", detail: "Playing House, Gelman Gallery, Providence, RI" },
        { _type: "cvEntry", _key: "g3", year: "2022", detail: "RISD Furniture Design Triennial, Woods Gerry Gallery, Providence, RI" },
      ],
    },
    {
      _type: "cvSection",
      _key: "pub",
      heading: "Publications",
      entries: [
        { _type: "cvEntry", _key: "p1", year: "2022", detail: "Rolling Homes, Shelter Publications" },
      ],
    },
  ],
  bio: [
    "Triston Wu is an artist based in California. Working across sculpture, site-specific installation, and functional objects, Wu moves between art and the everyday, holding geometric logic in tension with organic materials and the unpredictability of natural forces. His practice seeks to make invisible forces felt, creating conditions in which the overlooked becomes present and the familiar becomes forgotten.",
  ],
  statement: [
    "Where does logic end and expression begin? When does intuition become the structure? I'm working within the threshold between logical processes and expressive actions. In doing so, the artwork is less about objects and more about relation, listening to the material, and creating conditions for unseen forces to be felt.",
    "Thread acts as the invisible pencil lines in a drawing. It is a record of the making process, invisible and visible simultaneously, and the sinew of the system.",
  ],
  enquiriesEmail: "hello@triston.studio",
  instagramLabel: "@triston.studio",
  instagramUrl: "https://instagram.com/triston.studio",
};

function listProjectImages(folder, coverFile) {
  const dir = path.join(PROJECTS_DIR, folder);
  return fs
    .readdirSync(dir)
    .filter((f) => IMAGE_EXT.test(f))
    .sort((a, b) => {
      if (a === coverFile) return -1;
      if (b === coverFile) return 1;
      return a.localeCompare(b, undefined, { sensitivity: "base" });
    });
}

function randomKey() {
  return Math.random().toString(36).slice(2, 12);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function uploadImage(folder, file, attempts = 4) {
  const filePath = path.join(PROJECTS_DIR, folder, file);
  const buffer = fs.readFileSync(filePath);
  for (let i = 0; i < attempts; i++) {
    try {
      const asset = await client.assets.upload("image", buffer, {
        filename: file,
      });
      return asset._id;
    } catch (err) {
      if (i === attempts - 1) throw err;
      const wait = 2000 * (i + 1);
      console.warn(
        `  ! ${file} failed (${err.statusCode ?? err.message}); retrying in ${wait}ms`
      );
      await sleep(wait);
    }
  }
}

async function importWork([id, folder, coverFile]) {
  const existing = await client.getDocument(`work-${id}`);
  if (existing) {
    console.log(`• work-${id} (${META[id].title}) already exists — skipping`);
    return;
  }

  const files = listProjectImages(folder, coverFile);
  const images = [];

  for (const file of files) {
    const assetId = await uploadImage(folder, file);
    images.push({
      _type: "image",
      _key: randomKey(),
      asset: { _type: "reference", _ref: assetId },
    });
    process.stdout.write(`  · ${folder}/${file}\n`);
  }

  const meta = META[id];
  await client.createOrReplace({
    _id: `work-${id}`,
    _type: "work",
    title: meta.title,
    order: Number(id),
    year: meta.year,
    medium: meta.medium,
    dimensions: meta.dimensions,
    tags: meta.tags,
    images,
  });
  console.log(`✓ work-${id} (${meta.title}) — ${images.length} image(s)`);
}

async function importAbout() {
  await client.createOrReplace({ _id: "about", _type: "about", ...ABOUT });
  console.log("✓ about");
}

async function main() {
  console.log(`Importing into ${projectId}/${dataset}…\n`);
  for (const project of PROJECTS) {
    await importWork(project);
  }
  await importAbout();
  console.log("\nDone. Open /studio to review and publish.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
