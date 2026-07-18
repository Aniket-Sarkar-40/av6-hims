import { commonGetService } from "@/services/common.service.js";
import { BalanceSheetRequestInput } from "@/types/reports/balanceSheet.js";
import { LedgerBookRequestInput } from "@/types/reports/ledgerBook.js";
import { ReportCommonRequestInput } from "@/types/reports/report.js";
import { TrialBalanceRequestInput } from "@/types/reports/trialBalance.js";
import {
  validateIdCompany,
  validateIdFinancialYear,
} from "../company/company.service.validation.js";
import { validateIdCollectionCenter } from "../master/collectionCenter.service.validation.js";
import { validateIdGroup } from "../master/group.service.validation.js";
import { validateIdLedger } from "../master/ledger.service.validation.js";
import dayjs from "dayjs";
import { CashFlowRequestInput } from "@/types/reports/cashFlow.js";
import { FundFlowRequestInput } from "@/types/reports/fundFlow.js";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Ledger } from "@repo/db/generated/prisma/client";

export const validateTrialBalanceServiceValidation = async (
  input: TrialBalanceRequestInput,
) => {
  logger.info("entering::validateTrialBalance::service::validation");
  const { companyId, financialYearId, fromDate, toDate, ccId, ledgerIds } =
    input;
  await validateIdCompany(companyId);
  const fy = await validateIdFinancialYear(financialYearId);
  if (fy.companyId !== companyId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ASSOCIATION", "Financial Year", "Company"),
    );
  }

  if (dayjs(fromDate).isAfter(dayjs(toDate))) {
    throw new ErrorHandler(
      400,
      `From Date: ${fromDate} cannot be greater than To Date: ${toDate}`,
    );
  }

  if (
    dayjs(fy.startDate).startOf("day").isAfter(dayjs(fromDate)) ||
    dayjs(dayjs(fy.endDate).endOf("day")).isBefore(dayjs(toDate))
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_DATE_RANGE",
        "Financial Year",
        `From Date: ${dayjs(fy.startDate).format("YYYY-MM-DD")}`,
        `To Date: ${dayjs(fy.endDate).format("YYYY-MM-DD")}`,
      ),
    );
  }

  if (ccId) {
    await validateIdCollectionCenter(ccId);
  }

  const ledgers = (await commonGetService.getAllElements<"Ledger">({
    cacheCode: "LEDGER",
    canNullReturnable: true,
    modelName: "Ledger",
    shortCode: "LEDGER",
    useActiveFlag: true,
  })) as Ledger[];

  if (ledgerIds?.length) {
    for (const ledgerId of ledgerIds) {
      const ledger = ledgers.find((l) => l.id === ledgerId);
      if (!ledger) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Ledger"),
        );
      }
      if (ledger.companyId !== companyId) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("INVALID_ASSOCIATION", "Ledger", "Company"),
        );
      }
    }
  }
  logger.info("exiting::validateTrialBalance::service::validation");
};

export const validateLedgerBookServiceValidation = async (
  input: LedgerBookRequestInput,
) => {
  logger.info("entering::validateLedgerBook::service::validation");
  const { companyId, financialYearId, fromDate, toDate, ccId, ledgerId } =
    input;
  await validateIdCompany(companyId);
  const fy = await validateIdFinancialYear(financialYearId);
  if (fy.companyId !== companyId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ASSOCIATION", "Financial Year", "Company"),
    );
  }

  if (dayjs(fromDate).isAfter(dayjs(toDate))) {
    throw new ErrorHandler(
      400,
      `From Date: ${fromDate} cannot be greater than To Date: ${toDate}`,
    );
  }

  if (
    dayjs(fy.startDate).startOf("day").isAfter(dayjs(fromDate)) ||
    dayjs(dayjs(fy.endDate).endOf("day")).isBefore(dayjs(toDate))
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_DATE_RANGE",
        "Financial Year",
        `From Date: ${dayjs(fy.startDate).format("YYYY-MM-DD")}`,
        `To Date: ${dayjs(fy.endDate).format("YYYY-MM-DD")}`,
      ),
    );
  }
  if (ccId) {
    await validateIdCollectionCenter(ccId);
  }
  const ledger = await validateIdLedger(ledgerId);
  logger.info("exiting::validateLedgerBook::service::validation");
  return ledger;
};

export const validateReportCommonServiceValidation = async (
  input: ReportCommonRequestInput,
  groupId?: number,
) => {
  logger.info("entering::validateReportCommon::service::validation");

  const { companyId, financialYearId, fromDate, toDate, ccId } = input;

  await validateIdCompany(companyId);
  const fy = await validateIdFinancialYear(financialYearId);
  if (fy.companyId !== companyId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ASSOCIATION", "Financial Year", "Company"),
    );
  }

  if (dayjs(fromDate).isAfter(dayjs(toDate))) {
    throw new ErrorHandler(
      400,
      `From Date: ${fromDate} cannot be greater than To Date: ${toDate}`,
    );
  }

  if (
    dayjs(fy.startDate).startOf("day").isAfter(dayjs(fromDate)) ||
    dayjs(dayjs(fy.endDate).endOf("day")).isBefore(dayjs(toDate))
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_DATE_RANGE",
        "Financial Year",
        `From Date: ${dayjs(fy.startDate).format("YYYY-MM-DD")}`,
        `To Date: ${dayjs(fy.endDate).format("YYYY-MM-DD")}`,
      ),
    );
  }

  if (ccId) {
    await validateIdCollectionCenter(ccId);
  }
  if (groupId) {
    await validateIdGroup(groupId);
  }
  logger.info("exiting::validateReportCommon::service::validation");
};

