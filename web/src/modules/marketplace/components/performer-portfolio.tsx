"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { AudioShowcase, GalleryGrid, VideoShowcase } from "@/modules/media";

import type { CalendarEntry, PerformerProfile, Review } from "../types";
import {
  PortfolioAchievements,
  PortfolioEquipment,
  PortfolioOverviewMedia,
  PortfolioPackages,
  PortfolioPerformanceHistory,
  PortfolioReviews,
  PortfolioSocialProof,
  PortfolioTaxonomyStrip,
  PortfolioVerification,
} from "./portfolio-sections";
import {
  MarketplaceAvailabilitySummary,
  MarketplaceCredentials,
  MarketplaceFaq,
  MarketplaceLocationSummary,
  MarketplacePerformerDetails,
  MarketplacePerformerFacts,
} from "./profile-modules";
import { TrustPanel } from "./trust";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "videos", label: "Videos" },
  { id: "gallery", label: "Gallery" },
  { id: "audio", label: "Audio" },
  { id: "reviews", label: "Reviews" },
  { id: "calendar", label: "Calendar" },
  { id: "equipment", label: "Equipment" },
  { id: "achievements", label: "Achievements" },
  { id: "packages", label: "Packages" },
] as const;

type PortfolioTabId = (typeof tabs)[number]["id"];

export function PerformerPortfolio({
  profile,
  reviews,
  calendarEntries,
  trustFooter,
}: {
  profile: PerformerProfile;
  reviews: readonly Review[];
  calendarEntries: readonly CalendarEntry[];
  trustFooter?: ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<PortfolioTabId>("overview");
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const mediaById = new Map(
    profile.portfolioMedia.map((item) => [
      item.id,
      { title: item.title, thumbnail: item.thumbnail, source: item.source },
    ]),
  );

  function focusTab(index: number) {
    const next = (index + tabs.length) % tabs.length;
    tabRefs.current[next]?.focus();
    setActiveTab(tabs[next].id);
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusTab(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusTab(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusTab(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusTab(tabs.length - 1);
    }
  }

  return (
    <div className="space-y-8">
      <div
        role="tablist"
        aria-label="Performer portfolio sections"
        className="border-border flex gap-1 overflow-x-auto border-b pb-px"
      >
        {tabs.map((tab, index) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={active}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
              className={cn(
                "focus-visible:ring-ring shrink-0 rounded-t-md px-3 py-2 text-sm font-medium whitespace-nowrap outline-none focus-visible:ring-2",
                active
                  ? "border-primary text-foreground border-b-2"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel-${activeTab}`}
        aria-labelledby={`${baseId}-tab-${activeTab}`}
        className="space-y-10"
      >
        {activeTab === "overview" ? (
          <>
            <PortfolioSocialProof proof={profile.socialProof} />
            <PortfolioVerification verification={profile.verification} />
            <PortfolioTaxonomyStrip profile={profile} />
            <PortfolioOverviewMedia profile={profile} />
            <MarketplacePerformerFacts profile={profile} />
            <MarketplacePerformerDetails profile={profile} />
            <div className="grid gap-4 lg:grid-cols-2">
              <MarketplaceLocationSummary travel={profile.travel} />
              <MarketplaceAvailabilitySummary
                availability={profile.availability}
                entries={calendarEntries}
              />
            </div>
            <PortfolioPerformanceHistory
              history={profile.performanceHistory}
              mediaById={mediaById}
            />
            <MarketplaceCredentials profile={profile} />
            <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_0.6fr]">
              <MarketplaceFaq items={profile.faqs} />
              <TrustPanel signals={profile.trustSignals} footer={trustFooter} />
            </div>
          </>
        ) : null}

        {activeTab === "videos" ? <VideoShowcase media={profile.portfolioMedia} /> : null}
        {activeTab === "gallery" ? <GalleryGrid media={profile.portfolioMedia} /> : null}
        {activeTab === "audio" ? <AudioShowcase media={profile.portfolioMedia} /> : null}
        {activeTab === "reviews" ? (
          <PortfolioReviews summary={profile.rating} reviews={reviews} />
        ) : null}
        {activeTab === "calendar" ? (
          <MarketplaceAvailabilitySummary
            availability={profile.availability}
            entries={calendarEntries}
          />
        ) : null}
        {activeTab === "equipment" ? (
          <PortfolioEquipment equipment={profile.equipment} />
        ) : null}
        {activeTab === "achievements" ? (
          <PortfolioAchievements
            awards={profile.awards}
            certificates={profile.certificates}
          />
        ) : null}
        {activeTab === "packages" ? (
          <PortfolioPackages packages={profile.pricingPackages} />
        ) : null}
      </div>
    </div>
  );
}
