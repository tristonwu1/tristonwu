import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

/** True only when a real project id has been configured. */
export const sanityConfigured = projectId !== "missing-project-id";
