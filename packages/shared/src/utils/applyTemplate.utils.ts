import { TableBlock, TableCell } from "av6-pdf-engine";

// ========================  PDF Template Resolvers V2  ========================
// type Primitive = string | number | boolean | null | undefined;
type Data = Record<string, unknown>;

function getValue(path: string, obj: unknown): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function resolveString(str: string, scope: Data): string {
  return str.replace(/{{(.*?)}}/g, (_, key: string) => {
    const value = getValue(key.trim(), scope);
    return value !== undefined && value !== null ? String(value) : "";
  });
}

function resolveCell(cell: TableCell, scope: Data): TableCell {
  const result: TableCell = { ...cell };

  (Object.keys(result) as (keyof TableCell)[]).forEach((key) => {
    const value = result[key];

    if (typeof value === "string") {
      result[key] = resolveString(value, scope) as never;
    }
  });

  return result;
}

function processTableBody(body: TableBlock["body"], data: Data): TableCell[][] {
  const result: TableCell[][] = [];

  for (const row of body) {
    // 🔹 Iterable row
    if (
      typeof row === "object" &&
      row !== null &&
      "isIterable" in row &&
      row.isIterable
    ) {
      const iterableKey = row.iterableKey;
      const items = getValue(iterableKey, data);

      if (Array.isArray(items)) {
        for (const item of items) {
          const scope: Data =
            item && typeof item === "object"
              ? { ...data, ...(item as Record<string, unknown>) }
              : data;

          result.push(row.content.map((cell) => resolveCell(cell, scope)));
        }
      }
      continue;
    }

    // 🔹 Normal row (array)
    if (Array.isArray(row)) {
      result.push(row.map((cell) => resolveCell(cell, data)));
      continue;
    }

    // 🔹 Non-iterable structured row
    if (
      typeof row === "object" &&
      row !== null &&
      "content" in row &&
      Array.isArray(row.content)
    ) {
      result.push(row.content.map((cell) => resolveCell(cell, data)));
    }
  }

  return result;
}

function deepResolve<T>(input: T, scope: Data): T {
  // 🔹 string
  if (typeof input === "string") {
    return resolveString(input, scope) as T;
  }

  // 🔹 array
  if (Array.isArray(input)) {
    return input.map((item) => deepResolve(item, scope)) as T;
  }

  // 🔹 object
  if (input && typeof input === "object") {
    const obj = input as Record<string, unknown>;

    // 🔥 Table handling
    if (obj.type === "table" && Array.isArray(obj.body)) {
      return {
        ...obj,
        body: processTableBody(obj.body as TableBlock["body"], scope),
      } as T;
    }

    // 🔥 Columns handling
    if (obj.type === "columns" && Array.isArray(obj.columns)) {
      return {
        ...obj,
        columns: obj.columns.map((col) => deepResolve(col, scope)),
      } as T;
    }

    // 🔥 keyValueGrid handling
    if (obj.type === "keyValueGrid" && Array.isArray(obj.columns)) {
      return {
        ...obj,
        columns: obj.columns.map((col) =>
          Array.isArray(col)
            ? col.map((item) => {
                if (
                  item &&
                  typeof item === "object" &&
                  "key" in item &&
                  "value" in item
                ) {
                  const kv = item as Record<string, unknown>;

                  return {
                    ...kv,
                    key:
                      typeof kv.key === "string"
                        ? resolveString(kv.key, scope)
                        : kv.key,
                    value:
                      typeof kv.value === "string"
                        ? resolveString(kv.value, scope)
                        : kv.value,
                  };
                }
                return item;
              })
            : col
        ),
      } as T;
    }

    const result: Record<string, unknown> = {};

    for (const key in obj) {
      result[key] = deepResolve(obj[key], scope);
    }

    return result as T;
  }

  // 🔹 primitive
  return input;
}

export function resolvePdfTemplate<T, D extends object>(
  template: T,
  data: D
): T {
  return deepResolve(template, data as Record<string, unknown>);
}
