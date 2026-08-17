import { JsonLd } from "@/components/shared/json-ld";
import { siteConfig } from "@/config/site";
import { AboutPreviewSection } from "@/features/landing/about-preview/about-preview-section";
import { CategoriesSection } from "@/features/landing/categories";
import { ContactCtaSection } from "@/features/landing/contact-cta/contact-cta-section";
import { LandingFaqSection } from "@/features/landing/faq/landing-faq-section";
import { FeaturedArtistsSection } from "@/features/landing/featured-artists";
import { FeaturedBandsSection } from "@/features/landing/featured-bands";
import { FinalSearchCtaSection } from "@/features/landing/final-search-cta/final-search-cta-section";
import { HeroSection } from "@/features/landing/hero";
import { HowItWorksSection } from "@/features/landing/how-it-works/how-it-works-section";
import { MobileCtaSection } from "@/features/landing/mobile-cta/mobile-cta-section";
import { NewsletterSection } from "@/features/landing/newsletter/newsletter-section";
import { PerformersCtaSection } from "@/features/landing/performers-cta/performers-cta-section";
import { TestimonialsSection } from "@/features/landing/testimonials/testimonials-section";
import { TraditionalSection } from "@/features/landing/traditional";
import { TrustSection } from "@/features/landing/trust";
import { UpcomingPerformancesSection } from "@/features/landing/upcoming-performances/upcoming-performances-section";

/**
 * BandVerse landing page.
 *
 * Existing landing milestones remain frozen; the complete supporting
 * experience is composed after Featured Bands.
 */
export default function Home() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${siteConfig.url}/#organization`,
              name: siteConfig.name,
              url: siteConfig.url,
              description: siteConfig.description,
            },
            {
              "@type": "WebSite",
              "@id": `${siteConfig.url}/#website`,
              name: siteConfig.name,
              url: siteConfig.url,
              description: siteConfig.description,
              publisher: { "@id": `${siteConfig.url}/#organization` },
              potentialAction: {
                "@type": "SearchAction",
                target: `${siteConfig.url}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }}
      />
      <HeroSection />
      <TrustSection />
      <CategoriesSection />
      <TraditionalSection />
      <FeaturedArtistsSection />
      <FeaturedBandsSection />
      <HowItWorksSection />
      <UpcomingPerformancesSection />
      <TestimonialsSection />
      <AboutPreviewSection />
      <MobileCtaSection />
      <PerformersCtaSection />
      <NewsletterSection />
      <LandingFaqSection />
      <ContactCtaSection />
      <FinalSearchCtaSection />
    </>
  );
}
