import { reportService } from "@/services/report/report.service.js";
import { BalanceSheetRequestInput } from "@/types/reports/balanceSheet.js";
import { CashFlowRequestInput } from "@/types/reports/cashFlow.js";
import {
  ForexGainLossStatementInput,
  LedgerForexReportInput,
} from "@/types/reports/forexReport.js";
import { FundFlowRequestInput } from "@/types/reports/fundFlow.js";
import { GroupSummaryRequestInput } from "@/types/reports/groupSummary.js";
import {
  LedgerBookExcelRequestInput,
  LedgerBookRequestInput,
} from "@/types/reports/ledgerBook.js";
import { ReportCommonRequestInput } from "@/types/reports/report.js";
import { TrialBalanceRequestInput } from "@/types/reports/trialBalance.js";
import { TryCatch } from "@repo/platform";
import { logger } from "@repo/platform/logging/logger.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { Workbook } from "exceljs";
import { Request, Response } from "express";

export const getTrialBalance = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getTrialBalance::report::controller");
  const input = req.body as TrialBalanceRequestInput;
  const trialBalance = await reportService.getTrialBalance(input);
  const response = BaseResponse.success(
    { data: trialBalance, type: "FETCHED" },
    "Trial Balance",
  );
  logger.info("exiting::getTrialBalance::report::controller");
  return res.status(200).json(response);
});

export const getLedgerBook = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getLedgerBook::report::controller");
  const input = req.body as LedgerBookRequestInput;
  const ledgerBook = await reportService.getLedgerBook(input);
  const response = BaseResponse.success(
    { data: ledgerBook, type: "FETCHED" },
    "Ledger Book",
  );
  logger.info("exiting::getLedgerBook::report::controller");
  return res.status(200).json(response);
});

export const getGroupSummaryTree = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getGroupSummaryTree::report::controller");
    const input = req.body as GroupSummaryRequestInput;
    const groupSummaryTree = await reportService.getGroupSummaryTree(input);
    const response = BaseResponse.success(
      { data: groupSummaryTree, type: "FETCHED" },
      "Group Summary Tree",
    );
    logger.info("exiting::getGroupSummaryTree::report::controller");
    return res.status(200).json(response);
  },
);

export const getProfitLoss = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getProfitLoss::report::controller");
  const input = req.body as ReportCommonRequestInput;
  const profitLoss = await reportService.getProfitLoss(input);
  const response = BaseResponse.success(
    { data: profitLoss, type: "FETCHED" },
    "Profit Loss",
  );
  logger.info("exiting::getProfitLoss::report::controller");
  return res.status(200).json(response);
});

export const getBalanceSheet = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getBalanceSheet::report::controller");
  const input = req.body as BalanceSheetRequestInput;
  const balanceSheet = await reportService.getBalanceSheet(input);
  const response = BaseResponse.success(
    { data: balanceSheet, type: "FETCHED" },
    "Balance Sheet",
  );
  logger.info("exiting::getBalanceSheet::report::controller");
  return res.status(200).json(response);
});

export const getCashBankSummary = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getCashBankSummary::report::controller");
    const input = req.body as ReportCommonRequestInput;
    const cashBankSummary = await reportService.getCashBankSummary(input);
    const response = BaseResponse.success(
      { data: cashBankSummary, type: "FETCHED" },
      "Cash Bank Summary",
    );
    logger.info("exiting::getCashBankSummary::report::controller");
    return res.status(200).json(response);
  },
);

export const getReceivableSummary = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getReceivableSummary::report::controller");
    const input = req.body as ReportCommonRequestInput;
    const receivableSummary = await reportService.getReceivableSummary(input);
    const response = BaseResponse.success(
      { data: receivableSummary, type: "FETCHED" },
      "Receivable Summary",
    );
    logger.info("exiting::getReceivableSummary::report::controller");
    return res.status(200).json(response);
  },
);

export const getPayableSummary = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getPayableSummary::report::controller");
    const input = req.body as ReportCommonRequestInput;
    const payableSummary = await reportService.getPayableSummary(input);
    const response = BaseResponse.success(
      { data: payableSummary, type: "FETCHED" },
      "Payable Summary",
    );
    logger.info("exiting::getPayableSummary::report::controller");
    return res.status(200).json(response);
  },
);

export const getCashFlow = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getCashFlow::report::controller");
  const input = req.body as CashFlowRequestInput;
  const cashFlow = await reportService.getCashFlow(input);
  const response = BaseResponse.success(
    { data: cashFlow, type: "FETCHED" },
    "Cash Flow",
  );
  logger.info("exiting::getCashFlow::report::controller");
  return res.status(200).json(response);
});

export const getFundFlow = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getFundFlow::report::controller");
  const input = req.body as FundFlowRequestInput;
  const fundFlow = await reportService.getFundFlow(input);
  const response = BaseResponse.success(
    { data: fundFlow, type: "FETCHED" },
    "Fund Flow",
  );
  logger.info("exiting::getFundFlow::report::controller");
  return res.status(200).json(response);
});

