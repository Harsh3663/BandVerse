import {
  resolveOrganizerAnalytics,
  resolvePerformerAnalytics,
} from "@/modules/marketplace/analytics";
import {
  resolveOrganizerDashboardData,
  type MarketplaceRepositories,
} from "@/modules/marketplace/repositories";
import type {
  OrganizerAnalytics,
  PerformerAnalytics,
} from "@/modules/marketplace/types";
import type {
  ApplicationRepository,
  BookingRepository,
  PerformerRepository,
} from "@/backend/application/ports/repositories";
import { notFoundError } from "@/backend/shared/errors";
import { err, ok, type AppError, type Result } from "@/backend/shared/result";

export async function getOrganizerAnalyticsUseCase(
  repositories: MarketplaceRepositories,
): Promise<Result<OrganizerAnalytics, AppError>> {
  const dashboard = await resolveOrganizerDashboardData(repositories);
  if (!dashboard) return err(notFoundError("Organizer dashboard"));
  return ok(resolveOrganizerAnalytics(dashboard));
}

export async function getPerformerAnalyticsUseCase(
  performers: PerformerRepository,
  applications: ApplicationRepository,
  bookings: BookingRepository,
  performerId: string,
): Promise<Result<PerformerAnalytics, AppError>> {
  const performer = await performers.getById(performerId);
  if (!performer) return err(notFoundError("Performer", performerId));
  const [performerApplications, performerBookings] = await Promise.all([
    applications.listByPerformer(performerId),
    bookings.listByPerformer(performerId),
  ]);
  return ok(
    resolvePerformerAnalytics(performer, performerApplications, performerBookings),
  );
}
