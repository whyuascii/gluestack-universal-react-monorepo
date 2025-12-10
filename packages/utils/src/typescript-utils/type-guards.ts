import { isValid, parseISO } from "date-fns";


export const isString = (value: unknown): value is string => {
	return typeof value === "string";
};

export const isBoolean = (value: unknown): value is boolean => {
	return typeof value === "boolean";
};

export const isArray = (value: unknown): value is unknown[] => {
	return Array.isArray(value);
};

export const isDate = (value: unknown): value is Date => {
	return value instanceof Date;
};

/**
 * The purpose of this function is to determine if the value arg is a valid
 * typescript Record.
 *
 * Note that arrays and null are javascript objects, but are not valid
 * records.
 */
export const isRecord = (value: unknown): value is Record<string, unknown> => {
	if (typeof value !== "object" || value === null || isArray(value)) {
		return false;
	}

	return true;
};

export const isValidISODate = (value: string): boolean => {
	return isValid(parseISO(value));
};

export const isValidJSONString = (value: string): boolean => {
	try {
		JSON.parse(value);
		return true;
	} catch (_e) {
		return false;
	}
};
