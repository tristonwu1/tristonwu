export type CvEntry = {
  year: string;
  detail: string;
};

export type CvSection = {
  heading: string;
  entries: CvEntry[];
};

export type AboutContent = {
  eyebrow: string;
  title: string;
  portrait: string | null;
  portraitAlt: string;
  born: string;
  based: string;
  bio: string[];
  statement: string[];
  cv: CvSection[];
  cvFile: string | null;
  enquiriesEmail: string;
  instagramLabel: string;
  instagramUrl: string;
};

/** Static seed content; fallback when Sanity has no About document yet. */
export const staticAbout: AboutContent = {
  eyebrow: "About",
  title: "Triston Wu",
  portrait: "/about/portrait.png",
  portraitAlt: "Triston Wu",
  born: "San Diego, CA 2000",
  based: "Lives and works in San Francisco, CA",
  bio: [
    "Triston Wu is an artist based in California. Working across sculpture, site-specific installation, and functional objects, Wu moves between art and the everyday, holding geometric logic in tension with organic materials and the unpredictability of natural forces. His practice seeks to make invisible forces felt, creating conditions in which the overlooked becomes present and the familiar becomes forgotten.",
  ],
  statement: [
    "Where does logic end and expression begin? When does intuition become the structure? I'm working within the threshold between logical processes and expressive actions. In doing so, the artwork is less about objects and more about relation, listening to the material, and creating conditions for unseen forces to be felt.",
    "Thread acts as the invisible pencil lines in a drawing. It is a record of the making process, invisible and visible simultaneously, and the sinew of the system.",
  ],
  cv: [
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
      entries: [
        { year: "2022", detail: "Rolling Homes, Shelter Publications" },
      ],
    },
  ],
  cvFile: "/about/triston-wu-cv-2026.pdf",
  enquiriesEmail: "hello@triston.studio",
  instagramLabel: "@triston.studio",
  instagramUrl: "https://instagram.com/triston.studio",
};
