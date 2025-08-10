## Next.js Architecture & Best Practices

This document outlines how we structure a Next.js (App Router) codebase and the conventions we follow. It emphasizes server-first rendering, clear separation of concerns, and consistent function style.

### Guiding principles

- **Server-first**: Prefer Server Components and Server Actions. Use Client Components only when necessary (stateful UI, effects, browser APIs).
- **Colocate thoughtfully**: Keep code near where it’s used, but extract shared/domain logic into `src/data-access` and `src/lib`.
- **Single source of truth**: Business rules live in data-access/domain functions. UI and routes call those.
- **Typed boundaries**: Validate inputs at the edges (Zod) and return typed results from domain functions and actions.

## Project layout

- `src/app/`

  - Route segments, layouts, Server Components by default.
  - Route-scoped server actions colocated with routes when only used there.
  - Shared, cross-route actions live in `src/app/actions.ts`.

- `src/data-access/`

  - Domain-focused, framework-agnostic functions that read/write data (e.g., `users.ts`, `bundles.ts`).
  - No React/Next imports. Accept typed inputs, return typed outputs or a Result type.

- `src/lib/`

  - Infrastructure and integration glue: auth, db client, caching helpers, third-party SDK wrappers, utilities.
  - Safe to import from both actions and data-access (but avoid importing client-only code here).

- `src/components/`

  - UI components. Server by default; mark `use client` where necessary.

- `src/hooks/`

  - React hooks (client-only unless explicitly server-safe).

- `prisma/`
  - Prisma schema and migrations. Create a thin `src/lib/db.ts` wrapper for the Prisma client.

## Server Actions

- **Placement**

  - Route-scoped: put beside the route that uses it, e.g., `src/app/dashboard/actions.ts` or `src/app/dashboard/_actions.ts`.
  - Cross-route: use `src/app/actions.ts` for actions shared by multiple routes.
  - Keep files small and cohesive. Split by feature if one file grows too large.

- **Structure**

  - Top of file: `'use server'`.
  - Validate inputs with Zod. Never trust client data.
  - Re-check auth/authorization in the action itself.
  - Call into `src/data-access/*` for all reads/writes.
  - On mutation, call `revalidatePath`/`revalidateTag` as appropriate.
  - Errors: prefer returning a typed Result (`{ ok: true, data } | { ok: false, message, code }`). Use `redirect`/`notFound` when that fits the UX.

- **Naming & signatures**
  - Use imperative verbs: `createBundle`, `updateProfile`, `deleteItem`.
  - Prefer parameter objects for multi-arg actions: `async function createBundle(input: CreateBundleInput)`.
  - Export minimal API surface; avoid exporting internal helpers.

## Data-access functions

- **Placement & responsibilities**

  - One module per domain or feature: `src/data-access/users.ts`, `src/data-access/bundles.ts`.
  - Encapsulate all DB reads/writes and business rules. UI/routes should not embed SQL/ORM queries.
  - Use a single prisma client from `src/lib/db.ts`.

- **Function style**
  - Pure and deterministic aside from DB I/O. No React/Next imports.
  - Explicit input/output types. Map low-level errors to domain errors.
  - Prefer returning data or a typed Result rather than throwing. Only throw for truly exceptional, unrecoverable cases.
  - Use transactions via `prisma.$transaction` when multiple writes must be atomic.
  - Tag-based caching: design functions around cache tags you can revalidate from actions.

## Function formatting conventions

- **TypeScript**

  - Exported functions must have explicit return types.
  - Use parameter objects when there are >2 parameters or optional parameters.
  - Avoid `any`. Use discriminated unions for Result types.

- **Naming**

  - Functions: verb-phrases (`getUserById`, `listBundles`, `createBundle`).
  - Variables: descriptive noun-phrases (`currentUser`, `bundleInput`).
  - Avoid abbreviations and single-letter names.

- **Control flow**

  - Use early returns to reduce nesting.
  - Validate inputs at the top, then proceed to core logic.
  - Handle error and edge cases first.

- **Error handling**

  - Convert ORM/SDK errors into typed domain errors in data-access.
  - In server actions, return a typed Result for user-recoverable errors; use `redirect` for success flows when appropriate.

- **Formatting & exports**
  - Prefer named exports; avoid default exports for better discoverability.
  - Keep functions short and focused; extract helpers when a function exceeds ~40–60 lines.
  - Maintain stable import order: stdlib → third-party → internal (`src/lib`, `src/data-access`) → relative.

## Components: server vs client

- Server Components by default. Add `"use client"` only when using state, effects, refs, or browser APIs.
- Client Components must not import server-only modules (DB, filesystem, `next/cache` server utilities).
- Fetch data in Server Components or Server Actions; pass serialized props into Client Components.

### Component file boundaries

- One component per file. Keep files focused and cohesive.
- Route-owned components live under the route folder in a `components/` subdirectory.
  - Example: `src/app/boards/[id]/components/word-cloud.tsx`, `src/app/boards/[id]/components/submission-form.tsx`.
- Shared UI primitives remain in `src/components/ui/`.

## API routes vs Server Actions

- Prefer Server Actions for first-party form mutations and authenticated operations within the app.
- Use API routes for public APIs, webhooks, and integration callbacks. API routes should still call `src/data-access/*` for core logic.

## Caching & revalidation

- Use fetch caching and `revalidateTag`/`revalidatePath` to keep UI consistent after mutations.
- Tag domain reads in data-access so actions can revalidate by tag.

## Example placements

- `src/app/actions.ts`: shared actions like `signOut`, `updateProfile` (if used across routes).
- `src/app/(dashboard)/bundles/actions.ts`: actions specific to the dashboard bundles pages.
- `src/data-access/bundles.ts`: `getBundleById`, `listBundles`, `createBundle`, `updateBundle`.
- `src/lib/db.ts`: Prisma client. `src/lib/auth.ts`: session helpers.

## Checklist

- Server-only logic never leaks into Client Components.
- Inputs validated at the boundary (actions, route handlers).
- All DB I/O goes through `src/data-access`.
- Mutations revalidate affected paths/tags.
- Exported functions have explicit return types and clear names.
