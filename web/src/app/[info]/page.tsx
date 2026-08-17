import type { Metadata } from "next";

import {
  infoMetadata,
  InformationRoute,
  infoStaticParams,
} from "@/features/information/information-pages";

interface InformationPageProps {
  params: Promise<{ info: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export const generateStaticParams = infoStaticParams;

export async function generateMetadata({
  params,
}: InformationPageProps): Promise<Metadata> {
  return infoMetadata((await params).info);
}

export default async function InformationPage({
  params,
  searchParams,
}: InformationPageProps) {
  const [{ info }, query] = await Promise.all([params, searchParams]);
  return (
    <InformationRoute
      slug={info}
      defaults={{
        intent: first(query.intent),
        performer: first(query.performer),
        profile: first(query.profile),
        eventType: first(query.eventType),
        date: first(query.date),
        topic: first(query.topic),
      }}
    />
  );
}
