"use client";

import type { PointerEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { duration, easePremium } from "@/lib/motion";

import type { FeaturedCategory } from "./category-data";
import { CategoryGlyph } from "./category-glyph";

interface CategoryCardProps {
  category: FeaturedCategory;
  index: number;
  reduceMotion: boolean;
}

const performerCountFormatter = new Intl.NumberFormat("en-IN");

export function CategoryCard({ category, index, reduceMotion }: CategoryCardProps) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 120, damping: 22, mass: 0.5 });
  const y = useSpring(rawY, { stiffness: 120, damping: 22, mass: 0.5 });

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (reduceMotion || event.pointerType === "touch") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    rawX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * -12);
    rawY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * -12);
  }

  function resetParallax() {
    rawX.set(0);
    rawY.set(0);
  }

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        delay: reduceMotion ? 0 : index * 0.06,
        duration: duration.moderate,
        ease: easePremium,
      }}
      whileHover={reduceMotion ? undefined : { y: -6 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetParallax}
      className="group border-border/60 ring-foreground/10 focus-within:ring-ring relative isolate min-h-[28rem] overflow-hidden rounded-lg border bg-neutral-900 shadow-lg ring-1 focus-within:ring-2"
    >
      <motion.div
        style={reduceMotion ? undefined : { x, y }}
        className="absolute -inset-4 will-change-transform"
      >
        <Image
          src={category.image}
          alt={category.imageAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          quality={80}
          placeholder="blur"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/65 to-neutral-900/10" />
      <div className="from-primary-900/25 absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex min-h-[28rem] flex-col justify-end p-6">
        <span className="mb-auto flex size-11 items-center justify-center rounded-md border border-white/15 bg-white/10 text-white backdrop-blur-md">
          <CategoryGlyph name={category.glyph} className="size-6" />
        </span>

        <p className="text-gold-300 mb-2 text-xs font-semibold tracking-[0.08em] uppercase">
          {performerCountFormatter.format(category.performerCount)} performers live
        </p>
        <h3 className="font-display text-2xl font-semibold tracking-tight text-white">
          {category.name}
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/70">
          {category.description}
        </p>

        <Button
          asChild
          variant="secondary"
          className="mt-5 w-fit rounded-full bg-white/95 text-neutral-900 hover:bg-white"
        >
          <Link href={category.href as Route}>
            Explore
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </motion.article>
  );
}
