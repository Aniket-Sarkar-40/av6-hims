import {
  AutoMatchSuggestionInput,
  BankLedgerBookRequestInput,
  BankReconciliationSummaryRequestInput,
  BankStatementExcelBaseInput,
  ManualBankReconcileWithBankStatementInput,
  ManualReconcileRequestInput,
} from "@/types/bankReconciliation/bankReconciliation.js";
import { Request, Response } from "express";
import { bankReconciliationService } from "@/services/bankReconciliation/bankReconciliation.service.js";
import { TryCatch } from "@repo/platform";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";

export const getUnReconciledBankLedgerBookController = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getUnReconciledBankLedgerBook::controller");
    const input = req.body as BankLedgerBookRequestInput;
    const responseData =
      await bankReconciliationService.getUnReconciledBankLedgerBook(input);
    const response = BaseResponse.success(
      { type: "FETCHED", data: responseData },
      "Un-Reconciled Bank Voucher Lines",
    );
    logger.info("exiting::getUnReconciledBankLedgerBook::controller");
    return res.status(200).json(response);
  },
);

export const manualReconcileVoucherLinesController = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::manualReconcileVoucherLines::controller");
    const input = req.body as ManualReconcileRequestInput;
    await bankReconciliationService.manualReconcileVoucherLines(input);
    const response = BaseResponse.success(
      { type: "UPDATED" },
      "Manual Reconciled Voucher Lines",
    );
    logger.info("exiting::manualReconcileVoucherLines::controller");
    return res.status(200).json(response);
  },
);

export const uploadBankStatementExcelController = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::uploadBankStatementExcel::controller");
    const input = req.body as BankStatementExcelBaseInput;
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }
    await bankReconciliationService.createBankStatementExcel({
      filePath: req.file.path,
      baseInput: input,
    });
    // deleteFileIfExists(req.file.path);

    const response = new BaseResponse({
      success: true,
      message: "Bank Statement Excel Import started.",
    });

    logger.info("exiting::uploadBankStatementExcel::controller");
    return res.status(200).json(response);
  },
);

export const manualBankReconcileWithBankStatementController = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::manualBankReconcileWithBankStatement::controller");
    const input = req.body as ManualBankReconcileWithBankStatementInput;
    await bankReconciliationService.manualBankReconcileWithBankStatement(input);
    const response = BaseResponse.success(
      { type: "UPDATED" },
      "Manual Bank Reconcile with Bank Statement",
    );
    logger.info("exiting::manualBankReconcileWithBankStatement::controller");
    return res.status(200).json(response);
  },
);

export const getBankReconciliationSummaryController = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getBankReconciliationSummary::controller");
    const input = req.body as BankReconciliationSummaryRequestInput;
    const summary =
      await bankReconciliationService.getBankReconciliationSummary(input);
    const response = BaseResponse.success(
      { data: summary, type: "FETCHED" },
      "Bank Reconciliation Summary",
    );
    logger.info("exiting::getBankReconciliationSummary::controller");
    return res.status(200).json(response);
  },
);

export const getBankAutoSuggestionsController = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getBankAutoSuggestions::controller");
    const input = req.body as AutoMatchSuggestionInput;
    const suggestions =
      await bankReconciliationService.getBankAutoSuggestions(input);
    const response = BaseResponse.success(
      { data: suggestions, type: "FETCHED" },
      "Bank Auto Suggestions",
    );
    logger.info("exiting::getBankAutoSuggestions::controller");
    return res.status(200).json(response);
  },
);
