import {
  excelBalanceSheetReport,
  excelBalanceSheetReportWithChildren,
  excelCashBankSummaryReport,
  excelCashFlowReport,
  excelFundFlowReport,
  excelGroupSummaryReport,
  excelLedgerBookReport,
  excelPayableSummaryReport,
  excelProfitLossReport,
  excelReceivableSummaryReport,
  excelTrialBalanceReport,
  getBalanceSheet,
  getCashBankSummary,
  getCashFlow,
  getFundFlow,
  getGroupSummaryTree,
  getLedgerBook,
  getPayableSummary,
  getProfitLoss,
  getReceivableSummary,
  getTrialBalance,
  pdfBalanceSheetReport,
  pdfBalanceSheetReportWithChildren,
  pdfCashBankSummaryReport,
  pdfCashFlowReport,
  pdfFundFlowReport,
  pdfGroupSummaryReport,
  pdfLedgerBookReport,
  pdfPayableSummaryReport,
  pdfProfitLossReport,
  pdfReceivableSummaryReport,
  pdfTrialBalanceReport,
} from "@/controllers/report/report.controller.js";
import {
  validateBalanceSheetRequestInput,
  validateCashBankSummaryRequestInput,
  validateCashFlowRequestInput,
  validateFundFlowRequestInput,
  validateGroupSummaryRequestInput,
  validateLedgerBookRequestInput,
  validateReportCommonRequestInput,
  validateStatementOfAccountsRequestInput,
  validateTrialBalanceRequestInput,
} from "@/validations/request/report/report.validation.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const reportRouter: Router = Router();

reportRouter.post(
  "/trial-balance",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "TRIAL_BALANCE", "VIEW")),
  validateTrialBalanceRequestInput,
  getTrialBalance,
);

reportRouter.post(
  "/ledger-book",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "LEDGER_BOOK", "VIEW")),
  validateLedgerBookRequestInput,
  getLedgerBook,
);

reportRouter.post(
  "/group-summary-tree",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "GROUP_SUMMARY_TREE", "VIEW")),
  validateGroupSummaryRequestInput,
  getGroupSummaryTree,
);

reportRouter.post(
  "/profit-loss",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "PROFIT_LOSS", "VIEW")),
  validateReportCommonRequestInput,
  getProfitLoss,
);

reportRouter.post(
  "/balance-sheet",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "BALANCE_SHEET", "VIEW")),
  validateBalanceSheetRequestInput,
  getBalanceSheet,
);

reportRouter.post(
  "/cash-bank-summary",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "CASH_BANK_SUMMARY", "VIEW")),
  validateCashBankSummaryRequestInput,
  getCashBankSummary,
);

reportRouter.post(
  "/receivable-summary",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "RECEIVABLE_SUMMARY", "VIEW")),
  validateStatementOfAccountsRequestInput,
  getReceivableSummary,
);

reportRouter.post(
  "/payable-summary",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "PAYABLE_SUMMARY", "VIEW")),
  validateStatementOfAccountsRequestInput,
  getPayableSummary,
);

reportRouter.post(
  "/cash-flow",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "CASH_FLOW", "VIEW")),
  validateCashFlowRequestInput,
  getCashFlow,
);

reportRouter.post(
  "/fund-flow",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "FUND_FLOW", "VIEW")),
  validateFundFlowRequestInput,
  getFundFlow,
);

reportRouter.post(
  "/excel-balance-sheet",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "BALANCE_SHEET", "VIEW")),
  validateBalanceSheetRequestInput,
  excelBalanceSheetReport,
);

reportRouter.post(
  "/excel-balance-sheet-with-children",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "BALANCE_SHEET", "VIEW")),
  validateBalanceSheetRequestInput,
  excelBalanceSheetReportWithChildren,
);

reportRouter.post(
  "/excel-profit-loss",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "PROFIT_LOSS", "VIEW")),
  validateReportCommonRequestInput,
  excelProfitLossReport,
);

reportRouter.post(
  "/excel-ledger-book",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "LEDGER_BOOK", "VIEW")),
  validateLedgerBookRequestInput,
  excelLedgerBookReport,
);

reportRouter.post(
  "/excel-trial-balance",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "TRIAL_BALANCE", "VIEW")),
  validateTrialBalanceRequestInput,
  excelTrialBalanceReport,
);

reportRouter.post(
  "/excel-group-summary-tree",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "GROUP_SUMMARY_TREE", "VIEW")),
  validateGroupSummaryRequestInput,
  excelGroupSummaryReport,
);

reportRouter.post(
  "/excel-cash-bank-summary",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "CASH_BANK_SUMMARY", "VIEW")),
  validateCashBankSummaryRequestInput,
  excelCashBankSummaryReport,
);

reportRouter.post(
  "/excel-receivable-summary",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "RECEIVABLE_SUMMARY", "VIEW")),
  validateStatementOfAccountsRequestInput,
  excelReceivableSummaryReport,
);

reportRouter.post(
  "/excel-payable-summary",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "PAYABLE_SUMMARY", "VIEW")),
  validateStatementOfAccountsRequestInput,
  excelPayableSummaryReport,
);

reportRouter.post(
  "/excel-cash-flow",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "CASH_FLOW", "VIEW")),
  validateCashFlowRequestInput,
  excelCashFlowReport,
);

reportRouter.post(
  "/excel-fund-flow",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "FUND_FLOW", "VIEW")),
  validateFundFlowRequestInput,
  excelFundFlowReport,
);

reportRouter.post(
  "/pdf-balance-sheet",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "BALANCE_SHEET", "VIEW")),
  validateBalanceSheetRequestInput,
  pdfBalanceSheetReport,
);

reportRouter.post(
  "/pdf-balance-sheet-with-children",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "BALANCE_SHEET", "VIEW")),
  validateBalanceSheetRequestInput,
  pdfBalanceSheetReportWithChildren,
);

reportRouter.post(
  "/pdf-ledger-book",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "LEDGER_BOOK", "VIEW")),
  validateLedgerBookRequestInput,
  pdfLedgerBookReport,
);

reportRouter.post(
  "/pdf-trial-balance",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "TRIAL_BALANCE", "VIEW")),
  validateTrialBalanceRequestInput,
  pdfTrialBalanceReport,
);

reportRouter.post(
  "/pdf-group-summary-tree",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "GROUP_SUMMARY_TREE", "VIEW")),
  validateGroupSummaryRequestInput,
  pdfGroupSummaryReport,
);

reportRouter.post(
  "/pdf-cash-bank-summary",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "CASH_BANK_SUMMARY", "VIEW")),
  validateCashBankSummaryRequestInput,
  pdfCashBankSummaryReport,
);

reportRouter.post(
  "/pdf-receivable-summary",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "RECEIVABLE_SUMMARY", "VIEW")),
  validateStatementOfAccountsRequestInput,
  pdfReceivableSummaryReport,
);

reportRouter.post(
  "/pdf-payable-summary",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "PAYABLE_SUMMARY", "VIEW")),
  validateStatementOfAccountsRequestInput,
  pdfPayableSummaryReport,
);

reportRouter.post(
  "/pdf-profit-loss",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "PROFIT_LOSS", "VIEW")),
  validateReportCommonRequestInput,
  pdfProfitLossReport,
);

reportRouter.post(
  "/pdf-cash-flow",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "CASH_FLOW", "VIEW")),
  validateCashFlowRequestInput,
  pdfCashFlowReport,
);

reportRouter.post(
  "/pdf-fund-flow",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "FUND_FLOW", "VIEW")),
  validateFundFlowRequestInput,
  pdfFundFlowReport,
);
