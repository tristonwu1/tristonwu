"use client";

type SiteLoadingScreenProps = {
  progress: number;
  exiting?: boolean;
};

export function SiteLoadingScreen({
  progress,
  exiting = false,
}: SiteLoadingScreenProps) {
  const percent = Math.round(progress * 100);

  return (
    <div
      className={`site-loading ${exiting ? "site-loading--exit" : ""}`}
      role="status"
      aria-live="polite"
      aria-busy={!exiting}
      aria-label={`Loading ${percent} percent`}
    >
      <div className="site-loading-inner">
        <div className="site-loading-bar" aria-hidden>
          <span
            className="site-loading-bar-fill"
            style={{ transform: `scaleX(${Math.max(0.02, progress)})` }}
          />
        </div>
        <p className="site-loading-meta" aria-hidden>
          {percent}%
        </p>
      </div>
    </div>
  );
}
