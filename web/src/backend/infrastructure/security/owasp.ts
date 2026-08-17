/**
 * OWASP-aligned security recommendations for BandVerse production.
 * This module is documentation-as-code for platform engineering.
 */
export const owaspRecommendations = {
  A01_brokenAccessControl: [
    "Enforce RBAC + ABAC on every mutating endpoint.",
    "Deny by default; never trust client-supplied owner IDs.",
    "Use server-side authorization checks in use cases, not only UI gating.",
  ],
  A02_cryptographicFailures: [
    "Use TLS 1.2+ everywhere; HSTS in production.",
    "Hash passwords with Argon2id; never store plaintext refresh tokens.",
    "Encrypt PII at rest for phone/KYC documents where required.",
  ],
  A03_injection: [
    "Use parameterized queries via Prisma/Drizzle only.",
    "Validate all inputs with Zod schemas before domain entry.",
    "Sanitize rich text / markdown before storage and render.",
  ],
  A04_insecureDesign: [
    "Model booking/payment state machines centrally.",
    "Require idempotency keys for payment and booking creation.",
    "Threat-model media upload and messaging abuse paths.",
  ],
  A05_securityMisconfiguration: [
    "Disable debug stacks in production responses.",
    "Restrict CORS to known web origins.",
    "Keep dependency scanning in CI (npm audit / OSV).",
  ],
  A06_vulnerableComponents: [
    "Pin dependency ranges and review transitive advisories weekly.",
    "Prefer maintained auth/payment SDKs over custom crypto.",
  ],
  A07_identificationFailures: [
    "Rotate refresh tokens; detect reuse and revoke session family.",
    "Support MFA for organizers and admins.",
    "Lock accounts after repeated failed auth attempts.",
  ],
  A08_softwareDataIntegrity: [
    "Sign CI artifacts; verify migrations before deploy.",
    "Validate webhook signatures from Razorpay/Stripe.",
  ],
  A09_loggingMonitoring: [
    "Emit structured audit logs for authz failures and payment events.",
    "Alert on unusual booking/payment velocity.",
  ],
  A10_ssrf: [
    "Block outbound requests to private IP ranges from media fetchers.",
    "Allowlist webhook callback destinations.",
  ],
} as const;
