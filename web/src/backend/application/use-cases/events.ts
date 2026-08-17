import type { MarketplaceEvent } from "@/modules/marketplace/types";
import type { EventRepository } from "@/backend/application/ports/repositories";
import { notFoundError } from "@/backend/shared/errors";
import { paginate, type PaginatedResult, type PaginationQuery } from "@/backend/shared/pagination";
import { err, ok, type AppError, type Result } from "@/backend/shared/result";
import type { EventStatus } from "@/backend/domain/enums";

export interface EventListQuery extends PaginationQuery {
  hostId?: string;
  status?: EventStatus;
  city?: string;
  eventTypeId?: string;
}

function matchesEvent(event: MarketplaceEvent, query: EventListQuery): boolean {
  if (query.hostId && event.hostId !== query.hostId) return false;
  if (query.status && event.status !== query.status) return false;
  if (query.eventTypeId && event.eventTypeId !== query.eventTypeId) return false;
  if (
    query.city &&
    event.location.city.toLocaleLowerCase("en-IN") !==
      query.city.toLocaleLowerCase("en-IN")
  ) {
    return false;
  }
  if (query.q) {
    const haystack =
      `${event.title} ${event.description ?? ""}`.toLocaleLowerCase("en-IN");
    if (!haystack.includes(query.q.toLocaleLowerCase("en-IN"))) return false;
  }
  return true;
}

export async function listEventsUseCase(
  repository: EventRepository,
  query: EventListQuery,
): Promise<Result<PaginatedResult<MarketplaceEvent>>> {
  const source = query.hostId
    ? await repository.listByHost(query.hostId)
    : await repository.list();
  const filtered = source.filter((event) => matchesEvent(event, query));
  const sorted = [...filtered].sort((a, b) =>
    query.sortOrder === "asc"
      ? a.startsAt.localeCompare(b.startsAt)
      : b.startsAt.localeCompare(a.startsAt),
  );
  return ok(paginate(sorted, query));
}

export async function getEventByIdUseCase(
  repository: EventRepository,
  id: string,
): Promise<Result<MarketplaceEvent, AppError>> {
  const event = await repository.getById(id);
  if (!event) return err(notFoundError("Event", id));
  return ok(event);
}
