# Tembea production implementation plan

This document is the release source of truth for Tembea. A capability is considered complete only when its backend policy, frontend journey, persistent data model, error states, automated tests, and deployment configuration are all verified together.

## Product direction

Tembea should be a trusted Rwanda travel marketplace with three focused experiences:

1. Travellers discover, compare, reserve, pay, and manage trips or product orders.
2. Verified partners publish inventory, fulfil bookings and orders, respond to guests, and request earned payouts.
3. Administrators verify partners, moderate supply, manage exceptions, and audit money movement.

The initial production release should favour a smaller set of reliable journeys over visible but simulated features.

## Release gates

Every release must pass:

- Backend and frontend type checks, lint, unit/integration tests, and production builds.
- Database migration deployment against a clean PostgreSQL instance and an upgrade test from the previous release.
- Authorization tests for client, pending partner, verified partner, suspended partner, and administrator roles.
- End-to-end tests for registration, sign-in, search, listing detail, booking/order creation, hosted payment, cancellation, partner fulfilment, and moderation.
- Accessibility checks for keyboard navigation, focus, names, contrast, form errors, and responsive layouts.
- Signed provider webhook replay tests, idempotency tests, and reconciliation of provider amount/currency/reference.
- Production secrets, HTTPS origins, object storage, transactional email, logging, alerting, backups, and rollback instructions.

## Implementation sequence

### Phase 1 — security and data integrity

- Restrict public registration to `CLIENT` and `PARTNER`; administrator accounts are provisioned out of band.
- Enforce partner verification and suspension at every partner mutation boundary.
- Use explicit update DTOs and field mapping so partners cannot publish, feature, reassign, or self-moderate listings.
- Apply request throttling globally and stricter limits to authentication and password-reset endpoints.
- Reject unknown request fields and keep API documentation private or disabled in production.
- Calculate booking, order, payment, commission, and payout values on the server.
- Enforce booking/order state transitions, ownership, capacity, stock, idempotency, and transaction boundaries.
- Accept payment success only through a verified provider flow and signed webhook; never collect raw card details in Tembea UI.
- Generate and commit a complete additive Prisma migration with indexes and monetary/inventory constraints.

### Phase 2 — one coherent customer journey

- Standardize on a single API client contract and one canonical listing URL: `/detail/[category]/[id]`.
- Make global search server-backed, URL-addressable, paginated, and consistent with category pages.
- Complete listing detail, availability, booking/order creation, hosted/mobile-money payment, confirmation, and management pages.
- Provide accurate loading, empty, error, expired-session, unavailable-inventory, and payment-pending states.
- Use real aggregate data for counts, ratings, availability, dashboards, and earnings.
- Separate public navigation from client, partner, and admin application shells.
- Connect password reset, logout, profile/settings, notifications, wishlist, reviews, and messaging to supported API endpoints.

### Phase 3 — partner and admin operations

- Give verified partners inventory editors for listings, rooms, tickets, vehicles, guide packages, and products.
- Add operational booking/order queues with constrained actions, history, filters, and customer communication.
- Calculate available, pending, and paid earnings from settled transactions and reservations.
- Add verification and listing moderation queues with reasons and an immutable audit trail.
- Add refund, dispute, payout, and reconciliation workflows with administrator approval.

### Phase 4 — reliability and experience quality

- Store media in configured object storage with file validation, transformations, and lifecycle rules.
- Send transactional email for account recovery, booking/order events, payment outcomes, and partner decisions.
- Add structured logs, request correlation IDs, error monitoring, metrics, uptime/readiness checks, and alert thresholds.
- Add database backup/restore drills, privacy retention controls, account export/deletion, and incident runbooks.
- Finish responsive and accessibility remediation, performance budgets, image optimization, SEO metadata, and localisation.

## Features to remove or hide until real

- Simulated card processing, fake payment success, and direct collection of card number/CVV.
- Fake “live” connection indicators, fabricated counters/reviews/earnings, and hard-coded availability.
- AI search/recommendations/chat unless a real service, privacy policy, failure handling, and evaluation suite exist.
- Language choices for untranslated journeys; show only languages with complete product and transactional copy.
- Dead routes, duplicate local API proxies, placeholder social links, and navigation to unfinished pages.
- Bulk-delete utilities and fixed production/demo credentials from application and seed paths.
- Historical “100% complete” reports as release evidence.

## Definition of done for a feature

A feature is done when:

1. Its permissions and business rules are enforced server-side.
2. Its API request/response schema is typed and documented.
3. Its database change has a deployable migration and rollback/repair guidance.
4. Its UI is responsive, keyboard accessible, and handles loading, empty, validation, error, and success states.
5. Unit/integration tests cover happy paths, ownership, invalid transitions, duplicate requests, and concurrency where relevant.
6. Its end-to-end journey passes against a production-like database and provider sandbox.
7. Operational ownership, monitoring, and support behaviour are documented.

## External launch requirements

Live payment, email, media, maps, analytics, and monitoring can only be certified after valid sandbox/production accounts, webhook URLs, secrets, domains, and provider acceptance tests are supplied. Until then, the application must fail safely and label the capability unavailable rather than simulate success.
