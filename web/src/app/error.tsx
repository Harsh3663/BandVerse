"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container
      width="narrow"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-5 py-20 text-center"
    >
      <span className="bg-destructive/10 text-destructive rounded-full p-3">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </span>
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">
        We couldn&apos;t load this page
      </h1>
      <p className="text-muted-foreground max-w-sm">
        The problem may be temporary. Try loading the page again, or continue from the
        homepage.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" onClick={() => reset()}>
          Try again
        </Button>
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </Container>
  );
}
