"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type {
  Conversation,
  Message,
  NegotiationOffer,
} from "@/backend/domain/messaging";

interface InboxItem {
  conversation: Conversation;
  lastMessage?: Message;
  pendingOffers: number;
}

/**
 * Additive messaging surface for booking/dashboard app routes.
 * Does not modify marketplace dashboard layouts or booking workflow components.
 */
export function MessagingInboxPanel({
  title = "Messages",
  userId,
}: {
  title?: string;
  userId: string;
}) {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/v1/conversations", { credentials: "include" });
        if (!res.ok) {
          if (!cancelled) setError("Sign in to view conversations.");
          return;
        }
        const payload = (await res.json()) as {
          data?: Conversation[];
          value?: Conversation[];
        };
        const conversations = payload.data ?? payload.value ?? [];
        const enriched = await Promise.all(
          conversations.slice(0, 8).map(async (conversation) => {
            const [messagesRes, offersRes] = await Promise.all([
              fetch(`/api/v1/conversations/${conversation.id}/messages`, {
                credentials: "include",
              }),
              fetch(`/api/v1/conversations/${conversation.id}/offers`, {
                credentials: "include",
              }),
            ]);
            const messagesJson = messagesRes.ok
              ? ((await messagesRes.json()) as { data?: Message[] })
              : { data: [] };
            const offersJson = offersRes.ok
              ? ((await offersRes.json()) as { data?: NegotiationOffer[] })
              : { data: [] };
            const messages = messagesJson.data ?? [];
            const offers = offersJson.data ?? [];
            return {
              conversation,
              lastMessage: messages[messages.length - 1],
              pendingOffers: offers.filter((o) => o.status === "pending").length,
            };
          }),
        );
        if (!cancelled) setItems(enriched);
      } catch {
        if (!cancelled) setError("Unable to load messages.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <section className="space-y-3" aria-labelledby="messaging-inbox-heading">
      <h2 id="messaging-inbox-heading" className="font-display text-2xl font-semibold">
        {title}
      </h2>
      {error ? <p className="text-muted-foreground text-sm">{error}</p> : null}
      {!error && items.length === 0 ? (
        <p className="text-muted-foreground text-sm">No conversations yet.</p>
      ) : null}
      <ul className="space-y-2">
        {items.map(({ conversation, lastMessage, pendingOffers }) => (
          <li
            key={conversation.id}
            className="border-border flex items-start justify-between gap-3 rounded-lg border p-3"
          >
            <div className="min-w-0 space-y-1">
              <p className="truncate text-sm font-medium">
                {conversation.bookingId
                  ? `Booking ${conversation.bookingId}`
                  : `Conversation ${conversation.id.slice(0, 10)}`}
              </p>
              <p className="text-muted-foreground truncate text-sm">
                {lastMessage?.content || "No messages yet"}
              </p>
              {pendingOffers > 0 ? (
                <p className="text-xs font-medium">{pendingOffers} pending offer(s)</p>
              ) : null}
            </div>
            {conversation.bookingId ? (
              <Button asChild size="sm" variant="outline">
                <Link href={`/bookings/${conversation.bookingId}`}>Open</Link>
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function BookingMessagingPanel({
  bookingId,
  organizerId,
  performerId,
  currentUserId,
}: {
  bookingId: string;
  organizerId: string;
  performerId: string;
  currentUserId?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [offers, setOffers] = useState<NegotiationOffer[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [offerAmount, setOfferAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function refresh(convId: string) {
    const [messagesRes, offersRes] = await Promise.all([
      fetch(`/api/v1/conversations/${convId}/messages`, { credentials: "include" }),
      fetch(`/api/v1/conversations/${convId}/offers`, { credentials: "include" }),
    ]);
    if (messagesRes.ok) {
      const json = (await messagesRes.json()) as { data?: Message[] };
      setMessages(json.data ?? []);
    }
    if (offersRes.ok) {
      const json = (await offersRes.json()) as { data?: NegotiationOffer[] };
      setOffers(json.data ?? []);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/v1/conversations/by-booking/${bookingId}`, {
          credentials: "include",
        });
        if (!res.ok) {
          // Unauthenticated demo: create local conversation via API when possible
          if (!cancelled) {
            setError("Sign in as organizer or performer to message on this booking.");
          }
          return;
        }
        const json = (await res.json()) as {
          data?: {
            conversation: Conversation;
            messages: Message[];
            offers: NegotiationOffer[];
          };
        };
        const data = json.data;
        if (!data || cancelled) return;
        setConversationId(data.conversation.id);
        setMessages(data.messages);
        setOffers(data.offers);
        setError(null);
      } catch {
        if (!cancelled) setError("Unable to load booking messages.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookingId, organizerId, performerId]);

  function sendMessage() {
    if (!conversationId || !body.trim()) return;
    startTransition(async () => {
      const res = await fetch("/api/v1/messages", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          messageType: "text",
          content: body.trim(),
        }),
      });
      if (!res.ok) {
        setError("Failed to send message.");
        return;
      }
      setBody("");
      await refresh(conversationId);
    });
  }

  function sendOffer() {
    if (!conversationId) return;
    const amount = Number(offerAmount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    startTransition(async () => {
      const res = await fetch(`/api/v1/conversations/${conversationId}/offers`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency: "INR" }),
      });
      if (!res.ok) {
        setError("Failed to send offer.");
        return;
      }
      setOfferAmount("");
      await refresh(conversationId);
    });
  }

  return (
    <section className="space-y-4" aria-labelledby="booking-messaging-heading">
      <h2 id="booking-messaging-heading" className="font-display text-2xl font-semibold">
        Negotiation & messages
      </h2>
      {error ? <p className="text-muted-foreground text-sm">{error}</p> : null}
      <ul className="border-border max-h-72 space-y-2 overflow-y-auto rounded-lg border p-3">
        {messages.map((message) => (
          <li key={message.id} className="text-sm">
            <span className="font-medium">
              {message.senderId === currentUserId ? "You" : message.senderId.slice(0, 8)}
            </span>
            <span className="text-muted-foreground"> · {message.messageType}</span>
            <p>{message.content || message.attachmentUrl}</p>
          </li>
        ))}
        {messages.length === 0 ? (
          <li className="text-muted-foreground text-sm">No messages yet.</li>
        ) : null}
      </ul>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          className="border-border bg-background flex-1 rounded-md border px-3 py-2 text-sm"
          placeholder="Write a message"
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        <Button type="button" disabled={pending || !conversationId} onClick={sendMessage}>
          Send
        </Button>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Offers</h3>
        <ul className="space-y-1 text-sm">
          {offers.map((offer) => (
            <li key={offer.id}>
              {offer.currency} {offer.amount.toLocaleString("en-IN")} · {offer.status}
              {offer.notes ? ` — ${offer.notes}` : ""}
            </li>
          ))}
          {offers.length === 0 ? (
            <li className="text-muted-foreground">No offers yet.</li>
          ) : null}
        </ul>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="border-border bg-background flex-1 rounded-md border px-3 py-2 text-sm"
            placeholder="Offer amount (INR)"
            value={offerAmount}
            onChange={(event) => setOfferAmount(event.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            disabled={pending || !conversationId}
            onClick={sendOffer}
          >
            Send offer
          </Button>
        </div>
      </div>
    </section>
  );
}
