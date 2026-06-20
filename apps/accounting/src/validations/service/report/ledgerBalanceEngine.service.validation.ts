import { LedgerBalanceEngineInput } from "@/types/reports/ledgerBalanceEngine.js";
import {
  validateIdCompany,
  validateIdFinancialYear,
} from "../company/company.service.validation.js";
import dayjs from "dayjs";
import { validateIdCollectionCenter } from "../master/collectionCenter.service.validation.js";
import { commonGetService } from "@/services/common.service.js";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Ledger } from "@repo/db/generated/prisma/client";

export const validateLedgerBalanceEngineServiceValidation = async (
  input: LedgerBalanceEngineInput
) => {
  logger.info(
    "entering::validateLedgerBalanceEngineServiceValidation::service::validation"
  );
  const { companyId, financialYearId, fromDate, toDate, ccId, ledgerIds } =
    input;
  await validateIdCompany(companyId);
  const fy = await validateIdFinancialYear(financialYearId);
  if (fy.companyId !== companyId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ASSOCIATION", "Financial Year", "Company")
    );
  }

  if (dayjs(fromDate).isAfter(dayjs(toDate))) {
    throw new ErrorHandler(
      400,
      `From Date: ${fromDate} cannot be greater than To Date: ${toDate}`
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
        `To Date: ${dayjs(fy.endDate).format("YYYY-MM-DD")}`
      )
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
          generateErrorMessage("NOT_FOUND", "Ledger")
        );
      }
      if (ledger.companyId !== companyId) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("INVALID_ASSOCIATION", "Ledger", "Company")
        );
      }
    }
  }
  logger.info(
    "exiting::validateLedgerBalanceEngineServiceValidation::service::validation"
  );
};