export const validateBalanceSheetServiceValidation = async (
  input: BalanceSheetRequestInput,
) => {
  logger.info("entering::validateBalanceSheet::service::validation");
  const { companyId, financialYearId, asOnDate, ccId } = input;
  await validateIdCompany(companyId);
  const fy = await validateIdFinancialYear(financialYearId);
  if (fy.companyId !== companyId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ASSOCIATION", "Financial Year", "Company"),
    );
  }
  input.fromDate = fy.booksBeginFrom;
  if (
    dayjs(asOnDate).isAfter(dayjs(fy.endDate).endOf("day")) ||
    dayjs(asOnDate).isBefore(dayjs(fy.startDate).startOf("day"))
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_DATE_RANGE",
        "As On Date",
        `Start Date: ${dayjs(fy.startDate).format("YYYY-MM-DD")}`,
        `End Date: ${dayjs(fy.endDate).format("YYYY-MM-DD")}`,
      ),
    );
  }

  if (ccId) {
    await validateIdCollectionCenter(ccId);
  }

  logger.info("exiting::validateBalanceSheet::service::validation");
  return fy;
};

export const validateCashFlowServiceValidation = async (
  input: CashFlowRequestInput,
) => {
  logger.info("entering::validateCashFlow::service::validation");
  const {
    companyId,
    financialYearId,
    fromDate,
    toDate,
    ccId,
    groupId,
    month,
    view,
  } = input;
  await validateIdCompany(companyId);
  const fy = await validateIdFinancialYear(financialYearId);
  if (fy.companyId !== companyId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ASSOCIATION", "Financial Year", "Company"),
    );
  }
  if (dayjs(fromDate).isAfter(dayjs(toDate))) {
    throw new ErrorHandler(
      400,
      `From Date: ${fromDate} cannot be greater than To Date: ${toDate}`,
    );
  }
  if (
    dayjs(fy.startDate).startOf("day").isAfter(dayjs(fromDate)) ||
    dayjs(dayjs(fy.endDate).endOf("day")).isBefore(dayjs(toDate))
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_DATE_RANGE",
        "Financial Year",
        `From Date: ${dayjs(fy.startDate).format("YYYY-MM-DD")}`,
        `To Date: ${dayjs(fy.endDate).format("YYYY-MM-DD")}`,
      ),
    );
  }

  if (ccId) {
    await validateIdCollectionCenter(ccId);
  }
  if (groupId) {
    await validateIdGroup(groupId);
  }

  if (view === "MONTH_DETAIL" && !month) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("FIELD_REQUIRED", "Month"),
    );
  }
  if (view === "GROUP_DETAIL" && !groupId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("FIELD_REQUIRED", "Group"),
    );
  }
  if (view === "MONTHLY" && month) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("FIELD_NOT_ALLOWED", "Month"),
    );
  }
  logger.info("exiting::validateCashFlow::service::validation");
};

export const validateFundFlowServiceValidation = async (
  input: FundFlowRequestInput,
) => {
  logger.info("entering::validateFundFlow::service::validation");
  const {
    companyId,
    financialYearId,
    fromDate,
    toDate,
    ccId,
    groupId,
    month,
    view,
  } = input;

  await validateIdCompany(companyId);
  const fy = await validateIdFinancialYear(financialYearId);
  if (fy.companyId !== companyId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ASSOCIATION", "Financial Year", "Company"),
    );
  }
  if (dayjs(fromDate).isAfter(dayjs(toDate))) {
    throw new ErrorHandler(
      400,
      `From Date: ${fromDate} cannot be greater than To Date: ${toDate}`,
    );
  }
  if (
    dayjs(fy.startDate).startOf("day").isAfter(dayjs(fromDate)) ||
    dayjs(dayjs(fy.endDate).endOf("day")).isBefore(dayjs(toDate))
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_DATE_RANGE",
        "Financial Year",
        `From Date: ${dayjs(fy.startDate).format("YYYY-MM-DD")}`,
        `To Date: ${dayjs(fy.endDate).format("YYYY-MM-DD")}`,
      ),
    );
  }
  if (ccId) {
    await validateIdCollectionCenter(ccId);
  }
  if (groupId) {
    await validateIdGroup(groupId);
  }
  if (view === "MONTHLY" && month) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("FIELD_NOT_ALLOWED", "Month"),
    );
  }
  if (view === "GROUP_DETAIL" && !groupId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("FIELD_REQUIRED", "Group"),
    );
  }
  if (input.month && !dayjs(`${input.month}-01`).isValid()) {
    throw new ErrorHandler(400, "Month must be in YYYY-MM format");
  }

  if (
    (input.view === "SUMMARY" || input.view === "GROUP_DETAIL") &&
    input.month
  ) {
    const monthDate = dayjs(`${input.month}-01`);
    if (!monthDate.isValid()) {
      throw new ErrorHandler(400, "Month must be in YYYY-MM format");
    }
  }
  if (view === "SUMMARY" && !month) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("FIELD_REQUIRED", "Month"),
    );
  }
  if (view === "GROUP_DETAIL" && !month) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("FIELD_REQUIRED", "Month"),
    );
  }
  if (view === "SUMMARY" && groupId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("FIELD_NOT_ALLOWED", "Group"),
    );
  }
  logger.info("exiting::validateFundFlow::service::validation");
  return fy;
};
