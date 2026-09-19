# Nexpire

> **Keep the little deadlines visible.**

Nexpire is a calm, private expiry tracker for the things that quietly become
urgent: medicines, groceries, cosmetics, documents, and household essentials.
It turns a handful of dates into one glanceable watchlist—sorted by what needs
attention first, with no account, backend, or setup ceremony.

**[Open the live app → nexpire.vercel.app](https://nexpire.vercel.app)**

Nexpire is designed for real household use: quick to update on a phone,
readable at a glance, installable as a Progressive Web App, and private by
default.

## Why Nexpire exists

Expiry dates are easy to record and surprisingly easy to forget. A calendar can
hold the date, but it does not answer the useful question: **what needs my
attention first?**

Nexpire keeps that answer visible without turning household inventory into a
database or asking a family to create yet another account.

## What it does

- Add an item with a name, category, and expiry date.
- Support Medicine, Grocery, Cosmetic, Document, and Other categories.
- Sort the watchlist by nearest expiry, with same-day items ordered by name.
- Surface expired and soon-to-expire items immediately.
- Filter the list to everything, items needing attention, or safe items.
- Edit an item without changing its stable identity.
- Delete items with a six-second undo action.
- Recalculate date-based status when the day changes or the page regains focus.
- Persist the complete watchlist in the browser on the current device.
- Install the app when the browser supports PWA installation.
- Optionally enable local browser reminders for three days before expiry and on
  the expiry date.
- Continue showing the app shell offline, without treating the service worker
  as a data store.

## The status system

Every item has one source of truth for its date calculation and display:

| Status | Date range | Meaning |
| --- | --- | --- |
| 🔴 Expired | Before today | Act now |
| 🟠 Due soon | Today–3 days | Worth attention |
| 🟡 Coming up | 4–7 days | Keep it in view |
| 🟢 Safe | More than 7 days | No action yet |

An item expiring today is intentionally treated as **Due soon**, not expired.
Dates are compared as local calendar dates, avoiding timezone drift around
midnight.

## Privacy by design

Nexpire is local-first:

- There is no backend, account system, analytics, or remote item storage.
- Names, categories, and dates stay in the browser's `localStorage` on the
  device where they were entered.
- The service worker caches only the application shell and static assets.
- The service worker never caches or overwrites the watchlist.
- Reminder records are also local and versioned.
- Browser reminders are opt-in and best-effort. Reliable delivery while the
  app is fully closed would require a future push-service or backend decision.

The current item shape is deliberately small:

```ts
{
  id: string;
  name: string;
  category: "Medicine" | "Grocery" | "Cosmetic" | "Document" | "Other";
  expiryDate: "YYYY-MM-DD";
}
```

Malformed or outdated records are ignored safely instead of crashing the app.

## Built with

- [Next.js 16](https://nextjs.org/) App Router
- [React 19](https://react.dev/)
- TypeScript
- Tailwind CSS 4
- shadcn/ui-inspired primitives
- Vitest
- Web App Manifest and a versioned service worker
- Vercel deployment

The project keeps domain logic framework-independent where practical. Date
calculation, sorting, persistence, item transitions, and reminder eligibility
live under `lib/`; the page layer focuses on interaction and presentation.

## Run it locally

Requirements: Node.js and pnpm.

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

For a production-like run:

```bash
pnpm build
pnpm start
```

## Quality checks

```bash
pnpm test
pnpm lint
pnpm build
```

The test suite covers:

- Leap years, invalid calendar dates, and timezone-safe date differences.
- Every status boundary: expired, today, 3, 4, 7, and 8 days remaining.
- Stable expiry sorting and name tie-breaking.
- Add, edit, delete, and undo state transitions.
- Local storage round-tripping and malformed-data handling.
- Reminder deduplication and cleanup.
- Service-worker caching boundaries and offline fallbacks.

## Project map

```text
app/
  page.tsx              Main watchlist experience
  manifest.ts           Install metadata and app icons
  offline/page.tsx      Branded offline fallback
components/
  brand/                Nexpire identity and logo
  ui/                   Small reusable form primitives
  pwa-tools.tsx         Install, update, and reminder controls
lib/
  expiry.ts             Date validation, status, formatting, and sorting
  storage.ts            Local-only persistence and record validation
  item-state.ts         Add, edit, delete, and restore transitions
  reminders.ts          Local reminder eligibility and reconciliation
public/sw.js            Versioned app-shell service worker
tests/                  Focused behavior and policy tests
```

## Product boundary

The first release intentionally stays small. It is an expiry watchlist, not a
shared inventory platform. There is currently no login, sync, family account,
barcode scanning, cloud backup, or guaranteed background notification system.
Those features would change the privacy and infrastructure model and should be
treated as deliberate product decisions—not incidental additions.

## Contributing

Small, focused changes are welcome. Before opening a pull request:

1. Keep item data local unless the product boundary is explicitly changed.
2. Add or update focused tests for behavior changes.
3. Run `pnpm test`, `pnpm lint`, and `pnpm build`.
4. Check the mobile layout, keyboard flow, focus states, and offline behavior.
5. Document changes that affect storage, PWA behavior, or privacy.

## License

This repository does not currently declare a license. Add one before treating
the project as reusable third-party software.
