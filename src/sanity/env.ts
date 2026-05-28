export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-01";

/**
 * These are read at build time from the environment. Set them in `.env.local`:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
 *   NEXT_PUBLIC_SANITY_DATASET=production
 * Until a real project id is set the embedded Studio at /studio will load but
 * report a "project not found" error — the build still succeeds.
 */
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "missing-project-id";
