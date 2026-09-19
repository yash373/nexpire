export const CATEGORIES = [
  "Medicine",
  "Grocery",
  "Cosmetic",
  "Document",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type ExpiryItem = {
  id: string;
  name: string;
  category: Category;
  expiryDate: string;
};

export type ExpiryStatus = "expired" | "urgent" | "soon" | "safe";

export function isValidDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function dateKeyToUtc(dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);

  return Date.UTC(year, month - 1, day);
}

export function getDaysRemaining(expiryDate: string, today = new Date()): number {
  if (!isValidDateKey(expiryDate)) return Number.NaN;

  return Math.round(
    (dateKeyToUtc(expiryDate) - dateKeyToUtc(getLocalDateKey(today))) /
      (24 * 60 * 60 * 1000),
  );
}

export function getExpiryStatus(daysRemaining: number): ExpiryStatus {
  if (daysRemaining < 0) return "expired";
  if (daysRemaining <= 3) return "urgent";
  if (daysRemaining <= 7) return "soon";
  return "safe";
}

export function sortByExpiry(items: ExpiryItem[]): ExpiryItem[] {
  return [...items].sort(
    (a, b) =>
      a.expiryDate.localeCompare(b.expiryDate) ||
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}

export function formatExpiryDate(expiryDate: string): string {
  const [year, month, day] = expiryDate.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: year !== new Date().getFullYear() ? "numeric" : undefined,
  }).format(new Date(year, month - 1, day, 12));
}

export function formatDaysRemaining(daysRemaining: number): string {
  if (daysRemaining < 0) {
    const daysAgo = Math.abs(daysRemaining);
    return `${daysAgo} ${daysAgo === 1 ? "day" : "days"} overdue`;
  }
  if (daysRemaining === 0) return "Today";
  if (daysRemaining === 1) return "1 day left";
  if (daysRemaining <= 7) return `${daysRemaining} days left`;
  return "Safe";
}
