"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { failed: boolean };

/** Keeps the rest of the site usable if WebGL / Three fails on mobile. */
export class RockSceneErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Rock scene failed to render:", error);
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}
