import { requestStorage } from "@/config/requestContext.js";
import { getCompanyByIdFromDb } from "@/repository/company/company.repository.js";
import { getOpeningBalancesByLedgerIds } from "@/repository/master/ledgerOpeningBalance.repository.js";
import {
  getVoucherForexSumsBeforeDate,
  getVoucherForexSumsInRange,
} from "@/repository/voucher/voucher.repository.js";
import {
  ForexDrCrAmt,
  LedgerForexGainLossEngineResult,
  LedgerForexGainLossRow,
  LedgerForexReportInput,
} from "@/types/reports/forexReport.js";
import dayjs from "dayjs";
import { commonGetService } from "../common.service.js";
import { applyRound, RoundFormat, toIdValue } from "av6-utils";
import { DrCr } from "@repo/db/generated/prisma/enums.js";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { currencyService } from "@apps/core/services/master/currency.service.js";
import {
  Currency,
  Group,
  Ledger,
  RateOfExchange,
} from "@repo/db/generated/prisma/client";

export const toForexAmt = (signed: number): ForexDrCrAmt => ({
  amount: Math.abs(signed),
  drCr: signed > 0 ? DrCr.DR : signed < 0 ? DrCr.CR : null,
});

export const getLedgerForexGainLossEngine = async (
  input: LedgerForexReportInput,
): Promise<LedgerForexGainLossEngineResult> => {
  logger.info("entering::getLedgerForexGainLossEngine::service");
  const {
    companyId,
    financialYearId,
    fromDate,
    toDate,
    ccId,
    ledgerIds,
    includeZero = false,
  } = input;
  const store = requestStorage.getStore();
  const settings = store?.settings;
  const roundingPrecision = settings?.roundingPrecision ?? 2;
  const roundingMethod = settings?.roundingMethod ?? RoundFormat.TO_FIXED;
  const asOfDateStr = dayjs(toDate).format("YYYY-MM-DD");

  const company = await getCompanyByIdFromDb(companyId);
  if (!company) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Company"));
  }

  const currencies = await currencyService.getAllCurrency();
  const currencyMap = new Map<number, Currency>(
    currencies.map((currency) => [currency.id, currency]),
  );

  const baseCurrency = company.currencyId
    ? (currencyMap.get(company.currencyId) ?? null)
    : null;

  const allGroups: Group[] = await commonGetService.getAllElements<"Group">({
    cacheCode: "GROUP",
    canNullReturnable: true,
    modelName: "Group",
    shortCode: "GROUP",
    useActiveFlag: true,
  });
  const groups = allGroups.filter((g) => g.companyId === companyId);

  const allLedgers = (await commonGetService.getAllElements<"Ledger">({
    cacheCode: "LEDGER",
    canNullReturnable: true,
    modelName: "Ledger",
    shortCode: "LEDGER",
    useActiveFlag: true,
  })) as Ledger[];
  const ledgers = allLedgers.filter((l) => l.companyId === companyId);

  const ledgerIdFilter = ledgerIds?.length ? new Set(ledgerIds) : null;
  const foreignLedgers = ledgers.filter(
    (ledger) =>
      ledger.currencyId !== null &&
      ledger.currencyId !== company.currencyId &&
      (!ledgerIdFilter || ledgerIdFilter.has(ledger.id)),
  );
  const foreignLedgerIds = foreignLedgers.map((ledger) => ledger.id);

  const foreignLedgerGroupMap = new Map<number, Group>();
  for (const ledger of foreignLedgers) {
    const group = groups.find((g) => g.id === ledger.groupId);
    if (!group) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", `Group for ledger ${ledger.name}`),
      );
    }
    foreignLedgerGroupMap.set(ledger.id, group);
  }

  if (foreignLedgerIds.length === 0) {
    logger.info(
      "exiting::getLedgerForexGainLossEngine::service (no foreign ledgers)",
    );
    return {
      asOfDate: asOfDateStr,
      baseCurrency: baseCurrency ? toIdValue(baseCurrency, "code") : null,
      rows: [],
      totals: {
        transactedBaseAmount: toForexAmt(0),
        currentBaseAmount: toForexAmt(0),
        forexRevaluationAmount: toForexAmt(0),
        forexGainLossAmount: toForexAmt(0),
      },
    };
  }

  // Foreign-currency ledgers exist but no base currency is configured: genuine misconfiguration.
  if (!company.currencyId || !baseCurrency) {
    throw new ErrorHandler(400, "Company base currency is not configured");
  }

  const rateMap = buildCurrentRateMap({
    currencyIds: [
      ...new Set(foreignLedgers.map((ledger) => ledger.currencyId as number)),
    ],
    rates: (await commonGetService.getAllElements<"RateOfExchange">({
      cacheCode: "RATE_OF_EXCHANGE",
      canNullReturnable: true,
      modelName: "RateOfExchange",
      shortCode: "RATE_OF_EXCHANGE",
      useActiveFlag: true,
    })) as RateOfExchange[],
    companyId,
    financialYearId,
    asOfDate: toDate,
  });

  const openingRows = await getOpeningBalancesByLedgerIds({
    companyId,
    financialYearId,
  });
  const beforeRows = await getVoucherForexSumsBeforeDate({
    companyId,
    financialYearId,
    fromDate,
    ccId,
    ledgerIds: foreignLedgerIds,
  });

  const rangeRows = await getVoucherForexSumsInRange({
    companyId,
    financialYearId,
    fromDate,
    toDate,
    ccId,
    ledgerIds: foreignLedgerIds,
  });
  const voucherSums = [...(beforeRows ?? []), ...(rangeRows ?? [])];

  const rows: LedgerForexGainLossRow[] = [];

  let totalTransactedBaseSigned = 0;
  let totalCurrentBaseSigned = 0;
  let totalForexGainLossSigned = 0;
  let totalForexRevaluationSigned = 0;
  for (const ledger of foreignLedgers) {
    let foreignClosingSigned = 0;
    let transactedBaseSigned = 0;

    for (const opening of openingRows) {
      if (opening.ledgerId !== ledger.id) continue;

      const foreignAmount = Number(opening.currencyAmount ?? 0);
      const baseAmount = Number(opening.amount ?? 0);

      if (opening.drCr === DrCr.DR) {
        foreignClosingSigned += foreignAmount;
        transactedBaseSigned += baseAmount;
      } else {
        foreignClosingSigned -= foreignAmount;
        transactedBaseSigned -= baseAmount;
      }
    }

    for (const voucherSum of voucherSums) {
      if (voucherSum.ledgerId !== ledger.id) continue;

      const foreignAmount = Number(voucherSum._sum.currencyAmount ?? 0);
      const baseAmount = Number(voucherSum._sum.amount ?? 0);

      if (voucherSum.drCr === DrCr.DR) {
        foreignClosingSigned += foreignAmount;
        transactedBaseSigned += baseAmount;
      } else {
        foreignClosingSigned -= foreignAmount;
        transactedBaseSigned -= baseAmount;
      }
    }

    const roundedForeignClosingSigned = applyRound(
      foreignClosingSigned,
      roundingMethod,
      roundingPrecision,
    );

    const currencyId = ledger.currencyId as number;
    const currentRate = rateMap.get(currencyId);
    if (!currentRate) {
      const currency = currencyMap.get(currencyId);
      throw new ErrorHandler(
        400,
        `Exchange rate not found for ${
          currency?.code ?? currency?.name ?? currencyId
        } as on ${asOfDateStr}`,
      );
    }
    if (roundedForeignClosingSigned !== 0 && currentRate <= 0) {
      const currency = currencyMap.get(currencyId);
      throw new ErrorHandler(
        400,
        `Exchange rate not found for ${
          currency?.code ?? currency?.name ?? currencyId
        } as on ${asOfDateStr}`,
      );
    }

    const currentBaseSigned = foreignClosingSigned * currentRate;
    const ledgerRevaluationSigned = currentBaseSigned - transactedBaseSigned;
    // A revaluation that increases base assets (DR) is a forex gain (CR) and vice-versa.
    const forexGainLossSigned = -ledgerRevaluationSigned;

    const roundedTransactedBaseSigned = applyRound(
      transactedBaseSigned,
      roundingMethod,
      roundingPrecision,
    );
    const roundedCurrentBaseSigned = applyRound(
      currentBaseSigned,
      roundingMethod,
      roundingPrecision,
    );
    const roundedLedgerRevaluationSigned = applyRound(
      ledgerRevaluationSigned,
      roundingMethod,
      roundingPrecision,
    );
    const roundedForexGainLossSigned = applyRound(
      forexGainLossSigned,
      roundingMethod,
      roundingPrecision,
    );

    if (
      !includeZero &&
      roundedForeignClosingSigned === 0 &&
      roundedTransactedBaseSigned === 0 &&
      roundedCurrentBaseSigned === 0 &&
      roundedLedgerRevaluationSigned === 0 &&
      roundedForexGainLossSigned === 0
    ) {
      continue;
    }

    const forexGainLossAmount = toForexAmt(roundedForexGainLossSigned);
    const group = foreignLedgerGroupMap.get(ledger.id) as Group;
    const currency = currencyMap.get(currencyId);

    rows.push({
      ledger: toIdValue(ledger, "name"),
      group: toIdValue(group, "name"),
      currency: toIdValue(currency, "code"),
      foreignClosingAmount: toForexAmt(roundedForeignClosingSigned),
      transactedBaseAmount: toForexAmt(roundedTransactedBaseSigned),
      currentRate,
      currentBaseAmount: toForexAmt(roundedCurrentBaseSigned),
      ledgerRevaluationAmount: toForexAmt(roundedLedgerRevaluationSigned),
      forexGainLossAmount,
      isGain: forexGainLossAmount.drCr === DrCr.CR,
      isLoss: forexGainLossAmount.drCr === DrCr.DR,
    });

    totalTransactedBaseSigned += transactedBaseSigned;
    totalCurrentBaseSigned += currentBaseSigned;
    totalForexGainLossSigned += forexGainLossSigned;
    totalForexRevaluationSigned += ledgerRevaluationSigned;
  }

  const roundedTotalTransactedBaseSigned = applyRound(
    totalTransactedBaseSigned,
    roundingMethod,
    roundingPrecision,
  );
  const roundedTotalCurrentBaseSigned = applyRound(
    totalCurrentBaseSigned,
    roundingMethod,
    roundingPrecision,
  );
  const roundedTotalForexGainLossSigned = applyRound(
    totalForexGainLossSigned,
    roundingMethod,
    roundingPrecision,
  );
  const roundedTotalForexRevaluationSigned = applyRound(
    totalForexRevaluationSigned,
    roundingMethod,
    roundingPrecision,
  );

  logger.info("exiting::getLedgerForexGainLossEngine::service");

  return {
    asOfDate: asOfDateStr,
    baseCurrency: toIdValue(baseCurrency, "code"),
    rows,
    totals: {
      transactedBaseAmount: toForexAmt(roundedTotalTransactedBaseSigned),
      currentBaseAmount: toForexAmt(roundedTotalCurrentBaseSigned),
      forexRevaluationAmount: toForexAmt(roundedTotalForexRevaluationSigned),
      forexGainLossAmount: toForexAmt(roundedTotalForexGainLossSigned),
    },
  };
};

