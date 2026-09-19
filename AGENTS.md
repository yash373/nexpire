<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Nexpire Project Guide

## Product goal

Nexpire is a simple family-facing web app for recording items such as medicines,
milk, bread, cosmetics, groceries, and documents, then tracking when they
expire. The first release is a mobile-first Progressive Web App (PWA) built
with Next.js, TypeScript, Tailwind CSS, and shadcn/ui. Keep the experience
fast, calm, readable, and usable with one hand on a phone.

## MVP scope

Implement only the core expiry tracker unless the user explicitly expands the
scope:

- Add an item name.
- Select a category. Support at least Medicine, Grocery, Cosmetic, Document,
  and Other; keep the list easy to extend.
- Enter an expiry date.
- Calculate days remaining automatically from the current local date.
- Display items sorted by nearest expiry, with expired items first.
- Delete an item.
- Persist the complete item list in browser `localStorage` so it survives a
  page close and reopen. Do not add a backend, account system, or remote
  storage without explicit approval.

## Expiry status contract

Use one source of truth for status calculation and rendering:

- Red: expired (`daysRemaining < 0`).
- Orange: expires within 3 days (`0 <= daysRemaining <= 3`).
- Yellow: expires within 7 days (`4 <= daysRemaining <= 7`).
- Green: safe for more than 7 days (`daysRemaining > 7`).

An item expiring today has zero days remaining and is therefore Orange. Show
the expiry date and a plain-language status such as “Expired”, “Today”, “1 day
left”, or “Safe”. Sort by ascending expiry date, using a stable secondary key
such as item name when dates match.

## UI and PWA conventions

- Build mobile-first, then enhance for larger screens. Support touch targets of
  at least 44px, readable contrast, keyboard access, focus states, and reduced
  motion.
- Use shadcn/ui primitives and established project tokens before creating
  custom components. Keep reusable UI in `components/` and domain logic in
  framework-independent modules under `lib/`.
- Prefer a compact list or card layout on phones; preserve the clear priority
  order through color, text, and structure rather than color alone.
- Make the app installable as a PWA with a valid manifest, app icons, theme
  colors, and an appropriate offline shell. Never cache stale item data in a
  way that can silently overwrite newer `localStorage` data.
- Keep `app/manifest.ts` explicit about the app `id`, `scope`, install URL, and
  raster 192px/512px icons. Retain SVG icons only as optional fallbacks and
  include a maskable icon for adaptive home-screen displays. Serve the Apple
  touch icon from `public/apple-icon.png` so the generated metadata URL resolves.
- Keep service-worker registration isolated from page UI, and keep
  `public/sw.js` versioned. Pre-cache the app shell and `/offline`; use
  network-first navigation, cache-first versioned static assets, and do not
  cache Next.js RSC/data requests.
- The service worker must never become a data store: expiry items remain in
  `localStorage` under the existing key. Service-worker installation requires
  HTTPS in deployed environments; localhost is the development exception.
- Keep data local by default. Do not log item names, dates, or document details
  to analytics or server logs.

## Engineering expectations

- Use strict TypeScript and Next.js App Router conventions. Read the relevant
  versioned guidance in `node_modules/next/dist/docs/` before changing Next.js
  behavior or configuration.
- Keep date arithmetic timezone-safe and test boundary cases: expired items,
  today, 3 days, 4 days, 7 days, and 8 days remaining.
- Validate form input, handle malformed or missing `localStorage` data without
  crashing, and make deletion deliberate and accessible.
- Add focused tests for status calculation, sorting, persistence, and the main
  user flow. Run the repository's available checks before declaring work done.
- Update relevant documentation when product behavior, data shape, or PWA
  configuration changes. Do not add features merely because they are common
  in inventory apps; the brief defines the current boundary.
