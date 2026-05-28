"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Work } from "@/data/works";

const WorksContext = createContext<Work[]>([]);

export function SiteContentProvider({
  works,
  children,
}: {
  works: Work[];
  children: ReactNode;
}) {
  return <WorksContext.Provider value={works}>{children}</WorksContext.Provider>;
}

export function useWorks(): Work[] {
  return useContext(WorksContext);
}
