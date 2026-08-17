import type { Metadata } from "next";

import { discoveryCategories } from "@/data/discovery";
import { CategoryPage, getCategory } from "@/features/search/discovery-pages";

interface CategoryRouteProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return discoveryCategories.map(({ id }) => ({ slug: id }));
}

export async function generateMetadata({
  params,
}: CategoryRouteProps): Promise<Metadata> {
  const slug = (await params).slug;
  const category = getCategory(slug);
  return category
    ? {
        title: category.name,
        description: category.description,
        alternates: { canonical: `/categories/${category.id}` },
        openGraph: {
          type: "website",
          url: `/categories/${category.id}`,
          title: category.name,
          description: category.description,
          images: [{ url: category.image.src, alt: category.imageAlt }],
        },
      }
    : { title: "Category not found" };
}

export default async function CategoryRoute({ params }: CategoryRouteProps) {
  return <CategoryPage slug={(await params).slug} />;
}
