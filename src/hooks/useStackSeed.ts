"use client";

import { useRef } from "react";
import { createStackSeed } from "@/lib/proceduralStack";

/** Stable random seed for the current page visit (new stack each refresh). */
export function useStackSeed() {
  const seedRef = useRef<number | null>(null);
  if (seedRef.current === null) {
    seedRef.current = createStackSeed();
  }
  return seedRef.current;
}
