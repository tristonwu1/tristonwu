import { defineArrayMember, defineField, defineType } from "sanity";

export const aboutType = defineType({
  name: "about",
  title: "About page",
  type: "document",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      description: 'Small label above the title (e.g. "About").',
      type: "string",
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "portrait",
      title: "Portrait",
      description: "Photo shown to the left of the bio.",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alt text", type: "string" }),
      ],
    }),
    defineField({
      name: "born",
      title: "Born",
      description: "e.g. San Diego, CA 2000",
      type: "string",
    }),
    defineField({
      name: "based",
      title: "Based",
      description: "e.g. Lives and works in San Francisco, CA",
      type: "string",
    }),
    defineField({
      name: "bio",
      title: "Artist bio",
      type: "array",
      of: [{ type: "text", rows: 4 }],
    }),
    defineField({
      name: "statement",
      title: "Artist statement",
      type: "array",
      of: [{ type: "text", rows: 4 }],
    }),
    defineField({
      name: "cv",
      title: "CV sections",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "cvSection",
          title: "Section",
          fields: [
            defineField({
              name: "heading",
              title: "Heading",
              description: "e.g. Education, Group Exhibitions, Publications",
              type: "string",
            }),
            defineField({
              name: "entries",
              title: "Entries",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "cvEntry",
                  fields: [
                    defineField({ name: "year", title: "Year", type: "string" }),
                    defineField({
                      name: "detail",
                      title: "Detail",
                      type: "string",
                    }),
                  ],
                  preview: {
                    select: { title: "detail", subtitle: "year" },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: { title: "heading" },
          },
        }),
      ],
    }),
    defineField({
      name: "cvFile",
      title: "CV (PDF)",
      description: "Downloadable CV file.",
      type: "file",
      options: { accept: ".pdf" },
    }),
    defineField({
      name: "enquiriesEmail",
      title: "Enquiries email",
      type: "string",
    }),
    defineField({
      name: "instagramLabel",
      title: "Instagram label",
      description: "Display text, e.g. @triston.studio",
      type: "string",
    }),
    defineField({
      name: "instagramUrl",
      title: "Instagram URL",
      type: "url",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "eyebrow", media: "portrait" },
  },
});
