import type { PerformerProfile } from "@/modules/marketplace/types";
import type { PerformerQuery } from "@/modules/marketplace/filters";
import type { PerformerRepository } from "@/backend/application/ports/repositories";
import { notFoundError } from "@/backend/shared/errors";
import { paginate, type PaginatedResult, type PaginationQuery } from "@/backend/shared/pagination";
import { err, ok, type Result } from "@/backend/shared/result";
import type { AppError } from "@/backend/shared/result";

export async function listPerformersUseCase(
  repository: PerformerRepository,
  query: PerformerQuery & PaginationQuery,
): Promise<Result<PaginatedResult<PerformerProfile>>> {
  const performers = await repository.query(query);
  const sorted = [...performers].sort((a, b) =>
    query.sortOrder === "asc"
      ? a.displayName.localeCompare(b.displayName)
      : b.rating.average - a.rating.average ||
        a.displayName.localeCompare(b.displayName),
  );

  const filtered = query.q
    ? sorted.filter((performer) => {
        const haystack =
          `${performer.displayName} ${performer.headline} ${performer.handle}`.toLocaleLowerCase(
            "en-IN",
          );
        return haystack.includes(query.q!.toLocaleLowerCase("en-IN"));
      })
    : sorted;

  return ok(paginate(filtered, query));
}

export async function getPerformerByIdUseCase(
  repository: PerformerRepository,
  id: string,
): Promise<Result<PerformerProfile, AppError>> {
  const performer = await repository.getById(id);
  if (!performer) return err(notFoundError("Performer", id));
  return ok(performer);
}

export async function getPerformerByHandleUseCase(
  repository: PerformerRepository,
  handle: string,
): Promise<Result<PerformerProfile, AppError>> {
  const performer = await repository.getByHandle(handle);
  if (!performer) return err(notFoundError("Performer", handle));
  return ok(performer);
}
