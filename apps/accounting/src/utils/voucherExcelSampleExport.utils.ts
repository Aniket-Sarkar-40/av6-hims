import { VoucherStatusForExcel } from "@/types/voucher/voucher.js";
import { BankTransactionType, DrCr } from "@repo/db/generated/prisma/enums.js";
import dayjs from "dayjs";

type VoucherExcelSampleRow = Record<string, string | number>;

const pickEnumValue = (
  enumObj: object,
  preferredValues: string[] = []
): string => {
  const values = Object.values(enumObj)
    .filter((value) => typeof value === "string" || typeof value === "number")
    .map(String);

  for (const preferredValue of preferredValues) {
    const matchedValue = values.find(
      (value) => value.toUpperCase() === preferredValue.toUpperCase()
    );

    if (matchedValue) return matchedValue;
  }

  return values[0] ?? "";
};

export const buildVoucherExcelSampleRow = (
  voucherTypeName: string
): VoucherExcelSampleRow => {
  const status = pickEnumValue(VoucherStatusForExcel, ["POSTED", "DRAFT"]);
  const dr = pickEnumValue(DrCr, ["DR", "DEBIT"]);
  const cr = pickEnumValue(DrCr, ["CR", "CREDIT"]);
  const transactionType = pickEnumValue(BankTransactionType, ["CHEQUE"]);
  const name = voucherTypeName.toUpperCase();

  const common: VoucherExcelSampleRow = {
    "Voucher Date": dayjs(new Date()).format("DD-MM-YYYY"),
    "Voucher Type": voucherTypeName,
    Status: status,
    Narration: `Sample ${voucherTypeName.toLowerCase()} voucher`,
  };

  switch (name) {
    case "CONTRA":
      return {
        ...common,
        "Ref Type": "",
        "Sub Ref Type": "",
        "Ref No": "",

        "Ledger 1": "Cash",
        "Ledger 1 Group": "Cash-in-Hand",
        "Ledger 1 Amount": 1000,
        "Ledger 1 Dr/Cr": dr,

        "Ledger 2": "State Bank of India",
        "Ledger 2 Group": "Bank Accounts",
        "Ledger 2 Amount": 1000,
        "Ledger 2 Dr/Cr": cr,
      };

    case "JOURNAL":
      return {
        ...common,
        "Ref Type": "Salary",
        "Sub Ref Type": "Employee Salary",
        "Ref No": "REF-001",

        "Ledger 1": "Salary Expense",
        "Ledger 1 Group": "Indirect Expenses",
        "Ledger 1 Amount": 1000,
        "Ledger 1 Dr/Cr": dr,

        "Ledger 2": "Salary Payable",
        "Ledger 2 Group": "Current Liabilities",
        "Ledger 2 Amount": 1000,
        "Ledger 2 Dr/Cr": cr,
      };

    case "SALES":
      return {
        ...common,
        "Ref Type": "PHARMACY_SELL",
        "Sub Ref Type": "WALK_IN",
        "Ref No": "SELL-001",

        "Party Ledger": "Walk-in Customer",

        "Ledger 1": "Walk-in Sales",
        "Ledger 1 Group": "Sales Accounts",
        "Ledger 1 Amount": 1000,
      };

    case "PURCHASE":
      return {
        ...common,

        "Ref Type": "INVENTORY_GRN",
        "Sub Ref Type": "",
        "Ref No": "INV-GRN-001",

        "Party Ledger": "XYZ Supplier",

        "Ledger 1": "Inventory Purchase",
        "Ledger 1 Group": "Purchase Accounts",
        "Ledger 1 Amount": 1000,
      };

    case "PAYMENT":
      return {
        ...common,
        "Ref Type": "INVENTORY_GRN_PAYMENT",
        "Sub Ref Type": "",
        "Ref No": "INV-GRN-001",

        "Party Ledger": "XYZ Supplier",
        "Party Ledger Group": "Sundry Creditors",

        "Ledger 1": "Cash",
        "Ledger 1 Group": "Cash-in-Hand",
        "Ledger 1 Amount": 1000,
      };

    case "RECEIPT":
      return {
        ...common,
        "Ref Type": "PHARMACY_SELL_PAYMENT",
        "Sub Ref Type": "WALK_IN",
        "Ref No": "SELL-001",

        "Party Ledger": "ABC Customer",
        "Party Ledger Group": "Sundry Debtors",

        "Ledger 1": "Cash",
        "Ledger 1 Group": "Cash-in-Hand",
        "Ledger 1 Amount": 1000,
      };

    case "BANK PAYMENT":
      return {
        ...common,

        "Ref Type": "INVENTORY_GRN_PAYMENT",
        "Sub Ref Type": "",
        "Ref No": "INV-GRN-002",

        "Party Ledger": "XYZ Supplier",
        "Party Ledger Group": "Sundry Creditors",

        "Ledger 1": "State Bank of India",
        "Ledger 1 Group": "Bank Accounts",
        "Ledger 1 Amount": 1000,
        "Ledger 1 Transaction Type": transactionType,
        "Ledger 1 Instrument No": "2567",
        "Ledger 1 Instrument Date": dayjs(new Date()).format("DD-MM-YYYY"),
      };

    case "CASH PAYMENT":
      return {
        ...common,

        "Party Ledger": "XYZ Supplier",
        "Party Ledger Group": "Sundry Creditors",

        "Ledger 1": "Cash",
        "Ledger 1 Group": "Cash-in-Hand",
        "Ledger 1 Amount": 1000,
      };

    default:
      return common;
  }
};
