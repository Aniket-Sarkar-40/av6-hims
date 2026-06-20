export const serializeBigInt = <T>(data: T): T => {
  return JSON.parse(
    JSON.stringify(data, (_, value) => {
      if (typeof value === "bigint") {
        return Number(value);
      }

      return value;
    })
  );
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (Object.prototype.toString.call(value) !== "[object Object]") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

export function convertBigIntToString(obj: any): any {
  if (typeof obj === "bigint") {
    return obj.toString();
  }

  // Preserve Date values (serialize to ISO string)
  if (obj instanceof Date) {
    return obj.toISOString(); // or: return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => convertBigIntToString(item));
  }

  if (obj && isPlainObject(obj)) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, convertBigIntToString(v)])
    );
  }

  // Leave everything else as-is (Map, Set, RegExp, class instances, etc.)
  return obj;
}
