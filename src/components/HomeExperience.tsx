"use client";

import { useEffect } from "react";
import { works } from "@/data/works";
import { Header } from "@/components/Header";
import { WorkSlide } from "@/components/WorkSlide";

export function HomeExperience() {
  useEffect(() => {
    document.documentElement.classList.add("home-scroll-snap");
    return () => document.documentElement.classList.remove("home-scroll-snap");
  }, []);

  return (
    <div className="home-experience">
      <Header />
      <main className="works-scroll">
        <section className="works-rock-hero" aria-label="Triston Wu" />
        <div className="works-gallery">
          {works.map((work, index) => (
            <WorkSlide key={work.id} work={work} index={index} />
          ))}
        </div>
      </main>
    </div>
  );
}
