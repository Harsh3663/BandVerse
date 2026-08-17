import { z } from "zod";

export const sortOrderSchema = z.enum(["asc", "desc"]);
export type SortOrder = z.infer<typeof sortOrderSchema>;

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().min(1).max(64).optional(),
  sortOrder: sortOrderSchema.default("desc"),
  q: z.string().trim().min(1).max(200).optional(),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export interface PageMeta {
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly meta: PageMeta;
}

export function paginate<T>(
  items: readonly T[],
  query: Pick<PaginationQuery, "page" | "pageSize">,
): PaginatedResult<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / query.pageSize));
  const page = Math.min(query.page, totalPages);
  const start = (page - 1) * query.pageSize;
  const slice = items.slice(start, start + query.pageSize);

  return {
    items: slice,
    meta: {
      page,
      pageSize: query.pageSize,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export function emptyPage<T>(
  query: Pick<PaginationQuery, "page" | "pageSize">,
): PaginatedResult<T> {
  return {
    items: [],
    meta: {
      page: query.page,
      pageSize: query.pageSize,
      totalItems: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
}
