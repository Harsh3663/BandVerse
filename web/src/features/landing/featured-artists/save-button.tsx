"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface SaveButtonProps {
  artistName: string;
  reduceMotion: boolean;
  className?: string;
}

/**
 * Glass icon button, top-right of the card media — per
 * docs/DesignSystem.md § Band/Artist Cards ("quick-save icon, top-right of
 * media"). Rendered as a sibling of the profile `Link`, never nested inside
 * it: a `<button>` inside an `<a>` is invalid, inaccessible markup, which is
 * exactly why the Traditional card's own image affordance is a decorative
 * span rather than a real control — this one has to be a real, independently
 * focusable/toggleable button, so it can't share that trick.
 *
 * The spring "pop" on activation is the Design System's one sanctioned
 * playful exception to strict minimalism (§ Motion > Micro-Animations),
 * kept local to this single interaction. Fill color uses `primary`, not the
 * brand's reserved Spotlight Gold — each card's star rating already spends
 * this card's "one gold moment" (§ Color Philosophy: "never more than one
 * element's worth of emphasis per screen").
 *
 * No save backend exists yet, so the heart fills instantly and optimistically
 * on click (docs/LandingPageExperience.md § Premium Details #18) rather than
 * simulating a network round-trip that doesn't exist.
 */
export function SaveButton({ artistName, reduceMotion, className }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={isSaved}
      aria-label={
        isSaved ? `Remove ${artistName} from saved artists` : `Save ${artistName}`
      }
      onClick={() => setIsSaved((current) => !current)}
      className={cn(
        "flex size-9 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white opacity-90 backdrop-blur-md transition-colors hover:bg-white/25 hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none",
        className,
      )}
    >
      <motion.span
        key={String(isSaved)}
        initial={false}
        animate={reduceMotion ? undefined : { scale: [1, 1.35, 1] }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex items-center justify-center"
      >
        <Heart
          className={cn(
            "size-4 transition-colors",
            isSaved && "fill-primary-300 text-primary-300",
          )}
          aria-hidden="true"
        />
      </motion.span>
    </button>
  );
}
