"use client";

import { Flag, Heart, Share2 } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";

async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Continue to the DOM fallback when clipboard permission is unavailable.
  }

  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand("copy");
  field.remove();
  return copied;
}

export function MarketplaceProfileActions({
  name,
  canonicalPath,
  reportHref,
}: {
  name: string;
  canonicalPath: string;
  reportHref: Route;
}) {
  const [favourite, setFavourite] = useState(false);
  const [shareStatus, setShareStatus] = useState("");

  async function shareProfile() {
    const url = new URL(canonicalPath, window.location.origin).toString();
    setShareStatus("");

    if (navigator.share) {
      try {
        await navigator.share({ title: name, text: `View ${name} on BandVerse`, url });
        setShareStatus("Profile shared");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    setShareStatus(
      (await copyText(url)) ? "Profile link copied" : "Copy the page URL to share",
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2" aria-label="Profile actions">
        <Button type="button" variant="outline" size="sm" onClick={shareProfile}>
          <Share2 aria-hidden />
          Share
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-pressed={favourite}
          onClick={() => setFavourite((current) => !current)}
        >
          <Heart className={favourite ? "fill-current" : undefined} aria-hidden />
          {favourite ? "Favourited" : "Favourite"}
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href={reportHref}>
            <Flag aria-hidden />
            Report
          </Link>
        </Button>
      </div>
      <p className="text-muted-foreground min-h-4 text-xs" aria-live="polite">
        {shareStatus}
      </p>
    </div>
  );
}
