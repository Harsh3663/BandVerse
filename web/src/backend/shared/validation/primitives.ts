import { z } from "zod";

export const entityIdSchema = z.string().trim().min(1).max(128);
export const handleSchema = z
  .string()
  .trim()
  .min(2)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, "Handle must be URL-safe.");

export const emailSchema = z.string().trim().email().max(320);
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{7,14}$/, "Phone must be E.164-compatible.");

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD.");

export const isoDateTimeSchema = z.string().datetime({ offset: true }).or(
  z.string().datetime(),
);

export const moneySchema = z.object({
  amount: z.number().finite().nonnegative(),
  currency: z.literal("INR"),
});

export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const addressSchema = z.object({
  line1: z.string().trim().max(200).optional(),
  line2: z.string().trim().max(200).optional(),
  locality: z.string().trim().max(120).optional(),
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().min(1).max(120),
  postalCode: z.string().trim().max(16).optional(),
  countryCode: z.literal("IN"),
  coordinates: coordinatesSchema.optional(),
});

export const stringListSchema = z.array(z.string().trim().min(1).max(120)).max(50);
