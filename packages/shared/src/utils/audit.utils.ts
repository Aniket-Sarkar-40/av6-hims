export interface CreateTransaction {
  field: string;
  changedFrom?: string | null;
  changedTo?: string | null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function isValidDate(value: unknown): boolean {
  if (value instanceof Date) return !isNaN(value.getTime());

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return !isNaN(parsed.getTime());
  }
  return false;
}

function flattenObject(
  obj: Record<string, any>,
  parentKey: string = "",
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key of Object.keys(obj)) {
    const raw = obj[key];
    const newKey = parentKey ? `${parentKey}_${key}` : key;

    if (typeof raw !== "number" && isValidDate(raw)) {
      const date = raw instanceof Date ? raw : new Date(raw);
      result[newKey] = date.toISOString().split("T")[0];
      continue;
    }

    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      Object.assign(result, flattenObject(raw, newKey));
      continue;
    }

    result[newKey] = raw;
  }

  return result;
}

export function findDifferences<T extends Record<string, any>>(
  obj1: T,
  obj2: T,
): CreateTransaction[] {
  const flatObj1 = flattenObject(obj1);
  const flatObj2 = flattenObject(obj2);

  const differences: CreateTransaction[] = [];
  const allKeys = new Set([...Object.keys(flatObj1)]);

  allKeys.forEach((key) => {
    if (flatObj1[key] !== flatObj2[key]) {
      differences.push({
        field: key.replace(/_/g, " "),
        changedFrom:
          typeof flatObj1[key] !== "string"
            ? JSON.stringify(flatObj1[key])
            : flatObj1[key],
        changedTo:
          typeof flatObj2[key] !== "string"
            ? JSON.stringify(flatObj2[key])
            : flatObj2[key],
      });
    }
  });

  return differences;
}

export const toManagerIdsStr = (ids: number[]) =>
  [...ids].sort((a, b) => a - b).join(",");
