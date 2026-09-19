import type { ExpiryItem } from "./expiry";

export type DeletedItem = { item: ExpiryItem; index: number };

export function removeItem(items: ExpiryItem[], id: string): {
  items: ExpiryItem[];
  deleted: DeletedItem | null;
} {
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) return { items, deleted: null };

  return {
    items: items.filter((item) => item.id !== id),
    deleted: { item: items[index], index },
  };
}

export function restoreItem(items: ExpiryItem[], deleted: DeletedItem): ExpiryItem[] {
  const restored = [...items];
  restored.splice(Math.min(deleted.index, restored.length), 0, deleted.item);
  return restored;
}

export function upsertItem(
  items: ExpiryItem[],
  item: ExpiryItem,
  editingItemId: string | null,
): ExpiryItem[] {
  if (!editingItemId) return [...items, item];
  return items.map((entry) => (entry.id === editingItemId ? item : entry));
}
