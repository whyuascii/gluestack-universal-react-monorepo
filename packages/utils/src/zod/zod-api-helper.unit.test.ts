import { describe, expect, it } from "vitest";
import { z } from "zod";
import { parseSortSchema, sortStringSchema, transformStringToArray } from ".";

describe.concurrent("parseSortSchema", () => {
  it("should parse asc(name) to {field:name, sorOrder:1}", () => {
    const result = parseSortSchema("asc(name)");
    expect(result).toEqual({ field: "name", sortOrder: 1 });
  });

  it("should parse desc(name) to {field:name, sorOrder:-1}", () => {
    const result = parseSortSchema("desc(name)");
    expect(result).toEqual({ field: "name", sortOrder: -1 });
  });

  it("should return false for invalid format", () => {
    expect(parseSortSchema("ascname)")).toBe(false);
    expect(parseSortSchema("asc(name")).toBe(false);
    expect(parseSortSchema("asc(name)extra")).toBe(false);
  });

  it("should return false for non-string input", () => {
    expect(parseSortSchema(123 as unknown as string)).toBe(false);
    expect(parseSortSchema(null as unknown as string)).toBe(false);
    expect(parseSortSchema(undefined as unknown as string)).toBe(false);
  });

  it("should return false for empty field name", () => {
    expect(parseSortSchema("asc()")).toBe(false);
  });
});

describe.concurrent("sortStringSchema", () => {
  it("should transforms valid sort string into correct map", () => {
    const result = sortStringSchema.parse("asc(name),desc(age)");
    expect(result).toEqual({ name: 1, age: -1 });
  });

  it("ignores invalid sort clauses", () => {
    const result = sortStringSchema.parse("asc(name),invalid,desc(age)");
    expect(result).toEqual({ name: 1, age: -1 });
  });

  it("returns an empty map for all invalid sort clauses", () => {
    const result = sortStringSchema.parse("invalid1,invalid2");
    expect(result).toEqual({});
  });
});

describe.concurrent("transformStringToArray", () => {
  const schema = z.array(z.string()).or(z.string());

  it("should transform a string to an array", () => {
    const transformSchema = transformStringToArray(schema);
    const result = transformSchema.parse("test");
    expect(result).toEqual(["test"]);
  });

  it("should leave an array unchanged", () => {
    const transformSchema = transformStringToArray(schema);
    const result = transformSchema.parse(["test1", "test2"]);
    expect(result).toEqual(["test1", "test2"]);
  });

  it("should throw an error for non-string, non-array input", () => {
    const transformSchema = transformStringToArray(schema);
    expect(() => transformSchema.parse(123)).toThrow();
  });

  it("should throw an error for invalid array elements", () => {
    const invalidSchema = transformStringToArray(z.array(z.number()));
    expect(() => invalidSchema.parse("test")).toThrow();
    expect(() => invalidSchema.parse(["test1", "test2"])).toThrow();
  });

  it("should handle empty strings correctly", () => {
    const transformSchema = transformStringToArray(schema);
    const result = transformSchema.parse("");
    expect(result).toEqual([""]);
  });
});
