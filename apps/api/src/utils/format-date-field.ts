import { format } from "date-fns";

export const formatDatesInObject = <T extends Record<string, unknown>>(obj: T) => {
  // empty result object to store the formatted fields
  const result: Record<string, unknown> = {};

  // Loop through each key in the original object and format the desired fields
  for (const key in obj) {
    // Getting Value to check if it is a date or obj
    const value = obj[key];
    // If date format it
    if (value instanceof Date) {
      result[key] = format(value, "yyyy-MM-dd");
    } else if (typeof value === "object" && value !== null) {
      if (Array.isArray(value)) {
        result[key] = value.map((item) => {
          if (typeof item === "object") {
            return formatDatesInObject(item);
          }
          return item;
        });
      } else {
        // If object format the dates in the object
        result[key] = formatDatesInObject(value as Record<string, unknown>);
      }
    } else {
      // If not a date or object just add it to the result
      result[key] = value as T[keyof T];
    }
  }

  // Return the result object and make sure its the same type as the original object
  return result as T;
};
