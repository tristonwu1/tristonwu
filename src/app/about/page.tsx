import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { getAbout } from "@/sanity/queries";

export const metadata: Metadata = {
  title: "About — Triston Wu",
  description: "About Triston Wu — furniture and object design.",
};

export default async function AboutPage() {
  const about = await getAbout();

  return (
    <div className="about-page">
      <Header />
      <main className="about-main">
        {about.eyebrow ? <p className="about-eyebrow">{about.eyebrow}</p> : null}
        <h1 className="about-title">{about.title}</h1>
        {about.bio.length > 0 ? (
          <div className="about-content">
            {about.bio.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        ) : null}
        {about.statement.length > 0 ? (
          <div className="about-section">
            <h2 className="about-section-title">Statement</h2>
            <div className="about-content">
              {about.statement.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        ) : null}
        <div className="about-contact">
          <p>
            <span className="about-label">Enquiries</span>
            <a href={`mailto:${about.enquiriesEmail}`}>{about.enquiriesEmail}</a>
          </p>
          <p>
            <span className="about-label">Instagram</span>
            <a href={about.instagramUrl} className="about-link-muted">
              {about.instagramLabel}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
