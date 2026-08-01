# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

The git root is the application root — npm, docker and husky all run from here.
(The app used to live in a nested `my-app/` directory; that layout is gone, so
ignore any lingering references to it.)

```bash
npm run dev          # dev server on :3000 (turbopack)
npm run build        # production build — also runs lint + type check
npm run typecheck    # tsc --noEmit
npm run lint         # eslint .
npm run lint:fix     # eslint . --fix
npm run format       # prettier --write .
npm run verify       # typecheck + lint + format:check — run this before finishing work
```

`docker compose up` runs the same dev server on :3000. `node_modules` and
`.next` live in named volumes so the Linux build is not clobbered by the mounted
Windows host directory.

**There is no test suite yet.** Vitest + RTL + MSW + Playwright are planned in
phase 2.6 of `PLAN.md`. Do not invent test commands; if asked to run tests, say
none exist.

## PLAN.md is the roadmap

`PLAN.md` at the repo root is the agreed, phased plan for bringing this project
up to spec, with recorded decisions and their rationale. Read it before
proposing architectural changes — several obvious-looking "improvements"
(Zustand, micro frontends, Module Federation, WebAssembly, Postgres) were
considered and explicitly rejected or deferred there.

Code contains `TODO(<phase>)` markers such as `TODO(1.5)` or `TODO(2.1)` that
point at the phase in `PLAN.md` where that item is scheduled. Leave them in
place unless you are actually doing that phase.

Only phase 1.1 is complete. Notably absent by design, not by oversight: axios,
any real HTTP layer, socket connections, i18n, forms, SSR of data, auth, tests.

## Architecture

### Data flow

`src/mocks/seed.json` → `src/mocks/index.ts` (validated through `parseOrder` /
`parseProduct`) → page `useEffect` dispatches `setOrders` / `setProducts` →
Redux → components read via `useAppSelector`.

Both pages (`app/orders/page.tsx`, `app/products/page.tsx`) are `"use client"`
and load data in `useEffect`. **The App Router is in use but nothing is
server-rendered from data yet** — this is the phase 2.1 rework. Any data-fetch
code you add should be written so it can run on both server and client, and
`StoreProvider` should stay compatible with `preloadedState`.

`seed.json` is destined to become the seed of a separate NestJS API repository
(phase 1.2), so keep it a plain data file.

### Redux store (`src/lib/`)

Two slices with a deliberate split:

- `features/dataOrdersAndProducts/ordersAndProductsSlice.ts` — the domain data
  (orders, products) and deletions.
- `features/orders/ordersSlice.ts` — **UI selection state only**: which order is
  selected, its title, whether the side panel is open.

Use the typed hooks from `src/lib/hooks.ts` (`useAppDispatch`, `useAppSelector`),
never the raw react-redux ones.

Deleting an order requires dispatching **both** `deleteOrder` and
`deleteAllOrderProduct` with the same `OrderId`, otherwise products are orphaned.
`ModalWindow` is currently the only place that does this correctly.

### Type system (`src/types/`)

`@/types` is a barrel over `brand.ts`, `assert.ts`, `domain.ts`, `api.ts` and
`socket.ts`. Import from `@/types`, not the individual modules.

The conventions here are load-bearing — match them rather than working around
them:

- **Branded ids.** `OrderId` and `ProductId` are `Brand<number, …>`, not plain
  numbers. Convert at the boundary with `toOrderId` / `toProductId`. Do not
  reintroduce `String(id)` / `Number(id)` conversions; the whole point of the
  brands was removing them.
- **Parse at the boundary.** External data goes through `parseOrder` /
  `parseProduct`, which throw on malformed input rather than letting it reach
  the store. Type guards (`isOrder`, `isProduct`, `isPrice`, `isApiError`) back
  them.
- **Discriminated unions.** `ModalWindowProps` ties `category: "order" | "product"`
  to the type of `id`; `ServerEvent` in `socket.ts` is the shared socket
  contract, and `ServerToClientEvents` is derived from it by a mapped type so
  events are declared once. Use `assertNever` in the `default` branch of
  switches over these unions.
- `ProductType` is intentionally `string`, not an enum — product categories are
  open, backend-owned catalog data. `Currency` and `ProductCondition` are enums
  because those sets are closed.

### Styling

Bootstrap 5 + bootstrap-icons, imported globally in `app/layout.tsx`, plus
per-component CSS modules (`index.module.css` next to each component) and `clsx`
for conditional classes. Watch for the CSS-module trap: `clsx("x", { orders: … })`
emits the literal class `orders`, not the hashed module class — that bug exists
today in `app/orders/page.tsx` and is marked `TODO(1.4)`.

## Conventions and constraints

- **UI strings and code comments are in Russian.** There is no i18n yet
  (phase 1.5); hardcoded strings are marked `TODO(1.5)`.
- **`allowJs: false`** — the codebase is TypeScript-only, do not add `.js` files
  under `src/`. TS is strict plus `noUncheckedIndexedAccess`,
  `noImplicitOverride` and `noFallthroughCasesInSwitch`.
- **`eslint-config-next` is pinned to match `next` (15.2.2).** The flat config in
  `eslint.config.mjs` uses `FlatCompat`, which is required for v15 and breaks on
  v16. Do not bump one without the other.
- **Prettier uses `endOfLine: "lf"`** and `.gitattributes` sets `* text=auto eol=lf`
  to override the system-level `core.autocrlf=true` from Git for Windows.
- `socket.io` (the **server** package) is a stray frontend dependency — nothing
  imports it. The browser only needs `socket.io-client`. It is slated for removal
  when the API repository is created in phase 1.2.
- `npm audit` reports pre-existing vulnerabilities, including a critical one in
  `next@15.2.2`. Upgrading is a deliberate, unmade decision — do not "fix" it
  incidentally.
