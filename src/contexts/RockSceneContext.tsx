"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PrebuiltRockStack } from "@/lib/prebuildRockStack";

type RockSceneContextValue = {
  stackCount: number;
  maxStack: number;
  prebuilt: PrebuiltRockStack | null;
};

const RockSceneContext = createContext<RockSceneContextValue | null>(null);

export function RockSceneProvider({
  value,
  children,
}: {
  value: RockSceneContextValue;
  children: ReactNode;
}) {
  return (
    <RockSceneContext.Provider value={value}>{children}</RockSceneContext.Provider>
  );
}

export function useRockSceneMetrics() {
  const ctx = useContext(RockSceneContext);
  if (!ctx) {
    return { stackCount: 1, maxStack: 1, prebuilt: null };
  }
  return ctx;
}
