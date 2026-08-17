"use client";

import { type RefObject, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { animate, motion, useMotionValue, useScroll, useTransform } from "framer-motion";

import { duration, easePremium } from "@/lib/motion";

interface HeroScrollIndicatorProps {
  sectionRef: RefObject<HTMLElement | null>;
  reduceMotion: boolean;
  delay: number;
}

/**
 * The "thin, slowly pulsing downward chevron" from docs/
 * LandingPageExperience.md § Hero > Animation, step 7 — fades in last, then
 * fades back out once the visitor actually starts scrolling (its job is
 * done, it shouldn't linger and clutter the view).
 *
 * Both fades are combined into a single motion value (`opacity`) so they
 * never fight each other, and everything here is driven by motion values —
 * no React state, no re-renders while scrolling.
 */
export function HeroScrollIndicator({
  sectionRef,
  reduceMotion,
  delay,
}: HeroScrollIndicatorProps) {
  const entrance = useMotionValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    const controls = animate(entrance, 1, {
      delay,
      duration: duration.base,
      ease: easePremium,
    });
    return () => controls.stop();
  }, [reduceMotion, delay, entrance]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  // Fades out within the first ~15% of the Hero's own scroll range.
  const scrollFade = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const opacity = useTransform(
    [entrance, scrollFade],
    ([entranceValue, scrollValue]: number[]) => entranceValue * scrollValue,
  );

  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity }}
      className="absolute inset-x-0 bottom-8 flex justify-center"
    >
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
        transition={
          reduceMotion
            ? undefined
            : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
        }
        className="text-white/70"
      >
        <ChevronDown className="size-6" />
      </motion.div>
    </motion.div>
  );
}
