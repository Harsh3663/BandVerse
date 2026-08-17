"use client";

import { type FormEvent, useId, useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterSection() {
  const inputId = useId();
  const messageId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setStatus("error");
      return;
    }
    setStatus("success");
  }

  return (
    <section aria-labelledby="newsletter-title" className="bg-background py-16 sm:py-20">
      <Container width="narrow">
        <div className="text-center">
          <Mail
            className="text-primary mx-auto size-9"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <h2
            id="newsletter-title"
            className="font-display mt-4 text-3xl font-semibold sm:text-4xl"
          >
            Keep a finger on the beat.
          </h2>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            Preview the newsletter signup experience for new performers, events, and
            ideas.
          </p>
        </div>

        {status === "success" ? (
          <div
            role="status"
            className="bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-500 mx-auto mt-7 flex max-w-lg items-center justify-center gap-2 rounded-lg p-4 text-sm"
          >
            <CheckCircle2 className="size-5" aria-hidden="true" />
            Thanks — this frontend preview accepted your email. Nothing was sent or
            stored.
          </div>
        ) : (
          <form className="mx-auto mt-7 max-w-lg" onSubmit={handleSubmit} noValidate>
            <label htmlFor={inputId} className="sr-only">
              Email address
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id={inputId}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (status === "error") setStatus("idle");
                }}
                aria-invalid={status === "error"}
                aria-describedby={status === "error" ? messageId : undefined}
              />
              <Button type="submit">Preview signup</Button>
            </div>
            <p
              id={messageId}
              role={status === "error" ? "alert" : undefined}
              className={status === "error" ? "text-destructive mt-2 text-sm" : "sr-only"}
            >
              Enter a valid email address.
            </p>
            <p className="text-muted-foreground mt-3 text-center text-xs">
              Demo only: no backend is connected, and your email is not stored.
            </p>
          </form>
        )}
      </Container>
    </section>
  );
}
