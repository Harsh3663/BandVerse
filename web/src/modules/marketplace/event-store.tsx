"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { buildEventFromInput, createEventId, duplicateEventInput } from "./event-helpers";
import type {
  EntityId,
  MarketplaceEvent,
  MarketplaceEventInput,
  VenueProfile,
} from "./types";

interface EventStoreContextValue {
  events: readonly MarketplaceEvent[];
  hostId: EntityId;
  venue: VenueProfile;
  getById(id: EntityId): MarketplaceEvent | undefined;
  listByHost(hostId: EntityId): readonly MarketplaceEvent[];
  create(input: MarketplaceEventInput): MarketplaceEvent;
  update(id: EntityId, input: MarketplaceEventInput): MarketplaceEvent | undefined;
  duplicate(id: EntityId): MarketplaceEvent | undefined;
  archive(id: EntityId): MarketplaceEvent | undefined;
  remove(id: EntityId): boolean;
}

const EventStoreContext = createContext<EventStoreContextValue | null>(null);

export function EventStoreProvider({
  initialEvents,
  hostId,
  venue,
  children,
}: {
  initialEvents: readonly MarketplaceEvent[];
  hostId: EntityId;
  venue: VenueProfile;
  children: ReactNode;
}) {
  const [events, setEvents] = useState<readonly MarketplaceEvent[]>(() => [
    ...initialEvents,
  ]);

  const getById = useCallback(
    (id: EntityId) => events.find((event) => event.id === id),
    [events],
  );

  const listByHost = useCallback(
    (targetHostId: EntityId) =>
      events
        .filter((event) => event.hostId === targetHostId)
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    [events],
  );

  const create = useCallback(
    (input: MarketplaceEventInput) => {
      const next = buildEventFromInput(input, hostId);
      setEvents((current) => [...current, next]);
      return next;
    },
    [hostId],
  );

  const update = useCallback(
    (id: EntityId, input: MarketplaceEventInput) => {
      let updated: MarketplaceEvent | undefined;
      setEvents((current) =>
        current.map((event) => {
          if (event.id !== id) return event;
          updated = buildEventFromInput(input, hostId, event);
          return updated;
        }),
      );
      return updated;
    },
    [hostId],
  );

  const duplicate = useCallback(
    (id: EntityId) => {
      const source = events.find((event) => event.id === id);
      if (!source) return undefined;
      const input = duplicateEventInput(source);
      const next = buildEventFromInput(
        { ...input, title: input.title || `${source.title} (Copy)` },
        hostId,
        { ...source, id: createEventId(input.title) },
      );
      setEvents((current) => [...current, next]);
      return next;
    },
    [events, hostId],
  );

  const archive = useCallback((id: EntityId) => {
    let updated: MarketplaceEvent | undefined;
    setEvents((current) =>
      current.map((event) => {
        if (event.id !== id) return event;
        updated = { ...event, status: "archived" };
        return updated;
      }),
    );
    return updated;
  }, []);

  const remove = useCallback((id: EntityId) => {
    let removed = false;
    setEvents((current) => {
      const next = current.filter((event) => event.id !== id);
      removed = next.length !== current.length;
      return next;
    });
    return removed;
  }, []);

  const value = useMemo<EventStoreContextValue>(
    () => ({
      events,
      hostId,
      venue,
      getById,
      listByHost,
      create,
      update,
      duplicate,
      archive,
      remove,
    }),
    [
      archive,
      create,
      duplicate,
      events,
      getById,
      hostId,
      listByHost,
      remove,
      update,
      venue,
    ],
  );

  return (
    <EventStoreContext.Provider value={value}>{children}</EventStoreContext.Provider>
  );
}

export function useEventStore(): EventStoreContextValue {
  const context = useContext(EventStoreContext);
  if (!context) {
    throw new Error("useEventStore must be used within EventStoreProvider");
  }
  return context;
}
