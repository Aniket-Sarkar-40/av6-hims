import { auditProxy } from "@/config/audit.config.js";
import { requestStorage } from "@/config/requestContext.js";
import { getOpeningBalancesByLedgerIds } from "@/repository/master/ledgerOpeningBalance.repository.js";
import {
  getVoucherLineSumsBeforeDate,
  getVoucherLineSumsInRange,
} from "@/repository/voucher/voucher.repository.js";
import { LedgerBalanceEngineInput } from "@/types/reports/ledgerBalanceEngine.js";
import {
  buildDrCrSumMap,
  isAllZero,
  LedgerBalanceRowNum,
  signedFromDrCr,
  toDrCr,
} from "@/utils/ledgerBalanceEngine.utils.js";
import { validateLedgerBalanceEngineServiceValidation } from "@/validations/service/report/ledgerBalanceEngine.service.validation.js";
import { applyRound, RoundFormat, toIdValue } from "av6-utils";
import { commonGetService } from "../common.service.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  Currency,
  Group,
  Ledger,
  LedgerOpeningBalance,
} from "@repo/db/generated/prisma/client";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { getCompanyByIdFromDb } from "@/repository/company/company.repository.js";
import dayjs from "dayjs";
import { currencyService } from "@apps/core/services/master/currency.service.js";

/**
 * For foreign-currency ledgers the closing balance is not the simple sum of base
 * `amount`s; it is the net foreign-currency balance (from `currencyAmount`) revalued
 * at the exchange rate effective on `toDate`. Returns a map of ledgerId -> revalued
 * closing balance (signed; positive = DR, negative = CR) in base currency.
 */
const buildForeignLedgerClosingSignedMap = async (params: {
  companyId: number;
  financialYearId: number;
  fromDate: Date;
  toDate: Date;
  ccId?: number;
  foreignLedgers: Ledger[];
  openingRows: LedgerOpeningBalance[];
}): Promise<Map<number, number>> => {
  logger.info("entering::buildForeignLedgerClosingSignedMap::service");
  const {
    companyId,
    financialYearId,
    fromDate,
    toDate,
    ccId,
    foreignLedgers,
    openingRows,
  } = params;

  const closingSignedMap = new Map<number, number>();
  if (!foreignLedgers.length) {
    logger.info(
      "exiting::buildForeignLedgerClosingSignedMap::service (no foreign ledgers)"
    );
    return closingSignedMap;
  }

  const store = requestStorage.getStore();
  const settings = store?.settings;
  const roundingPrecision = settings?.roundingPrecision ?? 2;
  const roundingMethod = settings?.roundingMethod ?? RoundFormat.TO_FIXED;
  const asOfDateStr = dayjs(toDate).format("YYYY-MM-DD");

  const foreignLedgerIds = foreignLedgers.map((ledger) => ledger.id);

  const currencies = await currencyService.getAllCurrency();
  const currencyMap = new Map<number, Currency>(
    currencies.map((currency) => [currency.id, currency])
  );

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

  for (const ledger of foreignLedgers) {
    let foreignClosingSigned = 0;

    for (const opening of openingRows) {
      if (opening.ledgerId !== ledger.id) continue;
      foreignClosingSigned += signedFromDrCr(
        opening.drCr,
        Number(opening.currencyAmount ?? 0)
      );
    }

    for (const voucherSum of voucherSums) {
      if (voucherSum.ledgerId !== ledger.id) continue;
      foreignClosingSigned += signedFromDrCr(
        voucherSum.drCr,
        Number(voucherSum._sum.currencyAmount ?? 0)
      );
    }

    const roundedForeignClosingSigned = applyRound(
      foreignClosingSigned,
      roundingMethod,
      roundingPrecision
    );
    const currencyId = ledger.currencyId as number;
    const currentRate = rateMap.get(currencyId);

    if (
      roundedForeignClosingSigned !== 0 &&
      (currentRate === undefined || currentRate <= 0)
    ) {
      const currency = currencyMap.get(currencyId);
      throw new ErrorHandler(
        400,
        `Exchange rate not found for ${
          currency?.code ?? currency?.name ?? currencyId
        } as on ${asOfDateStr}`
      );
    }

    closingSignedMap.set(ledger.id, foreignClosingSigned * (currentRate ?? 0));
  }

  logger.info("exiting::buildForeignLedgerClosingSignedMap::service");
  return closingSignedMap;
};

