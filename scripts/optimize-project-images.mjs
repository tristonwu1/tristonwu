/**
 * Generates thumb + full WebP galleries in public/projects-opt/.
 * Run: npm run optimize:images
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const PROJECTS_DIR = path.join(ROOT, "public", "projects");
const OUT_DIR = path.join(ROOT, "public", "projects-opt");

const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

/** id → [folder, cover filename] */
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

const FULL_MAX_WIDTH = 1000;
const FULL_MAX_HEIGHT = 1250;
const FULL_QUALITY = 76;

/** Jays Backyard — large source JPEGs; tighter full size. */
const PROJECT_IMAGE_OVERRIDES = {
  "03": {
    fullMaxWidth: 720,
    fullMaxHeight: 900,
    fullQuality: 72,
  },
};

const THUMB_MAX_WIDTH = 520;
const THUMB_MAX_HEIGHT = 680;
const THUMB_QUALITY = 68;

function listProjectImages(folder, coverFile) {
  const dir = path.join(PROJECTS_DIR, folder);
  const files = fs
    .readdirSync(dir)
    .filter((f) => IMAGE_EXT.test(f))
    .sort((a, b) => {
      if (a === coverFile) return -1;
      if (b === coverFile) return 1;
      return a.localeCompare(b, undefined, { sensitivity: "base" });
    });
  return files;
}

async function writeWebp(pipeline, outPath, quality) {
  await pipeline.clone().webp({ quality, effort: 4 }).toFile(outPath);
  const meta = await sharp(outPath).metadata();
  return {
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    bytes: fs.statSync(outPath).size,
  };
}

function fullOptionsForProject(id) {
  const override = PROJECT_IMAGE_OVERRIDES[id];
  return {
    width: override?.fullMaxWidth ?? FULL_MAX_WIDTH,
    height: override?.fullMaxHeight ?? FULL_MAX_HEIGHT,
    quality: override?.fullQuality ?? FULL_QUALITY,
  };
}

async function optimizeGalleryImage(input, id, suffix) {
  const base = sharp(input).rotate();
  const fullOpts = fullOptionsForProject(id);

  const fullPath = path.join(OUT_DIR, `${id}-${suffix}.webp`);
  const thumbPath = path.join(OUT_DIR, `${id}-${suffix}-thumb.webp`);

  const fullPipeline = base.clone().resize({
    width: fullOpts.width,
    height: fullOpts.height,
    fit: "inside",
    withoutEnlargement: true,
  });

  const thumbPipeline = base.clone().resize({
    width: THUMB_MAX_WIDTH,
    height: THUMB_MAX_HEIGHT,
    fit: "inside",
    withoutEnlargement: true,
  });

  const [full, thumb] = await Promise.all([
    writeWebp(fullPipeline, fullPath, fullOpts.quality),
    writeWebp(thumbPipeline, thumbPath, THUMB_QUALITY),
  ]);

  return {
    webp: `/projects-opt/${id}-${suffix}.webp`,
    thumb: `/projects-opt/${id}-${suffix}-thumb.webp`,
    width: full.width,
    height: full.height,
    thumbWidth: thumb.width,
    thumbHeight: thumb.height,
    bytes: full.bytes + thumb.bytes,
  };
}

async function optimizeProject([id, folder, coverFile]) {
  const files = listProjectImages(folder, coverFile);
  const images = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const input = path.join(PROJECTS_DIR, folder, file);
    const suffix = String(i + 1).padStart(2, "0");
    const entry = await optimizeGalleryImage(input, id, suffix);
    images.push({
      webp: entry.webp,
      thumb: entry.thumb,
      width: entry.width,
      height: entry.height,
      thumbWidth: entry.thumbWidth,
      thumbHeight: entry.thumbHeight,
    });
  }

  const totalBytes = images.reduce((sum, img) => {
    return (
      sum +
      fs.statSync(path.join(OUT_DIR, path.basename(img.webp))).size +
      fs.statSync(path.join(OUT_DIR, path.basename(img.thumb))).size
    );
  }, 0);

  return { id, images, fileCount: files.length, totalBytes };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const manifest = [];
  for (const project of PROJECTS) {
    const result = await optimizeProject(project);
    manifest.push({ id: result.id, images: result.images });
    console.log(
      `${result.id}: ${result.fileCount} image(s) → ${(result.totalBytes / 1024).toFixed(0)}KB thumb+full`
    );
  }

  fs.writeFileSync(
    path.join(OUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );
  console.log(`\nWrote gallery manifest (${manifest.length} projects)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
