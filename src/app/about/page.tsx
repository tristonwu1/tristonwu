import type { Metadata } from "next";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "About — Triston Wu",
  description: "About Triston Wu — furniture and object design.",
};

export default function AboutPage() {
  return (
    <div className="about-page">
      <Header />
      <main className="about-main">
        <p className="about-eyebrow">About</p>
        <h1 className="about-title">Triston Wu</h1>
        <div className="about-content">
          <p>
            Triston Wu is a furniture and object designer working with solid timber,
            stone, and steel. Each piece is developed through close collaboration
            with craftspeople — forms that are functional, tactile, and meant to
            live with you for a long time.
          </p>
          <p>
            The work draws on perpendicular structure, honest joinery, and the
            material character of raw wood and stone. Prototypes and editions are
            produced in small runs.
          </p>
          <p className="about-placeholder">
            Studio bio, contact details, and press enquiries will be added here
            soon.
          </p>
        </div>
        <div className="about-contact">
          <p>
            <span className="about-label">Enquiries</span>
            <a href="mailto:hello@triston.studio">hello@triston.studio</a>
          </p>
          <p>
            <span className="about-label">Instagram</span>
            <a href="#" className="about-link-muted">
              @triston.studio
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
