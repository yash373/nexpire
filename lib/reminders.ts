import { getDaysRemaining, isValidDateKey, type ExpiryItem } from "./expiry";

export const REMINDER_STORAGE_KEY = "nexpire-reminders-v1";
export type ReminderKind = "three-days" | "due-today";
export type ReminderRecord = { itemId: string; kind: ReminderKind; dateKey: string };

export function getEligibleReminders(items: ExpiryItem[], today: Date): ReminderRecord[] {
  const dateKey = todayKey(today);
  return items.flatMap((item): ReminderRecord[] => {
    const days = getDaysRemaining(item.expiryDate, today);
    if (days === 3) return [{ itemId: item.id, kind: "three-days", dateKey }];
    if (days === 0) return [{ itemId: item.id, kind: "due-today", dateKey }];
    return [];
  });
}

export function readReminderRecords(storage: Storage | undefined): ReminderRecord[] {
  if (!storage) return [];
  try {
    const parsed: unknown = JSON.parse(storage.getItem(REMINDER_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isReminderRecord);
  } catch {
    return [];
  }
}

export function writeReminderRecords(storage: Storage | undefined, records: ReminderRecord[]): void {
  if (!storage) return;
  try {
    storage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Notifications are best-effort and must never block the tracker.
  }
}

export function getUnsentReminders(
  eligible: ReminderRecord[],
  sent: ReminderRecord[],
): ReminderRecord[] {
  return eligible.filter((record) => !sent.some((entry) => sameReminder(entry, record)));
}

export function reconcileReminderRecords(
  records: ReminderRecord[],
  items: ExpiryItem[],
): ReminderRecord[] {
  const ids = new Set(items.map((item) => item.id));
  return records.filter((record) => ids.has(record.itemId));
}

function sameReminder(a: ReminderRecord, b: ReminderRecord): boolean {
  return a.itemId === b.itemId && a.kind === b.kind && a.dateKey === b.dateKey;
}

function isReminderRecord(value: unknown): value is ReminderRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<ReminderRecord>;
  return (
    typeof record.itemId === "string" &&
    (record.kind === "three-days" || record.kind === "due-today") &&
    typeof record.dateKey === "string" &&
    isValidDateKey(record.dateKey)
  );
}

function todayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
