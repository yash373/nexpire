# Nexpire

Nexpire is a private, family-facing expiry tracker for medicines, groceries,
cosmetics, documents, and other household items.

## Local development

```bash
pnpm install
pnpm dev
```

Available checks:

```bash
pnpm test
pnpm lint
pnpm build
```

## Current behavior

- Add an item name, category, and expiry date.
- Edit any saved item without changing its stable item ID.
- Delete an item with a six-second undo action.
- Reject missing, malformed, or impossible calendar dates.
- Sort items by nearest expiry, with matching dates sorted by name.
- Refresh date-derived statuses when the page regains focus or visibility.
- Persist items only in browser `localStorage` under `nexpire-items-v1`.

Status colors and labels are calculated from the local calendar date:

- Red: expired.
- Orange: today through three days remaining.
- Yellow: four through seven days remaining.
- Green: more than seven days remaining.

## Privacy and storage

Nexpire has no backend, account system, analytics, or remote item storage.
Item names, categories, and dates stay on the device in the browser's local
storage. The service worker caches only the application shell; it is not a
data store and must not overwrite local item data.

Stored records currently use this shape:

```ts
{
  id: string;
  name: string;
  category: "Medicine" | "Grocery" | "Cosmetic" | "Document" | "Other";
  expiryDate: "YYYY-MM-DD";
}
```

Malformed records are ignored during loading rather than crashing the app.
