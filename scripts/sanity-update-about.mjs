/**
 * Updates the singleton `about` document: uploads the portrait image and CV
 * PDF, and patches in the born/based lines and CV sections.
 *
 * Usage:
 *   node --env-file=.env.local scripts/sanity-update-about.mjs
 *
 * Requires SANITY_API_WRITE_TOKEN (Editor token) in the environment.
 */
import fs from "fs";
import path from "path";
import { createClient } from "@sanity/client";

const ROOT = path.resolve(import.meta.dirname, "..");
const PORTRAIT = path.join(ROOT, "public", "about", "portrait.png");
const CV = path.join(ROOT, "public", "about", "triston-wu-cv-2026.pdf");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "7hhussty";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!token) {
  console.error(
    "Missing SANITY_API_WRITE_TOKEN. Run with:\n" +
      "  node --env-file=.env.local scripts/sanity-update-about.mjs"
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

const key = () => Math.random().toString(36).slice(2, 12);

const CV_SECTIONS = [
  {
    heading: "Education",
    entries: [{ year: "2023", detail: "BFA Furniture Design, RISD" }],
  },
  {
    heading: "Group Exhibitions",
    entries: [
      { year: "2024", detail: "Bent and Borrowed, Gallery 263, Cambridge, MA" },
      { year: "2023", detail: "Playing House, Gelman Gallery, Providence, RI" },
      {
        year: "2022",
        detail:
          "RISD Furniture Design Triennial, Woods Gerry Gallery, Providence, RI",
      },
    ],
  },
  {
    heading: "Publications",
    entries: [{ year: "2022", detail: "Rolling Homes, Shelter Publications" }],
  },
];

function cvForSanity() {
  return CV_SECTIONS.map((section) => ({
    _type: "cvSection",
    _key: key(),
    heading: section.heading,
    entries: section.entries.map((entry) => ({
      _type: "cvEntry",
      _key: key(),
      year: entry.year,
      detail: entry.detail,
    })),
  }));
}

async function main() {
  console.log(`Updating about in ${projectId}/${dataset}…\n`);

  console.log("· uploading portrait…");
  const image = await client.assets.upload("image", fs.readFileSync(PORTRAIT), {
    filename: "triston-wu-portrait.png",
  });

  console.log("· uploading CV…");
  const file = await client.assets.upload("file", fs.readFileSync(CV), {
    filename: "triston-wu-cv-2026.pdf",
  });

  await client
    .patch("about")
    .set({
      portrait: {
        _type: "image",
        alt: "Triston Wu",
        asset: { _type: "reference", _ref: image._id },
      },
      born: "San Diego, CA 2000",
      based: "Lives and works in San Francisco, CA",
      cv: cvForSanity(),
      cvFile: {
        _type: "file",
        asset: { _type: "reference", _ref: file._id },
      },
    })
    .commit();

  console.log("\n✓ about updated. Open /studio to review and publish.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
