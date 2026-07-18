import {
  CreateRateOfExchangeInput,
  FetchRateOfExchangeInput,
} from "@/types/master/rateOfExchange.js";
import { validateIdCompany } from "../company/company.service.validation.js";
import { validateIdCurrency } from "./currency.service.validation.js";
import { commonGetService } from "@/services/common.service.js";
import dayjs from "dayjs";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { RateOfExchange } from "@repo/db/generated/prisma/client";

export const createRateOfExchangeServiceValidation = async (
  input: CreateRateOfExchangeInput,
): Promise<CreateRateOfExchangeInput> => {
  logger.info(
    "entering::createRateOfExchangeServiceValidation::service::validation",
  );
  const { companyId, currencyId, date } = input;
  const formattedDate = dayjs(date).format("YYYY-MM-DD");
  input.date = formattedDate;
  const company = await validateIdCompany(companyId);
  const fy = company.companyFinancialYears.find((fy) => fy.isCurrent === true);
  if (!fy) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("NOT_FOUND", "Financial Year"),
    );
  }
  input.financialYearId = fy.id;

  const currency = await validateIdCurrency(currencyId);
  if (currency.id === company.currencyId) {
    throw new ErrorHandler(
      400,
      "Base currency is not allowed for configuring rate of exchange",
    );
  }

  const allRateOfExchanges =
    (await commonGetService.getAllElements<"RateOfExchange">({
      cacheCode: "RATE_OF_EXCHANGE",
      canNullReturnable: true,
      modelName: "RateOfExchange",
      shortCode: "RATE_OF_EXCHANGE",
      useActiveFlag: true,
    })) as RateOfExchange[];

  const existingRateOfExchanges = allRateOfExchanges.filter(
    (roe) =>
      roe.companyId === companyId &&
      roe.currencyId === currencyId &&
      roe.financialYearId === fy.id,
  );

  const existingRecordForDate = existingRateOfExchanges.find((roe) =>
    dayjs(roe.date).isSame(date, "day"),
  );
  if (existingRecordForDate) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "DUPLICATE_ITEM",
        `Rate of Exchange for ${currency.code} on ${formattedDate}`,
      ),
    );
  }
  logger.info(
    "exiting::createRateOfExchangeServiceValidation::service::validation",
  );
  return input;
};

export const fetchRateOfExchangeServiceValidation = async (
  input: FetchRateOfExchangeInput,
) => {
  logger.info(
    "entering::fetchRateOfExchangeServiceValidation::service::validation",
  );
  const { companyId, currencyId, date } = input;
  const company = await validateIdCompany(companyId);
  const currency = await validateIdCurrency(currencyId);

  if (currency.id === company.currencyId) {
    throw new ErrorHandler(
      400,
      "Base currency is not allowed for fetching rate of exchange",
    );
  }

  const fy = company.companyFinancialYears.find((fy) => fy.isCurrent === true);
  if (!fy) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("NOT_FOUND", "Financial Year"),
    );
  }

  if (
    dayjs(date).isBefore(dayjs(fy.startDate)) ||
    dayjs(date).isAfter(dayjs(fy.endDate))
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

  if (dayjs(date).isAfter(dayjs(), "day")) {
    throw new ErrorHandler(400, "Future date is not allowed");
  }

  input.financialYearId = fy.id;
  logger.info(
    "exiting::fetchRateOfExchangeServiceValidation::service::validation",
  );
};
