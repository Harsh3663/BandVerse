import { Music2, Search } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NotFound() {
  return (
    <Container
      width="narrow"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-20 text-center"
    >
      <Music2 className="text-muted-foreground size-8" aria-hidden />
      <h1 className="font-display text-2xl font-semibold">
        This page hasn&apos;t taken the stage yet.
      </h1>
      <p className="text-muted-foreground max-w-sm">
        We couldn&apos;t find what you were looking for. Let&apos;s get you back to
        somewhere familiar.
      </p>
      <form
        action="/search"
        method="get"
        role="search"
        aria-label="Search BandVerse"
        className="mt-2 flex w-full max-w-md flex-col gap-2 sm:flex-row"
      >
        <label className="relative flex-1">
          <span className="sr-only">Search performers</span>
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            name="q"
            type="search"
            placeholder="Search artists, bands, or cities"
            className="pl-10"
          />
        </label>
        <Button type="submit">Search</Button>
      </form>
      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild variant="outline">
          <Link href="/discover">Explore performers</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </Container>
  );
}
