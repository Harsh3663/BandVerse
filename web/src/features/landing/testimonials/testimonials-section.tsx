"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Quote } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { landingTestimonials } from "@/data/landing-experience";
import { duration, easePremium } from "@/lib/motion";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 6_000;
const SWIPE_THRESHOLD = 45;

export function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const reduceMotion = Boolean(useReducedMotion());

  useEffect(() => {
    if (paused || reduceMotion) return;
    const interval = window.setInterval(
      () => setActive((current) => (current + 1) % landingTestimonials.length),
      AUTOPLAY_MS,
    );
    return () => window.clearInterval(interval);
  }, [paused, reduceMotion]);

  const testimonial = landingTestimonials[active];

  return (
    <section
      aria-labelledby="testimonials-title"
      className="bg-muted/40 py-16 sm:py-20 lg:py-24"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      onTouchStart={(event) => {
        setPaused(true);
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) return;
        const distance =
          (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
        if (Math.abs(distance) >= SWIPE_THRESHOLD) {
          setActive((current) =>
            distance < 0
              ? (current + 1) % landingTestimonials.length
              : (current - 1 + landingTestimonials.length) % landingTestimonials.length,
          );
        }
        touchStartX.current = null;
      }}
    >
      <Container>
        <header className="mb-8 text-center sm:mb-10">
          <p className="text-primary mb-3 text-xs font-semibold tracking-[0.08em] uppercase">
            Stories that shape the experience
          </p>
          <h2
            id="testimonials-title"
            className="font-display text-3xl font-semibold sm:text-4xl"
          >
            Planning should feel exciting, not uncertain.
          </h2>
        </header>

        <Card className="mx-auto min-h-80 max-w-4xl justify-center">
          <CardContent className="relative grid items-center gap-8 p-3 sm:p-6 md:grid-cols-[180px_1fr]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={{
                  duration: reduceMotion ? 0 : duration.slow,
                  ease: easePremium,
                }}
                className="contents"
              >
                <div className="bg-primary/10 text-primary mx-auto flex size-32 items-center justify-center rounded-full text-3xl font-semibold md:size-40">
                  {testimonial.initials}
                </div>
                <figure>
                  <Quote
                    className="text-primary mb-5 size-9"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <blockquote className="font-display text-2xl leading-snug font-medium text-balance sm:text-3xl">
                    “{testimonial.quote}”
                  </blockquote>
                  <figcaption className="text-muted-foreground mt-6 flex flex-wrap items-center gap-3">
                    <span className="text-foreground font-semibold">
                      {testimonial.name}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{testimonial.event}</span>
                  </figcaption>
                </figure>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        <div
          className="mt-6 flex items-center justify-center gap-3"
          aria-label="Choose a story"
        >
          {landingTestimonials.map((item, index) => (
            <button
              key={item.name}
              type="button"
              aria-label={`Show story ${index + 1}`}
              aria-current={index === active ? "true" : undefined}
              onClick={() => setActive(index)}
              className={cn(
                "focus-visible:ring-ring size-11 rounded-full outline-none focus-visible:ring-3",
                "after:mx-auto after:block after:size-2.5 after:rounded-full after:transition-colors",
                index === active ? "after:bg-primary" : "after:bg-muted-foreground/40",
              )}
            />
          ))}
        </div>
        <div className="mt-3 text-center">
          <Badge variant="outline">Representative pre-launch scenarios</Badge>
        </div>
      </Container>
    </section>
  );
}
