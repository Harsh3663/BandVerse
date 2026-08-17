import type { Application } from "@/modules/marketplace/types";
import type { ApplicationRepository } from "@/backend/application/ports/repositories";
import type { ApplicationStatus } from "@/backend/domain/enums";
import { invalidTransitionError, notFoundError } from "@/backend/shared/errors";
import { paginate, type PaginatedResult, type PaginationQuery } from "@/backend/shared/pagination";
import { err, ok, type AppError, type Result } from "@/backend/shared/result";
import {
  canTransitionApplication,
  transitionApplication,
} from "@/modules/marketplace/state-machines";

export interface ApplicationListQuery extends PaginationQuery {
  eventId?: string;
  performerId?: string;
  status?: ApplicationStatus;
}

export async function listApplicationsUseCase(
  repository: ApplicationRepository,
  query: ApplicationListQuery,
): Promise<Result<PaginatedResult<Application>>> {
  let applications: readonly Application[];
  if (query.eventId) {
    applications = await repository.listByEvent(query.eventId);
  } else if (query.performerId) {
    applications = await repository.listByPerformer(query.performerId);
  } else {
    applications = await repository.list();
  }

  const filtered = applications.filter((application) => {
    if (query.status && application.status !== query.status) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) =>
    query.sortOrder === "asc"
      ? a.updatedAt.localeCompare(b.updatedAt)
      : b.updatedAt.localeCompare(a.updatedAt),
  );

  return ok(paginate(sorted, query));
}

export async function getApplicationByIdUseCase(
  repository: ApplicationRepository,
  id: string,
): Promise<Result<Application, AppError>> {
  const application = await repository.getById(id);
  if (!application) return err(notFoundError("Application", id));
  return ok(application);
}

export function transitionApplicationCommand(
  application: Application,
  to: ApplicationStatus,
): Result<Application, AppError> {
  if (!canTransitionApplication(application.status, to)) {
    return err(invalidTransitionError("application", application.status, to));
  }
  return ok(transitionApplication(application, to, new Date().toISOString()));
}
