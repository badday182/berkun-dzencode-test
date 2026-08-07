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

Phase 1.2 built the API in the sibling repository `../berkun-dzencode-api`
(NestJS, :4000) — REST for orders/products with cascade delete, a socket.io
gateway with a session counter, domain events, CORS, `ValidationPipe`, Docker.

Block 1 is complete: the app talks to the API over HTTP, holds a socket.io
connection, loads through thunks, has `not-found` / `error` / `loading` routes, a
collapsible sidebar, Formik forms and i18n in RU/EN/UK. Still absent by design,
not by oversight: editing (no `PATCH` on the API), SSR of data, auth, tests.
`src/types/socket.ts` is the shared event contract — the API mirrors it in
`src/domain/events.ts`; change both or neither.

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

### Layout and components

`app/layout.tsx` renders `StoreProvider` → `components/layout/appShell`, which
owns the frame: `layout/sidebar` on the left, `layout/topbar` above the page,
`{children}` under it. The shell is a client component because the mobile
backdrop needs state; pages stay independent of it. Sidebar state lives in the
`layout` slice — two separate flags, `isSidebarCollapsed` (desktop, shrinks to
icons) and `isMobileSidebarOpen` (narrow screens, slides over the content).

`components/modal` is the window itself — backdrop, Escape, scroll lock, focus,
optional footer. `components/modalWindow` is the delete confirmation built on
top of it, and the forms open in the same shell. Forms live in
`components/forms/` (Formik + Yup) and are pulled in with `next/dynamic` from
the `addOrderButton` / `addProductButton` wrappers — Formik and Yup should not
land in the initial bundle for someone who never opens a form.

Conditional CSS-module classes must be written `clsx(base, cond && styles.x)`,
not `clsx(base, { [styles.x]: cond })` — under `noUncheckedIndexedAccess` a
module class is `string | undefined` and cannot be a computed key.

### i18n (`src/i18n/`, `src/messages/`)

`next-intl` with the locale in a cookie, **not** in the URL — there is no
`[locale]` segment and no middleware, so routes stay as they are.
`src/i18n/request.ts` reads the cookie per request and loads the dictionary;
`src/i18n/config.ts` holds the locale list, the cookie name and `INTL_LOCALES`
(the `Intl` tags — `uk` must become `uk-UA` or date formatting falls back to the
browser's defaults). The switcher writes the cookie through the
`setLocaleCookie` server action and then calls `router.refresh()`; writing
`document.cookie` would leave the server rendering the old language.

Because the layout reads a cookie, every route is server-rendered on demand —
static prerendering is gone by design.

Formatting helpers take the locale as an argument (`formatDate(date, locale)`)
rather than reaching for a hook: they are plain functions in `utils/` and must
stay usable from server code and tests. Yup schemas are built inside components
via `useMemo(..., [t])` so their messages are translated and Formik still sees a
stable schema reference.

Product types are **not** translated — they are backend catalogue data, the same
reasoning that keeps `ProductType` a string rather than an enum.

`src/mocks/` is no longer wired to anything — it survives as fixtures for the
MSW/Vitest work in phase 2.6. Do not reconnect pages to it.

### Redux store (`src/lib/`)

Four slices with a deliberate split:

- `features/dataOrdersAndProducts/ordersAndProductsSlice.ts` — the domain data
  (orders, products), their request status/error, the `fetchOrders` /
  `fetchProducts` / `addOrder` / `addProduct` / `removeOrder` / `removeProduct`
  thunks and the local deletion reducers.
- `features/orders/ordersSlice.ts` — **UI selection state only**: which order is
  selected, its title, whether the side panel is open.
- `features/session/sessionSlice.ts` — the socket connection: how many sessions
  are active and whether we are connected. `socketConnectionStarted` /
  `socketConnectionStopped` are commands for the listener middleware, not state
  changes; `StoreProvider` dispatches them on mount/unmount.
- `features/layout/layoutSlice.ts` — sidebar collapse and the mobile drawer.

Use the typed hooks from `src/lib/hooks.ts` (`useAppDispatch`, `useAppSelector`),
never the raw react-redux ones.

Forms `await dispatch(addOrder(dto)).unwrap()` so the modal only closes once the
server answered; the rejection it throws is the `ApiError` payload, which
`toApiError` turns back into a message.

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
for conditional classes. Sizes in `rem`, colours through Bootstrap's CSS
variables (`var(--bs-danger, #dc3545)`) so a theme swap stays possible.

Two traps, both of which bit this codebase already: `clsx("x", { orders: … })`
emits the literal class `orders` rather than the hashed one (fixed in phase 1.4,
after the rule had silently done nothing since 1.1), and CSS values must not be
quoted — `position: "fixed"` is invalid and the browser drops the whole
declaration.

## Conventions and constraints

- **Code comments are in Russian; UI strings live in dictionaries.** Every
  user-facing string goes into `src/messages/{ru,en,uk}.json` and is read with
  `useTranslations()` (or `getTranslations()` in server components) — never
  inline. All three files must gain the key, not just `ru.json`.
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
