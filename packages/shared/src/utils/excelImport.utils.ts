import * as XLSX from "xlsx";

export const toBoolean = (value: unknown, defaultValue = false): boolean => {
  if (value === undefined || value === null || value === "")
    return defaultValue;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "y"].includes(normalized)) return true;
    if (["false", "0", "no", "n"].includes(normalized)) return false;
  }
  return defaultValue;
};

export const toStringOrNull = (value: unknown): string | null => {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str.length ? str : null;
};

export const toRequiredString = (
  value: unknown,
  fieldName: string,
  rowNo: number,
): string => {
  const str = toStringOrNull(value);
  if (!str) {
    throw new Error(`Row ${rowNo}: ${fieldName} is required`);
  }
  return str;
};

export const toNumberOrNull = (value: unknown): number | null => {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

export const toIntOrNull = (value: unknown): number | null => {
  const num = toNumberOrNull(value);
  if (num === null) return null;
  return Number.isInteger(num) ? num : null;
};

/** Converts Excel serial dates, Date objects, and date strings to JS Date. */
export const excelDateToJSDate = (value: unknown): Date | null => {
  if (value === undefined || value === null || value === "") return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      return new Date(parsed.y, parsed.m - 1, parsed.d);
    }
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
};

export const normalizeVendorExcelHeader = (header: string) => {
  return header
    .replace(/\s*[＊*]\s*$/u, "")
    .replace(
      /\s*\((required|optional|conditional|required if section is used|required if section used)\)\s*$/i,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();
};

export const normalizeVendorExcelRowHeaders = (
  row: Record<string, unknown>,
) => {
  return Object.entries(row).reduce<Record<string, unknown>>(
    (acc, [key, value]) => {
      acc[normalizeVendorExcelHeader(key)] = value;
      return acc;
    },
    {},
  );
};
