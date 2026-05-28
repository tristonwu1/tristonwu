import { defineField, defineType } from "sanity";

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
    select: { title: "title", subtitle: "eyebrow" },
  },
});