export const buildCurrentRateMap = (params: {
  currencyIds: number[];
  rates: RateOfExchange[];
  companyId: number;
  financialYearId: number;
  asOfDate: Date;
}): Map<number, number> => {
  const { currencyIds, rates, companyId, financialYearId, asOfDate } = params;
  const rateMap = new Map<number, number>();

  for (const currencyId of currencyIds) {
    const currencyRates = rates
      .filter(
        (rate) =>
          rate.companyId === companyId &&
          rate.financialYearId === financialYearId &&
          rate.currencyId === currencyId,
      )
      .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));

    let effectiveRateOfExchangeRecord: RateOfExchange | null = null;

    effectiveRateOfExchangeRecord =
      currencyRates.find((rate) =>
        dayjs(rate.date).isSame(dayjs(asOfDate), "day"),
      ) ?? null;

    if (!effectiveRateOfExchangeRecord && currencyRates.length > 0) {
      const pastRates = currencyRates.filter(
        (rate) =>
          dayjs(rate.date).isBefore(dayjs(asOfDate), "day") ||
          dayjs(rate.date).isSame(dayjs(asOfDate), "day"),
      );
      if (pastRates.length > 0) {
        effectiveRateOfExchangeRecord = pastRates[pastRates.length - 1];
      }
    }

    if (effectiveRateOfExchangeRecord) {
      rateMap.set(currencyId, effectiveRateOfExchangeRecord.stdRate);
    }
  }

  return rateMap;
};
