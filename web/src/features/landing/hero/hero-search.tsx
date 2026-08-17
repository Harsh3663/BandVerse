"use client";

import { type FormEvent, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { performerCategories } from "@/config/categories";
import { duration, easePremium } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface HeroSearchProps {
  reduceMotion: boolean;
  delay: number;
}

/** Long enough for the icon -> spinner morph to actually register, short
 * enough to never feel like a real wait — see component doc comment below. */
const SUBMIT_FEEDBACK_MS = 350;

/**
 * The Hero's glass search pill — see docs/LandingPageExperience.md § Hero >
 * Search for the three-part spec (Location | Category | Submit).
 *
 * `/search` doesn't exist yet (a future Search Experience milestone), so
 * submitting here correctly builds and navigates to its real, final IA path
 * rather than doing nothing — the moment that route ships, this form works
 * with zero changes.
 */
export function HeroSearch({ reduceMotion, delay }: HeroSearchProps) {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    if (category) params.set("category", category);
    const query = params.toString();

    window.setTimeout(() => {
      router.push((query ? `/search?${query}` : "/search") as Route);
    }, SUBMIT_FEEDBACK_MS);
  }

  return (
    <motion.form
      role="search"
      aria-label="Search for performers"
      onSubmit={handleSubmit}
      initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: duration.slow,
        ease: easePremium,
        delay: reduceMotion ? 0 : delay,
      }}
      className={cn(
        "mx-auto flex w-full max-w-xl flex-col gap-1 rounded-[28px] border border-white/15 bg-white/10 p-2 shadow-2xl backdrop-blur-md sm:flex-row sm:items-center sm:gap-2 sm:rounded-full",
        "focus-within:ring-primary-300/60 transition-shadow focus-within:ring-2",
      )}
    >
      <label className="flex flex-1 items-center gap-2 rounded-full px-3 py-1.5">
        <MapPin className="size-4 shrink-0 text-white/50" aria-hidden="true" />
        <span className="sr-only">Your location</span>
        <Input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Your city"
          autoComplete="off"
          className="h-auto border-0 bg-transparent p-0 text-sm text-white placeholder:text-white/50 focus-visible:ring-0 dark:bg-transparent"
        />
      </label>

      <div className="hidden h-6 w-px bg-white/15 sm:block" aria-hidden="true" />

      <div className="hidden shrink-0 sm:block">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger
            size="sm"
            aria-label="Category"
            className="w-40 border-0 bg-transparent text-sm text-white focus-visible:ring-0 data-placeholder:text-white/50 dark:bg-transparent dark:hover:bg-white/10 [&_svg]:text-white/50"
          >
            <SelectValue placeholder="Any category" />
          </SelectTrigger>
          <SelectContent>
            {performerCategories.map((cat) => (
              <SelectItem key={cat.slug} value={cat.slug}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        size="icon"
        disabled={isSubmitting}
        aria-label="Search"
        className="shrink-0 rounded-full"
      >
        {isSubmitting ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <Search aria-hidden="true" />
        )}
      </Button>
    </motion.form>
  );
}
