import { DrCr, Prisma } from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel } from "../common.js";

export type CreateOrUpdateBatchJobInput = Omit<
  Prisma.BatchJobCreateManyInput,
  BaseModelAttrWoCancel
>;

export type CreateOrUpdateBatchJobDetailsInput = Omit<
  Prisma.BatchJobDetailsCreateManyInput,
  BaseModelAttrWoCancel
>;

export type CreateOrUpdateVoucherEntryExcelInput = Omit<
  Prisma.VoucherEntryExcelUncheckedCreateInput,
  "batchJobId"
>;

export type VoucherEntryExcelBaseInput = {
  voucherTypeId: number;
  ccId: number;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export type VoucherEntryExcelRow = {
  "Voucher Date": Date;
  "Voucher Type": string;
  "Ref Type"?: string;
  "Sub Ref Type"?: string;
  "Ref No"?: string;
  Status: string;
  Narration: string;
  "Party Ledger"?: string;
  "Party Ledger Group"?: string;

  [key: string]: any;
};

export type LedgerColumnMeta = {
  index: number;
  ledgerKey: string;
  groupKey: string;
  amountKey: string;
  drCrKey?: string;
  transactionType?: BankTransactionType;
  instrumentNo?: string;
  instrumentDate?: Date;
};

export type OtherLedger = {
  ledgerName: string;
  ledgerGroup?: string;
  amount: number;
  drCr?: DrCr;
  transactionType?: BankTransactionType;
  instrumentNo?: string;
  instrumentDate?: Date;
};