export const getLedgerForexGainLoss = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getLedgerForexGainLoss::report::controller");
    const input = req.body as LedgerForexReportInput;
    const forexGainLoss = await reportService.getLedgerForexGainLoss(input);
    const response = BaseResponse.success(
      { data: forexGainLoss, type: "FETCHED" },
      "Ledger Forex Gain Loss",
    );
    logger.info("exiting::getLedgerForexGainLoss::report::controller");
    return res.status(200).json(response);
  },
);

export const getForexGainLossStatement = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getForexGainLossStatement::report::controller");
    const input = req.body as ForexGainLossStatementInput;
    const forexGainLossStatement =
      await reportService.getForexGainLossStatement(input);
    const response = BaseResponse.success(
      { data: forexGainLossStatement, type: "FETCHED" },
      "Forex Gain Loss Statement",
    );
    logger.info("exiting::getForexGainLossStatement::report::controller");
    return res.status(200).json(response);
  },
);

export const excelBalanceSheetReport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::excelBalanceSheetReport::controller");

    const input = req.body as BalanceSheetRequestInput;

    const wb: Workbook = await reportService.buildExcelForBalanceSheet(input);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="balance_sheet_report.xlsx"',
    );

    await wb.xlsx.write(res); // streams the Excel file
    res.end();
    logger.info("exiting::excelBalanceSheetReport::controller");
  },
);

export const excelBalanceSheetReportWithChildren = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::excelBalanceSheetReportWithChildren::controller");

    const input = req.body as BalanceSheetRequestInput;

    const wb: Workbook =
      await reportService.buildExcelForBalanceSheetWithChildren(input);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="balance_sheet_report.xlsx"',
    );

    await wb.xlsx.write(res); // streams the Excel file
    res.end();
    logger.info("exiting::excelBalanceSheetReportWithChildren::controller");
  },
);

export const excelLedgerBookReport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::excelLedgerBookReport::controller");

    const input = req.body as LedgerBookExcelRequestInput;

    const wb: Workbook =
      await reportService.buildExcelForLedgerBookReport(input);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="ledger_book_report.xlsx"',
    );

    await wb.xlsx.write(res); // streams the Excel file
    res.end();
    logger.info("exiting::excelLedgerBookReport::controller");
  },
);

export const excelTrialBalanceReport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::excelTrialBalanceReport::controller");

    const input = req.body as TrialBalanceRequestInput;

    const wb: Workbook = await reportService.buildExcelForTrialBalance(input);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="trial_balance_report.xlsx"',
    );

    await wb.xlsx.write(res); // streams the Excel file
    res.end();
    logger.info("exiting::excelTrialBalanceReport::controller");
  },
);

export const excelGroupSummaryReport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::excelGroupSummaryReport::controller");

    const input = req.body as GroupSummaryRequestInput;

    const wb: Workbook = await reportService.buildExcelForGroupSummary(input);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="group_summary_report.xlsx"',
    );

    await wb.xlsx.write(res); // streams the Excel file
    res.end();
    logger.info("exiting::excelGroupSummaryReport::controller");
  },
);

export const excelCashBankSummaryReport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::excelCashBankSummaryReport::controller");

    const input = req.body as ReportCommonRequestInput;

    const wb: Workbook =
      await reportService.buildExcelForCashBankSummary(input);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="cash_bank_summary_report.xlsx"',
    );

    await wb.xlsx.write(res); // streams the Excel file
    res.end();
    logger.info("exiting::excelCashBankSummaryReport::controller");
  },
);

export const excelReceivableSummaryReport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::excelReceivableSummaryReport::controller");

    const input = req.body as ReportCommonRequestInput;

    const wb: Workbook =
      await reportService.buildExcelForReceivableSummary(input);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="receivable_summary_report.xlsx"',
    );

    await wb.xlsx.write(res); // streams the Excel file
    res.end();
    logger.info("exiting::excelReceivableSummaryReport::controller");
  },
);

export const excelPayableSummaryReport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::excelPayableSummaryReport::controller");

    const input = req.body as ReportCommonRequestInput;

    const wb: Workbook = await reportService.buildExcelForPayableSummary(input);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="payable_summary_report.xlsx"',
    );

    await wb.xlsx.write(res); // streams the Excel file
    res.end();
    logger.info("exiting::excelPayableSummaryReport::controller");
  },
);

export const excelProfitLossReport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::excelProfitLossReport::controller");

    const input = req.body as ReportCommonRequestInput;

    const wb: Workbook = await reportService.buildExcelForProfitLoss(input);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="profit_loss_report.xlsx"',
    );

    await wb.xlsx.write(res); // streams the Excel file
    res.end();
    logger.info("exiting::excelProfitLossReport::controller");
  },
);

