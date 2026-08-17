"use client";

import Link from "next/link";
import type { Route } from "next";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const fieldClass =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 min-h-28 w-full rounded-lg border bg-transparent px-3.5 py-3 text-sm outline-none focus-visible:ring-3";
const labelClass = "grid gap-2 text-sm font-medium";

export interface ContactDefaults {
  intent?: string;
  performer?: string;
  profile?: string;
  eventType?: string;
  date?: string;
  topic?: string;
}

function Confirmation({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="border-primary/30 bg-primary/5 rounded-lg border p-4"
      role="status"
      tabIndex={-1}
    >
      <p className="font-medium">Demo confirmation</p>
      <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{children}</p>
    </div>
  );
}

export function ContactForm({ defaults }: { defaults: ContactDefaults }) {
  const [submitted, setSubmitted] = useState(false);
  const booking = defaults.intent === "booking" && defaults.performer;
  const report = defaults.intent === "report" && defaults.performer;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Name
          <Input name="name" autoComplete="name" required />
        </label>
        <label className={labelClass}>
          Email
          <Input name="email" type="email" autoComplete="email" required />
        </label>
      </div>
      <label className={labelClass}>
        Topic
        <select
          name="topic"
          defaultValue={defaults.topic || (booking ? "booking" : "general")}
          className="border-input focus-visible:ring-ring/50 h-11 rounded-lg border bg-transparent px-3.5 text-sm outline-none focus-visible:ring-3"
        >
          <option value="general">General question</option>
          <option value="booking">Booking enquiry</option>
          <option value="performer">Performer onboarding</option>
          <option value="safety">Trust and safety</option>
          <option value="privacy">Privacy</option>
          <option value="refund">Refund question</option>
          <option value="legal">Legal</option>
        </select>
      </label>
      {booking || report ? (
        <div className="bg-muted grid gap-1 rounded-lg p-4 text-sm">
          <p>
            <span className="text-muted-foreground">Performer:</span> {defaults.performer}
          </p>
          {defaults.eventType ? (
            <p>
              <span className="text-muted-foreground">Event:</span> {defaults.eventType}
            </p>
          ) : null}
          {defaults.date ? (
            <p>
              <span className="text-muted-foreground">Preferred date:</span>{" "}
              {defaults.date}
            </p>
          ) : null}
          {defaults.profile ? (
            <Link
              className="text-primary mt-2 font-medium hover:underline"
              href={defaults.profile as Route}
            >
              Return to profile
            </Link>
          ) : null}
        </div>
      ) : null}
      <label className={labelClass}>
        Message
        <textarea
          className={fieldClass}
          name="message"
          required
          defaultValue={
            booking
              ? `I would like to ask about ${defaults.performer}${defaults.eventType ? ` for a ${defaults.eventType}` : ""}${defaults.date ? ` on ${defaults.date}` : ""}.`
              : report
                ? `I would like to report a concern about the profile for ${defaults.performer}.`
                : ""
          }
        />
      </label>
      <p className="text-muted-foreground text-xs">
        Demo only. This form validates locally; it does not transmit, store, or deliver
        your message. Do not enter sensitive information.
      </p>
      <Button type="submit">Preview enquiry confirmation</Button>
      {submitted ? (
        <Confirmation>
          Your form is complete, but nothing was sent. A production backend is required
          before BandVerse can deliver enquiries.
        </Confirmation>
      ) : null}
    </form>
  );
}

export function OnboardingForm({ kind }: { kind: "performer" | "band" }) {
  const [submitted, setSubmitted] = useState(false);
  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          {kind === "band" ? "Band or group name" : "Stage or professional name"}
          <Input name="displayName" required />
        </label>
        <label className={labelClass}>
          Contact email
          <Input name="email" type="email" autoComplete="email" required />
        </label>
        <label className={labelClass}>
          Base city
          <Input name="city" autoComplete="address-level2" required />
        </label>
        <label className={labelClass}>
          Primary performance style
          <Input name="style" required />
        </label>
      </div>
      <label className={labelClass}>
        Tell us about your performance
        <textarea className={fieldClass} name="bio" required />
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input className="mt-1 size-4" type="checkbox" required />
        <span>
          I understand this demo does not create an account or submit an application.
        </span>
      </label>
      <Button type="submit">Preview application confirmation</Button>
      {submitted ? (
        <Confirmation>
          The sample application is complete, but it was not saved or sent. No performer
          account has been created.
        </Confirmation>
      ) : null}
    </form>
  );
}

export function LoginForm() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <label className={labelClass}>
        Email
        <Input name="email" type="email" autoComplete="email" required />
      </label>
      <label className={labelClass}>
        Password
        <Input
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={8}
          required
        />
      </label>
      <Button type="submit" className="w-full">
        Preview sign in
      </Button>
      <p className="text-muted-foreground text-center text-xs">
        Authentication is not connected. Credentials are not sent or stored.
      </p>
      {submitted ? (
        <Confirmation>
          Sign-in is unavailable in this frontend demo. No session was created.
        </Confirmation>
      ) : null}
    </form>
  );
}
