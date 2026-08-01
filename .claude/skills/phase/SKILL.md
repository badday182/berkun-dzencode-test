---
name: phase
description: Work through a phase of PLAN.md — from reading the phase brief to recording the outcome back into the plan. Use when starting, continuing or closing any numbered phase (1.2, 1.3, 2.1 …), or when the user says "давай делать фазу X" / "начни реализацию X".
---

# Working a phase of PLAN.md

`PLAN.md` is the agreed, phased plan for this project. It is not a wish list —
it records decisions and the reasoning behind them. Treat it as both the input
and the output of every phase.

## 1. Read before writing

Read three things, in this order:

1. **Section 2, «Принятые решения»** and «Отклонённые варианты». Every phase is
   downstream of these. Do not propose Zustand, micro frontends, Module
   Federation, WebAssembly, Postgres or `react-i18next` — they were argued and
   settled. If a decision genuinely blocks the phase, say so explicitly rather
   than quietly working around it.
2. **Section 3, «Текущее состояние кода»** — the live list of known gaps.
3. **The phase itself**, plus any phase it depends on.

Then read the actual files you are about to change. The plan describes intent;
the code is the truth, and they drift.

## 2. Do the work

Cover every checkbox in the phase. If one turns out to be wrong or impossible,
that is a finding to record in step 4 — not something to drop silently.

Watch for `TODO(<phase>)` markers: they point at work deliberately deferred to a
specific phase. Act on the ones belonging to _this_ phase and remove them. Leave
the rest alone.

If you find a real bug while working — the phases so far have turned up several —
fix it when it is inside the files you are already touching, and record it. If
fixing it would change behaviour the user has not asked about (layout, visual
output), leave it, mark it with a `TODO(<phase>)` pointing at the phase that
owns it, and record it as deliberately deferred.

## 3. Verify

Run `npm run verify` and `npm run build`. Both must pass. A known
`react-hooks/exhaustive-deps` warning in `src/app/orders/page.tsx` is expected
until phase 1.3.

Report failures honestly, with the output. Never describe a phase as done while
something is red.

Optionally run the `conventions-review` agent over the diff before reporting —
it checks the type-system and Redux rules that erode over time.

## 4. Record the outcome in PLAN.md

This is the part that gets skipped and matters most. Edit the phase section:

- Mark the heading: `### Фаза 1.1 — TypeScript-чистка `0.5 дн` — ✅ сделано`
- Tick the checkboxes that are genuinely done: `- [x]`
- Where the implementation differs from the checkbox text, rewrite the checkbox
  to describe what was actually built.

Then add whichever of these four subsections apply, in this order and with these
exact headings:

```markdown
#### Отклонение от плана

#### Попутно найдено и исправлено

#### Найдено, отложено осознанно

#### Проверка
```

- **Отклонение от плана** — anything built differently from the plan, with the
  reasoning. One decision per paragraph. This is the section a reviewer reads to
  tell judgement from carelessness, so state _why_, not just _what_.
- **Попутно найдено и исправлено** — bugs found and fixed along the way, each
  with the failure it caused, not just its name.
- **Найдено, отложено осознанно** — problems found and left alone, each naming
  the phase that will own it and the `TODO(<phase>)` marker left in the code.
- **Проверка** — which commands were run and what remains warning-level.

Finally, update **section 3, «Текущее состояние кода»**: delete the bullets this
phase closed, add anything newly discovered, and append a line to the
"Закрыто в фазе …" summary.

## 5. Do not commit

The user commits themselves — this is a standing rule, not a per-task
preference. Do not run `git commit`, `git add` or `git push` unless asked in
that specific turn.

Do tell them what is worth knowing before they commit: which files carry real
content changes versus incidental ones, and whether the change set would read
better as more than one commit.

## Reporting back

Lead with what was built, then the findings — bugs fixed, deviations, things
deferred. State plainly what is still open. Do not restate the plan or pad the
report with a summary of the diff the user can read themselves.
