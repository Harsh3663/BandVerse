/**
 * Safe public backend surface for shared domain/application/shared types.
 * Import presentation HTTP helpers from `@/backend/presentation` in route handlers only.
 * Import infrastructure from `@/backend/infrastructure` in server code only.
 */
export * from "./domain";
export * from "./application";
export * from "./shared";
