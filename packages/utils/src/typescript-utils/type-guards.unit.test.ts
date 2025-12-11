import { describe, expect, it } from "vitest";
import {
  isArray,
  isBoolean,
  isDate,
  isRecord,
  isString,
  isValidISODate,
  isValidJSONString,
} from "./type-guards";

describe.concurrent("isString", () => {
  it("returns true for a string", () => {
    expect(isString("hello")).toBe(true);
  });

  it("returns false for other types", () => {
    expect(isString(123)).toBe(false);
    expect(isString(true)).toBe(false);
    expect(isString(null)).toBe(false);
    expect(isString(undefined)).toBe(false);
    expect(isString({})).toBe(false);

    expect(isString([])).toBe(false);
  });
});

describe.concurrent("isBoolean", () => {
  it("returns true for a boolean", () => {
    expect(isBoolean(true)).toBe(true);
    expect(isBoolean(false)).toBe(true);
  });

  it("returns false for other types", () => {
    expect(isBoolean("hello")).toBe(false);
    expect(isBoolean(123)).toBe(false);
    expect(isBoolean(null)).toBe(false);
    expect(isBoolean(undefined)).toBe(false);
    expect(isBoolean({})).toBe(false);
    expect(isBoolean([])).toBe(false);
  });
});

describe.concurrent("isArray", () => {
  it("returns true for an array", () => {
    expect(isArray([])).toBe(true);
    expect(isArray([1, 2, 3])).toBe(true);
  });

  it("returns false for other types", () => {
    expect(isArray("hello")).toBe(false);
    expect(isArray(123)).toBe(false);
    expect(isArray(true)).toBe(false);
    expect(isArray(null)).toBe(false);
    expect(isArray(undefined)).toBe(false);
    expect(isArray({})).toBe(false);
  });
});

describe.concurrent("isDate", () => {
  it("returns true for a Date object", () => {
    expect(isDate(new Date())).toBe(true);
  });

  it("returns false for other types", () => {
    expect(isDate("2023-09-12T13:30:00Z")).toBe(false); // Even a valid date string is not a Date object
    expect(isDate(123)).toBe(false);
    expect(isDate(true)).toBe(false);
    expect(isDate(null)).toBe(false);
    expect(isDate(undefined)).toBe(false);
    expect(isDate({})).toBe(false);
    expect(isDate([])).toBe(false);
  });
});

describe.concurrent("isRecord", () => {
  it("returns true for a plain object", () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord({ a: 1, b: "hello" })).toBe(true);
  });

  it("returns false for other types", () => {
    expect(isRecord([])).toBe(false);
    expect(isRecord(null)).toBe(false);
    expect(isRecord(undefined)).toBe(false);
    expect(isRecord(123)).toBe(false);
    expect(isRecord("hello")).toBe(false);
    expect(isRecord(true)).toBe(false);
  });
});

describe.concurrent("isValidISODate", () => {
  it("returns true for a valid ISO date string", () => {
    expect(isValidISODate("2023-09-12T13:30:00Z")).toBe(true);
  });

  it("returns false for an invalid ISO date string", () => {
    expect(isValidISODate("invalid date")).toBe(false);
    expect(isValidISODate("2023-13-01")).toBe(false);
  });
});

describe.concurrent("isValidJSONString", () => {
  it("returns true for a valid JSON string", () => {
    expect(isValidJSONString('{"a": 1, "b": "hello"}')).toBe(true);
  });

  it("returns false for an invalid JSON string", () => {
    expect(isValidJSONString("invalid json")).toBe(false);
    expect(isValidJSONString('{"a": 1, "b": "hello"')).toBe(false);
  });
});
