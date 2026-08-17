/** Shared primitive aliases used across backend layers. */
export type EntityId = string;
export type ISODate = string;
export type ISODateTime = string;
export type CurrencyCode = "INR";

export interface Money {
  readonly amount: number;
  readonly currency: CurrencyCode;
}

export interface SoftDeletable {
  readonly deletedAt?: ISODateTime | null;
}

export interface Auditable {
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly createdBy?: EntityId;
  readonly updatedBy?: EntityId;
}

export interface Versioned {
  readonly version: number;
}

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
