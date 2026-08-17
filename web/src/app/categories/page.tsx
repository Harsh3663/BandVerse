import type { Metadata } from "next";

import { CategoriesPage } from "@/features/search/discovery-pages";

export const metadata: Metadata = {
  title: "Performance categories",
  description: "Browse live performers by music and performance category.",
  alternates: { canonical: "/categories" },
};

export default CategoriesPage;
