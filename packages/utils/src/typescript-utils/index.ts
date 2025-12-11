export * from "./type-guards";
/**
 * ts utility type to set some properties of an object to optional
 */
export type PartiallyOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * ts utility type to set some properties of an object to required
 */
export type PartiallyRequired<T, K extends keyof T> = Partial<T> & Required<Pick<T, K>>;

/**
 * ts utility type to set some properties of an object to nullable
 */
export type PartiallyNullable<T, K extends keyof T> = Omit<T, K> & { [P in K]: T[P] | null };

/**
 * ts utility type to remove nullability from some properties of an object
 */
export type RemoveNullable<T, K extends keyof T> = Omit<T, K> & { [P in K]: NonNullable<T[P]> };

/**
 * ts utility type to ensure a type cannot be undefined
 */
export type NonUndefined<T> = T extends undefined ? never : T;

type Primitive = string | number | boolean | null | undefined;

/**
 * Infers an enum of keys including paths to nested fields based on the structure of the model,
 * looking one additional level deep only for specified top-level keys.
 * @template ObjectType The type of the object to generate keys for.
 * @template NestedKeys A union type of top-level keys to nest.
 */
export type NestedKeyOf<ObjectType extends object, NestedKeys extends keyof ObjectType = never> = {
  [Key in keyof ObjectType & (string | number)]: Key extends NestedKeys
    ? ObjectType[Key] extends Primitive
      ? `${Key}`
      : ObjectType[Key] extends (infer ArrayType)[]
        ? ArrayType extends object
          ? `${Key}` | `${Key}.${keyof ArrayType & (string | number)}`
          : `${Key}`
        : ObjectType[Key] extends object
          ? `${Key}` | `${Key}.${keyof ObjectType[Key] & (string | number)}`
          : `${Key}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];
