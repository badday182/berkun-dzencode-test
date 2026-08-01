---
name: component
description: Create a React component following this repository's structure and conventions — folder layout, prop typing, CSS modules, client/server boundary, store access. Use when adding any new component (sidebar, topbar, forms, charts, cards), not when editing an existing one.
---

# Adding a component

## Layout

One folder per component under `src/components/`, always with an `index.tsx`,
plus `index.module.css` when it needs styles of its own:

```
src/components/orderCard/
├─ index.tsx
└─ index.module.css
```

Folder name is camelCase, component name is PascalCase, and **they should
match** — `sidebar/` exports `Sidebar`. Two older components break this
(`productsCard/` exports `ProductCard`, `select/` exports `SelectCustom`); do
not copy that.

Default-export the component. Named-export the props interface only if another
module needs it.

## Props

Declare the props interface **in the component file**, not in `@/types`. That
barrel holds domain types, DTOs and the socket contract — not UI shapes.
`OrderCardProps` in `src/components/orderCard/index.tsx` is the pattern.

Type props with the domain types, never their underlying primitives: an order id
prop is `OrderId`, not `number`. Import everything from the `@/types` barrel.

Prefer required props over optional ones. A prop typed `product?: Product`
forced an early `return` above the hooks in `productsCard` and broke the rules
of hooks — that bug is fixed, do not reintroduce the shape that caused it.

Where a prop determines the type of another prop, use a discriminated union —
`ModalWindowProps` ties `category: "order" | "product"` to the type of `id`, and
`assertNever` in the `default` branch keeps the switch exhaustive.

## Client or server

Add `"use client"` only when the component actually needs it: hooks, event
handlers, browser APIs, `usePathname`, store access. Every page is currently a
client component, but phase 2.1 converts them to server components — a
presentational component with no interactivity should not carry the directive
and block that.

## Store access

Use the typed hooks from `@/lib/hooks` — `useAppSelector`, `useAppDispatch` —
never the raw ones from `react-redux`.

Read domain data (orders, products) from `state.ordersAndProductsData` and
UI selection state (selected order, side panel) from `state.orders`. The split
is deliberate; keep new state on the correct side of it.

Call all hooks before any conditional return.

## Styles

Bootstrap 5 utility classes for layout, CSS modules for anything specific.
Existing modules use BEM-ish naming — `card`, `card__body`, `card__title` — with
a leading underscore for utility classes (`_wordWrap`, `_smallFontSize`). Follow
it.

Combine classes with `clsx`. **The trap:** `clsx("flex-grow-1", { orders: cond })`
emits the literal class `orders`, which does nothing, because module classes are
hashed. Conditional module classes must be written `{ [styles.orders]: cond }`.
One instance of this bug survives in `src/app/orders/page.tsx` under a
`TODO(1.4)`.

Attach handlers to the interactive element itself. Putting `onClick` on an `<i>`
inside a `<button>` — as two components used to — means clicks on the button but
off the icon do nothing.

## Strings

UI text is Russian and there is no i18n until phase 1.5. Every user-facing
string you add — labels, headings, placeholders, `aria-label`, empty states —
gets a `// TODO(1.5)` comment above it so the i18n sweep can find it.

## Before finishing

Run `npm run verify`. If the component is heavy — a modal, a form, a chart —
import it with `next/dynamic` at the use site rather than statically; lazy
loading is an explicit requirement of this project.
