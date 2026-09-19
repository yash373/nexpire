import { describe, expect, it } from "vitest";
import { loadItems, saveItems, STORAGE_KEY } from "@/lib/storage";
import type { ExpiryItem } from "@/lib/expiry";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const item: ExpiryItem = {
  id: "medicine-1",
  name: "Paracetamol",
  category: "Medicine",
  expiryDate: "2026-09-26",
};

describe("item storage", () => {
  it("round-trips valid items without changing the schema", () => {
    const storage = new MemoryStorage();

    saveItems(storage, [item]);

    expect(storage.getItem(STORAGE_KEY)).toBe(JSON.stringify([item]));
    expect(loadItems(storage)).toEqual([item]);
  });

  it("ignores malformed persisted values instead of throwing", () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEY, "not-json");
    expect(loadItems(storage)).toEqual([]);

    storage.setItem(
      STORAGE_KEY,
      JSON.stringify([item, { ...item, category: "Unknown" }, { name: "missing fields" }]),
    );
    expect(loadItems(storage)).toEqual([item]);
  });

  it("supports unavailable storage without throwing", () => {
    expect(loadItems(undefined)).toEqual([]);
    expect(() => saveItems(undefined, [item])).not.toThrow();
  });
});
