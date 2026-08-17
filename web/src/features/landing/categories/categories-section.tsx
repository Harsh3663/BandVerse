"use client";

import { useReducedMotion } from "framer-motion";

import { Container } from "@/components/layout/container";

import { featuredCategories } from "./category-data";
import { CategoryCard } from "./category-card";

export function CategoriesSection() {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <section
      aria-labelledby="featured-categories-title"
      className="bg-background py-12 sm:py-16 lg:py-20"
    >
      <Container width="wide">
        <header className="mb-8 max-w-2xl sm:mb-10">
          <p className="text-primary mb-3 text-xs font-semibold tracking-[0.08em] uppercase">
            Featured categories
          </p>
          <h2
            id="featured-categories-title"
            className="font-display text-foreground text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl"
          >
            A stage for every kind of sound.
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
            From intimate sets to full-scale celebrations, discover performers who make
            every moment feel unmistakably live.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featuredCategories.map((category, index) => (
            <CategoryCard
              key={category.name}
              category={category}
              index={index}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
