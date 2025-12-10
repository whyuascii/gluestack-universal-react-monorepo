import { z } from "zod";

/**
 * sortFieldSchema is a zod schema that validates a non-empty sort field name.
 */
const sortFieldSchema = z.string().refine((field) => field.length > 0, {
	message: "Field name cannot be empty.",
});

/**
 * parseSortSchema is a zod schema that validates and transforms a sort string
 * in the format "asc(fieldName)" or "desc(fieldName)".
 * It returns an object with the shape { field: string, sortOrder: number }.
 */
export const parseSortSchema = (sortString: string) => {
	if (typeof sortString !== "string") {
		return false;
	}

	const [order, field] = sortString.split("(");
	const sortOrder = order.toLowerCase() === "asc" ? 1 : -1;

	if (!field || field.slice(-1) !== ")") {
		return false;
	}
	const fieldName = field.slice(0, -1);

	if (!sortFieldSchema.safeParse(fieldName).success) {
		return false;
	}

	return { field: fieldName, sortOrder };
};

export type sortStringType =
	| {
			[field: string]: 1 | -1;
	  }
	| undefined;

/**
 * sortStringSchema is a zod schema that validates and transforms a sort string
 * containing multiple sort clauses separated by commas.
 * It returns a Record<string, number> object that maps field names to sort orders.
 */
export const sortStringSchema = z
	.string()
	.refine((sortString) => sortString.length > 0, {
		message: "Sort string cannot be empty.",
	})
	.optional()
	.transform((sortString) => {
		if (!sortString) {
			return undefined;
		}

		const sortMap: Record<string, 1 | -1> = {};

		sortString.split(",").map((sortClause) => {
			const parsedSortClause = parseSortSchema(sortClause);
			if (!parsedSortClause) {
				return undefined;
			}
			sortMap[parsedSortClause.field] = parsedSortClause.sortOrder as 1 | -1;
		});

		return sortMap;
	});

// Take a query param string transform it to an array of the same type.
export const transformStringToArray = <T extends z.ZodType<any, any>>(schema: T) => {
	return schema.transform((data) => {
		if (!Array.isArray(data)) {
			return [data];
		}
		return data;
	});
};

/**
 * Takes a string representation of a boolean and transforms it to a boolean. Case-insensitive.
 */
export const transformStringToBoolean = z.preprocess((val) => {
	if (typeof val === "string") {
		const lowerVal = val.toLowerCase();
		if (lowerVal === "true") return true;
		if (lowerVal === "false") return false;
	}
	return val;
}, z.boolean().optional());
