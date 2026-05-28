"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const onAbout = pathname === "/about";

  return (
    <header className="site-header">
      {onAbout ? (
        <Link href="/" className="site-header-back">
          ← back to work
        </Link>
      ) : (
        <Link href="/" className="site-logo">
          Triston Wu
        </Link>
      )}
      <nav className="site-nav">
        {onAbout ? (
          <span className="site-nav-label site-nav-label--active">About</span>
        ) : (
          <Link href="/about" className="site-nav-link">
            About
          </Link>
        )}
      </nav>
    </header>
  );
}
