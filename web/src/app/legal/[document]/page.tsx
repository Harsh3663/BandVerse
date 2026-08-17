import type { Metadata } from "next";

import { legalAliases } from "@/data/informational";
import { legalMetadata, LegalRoute } from "@/features/information/information-pages";

interface LegalPageProps {
  params: Promise<{ document: string }>;
}

export function generateStaticParams() {
  return Object.keys(legalAliases).map((document) => ({ document }));
}

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  return legalMetadata((await params).document);
}

export default async function LegalPage({ params }: LegalPageProps) {
  return <LegalRoute document={(await params).document} />;
}
