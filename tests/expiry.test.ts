import { describe, expect, it } from "vitest";
import { getDaysRemaining, getExpiryStatus, isValidDateKey, sortByExpiry, type ExpiryItem } from "@/lib/expiry";

const today = new Date(2026, 8, 19, 12);

describe("expiry status", () => {
  it.each(["2026-02-29", "2026-04-31", "2026-9-19", "not-a-date"])("rejects malformed date key %s", (dateKey) => {
    expect(isValidDateKey(dateKey)).toBe(false);
  });

  it("accepts valid leap-day and local date keys", () => {
    expect(isValidDateKey("2028-02-29")).toBe(true);
    expect(isValidDateKey("2026-09-19")).toBe(true);
  });

  it.each([
    [-1, "expired"],
    [0, "urgent"],
    [3, "urgent"],
    [4, "soon"],
    [7, "soon"],
    [8, "safe"],
  ])("maps %i days to %s", (days, status) => {
    expect(getExpiryStatus(days)).toBe(status);
  });

  it("calculates date-only differences without timezone drift", () => {
    expect(getDaysRemaining("2026-09-18", today)).toBe(-1);
    expect(getDaysRemaining("2026-09-19", today)).toBe(0);
    expect(getDaysRemaining("2026-09-26", today)).toBe(7);
  });
});

describe("expiry sorting", () => {
  it("sorts nearest expiry first and names ties consistently", () => {
    const items: ExpiryItem[] = [
      { id: "1", name: "Zinc", category: "Medicine", expiryDate: "2026-09-20" },
      { id: "2", name: "Milk", category: "Grocery", expiryDate: "2026-09-19" },
      { id: "3", name: "Bread", category: "Grocery", expiryDate: "2026-09-19" },
    ];
    expect(sortByExpiry(items).map((item) => item.name)).toEqual(["Bread", "Milk", "Zinc"]);
  });
});
