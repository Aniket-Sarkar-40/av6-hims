import { BankStatementExcelRow } from "@/types/bankReconciliation/bankReconciliation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

dayjs.extend(customParseFormat);

export function validateBankStatementExcelHeaders(row: BankStatementExcelRow) {
  const requiredHeaders = [
    "Transaction Date",
    "Value Date",
    "Transaction ID",
    "Cheque No",
    "Description",
    "Dr/Cr",
    "Transaction Amount",
    "Voucher No",
    "Voucher Type",
    "Ledger Name",
    "Bank Name",
  ];

  for (const header of requiredHeaders) {
    if (!(header in row)) {
      throw new ErrorHandler(400, `Missing required column: ${header}`);
    }
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
