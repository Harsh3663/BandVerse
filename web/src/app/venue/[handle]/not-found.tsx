import { Building2 } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export default function VenueNotFound() {
  return (
    <Container
      width="narrow"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-20 text-center"
    >
      <Building2 className="text-muted-foreground size-9" aria-hidden />
      <h1 className="font-display text-3xl font-semibold">Venue not found</h1>
      <p className="text-muted-foreground">
        This venue may have moved or is no longer listed.
      </p>
      <Button asChild>
        <Link href="/venues">Browse venue directory</Link>
      </Button>
    </Container>
  );
}
