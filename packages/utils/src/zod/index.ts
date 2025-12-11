// Dependencies
import { z } from "zod";

export * from "./api-helpers";

/**
 * Helper function to transform a string into a Date.
 */
export const transformDate = z
  .string()
  .transform((date, ctx) => {
    try {
      const dateObject = new Date(date);

      if (!z.date().safeParse(dateObject).success) {
        throw new Error("Invalid Date");
      }

      return dateObject;
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid date",
      });
    }

    return z.NEVER;
  })
  .or(z.date());

/**
 * Helper function to transform a nullable or optional (nullish) string into a Date.
 */
export const transformNullishDate = z
  .string()
  .nullish()
  .transform((date, ctx) => {
    if (!date) {
      return null;
    }

    try {
      const dateObject = new Date(date);

      if (!z.date().safeParse(dateObject).success) {
        throw new Error("Invalid Date");
      }

      return dateObject;
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid date",
      });
    }

    return z.NEVER;
  });

export const transformValidationErrorMessages = (issues: z.ZodError["issues"]) => {
  const errorMessages: {
    index: string | number | undefined;
    path: (string | number)[];
    message: string;
  }[] = [];

  for (const issue of issues) {
    const path = [...issue.path];
    const userIndex = path.shift();
    const remainingPath = path.filter((p): p is string | number => typeof p !== "symbol");

    errorMessages.push({
      index: typeof userIndex === "symbol" ? undefined : userIndex,
      path: remainingPath,
      message: issue.message,
    });
  }

  return errorMessages;
};

/**
 * Helper function from string to boolean.
 * Only accepts "true", "false" in any casing. Rejects other values as validation errors.
 */
export const transformToBoolean = z.union([z.boolean(), z.string()]).transform((val, ctx) => {
  if (typeof val === "boolean") return val;

  const lowercaseVal = val.toLowerCase().trim();

  if (lowercaseVal === "true") {
    return true;
  }

  if (lowercaseVal === "false") {
    return false;
  }

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: `Invalid boolean string. Expected "true" or "false" (case insensitive), got "${val}"`,
  });

  return z.NEVER;
});

/**
 * Helper function to transform an empty string to null.
 */
export const transformEmptyStringToNull = z.string().transform((val) => {
  if (val === "") {
    return null;
  }
  return val;
});
// Function to convert a Date to a UTC Date
function convertDateToUTC(date: Date) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds()
    )
  );
}

// Zod schema to handle the input and convert to a UTC Date object
export const transformDateToUTC = z
  .union([z.string(), z.date()])
  .describe("Accepts a string or Date object and converts it to a UTC Date object.")
  .refine(
    (value) => {
      // Custom validation logic to ensure the input is a valid date
      let date: Date | undefined;
      if (typeof value === "string") {
        // If the input is a string, try to parse it into a Date object
        date = new Date(value);
      } else if (value instanceof Date) {
        // If the input is already a Date object, use it directly
        date = value;
      }
      // Check if the parsed date is valid
      return date && !Number.isNaN(date.getTime());
    },
    {
      message: "Invalid date format. Must be a valid date string or Date object.",
    }
  )
  .transform((value) => {
    // Transform the validated input into a UTC Date object
    let date: Date | undefined;
    if (typeof value === "string") {
      // Parse string input into a Date object

      date = new Date(value);
    } else if (value instanceof Date) {
      // Use the Date object directly
      date = value;
    }
    // Convert the Date object to UTC
    return date && convertDateToUTC(date);
  })
  .describe("Transforms a string or Date object to a UTC Date object.");

export const transformDateToUTCString = z.union([
  z.date().transform((date) => convertDateToUTC(date).toISOString()),
  z.string(),
]);
