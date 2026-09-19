import { describe, expect, it } from "vitest";
import { getEligibleReminders, getUnsentReminders, reconcileReminderRecords, type ReminderRecord } from "@/lib/reminders";
import type { ExpiryItem } from "@/lib/expiry";

const today = new Date(2026, 8, 19, 12);
const item = (id: string, expiryDate: string): ExpiryItem => ({ id, name: id, category: "Grocery", expiryDate });

describe("local reminder eligibility", () => {
  it("finds three-day and due-today reminders only", () => {
    expect(getEligibleReminders([item("three", "2026-09-22"), item("today", "2026-09-19"), item("later", "2026-09-23")], today)).toEqual([
      { itemId: "three", kind: "three-days", dateKey: "2026-09-19" },
      { itemId: "today", kind: "due-today", dateKey: "2026-09-19" },
    ]);
  });

  it("deduplicates by item, kind, and local date", () => {
    const record: ReminderRecord = { itemId: "a", kind: "due-today", dateKey: "2026-09-19" };
    expect(getUnsentReminders([record], [record])).toEqual([]);
  });

  it("drops deleted items when records are reconciled", () => {
    const records: ReminderRecord[] = [
      { itemId: "kept", kind: "due-today", dateKey: "2026-09-19" },
      { itemId: "deleted", kind: "due-today", dateKey: "2026-09-19" },
    ];
    expect(reconcileReminderRecords(records, [item("kept", "2026-09-19")])).toEqual([records[0]]);
  });
});
