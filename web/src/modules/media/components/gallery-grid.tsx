import { Badge } from "@/components/ui/badge";

import { galleryImages, repertoirePdfs } from "../selectors";
import { mediaCategoryLabels, type PortfolioMediaItem } from "../types";
import { MediaCard } from "./media-card";

export function GalleryGrid({ media }: { media: readonly PortfolioMediaItem[] }) {
  const images = galleryImages(media);
  const pdfs = repertoirePdfs(media);

  return (
    <section className="space-y-6" aria-labelledby="gallery-heading">
      <div className="space-y-2">
        <h2 id="gallery-heading" className="font-display text-3xl font-semibold">
          Gallery
        </h2>
        <p className="text-muted-foreground max-w-2xl">
          Stage photos, event highlights, behind-the-scenes stills, and repertoire PDFs.
        </p>
      </div>

      {images.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No gallery images published yet.</p>
      )}

      {pdfs.length ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-xl font-semibold">Repertoire</h3>
            <Badge variant="secondary">{mediaCategoryLabels.repertoire}</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pdfs.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
