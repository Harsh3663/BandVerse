import { Container } from "@/components/layout/container";
import { Card, CardContent } from "@/components/ui/card";
import { landingSteps } from "@/data/landing-experience";

export function HowItWorksSection() {
  return (
    <section
      aria-labelledby="how-it-works-title"
      className="bg-muted/40 py-16 sm:py-20 lg:py-24"
    >
      <Container width="wide">
        <header className="mx-auto mb-10 max-w-3xl text-center">
          <p className="text-primary mb-3 text-xs font-semibold tracking-[0.08em] uppercase">
            How it works
          </p>
          <h2
            id="how-it-works-title"
            className="font-display text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl"
          >
            Booking live talent has never been this simple.
          </h2>
        </header>

        <ol className="relative grid gap-5 md:grid-cols-3">
          <span
            aria-hidden="true"
            className="bg-border absolute top-12 bottom-12 left-8 w-px md:top-12 md:right-[16.67%] md:bottom-auto md:left-[16.67%] md:h-px md:w-auto"
          />
          {landingSteps.map((step) => {
            const Icon = step.icon;
            return (
              <li key={step.number} className="relative">
                <Card className="bg-background h-full">
                  <CardContent className="flex gap-5 md:block">
                    <div className="bg-primary text-primary-foreground relative z-10 flex size-14 shrink-0 items-center justify-center rounded-full">
                      <Icon className="size-6" strokeWidth={1.5} aria-hidden="true" />
                    </div>
                    <div className="md:mt-7">
                      <span className="text-primary text-xs font-semibold tracking-widest">
                        STEP {step.number}
                      </span>
                      <h3 className="font-heading mt-2 text-xl font-semibold">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground mt-3 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
