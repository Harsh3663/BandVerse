import { Container } from "@/components/layout/container";
import { HeroSearch } from "@/features/landing/hero/hero-search";

export function FinalSearchCtaSection() {
  return (
    <section
      aria-labelledby="final-search-title"
      className="relative overflow-hidden bg-neutral-900 py-20 text-white sm:py-24"
    >
      <div
        aria-hidden="true"
        className="bg-primary-600/30 absolute inset-0 [background:radial-gradient(circle_at_50%_20%,rgba(116,81,245,.42),transparent_58%)]"
      />
      <Container className="relative text-center">
        <p className="text-primary-200 mb-3 text-xs font-semibold tracking-[0.08em] uppercase">
          Your next event starts here
        </p>
        <h2
          id="final-search-title"
          className="font-display mx-auto max-w-3xl text-3xl leading-tight font-semibold text-balance sm:text-4xl lg:text-5xl"
        >
          Ready to find your perfect performer?
        </h2>
        <p className="mx-auto mt-4 mb-8 max-w-xl text-white/70">
          Search by city and style to begin exploring the BandVerse lineup.
        </p>
        <HeroSearch reduceMotion delay={0} />
      </Container>
    </section>
  );
}
