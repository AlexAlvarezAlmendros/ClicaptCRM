import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatPhone,
  getInitials,
} from "../lib/formatters";

describe("formatCurrency", () => {
  it("formats 0", () => {
    expect(formatCurrency(0)).toContain("0");
    expect(formatCurrency(0)).toContain("€");
  });

  it("formats integers without decimals", () => {
    const result = formatCurrency(1500);
    expect(result).toContain("1500");
    expect(result).toContain("€");
  });

  it("formats decimals", () => {
    const result = formatCurrency(29.99);
    expect(result).toContain("29,99");
  });

  it("handles null/undefined", () => {
    expect(formatCurrency(null)).toContain("0");
    expect(formatCurrency(undefined)).toContain("0");
  });
});

describe("formatDate", () => {
  it("formats a valid date string", () => {
    const result = formatDate("2024-03-15");
    expect(result).toMatch(/15/);
    expect(result).toMatch(/mar/i);
    expect(result).toMatch(/2024/);
  });

  it("returns dash for null", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate("")).toBe("—");
    expect(formatDate(undefined)).toBe("—");
  });
});

describe("formatRelativeTime", () => {
  it("returns empty string for falsy input", () => {
    expect(formatRelativeTime("")).toBe("");
    expect(formatRelativeTime(null)).toBe("");
  });

  it('returns "ahora mismo" for just now', () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe("ahora mismo");
  });

  it("returns minutes for recent dates", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString();
    expect(formatRelativeTime(fiveMinAgo)).toBe("hace 5 min");
  });

  it("returns hours for dates within a day", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600000).toISOString();
    expect(formatRelativeTime(threeHoursAgo)).toBe("hace 3h");
  });

  it("returns days for dates within a week", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
    expect(formatRelativeTime(twoDaysAgo)).toBe("hace 2d");
  });

  it("falls back to formatDate for older dates", () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();
    const result = formatRelativeTime(twoWeeksAgo);
    // Should be a formatted date, not a relative time
    expect(result).not.toContain("hace");
    expect(result).toMatch(/\d{4}/);
  });
});

describe("formatPhone", () => {
  it("formats a Spanish phone number", () => {
    expect(formatPhone("+34612345678")).toBe("+34 612 345 678");
  });

  it("returns empty string for falsy input", () => {
    expect(formatPhone("")).toBe("");
    expect(formatPhone(null)).toBe("");
  });

  it("returns non-Spanish numbers unchanged", () => {
    expect(formatPhone("+1555123456")).toBe("+1555123456");
  });
});

describe("getInitials", () => {
  it("returns initials from a full name", () => {
    expect(getInitials("Juan García")).toBe("JG");
  });

  it("returns single initial from a single name", () => {
    expect(getInitials("Ana")).toBe("A");
  });

  it("limits to 2 initials", () => {
    expect(getInitials("Juan Carlos García López")).toBe("JC");
  });

  it('returns "?" for falsy input', () => {
    expect(getInitials("")).toBe("?");
    expect(getInitials(null)).toBe("?");
  });
});
