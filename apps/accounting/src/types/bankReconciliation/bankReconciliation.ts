import { BankReconcileStatus } from "@repo/db/generated/prisma/enums.js";
import { BaseModelAttrWoCancel } from "../common.js";
import { IdValue } from "../global.js";
import { DrCrAmt } from "../reports/ledgerBalanceEngine.js";
import {
  LedgerBookRequestInput,
  voucherHeadResponseForLedgerBook,
} from "../reports/ledgerBook.js";
import {
  BankStatement,
  Prisma,
  Voucher,
} from "@repo/db/generated/prisma/client";

export interface BankLedgerBookRequestInput extends LedgerBookRequestInput {
  status: BankReconcileStatus;
}

export type VoucherLineResponseForBankLedgerBook =
  Prisma.VoucherLineGetPayload<{
    include: {
      voucher: true;
      bankMatches: {
        where: {
          isActive: true;
        };
        include: {
          bankStatementRow: true;
        };
      };
    };
  }>;

export interface BankLedgerBookRow
  extends Omit<VoucherLineResponseForBankLedgerBook, "voucher"> {
  voucher: voucherHeadResponseForLedgerBook;
  runningBalance: DrCrAmt;
}

export type BankLedgerBookResponse = {
  ledger: IdValue | null;
  openingBalance: DrCrAmt;
  rows: BankLedgerBookRow[];
  totals: DrCrAmt;
  closingBalance: DrCrAmt;
  balanceAsPerCompanyBooks: DrCrAmt;
  amountNotReflectedInBank: DrCrAmt;
  balanceAsPerBank: DrCrAmt;
};

export type ManualReconcileRow = {
  voucherLineId: number;
  bankClearedDate: string;
};

export interface ManualReconcileRequestInput {
  ledgerId: number;
  rows: ManualReconcileRow[];
}

// Bank Statement Import Types

export type BankStatementExcelBaseInput = {
  ledgerId: number;
  companyId: number;
  financialYearId: number;
  statementFrom: Date;
  statementTo: Date;
  remarks?: string | null;
  fileUrl: string;
};

export type BankStatementExcelRow = {
  "Transaction Date": string | Date;
  "Value Date": string | Date;
  "Transaction ID": string;
  "Cheque No": string;
  Description: string;
  "Dr/Cr": string;
  "Transaction Amount": string | number;
  "Voucher No"?: string;
  "Voucher Type"?: string;
  "Ledger Name"?: string;
  "Bank Name"?: string;
};

export type CreateOrUpdateBankStatementExcelCreateInput = Omit<
  Prisma.BankStatementExcelUncheckedCreateInput,
  "batchJobId"
>;

export type CreateOrUpdateBankStatementRowInput = Omit<
  Prisma.BankStatementRowCreateManyInput,
  BaseModelAttrWoCancel | "bankStatementId"
>;

export interface CreateOrUpdateBankStatementInput
  extends Omit<Prisma.BankStatementCreateManyInput, BaseModelAttrWoCancel> {
  statementRows: CreateOrUpdateBankStatementRowInput[];
}

// Bank Statement list Response for Bank Statement Row
export type BankStatementRowResponse = Prisma.BankStatementRowGetPayload<{
  include: {
    bankMatches: {
      where: {
        isActive: true;
      };
      include: {
        voucherLine: {
          include: {
            voucher: true;
          };
        };
      };
    };
  };
}>;

export type BankStatementRowWithBankStatement =
  Prisma.BankStatementRowGetPayload<{
    include: {
      bankStatement: true;
    };
  }>;

export type VoucherLineResponseForBankReconciliationMatch =
  Prisma.VoucherLineGetPayload<{
    include: {
      voucher: true;
    };
  }>;

export type VoucherLineResponseForBankReconciliationMatchDTO = Omit<
  VoucherLineResponseForBankReconciliationMatch,
  BaseModelAttrWoCancel | "voucher"
> & {
  voucher: Omit<Voucher, BaseModelAttrWoCancel>;
};

