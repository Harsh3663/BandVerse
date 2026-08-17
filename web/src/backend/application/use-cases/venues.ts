import type { VenueProfile } from "@/modules/marketplace/types";
import type { VenueRepository } from "@/backend/application/ports/repositories";
import type { VenueType } from "@/backend/domain/enums";
import { notFoundError } from "@/backend/shared/errors";
import { paginate, type PaginatedResult, type PaginationQuery } from "@/backend/shared/pagination";
import { err, ok, type AppError, type Result } from "@/backend/shared/result";

export interface VenueListQuery extends PaginationQuery {
  city?: string;
  type?: VenueType;
  verified?: boolean;
}

export async function listVenuesUseCase(
  repository: VenueRepository,
  query: VenueListQuery,
): Promise<Result<PaginatedResult<VenueProfile>>> {
  const venues = await repository.list();
  const filtered = venues.filter((venue) => {
    if (
      query.city &&
      venue.location.city.toLocaleLowerCase("en-IN") !==
        query.city.toLocaleLowerCase("en-IN")
    ) {
      return false;
    }
    if (query.type && venue.type !== query.type) return false;
    if (typeof query.verified === "boolean" && venue.verified !== query.verified) {
      return false;
    }
    if (query.q) {
      const haystack =
        `${venue.name} ${venue.description} ${venue.handle}`.toLocaleLowerCase(
          "en-IN",
        );
      if (!haystack.includes(query.q.toLocaleLowerCase("en-IN"))) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  return ok(paginate(sorted, query));
}

export async function getVenueByIdUseCase(
  repository: VenueRepository,
  id: string,
): Promise<Result<VenueProfile, AppError>> {
  const venue = await repository.getById(id);
  if (!venue) return err(notFoundError("Venue", id));
  return ok(venue);
}

export async function getVenueByHandleUseCase(
  repository: VenueRepository,
  handle: string,
): Promise<Result<VenueProfile, AppError>> {
  const venue = await repository.getByHandle(handle);
  if (!venue) return err(notFoundError("Venue", handle));
  return ok(venue);
}