export const getLedgerBalancesNumber = async (
  input: LedgerBalanceEngineInput
): Promise<LedgerBalanceRowNum[]> => {
  logger.info("entering::getLedgerBalancesNumber::service");
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

  const ledgers = allLedgers.filter(
    (l) => l.companyId === companyId
  ) as Ledger[];

  const company = await getCompanyByIdFromDb(companyId);
  const baseCurrencyId = company?.currencyId ?? null;

  // A ledger is "foreign currency" when it is tagged with a currency other than the
  // company base currency; its closing balance must be revalued at the closing rate.
  const ledgerIdFilter = ledgerIds?.length ? new Set(ledgerIds) : null;
  const foreignLedgers = ledgers.filter(
    (l) =>
      l.currencyId !== null &&
      baseCurrencyId !== null &&
      l.currencyId !== baseCurrencyId &&
      (!ledgerIdFilter || ledgerIdFilter.has(l.id))
  );
  const foreignLedgerIdSet = new Set(foreignLedgers.map((l) => l.id));

  const ledgerGroupMap = new Map<number, Group>();
  for (const ledger of ledgers) {
    const group = groups.find((g) => g.id === ledger.groupId);
    if (!group) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", `Group for ledger ${ledger.name}`)
      );
    }
    ledgerGroupMap.set(ledger.id, group);
  }

  const openingRows = await getOpeningBalancesByLedgerIds({
    companyId,
    financialYearId,
    ledgerIds,
  });
  const beforeRows = await getVoucherLineSumsBeforeDate({
    companyId,
    financialYearId,
    fromDate,
    ccId,
    ledgerIds,
  });
  const rangeRows = await getVoucherLineSumsInRange({
    companyId,
    financialYearId,
    fromDate,
    toDate,
    ccId,
    ledgerIds,
  });

  // Build maps

  const openingSignedMap = new Map<number, number>();
  for (const row of openingRows) {
    const ledger = allLedgers.find((l) => l.id === row.ledgerId);
    const group = groups.find((g) => g.id === ledger?.groupId);
    if (!group) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", `Group for ledger ${ledger?.name}`)
      );
    }
    const signed = signedFromDrCr(row.drCr, Number(row.amount));
    openingSignedMap.set(
      row.ledgerId,
      (openingSignedMap.get(row.ledgerId) ?? 0) + signed
    );
  }

  const beforeMap = buildDrCrSumMap(beforeRows ?? []);
  const rangeMap = buildDrCrSumMap(rangeRows ?? []);

  const foreignClosingSignedMap = await buildForeignLedgerClosingSignedMap({
    companyId,
    financialYearId,
    fromDate,
    toDate,
    ccId,
    foreignLedgers,
    openingRows,
  });

  // Ledger universe
  const ledgerIdSet = new Set<number>();
  for (const k of openingSignedMap.keys()) ledgerIdSet.add(k);
  for (const k of beforeMap.keys()) ledgerIdSet.add(k);
  for (const k of rangeMap.keys()) ledgerIdSet.add(k);
  if (ledgerIds?.length) ledgerIds.forEach((id) => ledgerIdSet.add(id));

  const results: LedgerBalanceRowNum[] = [];

  for (const ledgerId of ledgerIdSet) {
    const group = ledgerGroupMap.get(ledgerId);
    if (!group) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", `Group for ledger ${ledgerId}`)
      );
    }
    const openingBaseSigned = openingSignedMap.get(ledgerId) ?? 0;

    const before = beforeMap.get(ledgerId) ?? { dr: 0, cr: 0 };
    const beforeSigned = before.dr - before.cr;
    const openingSigned = openingBaseSigned + beforeSigned;

    const period = rangeMap.get(ledgerId) ?? { dr: 0, cr: 0 };
    const periodSigned = period.dr - period.cr;

    // Foreign-currency ledgers close at the revalued (currencyAmount × closing rate)
    // balance instead of the plain base-amount roll-forward.
    const closingSigned =
      foreignLedgerIdSet.has(ledgerId) && foreignClosingSignedMap.has(ledgerId)
        ? (foreignClosingSignedMap.get(ledgerId) as number)
        : openingSigned + periodSigned;

    const row: LedgerBalanceRowNum = {
      ledger: toIdValue(
        ledgers.find((l) => l.id === ledgerId),
        "name"
      ),
      opening: toDrCr(
        applyRound(openingSigned, roundingMethod, roundingPrecision)
      ),
      period: {
        dr: applyRound(period.dr, roundingMethod, roundingPrecision),
        cr: applyRound(period.cr, roundingMethod, roundingPrecision),
      },
      closing: toDrCr(
        applyRound(closingSigned, roundingMethod, roundingPrecision)
      ),
    };

    if (!includeZero && isAllZero(row)) continue;
    results.push(row);
  }

  results.sort((a, b) => (a.ledger?.id ?? 0) - (b.ledger?.id ?? 0));
  logger.info("exiting::getLedgerBalancesNumber::service");
  return results;
};

const ledgerBalanceRaw = {
  async getLedgerBalanceNumber(
    input: LedgerBalanceEngineInput
  ): Promise<LedgerBalanceRowNum[]> {
    logger.info("entering::getLedgerBalanceNumber::service");
    await validateLedgerBalanceEngineServiceValidation(input);
    const ledgerBalance = await getLedgerBalancesNumber(input);
    logger.info("exiting::getLedgerBalanceNumber::service");
    return ledgerBalance;
  },
};

export const ledgerBalanceService = auditProxy.createAuditedService(
  "ledger-balance",
  ledgerBalanceRaw
);
