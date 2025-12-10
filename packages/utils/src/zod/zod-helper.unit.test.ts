import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	transformDate,
	transformDateToUTC,
	transformEmptyStringToNull,
	transformNullishDate,
	transformToBoolean,
	transformValidationErrorMessages,
} from ".";

describe.concurrent("transformValidationErrorMessages", () => {
	it("transforms ZodError issues to a user-friendly format", () => {
		// Creating a mock ZodError
		const mockZodError: z.ZodError = {
			issues: [
				{
					message: "Invalid input",
					path: [0, "name"],
				},
				{
					message: "Required",
					path: [1, "email"],
				},
			],
			// Additional properties and methods of ZodError
		} as unknown as z.ZodError;

		const result = transformValidationErrorMessages(mockZodError.issues);

		expect(result).toEqual([
			{
				index: 0,
				path: ["name"],
				message: "Invalid input",
			},
			{
				index: 1,
				path: ["email"],
				message: "Required",
			},
		]);
	});

	it("handles errors in nested fields correctly", () => {
		// Creating a mock ZodError for nested fields
		const mockZodError: z.ZodError = {
			issues: [
				{
					message: "Required",
					path: [0, "address", "street"],
				},
				{
					message: "Invalid format",
					path: [1, "contact", "email"],
				},
			],
			// Additional properties and methods of ZodError
		} as unknown as z.ZodError;

		const result = transformValidationErrorMessages(mockZodError.issues);

		expect(result).toEqual([
			{
				index: 0,
				path: ["address", "street"],
				message: "Required",
			},
			{
				index: 1,
				path: ["contact", "email"],
				message: "Invalid format",
			},
		]);
	});
});


describe.concurrent("transformDate", () => {
	const schema = z.object({
		date: transformDate,
	});
	it("should transform a valid date string to a Date instance", () => {
		const result = schema.safeParse({ date: "2023-05-21T00:00:00Z" });

		expect(result.success).toBe(true);
		expect(result.data?.date).toBeInstanceOf(Date);
	});

	it("should fail when the date string is invalid", () => {
		const result = schema.safeParse({ date: "invalid-date" });

		expect(result.success).toBe(false);
		// Zod 4 returns invalid_union when the union with .or(z.date()) fails
		expect(result.error?.issues[0].code).toBe(z.ZodIssueCode.invalid_union);
	});
});

describe.concurrent("transformNullishDate", () => {
	const schema = z.object({
		date: transformNullishDate,
	});
	it("should transform a valid date string to a Date instance", () => {
		const result = schema.safeParse({ date: "2023-05-21T00:00:00Z" });

		expect(result.success).toBe(true);
		expect(result.data?.date).toBeInstanceOf(Date);
	});

	it("should transform nullish values to null", () => {
		const result1 = schema.safeParse({ date: null });
		const result2 = schema.safeParse({ date: undefined });

		expect(result1.success).toBe(true);
		expect(result1.data?.date).toBeNull();

		expect(result2.success).toBe(true);
		expect(result2.data?.date).toBeNull();
	});

	it("should fail when the date string is invalid", () => {
		const result = schema.safeParse({ date: "invalid-date" });

		expect(result.success).toBe(false);
		expect(result.error?.issues[0].code).toBe(z.ZodIssueCode.custom);
	});
});

describe.concurrent("transformToBoolean", () => {
	const schema = z.object({
		value: transformToBoolean,
	});

	it("should return boolean values as is", () => {
		const result = schema.safeParse({ value: true });
		expect(result.success).toBe(true);
		expect(result.data?.value).toBe(true);
	});

	it("should transform 'true' to true", () => {
		const result = schema.safeParse({ value: "true" });

		expect(result.success).toBe(true);
		expect(result.data?.value).toBe(true);
	});

	it("should transform 'True' to true", () => {
		const result = schema.safeParse({ value: "True" });

		expect(result.success).toBe(true);
		expect(result.data?.value).toBe(true);
	});

	it("should transform 'TRUE' to true", () => {
		const result = schema.safeParse({ value: "TRUE" });

		expect(result.success).toBe(true);
		expect(result.data?.value).toBe(true);
	});

	it("should transform 'false' to false", () => {
		const result = schema.safeParse({ value: "false" });

		expect(result.success).toBe(true);
		expect(result.data?.value).toBe(false);
	});

	it("should transform 'False' to false", () => {
		const result = schema.safeParse({ value: "False" });

		expect(result.success).toBe(true);
		expect(result.data?.value).toBe(false);
	});

	it("should transform 'FALSE' to false", () => {
		const result = schema.safeParse({ value: "FALSE" });

		expect(result.success).toBe(true);
		expect(result.data?.value).toBe(false);
	});

	it("should fail for invalid boolean strings", () => {
		const result = schema.safeParse({ value: "invalid" });

		expect(result.success).toBe(false);
		expect(result.error?.issues[0].code).toBe(z.ZodIssueCode.custom);
		expect(result.error?.issues[0].message).toBe(
			'Invalid boolean string. Expected "true" or "false" (case insensitive), got "invalid"'
		);
	});
});

describe.concurrent("transformEmptyStringToNull", () => {
	const schema = z.object({
		value: transformEmptyStringToNull,
	});
	it("should transform an empty string to null", () => {
		const result = schema.safeParse({ value: "" });

		expect(result.success).toBe(true);
		expect(result.data?.value).toBeNull();
	});

	it("should keep non-empty strings as is", () => {
		const result = schema.safeParse({ value: "non-empty" });

		expect(result.success).toBe(true);
		expect(result.data?.value).toBe("non-empty");
	});
});
describe.concurrent("transformDateToUTC", () => {
	it("should convert valid string date to UTC Date object", () => {
		const result = transformDateToUTC.safeParse("2023-05-21T15:30:00Z");
		expect(result.success).toBe(true);
		expect(result.data).toBeInstanceOf(Date);
		expect(result.data?.toISOString()).toBe("2023-05-21T15:30:00.000Z");
	});

	it("should convert valid Date object to UTC Date object", () => {
		const date = new Date("2023-05-21T15:30:00Z");
		const result = transformDateToUTC.safeParse(date);
		expect(result.success).toBe(true);
		expect(result.data).toBeInstanceOf(Date);
		expect(result.data?.toISOString()).toBe("2023-05-21T15:30:00.000Z");
	});

	it("should fail for invalid input (number)", () => {
		const result = transformDateToUTC.safeParse(123456);
		expect(result.success).toBe(false);
		expect(result.error?.issues[0].message).toBe("Invalid input");
	});

	it("should fail for invalid input (string)", () => {
		const result = transformDateToUTC.safeParse("123456aaaa");
		expect(result.success).toBe(false);
		expect(result.error?.issues[0].message).toBe(
			"Invalid date format. Must be a valid date string or Date object."
		);
	});
});
