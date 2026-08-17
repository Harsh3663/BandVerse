import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  children,
  align = "left",
  className,
}: PageHeroProps) {
  return (
    <header
      className={cn(
        "border-border bg-card/40 border-b py-12 sm:py-16 lg:py-20",
        className,
      )}
    >
      <Container
        className={cn(
          "flex flex-col gap-5",
          align === "center" && "items-center text-center",
        )}
      >
        <div className="max-w-3xl space-y-4">
          {eyebrow ? (
            <Badge variant="secondary" className="uppercase">
              {eyebrow}
            </Badge>
          ) : null}
          <h1 className="font-display text-4xl leading-tight font-semibold text-balance sm:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="text-muted-foreground max-w-2xl text-base leading-relaxed text-pretty sm:text-lg">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-3">{actions}</div>
        ) : null}
        {children}
      </Container>
    </header>
  );
}
