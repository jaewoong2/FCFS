/**
 * Returns a new object containing only the keys from the expected object, with values from the actual object.
 * If a key in the expected object is not found in the actual object, it is skipped.
 *
 * @param actual - The actual object to extract values from.
 * @param expected - The expected object whose keys define the structure of the result.
 * @returns A new object with only the keys present in the expected object.
 */
export function filterObjectByExpectedKeys<
  T extends object,
  U extends Partial<T>,
>(actual: T, expected: U): Partial<T> {
  const result: Partial<T> = {};

  Object.keys(expected).forEach((key) => {
    if (key in actual) {
      result[key as keyof T] = actual[key as keyof T];
    }
  });

  return result;
}
