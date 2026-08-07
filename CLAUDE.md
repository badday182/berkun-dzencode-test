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

`docker compose -f docker-compose.full.yml up` brings up **both** halves — this
app plus the API from the sibling directory `../berkun-dzencode-api`. The two
files are kept separate on purpose: the plain `docker-compose.yml` must keep
working for someone who cloned only this repository.

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

Phases 1.1 and 1.2 are complete. 1.2 built the API in the sibling repository
`../berkun-dzencode-api` (NestJS, :4000) — REST for orders/products with cascade
delete, a socket.io gateway with a session counter, domain events, CORS,
`ValidationPipe`, Docker.

Phases 1.1–1.3 are complete: the app talks to the API over HTTP, holds a
socket.io connection, loads through thunks, and has `not-found` / `error` /
`loading` routes. Still absent by design, not by oversight: i18n, forms, the left
sidebar, SSR of data, auth, tests. `src/types/socket.ts` is the shared event
contract — the API mirrors it in `src/domain/events.ts`; change both or neither.

## Architecture

### Data flow

API (`:4000`) → `src/services/http.ts` (axios instance, errors normalised to
`HttpError`) → `src/services/api/*` (typed methods; responses validated through
`parseOrder` / `parseProduct`) → `fetchOrders` / `fetchProducts` thunks → Redux →
components read via `useAppSelector`.

Import request functions from `@/services/api`, never `@/services/http` directly
— the transport is internal, and phase 2.3 may move reads to GraphQL behind the
same six functions. Everything under `src/services/` is isomorphic: no `window`,
no React, no Redux, so phase 2.1 can call it from Server Components. Per-request
tweaks go through the narrow `RequestOptions` (`signal`, `headers`).

Server-pushed changes take a second path: `src/services/socket.ts` (socket.io
client, reconnection, payloads validated before they leave the module) →
`src/lib/listenerMiddleware.ts` → plain reducers. Components never subscribe to
the socket; they read the resulting state. A deletion made in another tab lands
in the store through the same reducers as a local one, so `deleteOrder` /
`deleteAllOrderProduct` / `deleteProduct` now have two callers each — the delete
thunks and the socket listener.

Components do not dispatch `fetchOrders` / `fetchProducts` themselves — they call
`useOrders()` / `useProducts()` from `@/hooks`, which return the list, a loading
flag, the error and a `refetch`. The thunks' `condition` deduplicates, so calling
the hook from several components is safe; `refetch` passes `{ force: true }` to
get past that guard. The same flag is what the socket listener uses to reload
both lists after a reconnect.

`src/hooks/` holds the app-level hooks (data, clock, socket, modals, storage);
`@/lib/hooks` stays what it was — the typed Redux wrappers.

Both pages (`app/orders/page.tsx`, `app/products/page.tsx`) are `"use client"`.
`/orders` and `/orders/[id]` both render `components/ordersView`; the deep-link
page is a **server** component that validates the id format and calls
`notFound()` before responding, then hands off to the client `OrderDeepLink`,
which 404s when the id is well-formed but absent from the loaded list. **The App Router is in use but
nothing is server-rendered from data yet** — this is the phase 2.1 rework;
`StoreProvider` already accepts `preloadedState`, and `makeStore` merges it over
the slices' `initialState`.

`src/mocks/` is no longer wired to anything — it survives as fixtures for the
MSW/Vitest work in phase 2.6. Do not reconnect pages to it.

### Redux store (`src/lib/`)

Two slices with a deliberate split:

- `features/dataOrdersAndProducts/ordersAndProductsSlice.ts` — the domain data
  (orders, products), their request status/error, the `fetchOrders` /
  `fetchProducts` / `removeOrder` / `removeProduct` thunks and the local
  deletion reducers.
- `features/orders/ordersSlice.ts` — **UI selection state only**: which order is
  selected, its title, whether the side panel is open.
- `features/session/sessionSlice.ts` — the socket connection: how many sessions
  are active and whether we are connected. `socketConnectionStarted` /
  `socketConnectionStopped` are commands for the listener middleware, not state
  changes; `StoreProvider` dispatches them on mount/unmount.

Use the typed hooks from `src/lib/hooks.ts` (`useAppDispatch`, `useAppSelector`),
never the raw react-redux ones.

Delete through the `removeOrder` / `removeProduct` thunks, not the plain
reducers — the thunk waits for the server's `204` before touching the store, so
the UI never shows a deletion the API rejected. `removeOrder.fulfilled` runs
`deleteOrder` **and** `deleteAllOrderProduct` together; dispatching the plain
`deleteOrder` on its own leaves orphaned products, which is why the pair lives
in one place now.

New async work uses `createAppAsyncThunk` from `src/lib/createAppAsyncThunk.ts`
(typed `state`/`dispatch`/`rejectValue: ApiError`) and rejects with
`rejectWithValue(toApiError(cause))` — a raw `Error` is not serialisable and
must not reach the store.

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
- The socket connection is opened lazily and only in the browser: `getSocket()`
  returns `null` when `window` is undefined, so importing `services/socket` from
  server-rendered code is safe. The server-side `socket.io` package was removed
  from this repository in phase 1.2; it lives in the API now. Do not add it back.
- `npm audit` reports pre-existing vulnerabilities, including a critical one in
  `next@15.2.2`. Upgrading is a deliberate, unmade decision — do not "fix" it
  incidentally.
