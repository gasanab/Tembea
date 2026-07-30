# Tembea Platform

Tembea is a Rwanda-focused travel marketplace with a Next.js frontend and a NestJS/PostgreSQL backend.

## Applications

- `tembea-frontend` — Next.js customer, partner, and administration interfaces.
- `tembea-backend` — NestJS API with Prisma and PostgreSQL.

## Local setup

1. Copy `tembea-backend/.env.example` to `tembea-backend/.env` and provide development-only secrets.
2. Copy `tembea-frontend/.env.example` to `tembea-frontend/.env.local`.
3. Start PostgreSQL with `docker compose -f tembea-backend/docker-compose.yml up -d postgres`.
4. Install dependencies in each application with `npm ci`.
5. From `tembea-backend`, run `npx prisma migrate deploy`, then `npm run dev`.
6. From `tembea-frontend`, run `npm run dev`.

Optional development seeding requires unique `SEED_CLIENT_PASSWORD` and `SEED_PARTNER_PASSWORD` values of at least 12 characters. Seeding is blocked in production and does not contain an administrator account.

The frontend runs on `http://localhost:3000`; the API defaults to `http://localhost:4000/api`.

## Quality checks

Run these from the repository root:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

`npm run check` executes the complete local verification sequence.

## Production status

The platform must pass the repository CI workflow and have production credentials for payments, email, and media storage before deployment. Demo seed users, simulated transactions, or placeholder integrations must never be treated as production behavior.

Historical completion reports in the repository describe earlier prototype milestones and are not the source of truth for release readiness. The executable checks and current deployment runbook are authoritative.

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for the prioritised roadmap, release gates, features to retire, and the definition of done.

Production configuration, migration order, rollback guidance, and smoke checks are in [DEPLOYMENT.md](./DEPLOYMENT.md).
