import {
  BankReconciliationSummaryRequestInput,
  BankStatementExcelBaseInput,
  ManualBankReconcileWithBankStatementInput,
  ManualBankReconcileWithBankStatementRow,
  ManualReconcileRequestInput,
  ManualReconcileRow,
} from "@/types/bankReconciliation/bankReconciliation.js";
import Joi from "joi";
import { ledgerBookRequestInputSchema } from "../report/report.validation.js";
import { BankReconcileStatus } from "@repo/db/generated/prisma/enums.js";
import {
  arrayRequired,
  dateRequired,
  enumRequired,
  idRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

export const fetchUnReconciledBankLedgerBookRequestInputSchema =
  ledgerBookRequestInputSchema.keys({
    status: enumRequired("Status", BankReconcileStatus),
  });

export const manualReconcileVoucherLineSchema = Joi.object<ManualReconcileRow>({
  voucherLineId: idRequired("Voucher Line Id"),
  bankClearedDate: dateRequired("Bank Cleared Date"),
});

export const manualReconcileVoucherLinesRequestInputSchema =
  Joi.object<ManualReconcileRequestInput>({
    ledgerId: idRequired("Ledger Id"),
    rows: arrayRequired("Rows", manualReconcileVoucherLineSchema, 1)
      .custom((value, helpers) => {
        const rows = value as ManualReconcileRow[];
        const uniqueVoucherLineIds = new Set(rows.map((r) => r.voucherLineId));
        if (uniqueVoucherLineIds.size !== rows.length) {
          return helpers.error("array.duplicate");
        }
        return value;
      })
      .messages({
        "array.duplicate": "Voucher Line Id must be unique",
      }),
  });

export const bankStatementExcelBaseInputSchema =
  Joi.object<BankStatementExcelBaseInput>({
    ledgerId: idRequired("Ledger Id"),
    companyId: idRequired("Company Id"),
    financialYearId: idRequired("Financial Year Id"),
    statementFrom: dateRequired("Statement From"),
    statementTo: dateRequired("Statement To"),
    remarks: strOptional("Remarks"),
    fileUrl: strRequired("File Url"),
  });

export const manualBankReconcileWithBankStatementRowSchema =
  Joi.object<ManualBankReconcileWithBankStatementRow>({
    voucherLineId: idRequired("Voucher Line Id"),
    bankStatementRowId: idRequired("Bank Statement Row Id"),
    remarks: strOptional("Remarks"),
  });
export const manualBankReconcileWithBankStatementInputSchema =
  Joi.object<ManualBankReconcileWithBankStatementInput>({
    ledgerId: idRequired("Ledger Id"),
    rows: arrayRequired(
      "Rows",
      manualBankReconcileWithBankStatementRowSchema,
      1
    )
      .custom((value, helpers) => {
        const rows = value as ManualBankReconcileWithBankStatementRow[];
        const uniqueVoucherLineIds = new Set(rows.map((r) => r.voucherLineId));
        if (uniqueVoucherLineIds.size !== rows.length) {
          return helpers.error("array.duplicate");
        }
        return value;
      })
      .messages({
        "array.duplicate": "Voucher Line Id must be unique",
      }),
  });
export const bankReconciliationSummaryRequestInputSchema =
  Joi.object<BankReconciliationSummaryRequestInput>({
    ledgerId: idRequired("Ledger Id"),
    fromDate: dateRequired("From Date"),
    toDate: dateRequired("To Date"),
  });
export const validateFetchUnReconciledBankLedgerBookRequestInput =
  validationHandler({
    schema: fetchUnReconciledBankLedgerBookRequestInputSchema,
    path: "body",
  });

export const validateManualReconcileVoucherLinesRequestInput =
  validationHandler({
    schema: manualReconcileVoucherLinesRequestInputSchema,
    path: "body",
  });

export const validateBankStatementExcelBaseInput = validationHandler({
  schema: bankStatementExcelBaseInputSchema,
  path: "body",
  type: "FORMDATA",
  imgAttr: "fileUrl",
});

export const validateManualBankReconcileWithBankStatementRequestInput =
  validationHandler({
    schema: manualBankReconcileWithBankStatementInputSchema,
    path: "body",
  });

export const validateBankReconciliationSummaryRequestInput = validationHandler({
  schema: bankReconciliationSummaryRequestInputSchema,
  path: "body",
});
