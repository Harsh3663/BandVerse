import type { PortfolioMediaItem, VideoEventFilter } from "./types";

export function filterVideos(
  media: readonly PortfolioMediaItem[],
  eventFilter?: VideoEventFilter | "all",
) {
  const videos = media.filter((item) => item.type === "video" || item.type === "short");
  if (!eventFilter || eventFilter === "all") return videos;
  return videos.filter((item) => item.eventFilter === eventFilter);
}

export function featuredPerformance(media: readonly PortfolioMediaItem[]) {
  const videos = filterVideos(media);
  return videos.find((item) => item.featured) ?? videos[0];
}

export function latestPerformances(media: readonly PortfolioMediaItem[], limit = 4) {
  return [...filterVideos(media)]
    .sort((left, right) => right.uploadedAt.localeCompare(left.uploadedAt))
    .slice(0, limit);
}

export function trendingVideos(media: readonly PortfolioMediaItem[], limit = 4) {
  return [...filterVideos(media)]
    .sort(
      (left, right) =>
        right.likes / Math.max(right.views, 1) - left.likes / Math.max(left.views, 1),
    )
    .slice(0, limit);
}

export function mostWatchedVideos(media: readonly PortfolioMediaItem[], limit = 4) {
  return [...filterVideos(media)]
    .sort((left, right) => right.views - left.views)
    .slice(0, limit);
}

export function galleryImages(media: readonly PortfolioMediaItem[]) {
  return media.filter((item) => item.type === "image");
}

export function audioSamples(media: readonly PortfolioMediaItem[]) {
  return media.filter((item) => item.type === "audio");
}

export function repertoirePdfs(media: readonly PortfolioMediaItem[]) {
  return media.filter((item) => item.type === "pdf");
}

export function formatDuration(seconds?: number) {
  if (!seconds || seconds <= 0) return undefined;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

export function formatCompactCount(value: number) {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
