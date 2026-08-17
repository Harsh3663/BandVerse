import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: readonly FaqItem[];
  heading?: string;
  className?: string;
}

export function FaqAccordion({
  items,
  heading = "Frequently asked questions",
  className,
}: FaqAccordionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className={cn("space-y-6", className)} aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="font-display text-3xl font-semibold">
        {heading}
      </h2>
      <div className="border-border divide-border divide-y border-y">
        {items.map((item) => (
          <details key={item.id} className="group py-1">
            <summary className="focus-visible:ring-ring flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-md py-3 font-medium outline-none focus-visible:ring-3 [&::-webkit-details-marker]:hidden">
              <span>{item.question}</span>
              <ChevronDown
                className="text-muted-foreground size-5 shrink-0 transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="text-muted-foreground max-w-3xl pb-5 leading-relaxed">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
