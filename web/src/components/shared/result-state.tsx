"use client";

import { AlertTriangle, SearchX } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResultStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

function StateLayout({
  icon,
  title,
  description,
  action,
  className,
  role,
}: ResultStateProps & {
  icon: ReactNode;
  role?: "alert" | "status";
}) {
  return (
    <div
      role={role}
      className={cn(
        "border-border bg-card flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center",
        className,
      )}
    >
      <div className="bg-muted text-muted-foreground mb-4 flex size-12 items-center justify-center rounded-full">
        {icon}
      </div>
      <h2 className="font-heading text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-2 max-w-md leading-relaxed">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

interface EmptyStateProps extends Partial<ResultStateProps> {
  clearHref?: string;
}

export function EmptyState({
  title = "No matches found",
  description = "Try widening your search or clearing one of the active filters.",
  clearHref,
  action,
  className,
}: EmptyStateProps) {
  return (
    <StateLayout
      role="status"
      title={title}
      description={description}
      className={className}
      icon={<SearchX className="size-6" aria-hidden="true" />}
      action={
        action ??
        (clearHref ? (
          <Button asChild variant="outline">
            <Link href={clearHref as Route}>Clear filters</Link>
          </Button>
        ) : undefined)
      }
    />
  );
}

interface ErrorStateProps extends Partial<ResultStateProps> {
  onRetry?: () => void;
}

export function ErrorState({
  title = "We couldn’t load these results",
  description = "Please try again. If the problem continues, come back in a few minutes.",
  onRetry,
  action,
  className,
}: ErrorStateProps) {
  return (
    <StateLayout
      role="alert"
      title={title}
      description={description}
      className={className}
      icon={<AlertTriangle className="size-6" aria-hidden="true" />}
      action={
        action ??
        (onRetry ? (
          <Button type="button" variant="outline" onClick={onRetry}>
            Try again
          </Button>
        ) : undefined)
      }
    />
  );
}
