"use client";

import dynamic from "next/dynamic";

// The Studio (and its styled-components / sanity deps) must never be evaluated
// on the server, so load it client-side only.
const Studio = dynamic(
  () => import("@/components/Studio").then((m) => m.Studio),
  { ssr: false }
);

export default function StudioPage() {
  return <Studio />;
}
