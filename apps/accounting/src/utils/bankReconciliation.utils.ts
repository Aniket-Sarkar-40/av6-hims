import {
  BankStatementExcelFormatConfig,
  BankStatementExcelImportField,
  ExcelRow,
} from "@/types/bankReconciliation/bankReconciliation.js";
import {
  BankStatementFormatMapping,
  DrCr,
} from "@repo/db/generated/prisma/client";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

dayjs.extend(customParseFormat);

export function validateBankStatementExcelHeaders(params: {
  headers: string[];
  statementFormat: BankStatementFormatMapping;
}) {
  const { headers, statementFormat } = params;
  const config = getExcelFormatConfig(statementFormat.excelFormat);

  const requiredHeaders = Object.values(config.columns);

  const normalizedExcelHeaders = new Set(
    headers.map((header) => normalizeHeader(header))
  );

  const missingHeaders = requiredHeaders.filter((requiredHeader) => {
    return !normalizedExcelHeaders.has(normalizeHeader(requiredHeader));
  });

  if (missingHeaders.length > 0) {
    throw new ErrorHandler(
      400,
      `Missing required columns: ${missingHeaders.join(", ")}`
    );
  }
}

export type BankMovement = "IN" | "OUT";

export const getBankMovementFromVoucherLineDrCr = (
  drCr: "DR" | "CR"
): BankMovement => {
  return drCr === "DR" ? "IN" : "OUT";
};

export const getBankMovementFromStatementRowDrCr = (
  drCr: "DR" | "CR"
): BankMovement => {
  return drCr === "CR" ? "IN" : "OUT";
};
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

/**
 * changes utils for dynamic statement format
 */

const DEFAULT_DR_VALUES = [
  "DR",
  "D",
  "DEBIT",
  "WITHDRAWAL",
  "WITHDRAW",
  "PAYMENT",
];
const DEFAULT_CR_VALUES = ["CR", "C", "CREDIT", "DEPOSIT", "RECEIPT"];
const DEFAULT_DATE_FORMATS = [
  "YYYY-MM-DD",
  "DD-MM-YYYY",
  "MM-DD-YYYY",
  "DD/MM/YYYY",
  "MM/DD/YYYY",
];
export const isRecord = (value: unknown): value is ExcelRow => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

export const isBlank = (value: unknown): boolean => {
  return value === null || value === undefined || String(value).trim() === "";
};

export const normalizeHeader = (value: string): string => {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
};

export const getExcelFormatConfig = (
  excelFormat: unknown
): BankStatementExcelFormatConfig => {
  if (!isRecord(excelFormat)) {
    throw new ErrorHandler(
      400,
      "Invalid bank statement excel format configuration"
    );
  }

  const config = excelFormat as BankStatementExcelFormatConfig;

  if (!config.columns || !isRecord(config.columns)) {
    throw new ErrorHandler(
      400,
      "Invalid bank statement excel columns configuration"
    );
  }

  return config;
};

export const getRowValueByHeader = (
  row: ExcelRow,
  headerName?: string | null
): unknown => {
  if (!headerName) return null;

  if (Object.prototype.hasOwnProperty.call(row, headerName)) {
    return row[headerName];
  }

  const normalizedHeaderName = normalizeHeader(headerName);

  const matchedEntry = Object.entries(row).find(([key]) => {
    return normalizeHeader(key) === normalizedHeaderName;
  });

  return matchedEntry?.[1] ?? null;
};

export const getMappedValue = (
  row: ExcelRow,
  config: BankStatementExcelFormatConfig,
  field: BankStatementExcelImportField
): unknown => {
  return getRowValueByHeader(row, config.columns[field]);
};

export const getRequiredMappedValue = (params: {
  row: ExcelRow;
  config: BankStatementExcelFormatConfig;
  field: BankStatementExcelImportField;
  rowNo: number;
  label: string;
}): unknown => {
  const value = getMappedValue(params.row, params.config, params.field);

  if (isBlank(value)) {
    throw new ErrorHandler(
      400,
      `Row ${params.rowNo}: ${params.label} is required`
    );
  }

  return value;
};

export const parseStringOrNull = (value: unknown): string | null => {
  if (isBlank(value)) return null;
  return String(value).trim();
};

