import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/shared/result-state";

export default function OpportunityNotFound() {
  return (
    <Container className="py-10 sm:py-14">
      <EmptyState
        title="Opportunity not found"
        description="This opportunity may be closed, unpublished, or unavailable."
        clearHref="/opportunities"
      />
    </Container>
  );
}
