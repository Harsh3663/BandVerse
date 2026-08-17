"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface FavoriteBandButtonProps {
  bandName: string;
  reduceMotion: boolean;
  className?: string;
}

/**
 * Band-card equivalent of `featured-artists/save-button.tsx` — kept as its
 * own small component (per this milestone's explicit file list) rather than
 * importing the artist-feature version directly, since reaching into a
 * *different, already-completed* feature's internals for a one-line button
 * would be a tighter coupling than the two features actually need. The
 * interaction contract is intentionally identical (glass icon button,
 * top-right of media, optimistic instant toggle, the Design System's one
 * sanctioned "spring pop" exception) so the two read as one consistent
 * pattern to the user even though they're two small independent files.
 */
export function FavoriteBandButton({
  bandName,
  reduceMotion,
  className,
}: FavoriteBandButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={isFavorited}
      aria-label={
        isFavorited ? `Remove ${bandName} from favorites` : `Favorite ${bandName}`
      }
      onClick={() => setIsFavorited((current) => !current)}
      className={cn(
        "flex size-9 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white opacity-90 backdrop-blur-md transition-colors hover:bg-white/25 hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none",
        className,
      )}
    >
      <motion.span
        key={String(isFavorited)}
        initial={false}
        animate={reduceMotion ? undefined : { scale: [1, 1.35, 1] }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex items-center justify-center"
      >
        <Heart
          className={cn(
            "size-4 transition-colors",
            isFavorited && "fill-primary-300 text-primary-300",
          )}
          aria-hidden="true"
        />
      </motion.span>
    </button>
  );
}
