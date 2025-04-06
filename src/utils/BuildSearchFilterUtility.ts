/* eslint-disable @typescript-eslint/no-explicit-any */
export const buildSearchFilterUtilityCondition = (
  field: string,
  value: string
): Record<string, any> => {
  // Split the field by '.' into an array
  const nestedFields = field.split(".");

  // Create a recursive function to build nested conditions of any depth
  const buildNestedCondition = (
    fields: string[],
    currentIndex: number,
    value: string
  ): Record<string, any> => {
    if (currentIndex === fields.length - 1) {
      // Base case: we've reached the final field
      return {
        [fields[currentIndex]]: {
          contains: value,
          mode: "insensitive",
        },
      };
    } else {
      // Recursive case: build the next level of nesting
      return {
        [fields[currentIndex]]: buildNestedCondition(
          fields,
          currentIndex + 1,
          value
        ),
      };
    }
  };

  // Start the recursive building from the first field
  return buildNestedCondition(nestedFields, 0, value);
};
