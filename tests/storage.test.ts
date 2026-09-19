import { describe, expect, it } from "vitest";
import { loadItems, saveItems, STORAGE_KEY } from "@/lib/storage";
import type { ExpiryItem } from "@/lib/expiry";

function makeStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  } as Storage;
}

describe("item persistence", () => {
  it("round-trips valid items without changing their IDs", () => {
    const storage = makeStorage();
    const items: ExpiryItem[] = [{
      id: "medicine-1",
      name: "Paracetamol",
      category: "Medicine",
      expiryDate: "2026-09-19",
    }];

    saveItems(storage, items);

    expect(storage.getItem(STORAGE_KEY)).toContain("medicine-1");
    expect(loadItems(storage)).toEqual(items);
  });

  it("ignores malformed records while retaining valid records", () => {
    const storage = makeStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify([
      { id: "valid", name: "Milk", category: "Grocery", expiryDate: "2026-09-19" },
      { id: "bad-date", name: "Milk", category: "Grocery", expiryDate: "2026-02-29" },
      { id: "bad-category", name: "Soap", category: "Household", expiryDate: "2026-09-19" },
    ]));

    expect(loadItems(storage).map((item) => item.id)).toEqual(["valid"]);
  });

  it("ignores malformed JSON instead of throwing", () => {
    const storage = makeStorage();
    storage.setItem(STORAGE_KEY, "not-json");

    expect(loadItems(storage)).toEqual([]);
  });

  it("supports unavailable storage without throwing", () => {
    expect(loadItems(undefined)).toEqual([]);
    expect(() => saveItems(undefined, [])).not.toThrow();
  });
});
