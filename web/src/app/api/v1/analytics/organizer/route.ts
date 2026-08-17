import { getOrganizerAnalyticsUseCase } from "@/backend/application/use-cases/analytics";
import { getBackendContainer } from "@/backend/infrastructure/container";
import {
  createRequestId,
  fromResult,
} from "@/backend/presentation/http/response";

export const dynamic = "force-dynamic";

export async function GET() {
  const requestId = createRequestId();
  const container = getBackendContainer();
  const result = await getOrganizerAnalyticsUseCase(container.repositories);
  return fromResult(result, { requestId });
}
