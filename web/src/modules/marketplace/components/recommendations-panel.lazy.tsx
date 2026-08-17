"use client";

import dynamic from "next/dynamic";

const RecommendationsPanel = dynamic(
  () =>
    import("./recommendations-panel").then((module) => module.RecommendationsPanel),
  {
    ssr: false,
    loading: () => (
      <div
        className="bg-muted/40 min-h-64 animate-pulse rounded-xl"
        aria-busy="true"
        aria-label="Loading recommendations"
      />
    ),
  },
);

export { RecommendationsPanel as LazyRecommendationsPanel };
