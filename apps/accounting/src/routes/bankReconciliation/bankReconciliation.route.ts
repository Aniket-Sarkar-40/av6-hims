import {
  getBankAutoSuggestionsController,
  getBankReconciliationSummaryController,
  getUnReconciledBankLedgerBookController,
  manualBankReconcileWithBankStatementController,
  manualReconcileVoucherLinesController,
  uploadBankStatementExcelController,
} from "@/controllers/bankReconciliation/bankReconciliation.controller.js";
import {
  validateBankReconciliationSummaryRequestInput,
  validateBankStatementExcelBaseInput,
  validateFetchUnReconciledBankLedgerBookRequestInput,
  validateManualBankReconcileWithBankStatementRequestInput,
  validateManualReconcileVoucherLinesRequestInput,
} from "@/validations/request/bankReconciliation/bankReconciliation.validation.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { createUploadMiddleware } from "@repo/platform/middlewares/imageUpload.middleware.js";
import { uploadToHetzner } from "@repo/platform/middlewares/s3bucket.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const bankReconciliationRouter: Router = Router();

bankReconciliationRouter.post(
  "/un-reconciled-bank-voucher-lines",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "UNRECONCILED_BANK_VOUCHER_LINES", "VIEW")),
  validateFetchUnReconciledBankLedgerBookRequestInput,
  getUnReconciledBankLedgerBookController,
);

bankReconciliationRouter.post(
  "/manual-reconcile",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "MANUAL_RECONCILE", "CREATE")),
  validateManualReconcileVoucherLinesRequestInput,
  manualReconcileVoucherLinesController,
);

bankReconciliationRouter.post(
  "/upload-bank-statement",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "BANK_STATEMENT", "CREATE")),
  createUploadMiddleware("excelFile"),
  uploadToHetzner("excel"),
  validateBankStatementExcelBaseInput,
  uploadBankStatementExcelController,
);

bankReconciliationRouter.post(
  "/manual-bank-reconcile",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "MANUAL_BANK_RECONCILE", "CREATE")),
  validateManualBankReconcileWithBankStatementRequestInput,
  manualBankReconcileWithBankStatementController,
);

bankReconciliationRouter.post(
  "/summary",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "BANK_RECONCILIATION_SUMMARY", "VIEW")),
  validateBankReconciliationSummaryRequestInput,
  getBankReconciliationSummaryController,
);

bankReconciliationRouter.post(
  "/auto-suggestions",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "BANK_AUTO_SUGGESTIONS", "VIEW")),
  validateBankReconciliationSummaryRequestInput,
  getBankAutoSuggestionsController,
);
