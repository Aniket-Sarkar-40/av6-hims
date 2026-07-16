import { IdValue } from "../global.js";
import { DrCrAmt } from "./ledgerBalanceEngine.js";
import { BaseModelAttrWoCancel } from "../common.js";
import {
  Currency,
  Ledger,
  Prisma,
  Voucher,
} from "@repo/db/generated/prisma/client";

export type VoucherLineResponseForLedgerBook = Prisma.VoucherLineGetPayload<{
  include: {
    voucher: true;
  };
}>;

export interface voucherHeadResponseForLedgerBook
  extends Omit<Voucher, BaseModelAttrWoCancel | "voucherTypeId"> {
  voucherType: IdValue | null;
  createdBy: IdValue | null;
  updatedBy: IdValue | null;
}
export interface LedgerBookRow
  extends Omit<VoucherLineResponseForLedgerBook, "voucher"> {
  voucher: voucherHeadResponseForLedgerBook;
  currency: Currency | null;
  runningBalance: DrCrAmt; //the balance of the ledger after applying this line
}

export interface VirtualRow {
  id: number;
  value: string;
  amount: DrCrAmt;
}

export type LedgerBookResponse = {
  ledger: Pick<Ledger, "id" | "name" | "isBankAccount"> | null;
  openingBalance: DrCrAmt; // opening balance as fromDate
  rows: LedgerBookRow[]; //list for the voucher lines between fromDate and toDate.(along with voucher header data and a computed running balance.)
  virtualRow?: VirtualRow | null;
  totals: DrCrAmt; //This is the sum of all DR and CR amounts shown in rows (only for the report period).
  closingBalance: DrCrAmt; //This is the balance as on toDate end, after applying all rows to the opening.
};

export type LedgerBookRequestInput = {
  companyId: number;
  financialYearId: number;
  ledgerId: number;
  fromDate: Date;
  toDate: Date;
  ccId?: number;
};

export interface LedgerBookExcelRequestInput extends LedgerBookRequestInput {
  showNarration: boolean;
  showCreatedBy: boolean;
  showUpdatedBy: boolean;
}
