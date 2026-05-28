import type { Metadata } from "next";
import Image from "next/image";
import { Header } from "@/components/Header";
import { getAbout } from "@/sanity/queries";

export const metadata: Metadata = {
  title: "About — Triston Wu",
  description: "About Triston Wu — furniture and object design.",
};

export default async function AboutPage() {
  const about = await getAbout();
  const hasCv = about.cv.some((section) => section.entries.length > 0);

  return (
    <div className="about-page">
      <Header />
      <main className="about-main">
        <div className="about-layout">
          {about.portrait ? (
            <div className="about-portrait">
              <Image
                src={about.portrait}
                alt={about.portraitAlt || about.title}
                fill
                sizes="(max-width: 768px) 100vw, 22rem"
                className="about-portrait-img"
                priority
              />
            </div>
          ) : null}

          <div className="about-body">
            {about.eyebrow ? (
              <p className="about-eyebrow">{about.eyebrow}</p>
            ) : null}
            <h1 className="about-title">{about.title}</h1>
            {about.born || about.based ? (
              <div className="about-meta">
                {about.born ? <span>{about.born}</span> : null}
                {about.based ? <span>{about.based}</span> : null}
              </div>
            ) : null}

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

            {hasCv ? (
              <div className="about-section">
                <h2 className="about-section-title about-cv-title">
                  CV
                  <a
                    className="about-cv-download"
                    href="/about/cv"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    download
                  </a>
                </h2>
                <div className="about-cv">
                  {about.cv.map((section) =>
                    section.entries.length > 0 ? (
                      <div className="about-cv-group" key={section.heading}>
                        <h3 className="about-cv-heading">{section.heading}</h3>
                        <ul className="about-cv-list">
                          {section.entries.map((entry, index) => (
                            <li className="about-cv-entry" key={index}>
                              {entry.year ? (
                                <span className="about-cv-year">
                                  {entry.year}
                                </span>
                              ) : null}
                              <span className="about-cv-detail">
                                {entry.detail}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            ) : null}

            <div className="about-contact">
              <p>
                <span className="about-label">Enquiries</span>
                <a href={`mailto:${about.enquiriesEmail}`}>
                  {about.enquiriesEmail}
                </a>
              </p>
              <p>
                <span className="about-label">Instagram</span>
                <a href={about.instagramUrl} className="about-link-muted">
                  {about.instagramLabel}
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