export const parseDateOrNull = (params: {
  value: unknown;
  rowNo: number;
  label: string;
  required?: boolean;
  dateFormats?: string[];
}) => {
  const {
    value,
    rowNo,
    label,
    required = false,
    dateFormats = DEFAULT_DATE_FORMATS,
  } = params;

  if (isBlank(value)) {
    if (required) {
      throw new ErrorHandler(400, `Row ${rowNo}: ${label} is required`);
    }

    return null;
  }

  if (value instanceof Date) {
    const parsedDate = dayjs(value);

    if (!parsedDate.isValid()) {
      throw new ErrorHandler(400, `Row ${rowNo}: Invalid ${label}`);
    }

    return parsedDate.format("YYYY-MM-DD");
  }

  if (typeof value === "number") {
    const parsedDate = dayjs(
      new Date(Math.round((value - 25569) * 86400 * 1000))
    );

    if (!parsedDate.isValid()) {
      throw new ErrorHandler(400, `Row ${rowNo}: Invalid ${label}`);
    }

    return parsedDate.format("YYYY-MM-DD");
  }

  const rawDate = String(value).trim();

  let parsedDate = dayjs(rawDate, dateFormats, true);

  if (!parsedDate.isValid()) {
    parsedDate = dayjs(rawDate);
  }

  if (!parsedDate.isValid()) {
    throw new ErrorHandler(400, `Row ${rowNo}: Invalid ${label}`);
  }

  return parsedDate.format("YYYY-MM-DD");
};

export const parseAmountOrNull = (params: {
  value: unknown;
  rowNo: number;
  label: string;
  required?: boolean;
}): number | null => {
  const { value, rowNo, label, required = false } = params;

  if (isBlank(value)) {
    if (required) {
      throw new ErrorHandler(400, `Row ${rowNo}: ${label} is required`);
    }

    return null;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new ErrorHandler(400, `Row ${rowNo}: Invalid ${label}`);
    }

    return value;
  }

  const rawValue = String(value).trim();
  const isNegativeByBracket =
    rawValue.startsWith("(") && rawValue.endsWith(")");

  const cleanValue = rawValue
    .replace(/[₹$,]/g, "")
    .replace(/\s/g, "")
    .replace(/[()]/g, "")
    .replace(/[^0-9.-]/g, "");

  const parsedAmount = Number(cleanValue);

  if (!Number.isFinite(parsedAmount)) {
    throw new ErrorHandler(400, `Row ${rowNo}: Invalid ${label}`);
  }

  return isNegativeByBracket ? -Math.abs(parsedAmount) : parsedAmount;
};

export const parseDrCr = (params: {
  value: unknown;
  amount: number;
  rowNo: number;
  config: BankStatementExcelFormatConfig;
}): DrCr => {
  const { value, amount, rowNo, config } = params;

  const normalizedValue = String(value ?? "")
    .trim()
    .toUpperCase();

  const drValues = [...DEFAULT_DR_VALUES, ...(config.drCrValues?.DR ?? [])].map(
    (item) => item.toUpperCase()
  );

  const crValues = [...DEFAULT_CR_VALUES, ...(config.drCrValues?.CR ?? [])].map(
    (item) => item.toUpperCase()
  );

  if (drValues.includes(normalizedValue)) {
    return DrCr.DR;
  }

  if (crValues.includes(normalizedValue)) {
    return DrCr.CR;
  }

  if (amount < 0) {
    return DrCr.DR;
  }

  if (amount > 0) {
    return DrCr.CR;
  }

  throw new ErrorHandler(400, `Row ${rowNo}: Invalid Dr/Cr value`);
};

export const getAmountAndDrCr = (params: {
  row: ExcelRow;
  config: BankStatementExcelFormatConfig;
  rowNo: number;
}): {
  transactionAmount: number;
  drCr: DrCr;
} => {
  const { row, config, rowNo } = params;

  const amountMode = config.amountMode ?? "SINGLE";

  if (amountMode === "DEBIT_CREDIT") {
    const debitAmount = parseAmountOrNull({
      value: getMappedValue(row, config, "debitAmount"),
      rowNo,
      label: "Debit Amount",
    });

    const creditAmount = parseAmountOrNull({
      value: getMappedValue(row, config, "creditAmount"),
      rowNo,
      label: "Credit Amount",
    });

    const hasDebitAmount = debitAmount !== null && debitAmount !== 0;
    const hasCreditAmount = creditAmount !== null && creditAmount !== 0;

    if (hasDebitAmount && hasCreditAmount) {
      throw new ErrorHandler(
        400,
        `Row ${rowNo}: Both debit and credit amount cannot be present`
      );
    }

    if (!hasDebitAmount && !hasCreditAmount) {
      throw new ErrorHandler(
        400,
        `Row ${rowNo}: Either debit or credit amount is required`
      );
    }

    if (hasDebitAmount) {
      return {
        drCr: DrCr.DR,
        transactionAmount: Math.abs(Number(debitAmount)),
      };
    }

    return {
      drCr: DrCr.CR,
      transactionAmount: Math.abs(Number(creditAmount)),
    };
  }

  const amount = parseAmountOrNull({
    value: getRequiredMappedValue({
      row,
      config,
      field: "transactionAmount",
      rowNo,
      label: "Transaction Amount",
    }),
    rowNo,
    label: "Transaction Amount",
    required: true,
  });

  const drCr = parseDrCr({
    value: getMappedValue(row, config, "drCr"),
    amount: Number(amount),
    rowNo,
    config,
  });

  return {
    drCr,
    transactionAmount: Math.abs(Number(amount)),
  };
};
