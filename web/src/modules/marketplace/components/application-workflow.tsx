"use client";

import { useState, type FormEvent, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { formatDateTime, formatMoney, titleCase } from "../format";
import {
  applicationTransitions,
  canTransitionApplication,
  transitionApplication,
} from "../state-machines";
import type {
  Application,
  ApplicationStatus,
  EntityId,
  Money,
  PerformerProfile,
  PricingPackage,
} from "../types";

export interface ArtistApplicationInput {
  performerId: EntityId;
  eventId: EntityId;
  proposedPackageId?: EntityId;
  quotedPrice: Money;
  message: string;
}

export function ArtistApplicationForm({
  eventId,
  performer,
  onSubmit,
}: {
  eventId: EntityId;
  performer: PerformerProfile;
  onSubmit?: (input: ArtistApplicationInput) => void | Promise<void>;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const firstPackage = performer.pricingPackages[0];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    await onSubmit?.({
      performerId: performer.id,
      eventId,
      proposedPackageId: String(data.get("packageId") || "") || undefined,
      quotedPrice: { amount: Number(data.get("quotedPrice")), currency: "INR" },
      message: String(data.get("message") || ""),
    });
    setPending(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Card role="status">
        <CardHeader>
          <CardTitle>Application submitted</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          This demo saved your proposal in local page state. An API callback can replace
          this handler.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply as {performer.displayName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="artist-application" className="space-y-4" onSubmit={submit}>
          <Field label="Package" htmlFor="application-package">
            <select
              id="application-package"
              name="packageId"
              defaultValue={firstPackage?.id}
              className={controlClass}
            >
              <option value="">Custom proposal</option>
              {performer.pricingPackages.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {formatMoney(item.price)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Your quote (INR)" htmlFor="application-quote">
            <Input
              id="application-quote"
              name="quotedPrice"
              type="number"
              min={1}
              required
              defaultValue={firstPackage?.price.amount}
            />
          </Field>
          <Field label="Proposal message" htmlFor="application-message">
            <textarea
              id="application-message"
              name="message"
              required
              rows={5}
              className={controlClass}
              placeholder="Describe your set, requirements, and why you fit this event."
            />
          </Field>
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Submitting…" : "Submit application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function VenueApplicationCard({
  application,
  performer,
  packageOption,
  onStatusChange,
}: {
  application: Application;
  performer?: PerformerProfile;
  packageOption?: PricingPackage;
  onStatusChange: (
    application: Application,
    status: ApplicationStatus,
  ) => void | Promise<void>;
}) {
  const allowed = applicationTransitions[
    application.status
  ] as readonly ApplicationStatus[];
  const venueActions = (["shortlisted", "accepted", "rejected"] as const).filter(
    (status) => allowed.includes(status),
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>{performer?.displayName ?? application.performerId}</CardTitle>
          <Badge
            variant={application.status === "rejected" ? "destructive" : "secondary"}
          >
            {titleCase(application.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p>{application.message}</p>
        <dl className="text-muted-foreground grid gap-2 text-sm sm:grid-cols-3">
          <div>
            <dt>Quote</dt>
            <dd className="text-foreground font-medium">
              {formatMoney(application.quotedPrice)}
            </dd>
          </div>
          <div>
            <dt>Package</dt>
            <dd className="text-foreground font-medium">
              {packageOption?.name ?? "Custom"}
            </dd>
          </div>
          <div>
            <dt>Submitted</dt>
            <dd className="text-foreground font-medium">
              {formatDateTime(application.submittedAt)}
            </dd>
          </div>
        </dl>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {venueActions.map((status) => (
          <Button
            key={status}
            type="button"
            variant={
              status === "rejected"
                ? "destructive"
                : status === "accepted"
                  ? "default"
                  : "outline"
            }
            onClick={() => {
              if (canTransitionApplication(application.status, status)) {
                void onStatusChange(application, status);
              }
            }}
          >
            {status === "shortlisted" ? "Shortlist" : titleCase(status)}
          </Button>
        ))}
        {!venueActions.length ? (
          <p className="text-muted-foreground text-sm">
            No venue actions are available in this state.
          </p>
        ) : null}
      </CardFooter>
    </Card>
  );
}

export function ApplicationInbox({
  initialApplications,
  performers,
  onStatusChange,
}: {
  initialApplications: readonly Application[];
  performers: readonly PerformerProfile[];
  onStatusChange?: (
    application: Application,
    status: ApplicationStatus,
  ) => void | Promise<void>;
}) {
  const [applications, setApplications] = useState(initialApplications);

  async function update(application: Application, status: ApplicationStatus) {
    if (onStatusChange) await onStatusChange(application, status);
    const next = transitionApplication(application, status, new Date().toISOString());
    setApplications((current) =>
      current.map((item) => (item.id === next.id ? next : item)),
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => {
        const performer = performers.find((item) => item.id === application.performerId);
        return (
          <VenueApplicationCard
            key={application.id}
            application={application}
            performer={performer}
            packageOption={performer?.pricingPackages.find(
              (item) => item.id === application.proposedPackageId,
            )}
            onStatusChange={update}
          />
        );
      })}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}

const controlClass =
  "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border px-3.5 py-2 text-base outline-none focus-visible:ring-3 md:text-sm";
