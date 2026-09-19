import { describe, expect, it } from "vitest";
import { removeItem, restoreItem, upsertItem } from "@/lib/item-state";
import type { ExpiryItem } from "@/lib/expiry";

const items: ExpiryItem[] = [
  { id: "a", name: "A", category: "Grocery", expiryDate: "2026-09-20" },
  { id: "b", name: "B", category: "Medicine", expiryDate: "2026-09-21" },
];

describe("item state transitions", () => {
  it("removes an item and records its original position", () => {
    expect(removeItem(items, "a")).toEqual({
      items: [items[1]],
      deleted: { item: items[0], index: 0 },
    });
  });

  it("restores an item at its original position", () => {
    const deleted = removeItem(items, "a").deleted;
    expect(deleted && restoreItem([items[1]], deleted)).toEqual(items);
  });

  it("replaces an edit without changing its ID", () => {
    const edited = { ...items[0], name: "Updated" };
    expect(upsertItem(items, edited, "a")).toEqual([edited, items[1]]);
  });

  it("appends a new item", () => {
    const added: ExpiryItem = { id: "c", name: "C", category: "Other", expiryDate: "2026-09-22" };
    expect(upsertItem(items, added, null)).toEqual([...items, added]);
  });
});
