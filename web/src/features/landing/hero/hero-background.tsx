"use client";

import Image from "next/image";
import { type RefObject, useEffect, useState } from "react";
import { type MotionValue, motion, useScroll, useTransform } from "framer-motion";

import { duration } from "@/lib/motion";

import { heroSlides } from "./hero-media";

/** How long each slide holds before cross-dissolving to the next. */
const SLIDE_HOLD_MS = 6000;

interface HeroBackgroundProps {
  sectionRef: RefObject<HTMLElement | null>;
  parallaxX: MotionValue<number>;
  parallaxY: MotionValue<number>;
  reduceMotion: boolean;
}

/**
 * The Hero's cinematic backdrop — see hero-media.ts for why this is a
 * cross-dissolving photo slideshow rather than the licensed video montage
 * docs/LandingPageExperience.md § Hero > Background ultimately calls for.
 *
 * Layering (back to front): parallax-driven image stack -> Spotlight Glow ->
 * dark gradient scrim. Only `transform`/`opacity` are ever animated here
 * (GPU-accelerated, never triggers layout).
 */
export function HeroBackground({
  sectionRef,
  parallaxX,
  parallaxY,
  reduceMotion,
}: HeroBackgroundProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || heroSlides.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroSlides.length);
    }, SLIDE_HOLD_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  // Scroll-linked parallax: the background drifts a little slower than the
  // foreground as the visitor scrolls the Hero away, per docs/
  // LandingPageExperience.md § Hero > Motion ("moves ~5% slower... a sense
  // of depth between the stage and the audience's view").
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const scrollDrift = useTransform(scrollYProgress, [0, 1], [0, 48]);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute inset-x-0 -inset-y-16"
        style={reduceMotion ? undefined : { y: scrollDrift }}
      >
        <motion.div
          className="absolute -inset-8"
          style={reduceMotion ? undefined : { x: parallaxX, y: parallaxY }}
        >
          {heroSlides.map((slide, index) => {
            const isActive = reduceMotion ? index === 0 : index === activeIndex;
            return (
              <motion.div
                key={slide.alt}
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: isActive ? 1 : 0 }}
                transition={{ duration: duration.cinematic, ease: "easeInOut" }}
              >
                <motion.div
                  className="absolute inset-0"
                  initial={false}
                  animate={isActive && !reduceMotion ? { scale: 1.08 } : { scale: 1 }}
                  transition={{
                    duration: SLIDE_HOLD_MS / 1000 + duration.cinematic,
                    ease: "linear",
                  }}
                >
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    priority={index === 0}
                    loading={index === 0 ? undefined : "lazy"}
                    sizes="100vw"
                    quality={80}
                    placeholder="blur"
                    className="object-cover"
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Spotlight Glow — per docs/DesignSystem.md § Gradients, an
          intentional, subconscious echo of a real stage light. */}
      <div className="bg-gold-500/25 pointer-events-none absolute top-0 left-1/2 h-[55vh] w-[70vw] -translate-x-1/2 -translate-y-1/3 rounded-full blur-[120px]" />

      {/* Dark gradient scrim — bottom-heavy, guarantees AA text contrast
          regardless of what's playing behind it. Fixed neutral-900 (not a
          theme token): the Hero is a contained, always-dark cinematic
          moment, independent of the site-wide light/dark theme toggle —
          you can't "light theme" a photograph. */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: reduceMotion ? 0 : 0.15,
          duration: duration.moderate,
        }}
        className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/55 to-neutral-900/25"
      />
    </div>
  );
}
