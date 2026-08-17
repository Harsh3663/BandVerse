"use client";

import { Menu } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

import { Container } from "@/components/layout/container";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { primaryNav } from "@/config/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-border bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur-md">
      <Link
        href="#main-content"
        className="bg-background text-foreground focus-visible:ring-ring fixed top-2 left-2 z-50 -translate-y-20 rounded-md px-4 py-2 text-sm font-medium shadow-lg transition-transform focus-visible:translate-y-0 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
      >
        Skip to content
      </Link>
      <Container width="wide" className="flex h-18 items-center justify-between py-3">
        <Logo />

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {primaryNav.map((item) => (
            // See the comment on NavItem['href'] in src/types/nav.ts for why
            // this cast is necessary and safe.
            <Link
              key={item.href}
              href={item.href as Route}
              className={cn(
                "group text-muted-foreground hover:text-foreground focus-visible:ring-ring relative rounded-sm text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
              )}
            >
              {item.label}
              <span className="bg-foreground absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 transition-transform duration-150 ease-out group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/get-started">Get Started</Link>
          </Button>
        </div>

        {/* Mobile nav trigger */}
        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
            <SheetContent side="right" className="w-full sm:max-w-xs">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Primary" className="flex flex-col gap-1 px-4">
                {primaryNav.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href as Route}
                      className="text-foreground hover:bg-accent rounded-md px-3 py-3 text-base font-medium"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2 p-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    Log in
                  </Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/get-started" onClick={() => setMobileOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}
