import { isValidDateKey, type Category, type ExpiryItem } from "./expiry";

export const STORAGE_KEY = "nexpire-items-v1";

function isCategory(value: unknown): value is Category {
  return ["Medicine", "Grocery", "Cosmetic", "Document", "Other"].includes(
    value as Category,
  );
}

function isExpiryItem(value: unknown): value is ExpiryItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<ExpiryItem>;

  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    item.name.trim().length > 0 &&
    isCategory(item.category) &&
    typeof item.expiryDate === "string" &&
    isValidDateKey(item.expiryDate)
  );
}

export function loadItems(storage: Storage | undefined): ExpiryItem[] {
  if (!storage) return [];

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isExpiryItem) : [];
  } catch {
    return [];
  }
}

export function saveItems(storage: Storage | undefined, items: ExpiryItem[]): void {
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Persistence can fail in private browsing or when storage is disabled.
  }
}
