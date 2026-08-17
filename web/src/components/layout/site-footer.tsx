import { ChevronDown } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Logo } from "@/components/shared/logo";
import { footerNav, siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-border bg-background border-t">
      <Container
        width="wide"
        className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-[1.35fr_repeat(3,1fr)] xl:grid-cols-[1.35fr_repeat(6,1fr)] xl:py-16"
      >
        <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-4 xl:col-span-1">
          <Logo />
          <p className="text-muted-foreground max-w-xs text-sm">{siteConfig.tagline}</p>
          <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
            Find representative artists, bands, and traditional performers across India.
          </p>
        </div>

        {footerNav.map((group) => (
          <details
            key={group.title}
            className="group border-border border-b pb-3 sm:border-0 sm:pb-0"
          >
            <summary className="focus-visible:ring-ring flex cursor-pointer list-none items-center justify-between rounded-sm py-1 text-sm font-medium focus-visible:ring-2 focus-visible:outline-none sm:pointer-events-none sm:cursor-default [&::-webkit-details-marker]:hidden">
              {group.title}
              <ChevronDown
                className="size-4 transition-transform group-open:rotate-180 motion-reduce:transition-none sm:hidden"
                aria-hidden="true"
              />
            </summary>
            <ul className="mt-3 hidden flex-col gap-2.5 group-open:flex sm:flex">
              {group.items.map((item) => (
                <li key={item.href}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-sm text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    >
                      {item.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    <Link
                      href={item.href as Route}
                      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-sm text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </details>
        ))}
      </Container>

      <Container
        width="wide"
        className="border-border text-muted-foreground flex flex-col-reverse items-center gap-4 border-t py-6 text-xs sm:flex-row sm:justify-between"
      >
        <p>
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
        <p>Payments secured by Razorpay</p>
      </Container>
    </footer>
  );
}
