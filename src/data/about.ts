export type AboutContent = {
  eyebrow: string;
  title: string;
  bio: string[];
  statement: string[];
  enquiriesEmail: string;
  instagramLabel: string;
  instagramUrl: string;
};

/** Static seed content; fallback when Sanity has no About document yet. */
export const staticAbout: AboutContent = {
  eyebrow: "About",
  title: "Triston Wu",
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