export type BankMatchResponseForBankStatementRowDTO = Omit<
  BankStatementRowResponse["bankMatches"][number],
  BaseModelAttrWoCancel | "voucherLineId" | "bankStatementRowId" | "voucherLine"
> & {
  voucherLine: VoucherLineResponseForBankReconciliationMatchDTO;
};

export type BankStatementRowDTO = Omit<
  BankStatementRowResponse,
  BaseModelAttrWoCancel | "bankMatches"
> & {
  // lastReconciledBy: IdValue | null;
  bankMatches: BankMatchResponseForBankStatementRowDTO[];
};

//-----------------------------
export interface BankStatementDTO
  extends Omit<BankStatement, BaseModelAttrWoCancel | "ledgerId"> {
  ledger: IdValue | null;
}

//Manual Reconcile with bank statement row
export type ManualBankReconcileWithBankStatementRow = {
  voucherLineId: number;
  bankStatementRowId: number;
  matchedAmount: number;
  bankReferenceNo?: string | null;
  bankTransactionDate: Date;
  clearedDate: Date;
  remarks?: string | null;
};
export interface ManualBankReconcileWithBankStatementInput {
  ledgerId: number;
  rows: ManualBankReconcileWithBankStatementRow[];
}

//Auto Reconcile with bank statement row
export type AutoMatchSuggestionInput = BankReconciliationSummaryRequestInput;

export interface AutoMatchSuggestionResponse {
  rows: AutoMatchSuggestionRow[];
}

export interface AutoMatchSuggestionRow {
  voucherLineId: number;
  bankStatementRowId: number;

  voucherLine: {
    id: number;
    voucherId: number;
    voucherNo: string;
    voucherType: string | null;
    voucherDate: string;
    drCr: "DR" | "CR";
    amount: number;
    transactionType: BankTransactionType | null;
    instrumentNo: string | null;
    instrumentDate: string | null;
    description: string | null;
    narration: string | null;
  };

  bankStatementRow: {
    id: number;
    transactionDate: string;
    valueDate: string | null;
    voucherNo?: string;
    voucherType?: string;
    drCr: "DR" | "CR";
    amount: number;
    transactionId: string | null;
    chequeNo: string | null;
    description: string | null;
  };
}

// Bank Reconciliation Summary
export type BankReconciliationSummaryRequestInput = {
  ledgerId: number;
  fromDate: Date;
  toDate: Date;
};

export type BankReconciliationSummaryResponse = {
  ledger: IdValue | null;
  fromDate: string;
  toDate: string;

  summary: {
    balanceAsPerCompanyBooks: number;

    availableOnlyInBooks: {
      addWithdrawals: {
        amount: number;
        count: number;
      };
      lessDeposits: {
        amount: number;
        count: number;
      };
      netEffect: number;
      count: number;
    };

    availableOnlyInBank: {
      addDeposits: {
        amount: number;
        count: number;
      };
      lessWithdrawals: {
        amount: number;
        count: number;
      };
      netEffect: number;
      count: number;
    };

    totalUnreconciledAmount: number;
    totalUnreconciledCount: number;
    expectedBankBalance: number;
    balanceAsPerBankStatement: number;
    difference: number;
  };
};

/**
 * changes types for dynamic statement format
 */

export type ExcelRow = Record<string, unknown>;

export type BankStatementExcelImportField =
  | "transactionDate"
  | "valueDate"
  | "transactionId"
  | "chequeNo"
  | "description"
  | "drCr"
  | "transactionAmount"
  | "debitAmount"
  | "creditAmount"
  | "voucherNo"
  | "voucherType"
  | "ledgerName"
  | "bankName";

export type BankStatementExcelAmountMode = "SINGLE" | "DEBIT_CREDIT";

export type BankStatementExcelFormatConfig = {
  amountMode?: BankStatementExcelAmountMode;
  dateFormats?: string[];
  columns: Partial<Record<BankStatementExcelImportField, string>>;
  drCrValues?: {
    DR?: string[];
    CR?: string[];
  };
};