export const excelCashFlowReport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::excelCashFlowReport::controller");

    const input = req.body as CashFlowRequestInput;

    const wb: Workbook = await reportService.buildExcelForCashFLow(input);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="cash_flow_report.xlsx"',
    );

    await wb.xlsx.write(res); // streams the Excel file
    res.end();
    logger.info("exiting::excelCashFlowReport::controller");
  },
);

export const excelFundFlowReport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::excelFundFlowReport::controller");

    const input = req.body as FundFlowRequestInput;

    const wb: Workbook = await reportService.buildExcelForFundFLow(input);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="fund_flow_report.xlsx"',
    );

    await wb.xlsx.write(res); // streams the Excel file
    res.end();
    logger.info("exiting::excelFundFlowReport::controller");
  },
);

export const pdfBalanceSheetReport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::pdfBalanceSheetReport::controller");

    const input = req.body as BalanceSheetRequestInput;

    const pdfBuffer = await reportService.buildPdfForBalanceSheet(input);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="balance_sheet_report.pdf"',
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    res.end(pdfBuffer);
    logger.info("exiting::pdfBalanceSheetReport::controller");
  },
);

export const pdfBalanceSheetReportWithChildren = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::pdfBalanceSheetReportWithChildren::controller");

    const input = req.body as BalanceSheetRequestInput;

    const pdfBuffer =
      await reportService.buildPdfForBalanceSheetWithChildren(input);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="balance_sheet_report.pdf"',
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    res.end(pdfBuffer);
    logger.info("exiting::pdfBalanceSheetReportWithChildren::controller");
  },
);

export const pdfLedgerBookReport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::pdfLedgerBookReport::controller");

    const input = req.body as LedgerBookExcelRequestInput;

    const pdfBuffer = await reportService.buildPdfForLedgerBookReport(input);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="ledger_book_report.pdf"',
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    res.end(pdfBuffer);
    logger.info("exiting::pdfLedgerBookReport::controller");
  },
);

export const pdfTrialBalanceReport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::pdfTrialBalanceReport::controller");

    const input = req.body as LedgerBookRequestInput;

    const pdfBuffer = await reportService.buildPdfForTrialBalance(input);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="trial_balance_report.pdf"',
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    res.end(pdfBuffer);
    logger.info("exiting::pdfTrialBalanceReport::controller");
  },
);

export const pdfGroupSummaryReport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::pdfGroupSummaryReport::controller");

    const input = req.body as GroupSummaryRequestInput;

    const pdfBuffer = await reportService.buildPdfForGroupSummary(input);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="group_summary_report.pdf"',
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    res.end(pdfBuffer);
    logger.info("exiting::pdfGroupSummaryReport::controller");
  },
);

export const pdfCashBankSummaryReport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::pdfCashBankSummaryReport::controller");

    const input = req.body as ReportCommonRequestInput;

    const pdfBuffer = await reportService.buildPdfForCashBankSummary(input);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="cash_bank_summary_report.pdf"',
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    res.end(pdfBuffer);
    logger.info("exiting::pdfCashBankSummaryReport::controller");
  },
);

export const pdfReceivableSummaryReport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::pdfReceivableSummaryReport::controller");

    const input = req.body as ReportCommonRequestInput;

    const pdfBuffer = await reportService.buildPdfForReceivableSummary(input);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="receivable_summary_report.pdf"',
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    res.end(pdfBuffer);
    logger.info("exiting::pdfReceivableSummaryReport::controller");
  },
);

export const pdfPayableSummaryReport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::pdfPayableSummaryReport::controller");

    const input = req.body as ReportCommonRequestInput;

    const pdfBuffer = await reportService.buildPdfForPayableSummary(input);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="payable_summary_report.pdf"',
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    res.end(pdfBuffer);
    logger.info("exiting::pdfPayableSummaryReport::controller");
  },
);

export const pdfProfitLossReport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::pdfProfitLossReport::controller");

    const input = req.body as ReportCommonRequestInput;

    const pdfBuffer = await reportService.buildPdfForProfitLoss(input);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="profit_loss_report.pdf"',
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    res.end(pdfBuffer);
    logger.info("exiting::pdfProfitLossReport::controller");
  },
);

export const pdfCashFlowReport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::pdfCashFlowReport::controller");

    const input = req.body as CashFlowRequestInput;

    const pdfBuffer = await reportService.buildPdfForCashFlow(input);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="cash_flow_report.pdf"',
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    res.end(pdfBuffer);
    logger.info("exiting::pdfCashFlowReport::controller");
  },
);

export const pdfFundFlowReport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::pdfFundFlowReport::controller");

    const input = req.body as FundFlowRequestInput;

    const pdfBuffer = await reportService.buildPdfForFundFlow(input);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="fund_flow_report.pdf"',
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    res.end(pdfBuffer);
    logger.info("exiting::pdfFundFlowReport::controller");
  },
);
