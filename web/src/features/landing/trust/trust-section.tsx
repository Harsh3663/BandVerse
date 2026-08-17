"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

import { Container } from "@/components/layout/container";
import { cardHover, fadeUp } from "@/lib/motion";

import { AnimatedStat } from "./animated-stat";
import { trustMetrics } from "./trust-data";

export function TrustSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.4 });
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <section
      ref={sectionRef}
      aria-label="BandVerse at a glance"
      className="border-border/70 bg-card border-y py-8"
    >
      <Container width="wide">
        <ul className="-mx-5 flex snap-x snap-mandatory [scrollbar-width:none] gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-5 [&::-webkit-scrollbar]:hidden">
          {trustMetrics.map((metric, index) => {
            const Icon = metric.icon;

            return (
              <motion.li
                key={metric.label}
                variants={reduceMotion ? undefined : fadeUp}
                initial={reduceMotion ? false : "hidden"}
                animate={isInView ? "visible" : "hidden"}
                transition={{ delay: reduceMotion ? 0 : index * 0.06 }}
                whileHover={reduceMotion ? undefined : cardHover.hover}
                className="border-border/80 bg-background/70 ring-foreground/5 min-w-44 snap-start rounded-lg border p-4 ring-1 backdrop-blur-sm md:min-w-0"
              >
                <div className="flex items-center gap-3">
                  <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-md">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <strong className="font-display text-foreground block text-xl leading-none font-semibold tracking-tight">
                      {metric.value === undefined ? (
                        metric.text
                      ) : (
                        <AnimatedStat
                          value={metric.value}
                          decimals={metric.decimals}
                          prefix={metric.prefix}
                          suffix={metric.suffix}
                          start={isInView}
                          reduceMotion={reduceMotion}
                        />
                      )}
                    </strong>
                    <span className="text-muted-foreground mt-1.5 block text-xs leading-tight">
                      {metric.label}
                    </span>
                  </span>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
