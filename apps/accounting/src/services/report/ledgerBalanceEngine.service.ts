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
import { Group, Ledger } from "@repo/db/generated/prisma/client";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

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

    const closingSigned = openingSigned + periodSigned;

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
