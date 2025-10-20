# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

- Install deps:
  ```bash
  npm install
  # clean install (CI): npm ci
  ```
- Dev server (Turbopack):
  ```bash
  npm run dev
  # http://localhost:3000
  ```
- Build and run:
  ```bash
  npm run build
  npm run start
  ```
- Lint (ESLint flat config):
  ```bash
  # lint project root explicitly
  npm run lint -- .
  # autofix
  npx eslint . --fix
  ```
- Type-check (no emit):
  ```bash
  npx tsc --noEmit
  ```
- Tests: none configured (no test script present).

## High-level architecture

- Framework: Next.js App Router (TypeScript) with Turbopack.
  - Global provider in `app/layout.tsx` wraps the app with `ClerkProvider` and font setup; global styles via `app/globals.css`.
  - Route groups: `app/(dashboard)/dashboard` for the authenticated dashboard UI.
- API layer: Route handlers under `app/api` (Edge/Node runtime per Next defaults).
  - `app/api/bookings/route.ts` (GET, POST) and `app/api/bookings/[id]/route.ts` (PUT, DELETE) implement CRUD.
  - Auth enforced server-side with Clerk (`getAuth(request)`); requests require an authenticated `userId`.
- Data layer: MongoDB via Mongoose with connection caching.
  - `lib/database.ts` establishes and caches a single Mongoose connection using `MONGODB_URI`.
  - Schemas/models in `models/` (`Booking.ts`, `Customer.ts`). Note: `models/Models.ts` defines a duplicate `Booking` model; prefer `models/Booking.ts` to avoid confusion.
- Validation and types: Zod schemas in `lib/validations.ts` (e.g., `BookingFormSchema`) shared across client and server for type safety.
- Client state: Zustand store in `store/booking-store.ts` manages bookings, selection, loading state, and CRUD helpers.
- UI: Component library under `components/ui/*` (Radix-based primitives); feature components like `components/BookingForm.tsx` and `components/BookingList.tsx` compose the dashboard.
- Styling: Tailwind CSS v4 via PostCSS (`postcss.config.mjs`), theme tokens and layers defined in `app/globals.css`. No Tailwind config file is required.
- Linting: ESLint flat config (`eslint.config.mjs`) extending `next/core-web-vitals` and `next/typescript`, with ignores for build artifacts.
- TS config: Path alias `@/*` maps to project root (`tsconfig.json`), used throughout imports.

## Environment

- Required for database: set `MONGODB_URI` (used by `lib/database.ts`).
- Authentication: project uses Clerk (`@clerk/nextjs`). Ensure necessary Clerk environment configuration is present so `getAuth` resolves a `userId` for API calls.

## Notes from README

- Start the dev server with `npm run dev` and visit `http://localhost:3000`.
- Edit the landing page at `app/page.tsx`; changes hot-reload in dev.
