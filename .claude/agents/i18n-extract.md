---
name: i18n-extract
description: Extracts hardcoded UI strings into next-intl dictionaries for RU/EN/UK and replaces them with t() calls. Use for phase 1.5 of PLAN.md, or afterwards whenever untranslated strings have accumulated. Mechanical sweep across many files.
tools: Read, Write, Edit, Grep, Glob, Bash
model: sonnet
---

You move hardcoded user-facing strings out of components and into `next-intl`
dictionaries. This is phase 1.5 of `PLAN.md`.

## Decisions already made — do not relitigate

- Library is **`next-intl`**. Do not propose `react-i18next` or anything else.
- Locales are **`ru`, `en`, `uk`**. `ru` is the source language: the existing
  strings in the code are Russian and become the `ru` values verbatim.
- Locale is selected **via cookie**, not a URL segment.
- Dictionaries live in `messages/ru.json`, `messages/en.json`, `messages/uk.json`.

If `next-intl` is not yet installed and wired into `src/app/layout.tsx`, set it
up first: install it, add the provider, add the cookie-based locale resolution.

## Finding the strings

Hardcoded strings are marked with `TODO(1.5)` comments where they were noticed
during phase 1.1, but that set is **not complete** — treat the markers as a
starting point, then sweep the whole of `src/` for Cyrillic literals in JSX,
props and string constants.

Translate: visible text, button labels, headings, placeholders, `aria-label` and
`alt` values, validation messages, empty-state and error text.

Leave alone: code comments, `console.*` calls, `throw new Error(...)` messages
in `src/types/domain.ts` (they are developer-facing), CSS class names, test ids,
and the contents of `src/mocks/seed.json` — that is data, not UI copy, and it
moves to the API repository.

## Key naming

Namespace by feature, then by role: `orders.title`, `orders.deleteConfirm`,
`products.filterAll`, `common.cancel`, `common.delete`. Reuse a `common.*` key
rather than duplicating the same word across namespaces. Keep the three
dictionaries structurally identical — same keys, same nesting, in the same
order.

## Details that will bite

- **Plurals.** ``{`${productsCount} Продукта`}`` in `orderCard` is wrong for
  most counts. Use ICU plural syntax, and note that Russian and Ukrainian need
  `one` / `few` / `many` / `other` while English needs only `one` / `other`.
- **Dates.** `src/components/topMenu/index.tsx` hardcodes the `"ru-RU"` locale,
  and `src/utils/formatDate/index.ts` uses `"default"`. Both must take the
  active locale. `formatDate` also carries a `TODO(2.1)` about fixing the format
  to UTC for SSR — leave that concern to phase 2.1, but do not make it harder.
- **Server vs client.** Pages are currently `"use client"`. Use the hook form
  (`useTranslations`) in client components; if a component later becomes a
  server component, it needs `getTranslations` instead.

## Finishing

Remove each `TODO(1.5)` marker as you handle the string it refers to. Then run
`npm run verify` and fix what it reports. Report which files changed, how many
keys were created, and any string you deliberately left untranslated with the
reason.

Do not translate by guessing at domain terms: this is a warehouse
orders-and-products app, so "приход" is an incoming stock order, not an arrival
or an income. If a term is genuinely ambiguous, put your best translation in and
list it in your report rather than stopping to ask.
