import {
  getLastPurchaseRateByCurrencyId,
  getLastSellingRateByCurrencyId,
} from "@/repository/voucher/voucher.repository.js";
import { commonGetService } from "@/services/common.service.js";
import {
  FetchRateOfExchangeInput,
  FetchRateOfExchangeType,
  RateOfExchangeDTO,
  RateOfExchangeResponse,
} from "@/types/master/rateOfExchange.js";
import { currencyService } from "@apps/core/services/master/currency.service.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { RateOfExchange } from "@repo/db/generated/prisma/client";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { customOmit, toIdValue } from "av6-utils";
import dayjs from "dayjs";

export const toRateOfExchangeDto = async (
  input: RateOfExchangeResponse[]
): Promise<RateOfExchangeDTO[]> => {
  const currencies = await currencyService.getAllCurrency();

  const response: RateOfExchangeDTO[] = await Promise.all(
    input.map(async (rateOfExchange) => {
      const currency = currencies.find(
        (currency) => currency.id === rateOfExchange.currencyId
      );
      const createdBy = rateOfExchange.createdBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            rateOfExchange.createdBy
          )
        : null;
      const lastSellingRate = await getLastSellingRateByCurrencyId({
        companyId: rateOfExchange.companyId,
        currencyId: rateOfExchange.currencyId,
        financialYearId: rateOfExchange.financialYearId,
      });
      const lastPurchaseRate = await getLastPurchaseRateByCurrencyId({
        companyId: rateOfExchange.companyId,
        currencyId: rateOfExchange.currencyId,
        financialYearId: rateOfExchange.financialYearId,
      });
      return {
        ...customOmit(rateOfExchange, [
          "company",
          "companyId",
          "financialYear",
          "financialYearId",
          "currencyId",
          "createdBy",
          "updatedBy",
          "updatedAt",
          "deletedBy",
          "deletedAt",
          "isActive",
        ]).rest,
        currency: toIdValue(currency, "code"),
        lastVoucherSellingRate: lastSellingRate?.currencyConversionRate
          ? Number(lastSellingRate.currencyConversionRate)
          : null,
        lastVoucherBuyingRate: lastPurchaseRate?.currencyConversionRate
          ? Number(lastPurchaseRate.currencyConversionRate)
          : null,
        createdBy: toIdValue(createdBy, "name"),
        company: toIdValue(rateOfExchange.company, "name"),
        financialYear: customOmit(rateOfExchange.financialYear, [
          "isActive",
          "createdBy",
          "createdAt",
          "updatedBy",
          "updatedAt",
          "deletedBy",
          "deletedAt",
        ]).rest,
      };
    })
  );
  return response;
};

export const toFetchRateOfExchangeDto = async (
  input: FetchRateOfExchangeInput
) => {
  const { companyId, currencyId, financialYearId, date, type } = input;
  const allRateOfExchanges =
    (await commonGetService.getAllElements<"RateOfExchange">({
      cacheCode: "RATE_OF_EXCHANGE",
      canNullReturnable: true,
      modelName: "RateOfExchange",
      shortCode: "RATE_OF_EXCHANGE",
      useActiveFlag: true,
    })) as RateOfExchange[];

  const rateOfExchanges = allRateOfExchanges
    .filter(
      (rateOfExchange) =>
        rateOfExchange.companyId === companyId &&
        rateOfExchange.currencyId === currencyId &&
        rateOfExchange.financialYearId === financialYearId
    )
    .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));

  let effectiveRateOfExchangeRecord: RateOfExchange | null = null;

  effectiveRateOfExchangeRecord =
    rateOfExchanges.find((rate) =>
      dayjs(rate.date).isSame(dayjs(date), "day")
    ) ?? null;

  if (!effectiveRateOfExchangeRecord && rateOfExchanges.length > 0) {
    const pastRates = rateOfExchanges.filter(
      (rate) =>
        dayjs(rate.date).isBefore(dayjs(date), "day") ||
        dayjs(rate.date).isSame(dayjs(date), "day")
    );
    if (pastRates.length > 0) {
      effectiveRateOfExchangeRecord = pastRates[pastRates.length - 1];
    }
  }
  let rate: number | null = null;
  if (effectiveRateOfExchangeRecord) {
    switch (type) {
      case FetchRateOfExchangeType.PURCHASE:
        rate =
          effectiveRateOfExchangeRecord.buyingRate ??
          effectiveRateOfExchangeRecord.stdRate;
        break;
      case FetchRateOfExchangeType.SELL:
        rate =
          effectiveRateOfExchangeRecord.sellingRate ??
          effectiveRateOfExchangeRecord.stdRate;
        break;
      case FetchRateOfExchangeType.PAYMENT:
        rate =
          effectiveRateOfExchangeRecord.buyingRate ??
          effectiveRateOfExchangeRecord.stdRate;
        break;
      case FetchRateOfExchangeType.RECEIPT:
        rate =
          effectiveRateOfExchangeRecord.sellingRate ??
          effectiveRateOfExchangeRecord.stdRate;
        break;
      case FetchRateOfExchangeType.OTHER:
        rate = effectiveRateOfExchangeRecord.stdRate;
        break;
      default:
        throw new ErrorHandler(400, "Invalid type");
    }
  }
  return rate;
};
