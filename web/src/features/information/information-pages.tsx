import { ArrowRight, Building2, Music, UserRound } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { PageHero } from "@/components/shared/page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  informationalAliases,
  informationalPages,
  legalAliases,
  type InfoPageData,
} from "@/data/informational";

import {
  ContactForm,
  LoginForm,
  OnboardingForm,
  type ContactDefaults,
} from "./demo-forms";

export const specialInfoSlugs = [
  "contact",
  "become-performer",
  "become-band",
  "for-performers",
  "login",
  "get-started",
] as const;

export function infoStaticParams() {
  return [...Object.keys(informationalAliases), ...specialInfoSlugs].map((info) => ({
    info,
  }));
}

export function infoMetadata(slug: string): Metadata {
  const data = informationalPages[informationalAliases[slug]];
  if (data)
    return {
      title: data.title,
      description: data.description,
      alternates: { canonical: `/${slug}` },
    };
  const titles: Record<string, string> = {
    contact: "Contact",
    "become-performer": "Become a performer",
    "become-band": "List your band",
    "for-performers": "For performers",
    login: "Log in",
    "get-started": "Get started",
  };
  return titles[slug]
    ? { title: titles[slug], alternates: { canonical: `/${slug}` } }
    : { title: "Page not found" };
}

export function legalMetadata(document: string): Metadata {
  const page = informationalPages[legalAliases[document]];
  return page
    ? {
        title: page.title,
        description: page.description,
        alternates: { canonical: `/legal/${document}` },
      }
    : { title: "Document not found" };
}

