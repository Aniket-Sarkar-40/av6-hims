import { getCompanySettings } from "@/repository/settings/settings.repository.js";
import { COMPANY_LOGO_BASE_URL } from "@repo/shared";
import { TableBlock, TableCell } from "av6-pdf-engine";
import { convertDatesToYMD } from "@repo/shared/utils/date.utils.js";
// ========================  PDF Template Resolvers V2  ========================

type Data = Record<string, unknown>;

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function getValue(path: string, obj: unknown): unknown {
  if (!path) return undefined;

  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc === null || acc === undefined) {
      return undefined;
    }

    if (typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }

    return undefined;
  }, obj);
}

function resolveString(str: string, scope: Data): string {
  return str.replace(/{{(.*?)}}/g, (_, key: string) => {
    const value = getValue(key.trim(), scope);

    if (value === undefined || value === null) {
      return "";
    }

    return String(value);
  });
}

function resolveTableRowContent(
  content: TableCell[],
  scope: Data
): TableCell[] {
  return content.map((cell) => deepResolve(cell, scope));
}

function processTableBody(body: TableBlock["body"], data: Data): TableCell[][] {
  const result: TableCell[][] = [];

  for (const row of body) {
    // normal array row
    if (Array.isArray(row)) {
      result.push(resolveTableRowContent(row, data));
      continue;
    }

    if (!isObjectRecord(row)) {
      continue;
    }

    const rowContent = row.content;

    if (!Array.isArray(rowContent)) {
      continue;
    }

    // iterable row
    if (row.isIterable) {
      const iterableKey = String(row.iterableKey || "");
      const items = getValue(iterableKey, data);

      if (!Array.isArray(items)) {
        continue;
      }

      for (const item of items) {
        const itemScope: Data = isObjectRecord(item)
          ? {
              ...data,
              ...item,
            }
          : {
              ...data,
              value: item,
            };

        result.push(
          resolveTableRowContent(rowContent as TableCell[], itemScope)
        );
      }

      continue;
    }

    // non-iterable structured row
    result.push(resolveTableRowContent(rowContent as TableCell[], data));
  }

  return result;
}

function deepResolve<T>(input: T, scope: Data): T {
  // string
  if (typeof input === "string") {
    return resolveString(input, scope) as T;
  }

  // array
  if (Array.isArray(input)) {
    return input.map((item) => deepResolve(item, scope)) as T;
  }

  // object
  if (input && typeof input === "object") {
    const obj = input as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const key in obj) {
      const value = obj[key];

      // special table body handling
      if (obj.type === "table" && key === "body" && Array.isArray(value)) {
        result[key] = processTableBody(value as TableBlock["body"], scope);
      } else {
        result[key] = deepResolve(value, scope);
      }
    }

    return result as T;
  }

  // primitive
  return input;
}

export async function resolvePdfTemplate<T, D extends object>(
  template: T,
  data: D
): Promise<T> {
  const companySettings = (await getCompanySettings()) ?? null;
  if (companySettings)
    companySettings.miniLogo = `${COMPANY_LOGO_BASE_URL}${companySettings?.miniLogo}`;
  return deepResolve(
    template,
    convertDatesToYMD({
      ...data,
      companySettings,
    })
  );
}
