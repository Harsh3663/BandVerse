import { Badge } from "@/components/ui/badge";

import { audioSamples } from "../selectors";
import { mediaCategoryLabels, type PortfolioMediaItem } from "../types";
import { MediaCard } from "./media-card";

const audioOrder = [
  "original",
  "cover",
  "instrument-demo",
  "practice",
  "live-recording",
] as const;

export function AudioShowcase({ media }: { media: readonly PortfolioMediaItem[] }) {
  const samples = audioSamples(media);
  const grouped = audioOrder
    .map((kind) => ({
      kind,
      items: samples.filter((item) => item.audioKind === kind || item.category === kind),
    }))
    .filter((group) => group.items.length);

  return (
    <section className="space-y-6" aria-labelledby="audio-showcase-heading">
      <div className="space-y-2">
        <h2 id="audio-showcase-heading" className="font-display text-3xl font-semibold">
          Audio showcase
        </h2>
        <p className="text-muted-foreground max-w-2xl">
          Original songs, covers, instrument demos, practice sessions, and live
          recordings.
        </p>
      </div>

      {grouped.length ? (
        grouped.map((group) => (
          <div key={group.kind} className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-xl font-semibold">
                {mediaCategoryLabels[group.kind]}
              </h3>
              <Badge variant="outline">{group.items.length}</Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {group.items.map((item) => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-muted-foreground">No audio samples published yet.</p>
      )}
    </section>
  );
}
