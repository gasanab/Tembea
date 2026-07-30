# Tembea deployment runbook

Tembea consists of a Next.js frontend, a NestJS API, and PostgreSQL. Production deployment is not complete until both applications, the database migration, provider webhooks, and the post-deploy smoke checks below succeed.

## Required production configuration

Backend:

- `NODE_ENV=production`
- `DATABASE_URL`
- `CORS_ORIGIN` — comma-separated public HTTPS frontend origins
- `FRONTEND_URL` — canonical public HTTPS frontend origin
- independent, randomly generated `JWT_SECRET` and `JWT_REFRESH_SECRET`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY`, `EMAIL_FROM`
- `PAYMENTS_ENABLED=true`
- `PAYMENT_WEBHOOKS_ENABLED=true`
- `PAYMENT_PROVIDER=flutterwave`
- `PAYMENT_REDIRECT_URL` — public frontend payment-return URL
- `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_WEBHOOK_HASH`
- `PLATFORM_COMMISSION_RATE`

Frontend:

- `NEXT_PUBLIC_API_URL` — public API origin; `/api` may be included or omitted
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_PAYMENTS_ENABLED=true`
- `NEXT_PUBLIC_PAYMENT_PROVIDER=flutterwave`

Never put provider secret keys, webhook secrets, JWT secrets, or database credentials in `NEXT_PUBLIC_*` variables.

## Release procedure

1. Run `npm ci` in both application directories.
2. Run `npm run check` from the repository root.
3. Back up PostgreSQL and record the restore point.
4. Apply migrations with `npm --prefix tembea-backend run prisma:migrate:deploy`.
5. Deploy the backend and verify `/api/health/live` and `/api/health/ready`.
6. Deploy the frontend.
7. Configure the Flutterwave webhook URL as `https://<api-origin>/api/payments/webhook`.
8. Run provider sandbox transactions and verify that only a signed webhook changes a payment to `PAID`.
9. Run the smoke checklist below before enabling traffic.

Do not run `prisma migrate dev`, `prisma db push`, or the seed command against production.

## Smoke checklist

- Register and sign in as a client; confirm the HTTP-only auth cookie works.
- Confirm public registration rejects an `ADMIN` role.
- Search using query, category, region, rating, and price; open a canonical listing URL.
- Create a booking and confirm the displayed total is the server-calculated total.
- Complete a provider sandbox payment and verify booking/payment state after webhook processing.
- Retry the same booking, order, and webhook requests; confirm they are idempotent.
- Attempt overlapping capacity reservations; confirm inventory cannot be oversold.
- Sign in as pending, verified, and suspended partners; confirm only the verified partner can mutate inventory.
- Publish/reject a listing through administrator moderation.
- Request and consume a password-reset link once; confirm reuse and expiration fail.
- Upload a valid image and reject an oversized, disguised, or unsupported file.
- Verify client, partner, and admin dashboards show real empty/error states rather than demo data.

## Rollback

Application rollback and database rollback are separate decisions:

- If application code fails but the migration is backward-compatible, redeploy the previous application version.
- Do not automatically reverse a production migration containing business data.
- If a migration causes data loss or incompatibility, stop writes, restore the recorded database backup into an isolated database, validate it, and follow the incident runbook before switching traffic.
- Keep payment webhooks enabled only when a compatible backend is available; provider retries must remain idempotent.

## Required monitoring

- Alert on readiness failures, elevated 5xx rates, authentication throttling spikes, webhook signature failures, payment verification mismatches, and payout-balance conflicts.
- Retain structured logs with the `x-request-id` response value, while excluding passwords, reset tokens, cookies, card/mobile-money credentials, and provider secrets.
- Monitor database storage/connections, migration status, email delivery failures, media upload failures, and provider reconciliation differences.
