import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const PRIMARY_CATEGORIES = new Set<string>([
  "ASSET",
  "LIABILITY",
  "INCOME",
  "EXPENSE",
]);
export const REPORT_TYPES = new Set<string>(["BALANCE_SHEET", "PROFIT_LOSS"]);
export const NATURES = new Set<string>(["DEBIT", "CREDIT"]);
export const LEDGER_TYPES = new Set<string>([
  "GENERAL",
  "CUSTOMER",
  "SUPPLIER",
  "BANK",
  "CASH",
  "TAX",
]);
export const GST_TYPES = new Set<string>([
  "NA",
  "REGISTERED",
  "UNREGISTERED",
  "COMPOSITION",
  "SEZ",
  "EXPORT",
  "OTHER",
]);
export const DR_CR = new Set<string>(["DR", "CR"]);

export const parseOptionalString = (value: unknown): string | null => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
};

export const parseOptionalBoolean = (value: unknown): boolean | null => {
  if (value === undefined || value === null || String(value).trim() === "")
    return null;
  const normalized = String(value).trim().toLowerCase();
  if (["true", "yes", "y", "1"].includes(normalized)) return true;
  if (["false", "no", "n", "0"].includes(normalized)) return false;
  throw new ErrorHandler(400, `Invalid boolean value: ${value}`);
};

export const parseEnum = <T extends string>(
  value: unknown,
  allowed: Set<string>,
  fieldName: string
): T | null => {
  const parsed = parseOptionalString(value);
  if (!parsed) return null;
  const normalized = parsed.toUpperCase().replace(/\s+/g, "_");
  if (!allowed.has(normalized)) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_VALUE", fieldName)
    );
  }
  return normalized as T;
};

export const parseOptionalDecimal = (
  value: unknown,
  fieldName = "Amount"
): number | null => {
  const parsed = parseOptionalString(value);
  if (!parsed) return null;
  const num = Number(parsed);
  if (Number.isNaN(num)) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_VALUE", fieldName)
    );
  }
  return num;
};

type GroupExcelSampleRow = Record<string, string | number | boolean>;

export const buildGroupExcelSampleRows = (): GroupExcelSampleRow[] => [
  {
    Name: "Sundry Debtors",
    Alias: "SD",
    "Is Primary Group": "NO",
    "Parent Group Name": "Current Assets",
    "Primary Category": "",
    "Report Type": "",
    Nature: "",
    "Affects Gross Profit": "",
  },

  {
    Name: "Sales Accounts",
    Alias: "SA",
    "Is Primary Group": "YES",
    "Parent Group Name": "",
    "Primary Category": "INCOME",
    "Report Type": "PROFIT_LOSS",
    Nature: "CREDIT",
    "Affects Gross Profit": "YES",
  },
  {
    Name: "Purchase Accounts",
    Alias: "PA",
    "Is Primary Group": "YES",
    "Parent Group Name": "",
    "Primary Category": "EXPENSE",
    "Report Type": "PROFIT_LOSS",
    Nature: "DEBIT",
    "Affects Gross Profit": "YES",
  },
];

type LedgerExcelSampleRow = Record<string, string | number | boolean>;

export const buildLedgerExcelSampleRows = (): LedgerExcelSampleRow[] => [
  {
    Name: "ABC Customer",
    "Group Name": "Sundry Debtors",
    Alias: "ABC",
    "Ledger Type": "CUSTOMER",
    "Bank Account": "NO",
    "Cash Account": "NO",
    "Bank Name": "",
    "Bank IFSC": "",
    "Bank Account No": "",
    "UPI Id": "",
    "Contact Name": "John Doe",
    Phone: "9876543210",
    Email: "john@example.com",
    Address: "",
    "TIN Type": "REGISTERED",
    "TIN Number": "29ABCDE1234F1Z5",
    "Place of Supply State": "",
    "Currency Code": "",
  },
  {
    Name: "HDFC Bank",
    "Group Name": "Bank Accounts",
    Alias: "",
    "Ledger Type": "BANK",
    "Bank Account": "YES",
    "Cash Account": "NO",
    "Bank Name": "HDFC Bank",
    "Bank IFSC": "HDFC0001234",
    "Bank Account No": "1234567890",
    "UPI Id": "",
    "Contact Name": "",
    Phone: "",
    Email: "",
    Address: "",
    "TIN Type": "NA",
    "TIN Number": "",
    "Place of Supply State": "",
    "Currency Code": "",
  },
];