export function StaticInformationPage({ data }: { data: InfoPageData }) {
  return (
    <>
      <PageHero
        eyebrow={data.eyebrow}
        title={data.title}
        description={data.description}
        actions={
          data.primaryAction ? (
            <>
              <Button asChild>
                <Link href={data.primaryAction.href as Route}>
                  {data.primaryAction.label}
                </Link>
              </Button>
              {data.secondaryAction ? (
                <Button asChild variant="outline">
                  <Link href={data.secondaryAction.href as Route}>
                    {data.secondaryAction.label}
                  </Link>
                </Button>
              ) : null}
            </>
          ) : null
        }
      />
      <Container width="narrow" className="space-y-12 py-10 sm:py-14">
        {data.notice ? (
          <aside className="border-primary/30 bg-primary/5 rounded-lg border p-4 text-sm leading-relaxed">
            <strong>Current product status:</strong> {data.notice}
          </aside>
        ) : null}
        {data.sections.map((section) => (
          <section key={section.id} aria-labelledby={section.id} className="space-y-4">
            <h2
              id={section.id}
              className="font-display text-2xl font-semibold sm:text-3xl"
            >
              {section.title}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
            {section.bullets ? (
              <ul className="text-muted-foreground list-disc space-y-2 pl-5 leading-relaxed">
                {section.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
        {data.faqs ? <FaqAccordion items={data.faqs} /> : null}
      </Container>
    </>
  );
}

export function InformationRoute({
  slug,
  defaults = {},
}: {
  slug: string;
  defaults?: ContactDefaults;
}) {
  const key = informationalAliases[slug];
  if (key) return <StaticInformationPage data={informationalPages[key]} />;
  if (slug === "contact") return <ContactPage defaults={defaults} />;
  if (slug === "become-performer") return <OnboardingPage kind="performer" />;
  if (slug === "become-band") return <OnboardingPage kind="band" />;
  if (slug === "for-performers") return <ForPerformersPage />;
  if (slug === "login") return <LoginPage />;
  if (slug === "get-started") return <GetStartedPage />;
  notFound();
}

export function LegalRoute({ document }: { document: string }) {
  const key = legalAliases[document];
  if (!key) notFound();
  return <StaticInformationPage data={informationalPages[key]} />;
}

function ContactPage({ defaults }: { defaults: ContactDefaults }) {
  return (
    <>
      <PageHero
        eyebrow={
          defaults.intent === "booking"
            ? "Booking enquiry"
            : defaults.intent === "report"
              ? "Profile report"
              : "Contact"
        }
        title={
          defaults.performer
            ? defaults.intent === "report"
              ? `Report ${defaults.performer}`
              : `Ask about ${defaults.performer}`
            : "How can we help?"
        }
        description="Complete the form to preview the contact experience. No message is sent from this demo."
      />
      <Container width="narrow" className="py-10 sm:py-14">
        <ContactForm defaults={defaults} />
      </Container>
    </>
  );
}

function OnboardingPage({ kind }: { kind: "performer" | "band" }) {
  const band = kind === "band";
  return (
    <>
      <PageHero
        eyebrow="Performer onboarding"
        title={band ? "Introduce your band or group" : "Introduce your performance"}
        description="Preview the information a future BandVerse listing would need. This demo does not create an account or submit an application."
      />
      <Container width="narrow" className="space-y-8 py-10 sm:py-14">
        <OnboardingForm kind={kind} />
        <p className="text-muted-foreground text-sm">
          Looking for the other path?{" "}
          <Link
            className="text-primary font-medium hover:underline"
            href={band ? "/become-performer" : "/become-band"}
          >
            {band ? "Join as a solo performer" : "Join as a band or group"}
          </Link>
        </p>
      </Container>
    </>
  );
}

function ForPerformersPage() {
  return (
    <>
      <PageHero
        eyebrow="For performers"
        title="A clearer way to present your work"
        description="BandVerse is exploring profiles that put sound, event fit, pricing context, and enquiry details in one place."
        actions={
          <Button asChild>
            <Link href="/become-performer">Preview solo onboarding</Link>
          </Button>
        }
      />
      <Container className="grid gap-5 py-10 sm:grid-cols-3 sm:py-14">
        {[
          [
            "Structured profile",
            "Present style, location, languages, pricing context, and representative work consistently.",
          ],
          [
            "Relevant enquiries",
            "A future service would collect event type, date, and requirements before contact.",
          ],
          [
            "Honest controls",
            "This demo creates no public listing, account, or booking and takes no payment.",
          ],
        ].map(([title, text]) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              {text}
            </CardContent>
          </Card>
        ))}
        <div className="flex flex-wrap gap-3 sm:col-span-3">
          <Button asChild>
            <Link href="/become-performer">I’m a solo performer</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/become-band">We’re a band or group</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/faq">Read the FAQ</Link>
          </Button>
        </div>
      </Container>
    </>
  );
}

function LoginPage() {
  return (
    <>
      <PageHero
        eyebrow="Account preview"
        title="Log in"
        description="Authentication is not connected in this frontend demo."
        align="center"
      />
      <Container width="narrow" className="py-10 sm:py-14">
        <Card className="mx-auto max-w-lg">
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </Container>
    </>
  );
}

function GetStartedPage() {
  const choices = [
    {
      title: "Book live talent",
      text: "Discover representative profiles and send a demo enquiry.",
      href: "/search",
      label: "Browse performers",
      icon: <UserRound />,
    },
    {
      title: "Join as a performer",
      text: "Preview the solo performer onboarding form.",
      href: "/become-performer",
      label: "Performer path",
      icon: <Music />,
    },
    {
      title: "Join as a band or group",
      text: "Preview onboarding for a multi-person act.",
      href: "/become-band",
      label: "Band path",
      icon: <Building2 />,
    },
  ] as const;
  return (
    <>
      <PageHero
        eyebrow="Get started"
        title="Choose what you want to do"
        description="All paths are functional previews. No account, application, or booking is created."
        align="center"
      />
      <Container className="grid gap-5 py-10 sm:py-14 md:grid-cols-3">
        {choices.map((choice) => (
          <Card key={choice.href}>
            <CardHeader>
              <Badge variant="secondary" className="mb-3 w-fit [&_svg]:size-4">
                {choice.icon}
              </Badge>
              <CardTitle>{choice.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-5">
              <p className="text-muted-foreground leading-relaxed">{choice.text}</p>
              <Button asChild variant="outline" className="mt-auto">
                <Link href={choice.href}>
                  {choice.label}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </Container>
    </>
  );
}
