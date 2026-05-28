import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schema } from "./src/sanity/schemaTypes";

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("About page")
              .id("about")
              .child(S.document().schemaType("about").documentId("about")),
            S.divider(),
            S.documentTypeListItem("work").title("Works"),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
