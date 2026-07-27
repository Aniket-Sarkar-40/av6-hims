import { auditProxy } from "@/config/audit.config.js";
import { requestStorage } from "@/config/requestContext.js";
import { toLedgerDtoForTrialBalance } from "@/mapper/master/ledger.mapper.js";
import { getLedgersByCompanyIdAndLedgerIds } from "@/repository/master/ledger.repository.js";
import { getLedgerBookLines } from "@/repository/voucher/voucher.repository.js";
import { LedgerDTOForTrialBalance } from "@/types/master/ledger.js";
import {
  BalanceSheetRequestInput,
  BalanceSheetResponse,
  BsNode,
  InternalNodeForBalanceSheet,
} from "@/types/reports/balanceSheet.js";
import type {
  AgeingBucketAmount,
  AgeingSummaryResponse,
} from "@/types/reports/groupSummary.js";
import {
  GroupSummaryNode,
  GroupSummaryRequestInput,
  GroupSummaryTreeResponse,
} from "@/types/reports/groupSummary.js";
import { DrCrAmt } from "@/types/reports/ledgerBalanceEngine.js";
import {
  LedgerBookExcelRequestInput,
  LedgerBookRequestInput,
  LedgerBookResponse,
  LedgerBookRow,
  VirtualRow,
  voucherHeadResponseForLedgerBook,
} from "@/types/reports/ledgerBook.js";
import {
  GroupMeta,
  InternalNode,
  PlNode,
  ProfitLossResponse,
} from "@/types/reports/profitLoss.js";
import type { AgeingBucketInput } from "@/types/reports/report.js";
import { ReportCommonRequestInput } from "@/types/reports/report.js";
import {
  TrialBalanceRequestInput,
  TrialBalanceResponse,
  TrialBalanceRow,
} from "@/types/reports/trialBalance.js";

import { IdValue } from "@/types/global.js";
import {
  CashFlowGroupRecursiveRow,
  CashFlowLedgerRow,
  CashFlowMonthRow,
  CashFlowNode,
  CashFlowRequestInput,
  CashFlowResponse,
} from "@/types/reports/cashFlow.js";
import {
  FundFlowGroupRecursiveRow,
  FundFlowLedgerRow,
  FundFlowMonthlyRow,
  FundFlowRequestInput,
  FundFlowResponse,
  FundFlowSummaryRow,
} from "@/types/reports/fundFlow.js";
import { toPickFieldsWithoutNull } from "@/utils/helper.utils.js";
import {
  addDifferenceNodeAdvanced,
  addDrCr,
  addSigned,
  almostEqual,
  decToNum,
  DifferenceType,
  getDifferenceLabel,
  LedgerBalanceRowNum,
  netAsset,
  netExpense,
  netIncome,
  netLiability,
  toDrCr,
  zero,
} from "@/utils/ledgerBalanceEngine.utils.js";
import {
  validateBalanceSheetServiceValidation,
  validateCashFlowServiceValidation,
  validateFundFlowServiceValidation,
  validateLedgerBookServiceValidation,
  validateReportCommonServiceValidation,
  validateTrialBalanceServiceValidation,
} from "@/validations/service/report/report.service.validation.js";
import {
  AccountingReportType,
  Currency,
  DrCr,
  Group,
  Ledger,
} from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import {
  CASH_BANK_GROUPS,
  PAYABLE_GROUPS,
  RECEIVABLE_GROUPS,
} from "@repo/shared";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { applyRound, customOmit, RoundFormat, toIdValue } from "av6-utils";
import dayjs from "dayjs";
import ExcelJs from "exceljs";
import PDFDocument from "pdfkit";
import { commonGetService } from "../common.service.js";
import { cashFlowEngineService } from "./cashFlowEngine.service.js";
import { fundFlowEngineService } from "./fundFlowEngine.service.js";
import { getLedgerBalancesNumber } from "./ledgerBalanceEngine.service.js";
import { currencyService } from "@apps/core/services/master/currency.service.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { getLedgerForexGainLossEngine } from "@/services/report/ledgerForexEngine.service.js";
import { forexAmtToSigned, isRoundedZero } from "@/utils/forexReport.utils.js";
import {
  ForexDrCrAmt,
  ForexGainLossNode,
  ForexGainLossStatementInput,
  ForexGainLossStatementResult,
  LedgerForexGainLossEngineResult,
  LedgerForexGainLossRow,
  LedgerForexReportInput,
} from "@/types/reports/forexReport.js";
import { featureFlagService } from "@/services/feature/feature.service.js";
import { validateLedgerBalanceEngineServiceValidation } from "@/validations/service/report/ledgerBalanceEngine.service.validation.js";
import { inventoryRequests } from "@/client/inventory/request.js";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const UNADJUSTED_FOREX_GAIN_LOSS_LABEL = "Unadjusted Forex Gain/Loss";
const FOREX_GAIN_LOSS_VIRTUAL_ID = -10;
const CLOSING_STOCK_VIRTUAL_ID = -2;
const CLOSING_STOCK_LABEL = "Closing Stock";
const CURRENT_ASSETS_GROUP_NAME = "Current Assets";

const toStartOfDay = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const calculateAgeDays = (voucherDate: Date, asOnDate: Date): number => {
  const diffInMs =
    toStartOfDay(asOnDate).getTime() - toStartOfDay(voucherDate).getTime();
  if (diffInMs <= 0) return 0;
  return Math.floor(diffInMs / DAY_IN_MS);
};

const collectLedgersFromGroupTree = (roots: GroupSummaryNode[]): IdValue[] => {
  const map = new Map<number, IdValue>();

  const walk = (node: GroupSummaryNode) => {
    for (const ledgerRow of node.ledger) {
      if (ledgerRow.ledger?.id && ledgerRow.ledger.value) {
        map.set(ledgerRow.ledger.id, {
          id: ledgerRow.ledger.id,
          value: ledgerRow.ledger.value,
        });
      }
    }

    node.children.forEach(walk);
  };

  roots.forEach(walk);

  return [...map.values()];
};

const findAgeingBucketIndex = (
  ageDays: number,
  buckets: AgeingBucketInput[],
): number => {
  return buckets.findIndex(
    (bucket) =>
      ageDays >= bucket.from && (bucket.to === 0 || ageDays <= bucket.to),
  );
};

const toAgeingBucketAmounts = (
  bucketDefinitions: AgeingBucketInput[],
  amounts: number[],
): AgeingBucketAmount[] => {
  return bucketDefinitions.map((bucket, index) => ({
    from: bucket.from,
    to: bucket.to,
    amount: amounts[index] ?? 0,
  }));
};

const buildAgeingSummary = async (params: {
  companyId: number;
  financialYearId: number;
  fromDate: Date;
  toDate: Date;
  ccId?: number;
  includeZero: boolean;
  roots: GroupSummaryNode[];
  buckets: AgeingBucketInput[];
  mode: "RECEIVABLE" | "PAYABLE";
}): Promise<AgeingSummaryResponse> => {
  const {
    companyId,
    financialYearId,
    fromDate,
    toDate,
    ccId,
    includeZero,
    roots,
    buckets,
    mode,
  } = params;

  const store = requestStorage.getStore();
  const settings = store?.settings;
  const roundingPrecision = settings?.roundingPrecision ?? 2;
  const roundingMethod = settings?.roundingMethod ?? RoundFormat.TO_FIXED;

  const roundValue = (value: number) =>
    applyRound(value, roundingMethod, roundingPrecision);

  const rows: AgeingSummaryResponse["rows"] = [];

  const totals = {
    pending: 0,
    bucketAmounts: new Array(buckets.length).fill(0) as number[],
  };

  const asOnDate = new Date(toDate);
  const effectiveToDate = new Date(toDate);
  const ledgerItems = collectLedgersFromGroupTree(roots);

  for (const ledger of ledgerItems) {
    const lines = await getLedgerBookLines({
      companyId,
      financialYearId,
      ledgerId: ledger.id,
      fromDate,
      toDate: effectiveToDate,
      ccId,
    });

    const bucketValues = new Array(buckets.length).fill(0) as number[];
    let pending = 0;

    for (const line of lines) {
      const amount = decToNum(line.amount);

      const signedAmount =
        mode === "RECEIVABLE"
          ? line.drCr === DrCr.DR
            ? amount
            : -amount
          : line.drCr === DrCr.CR
            ? amount
            : -amount;

      if (!signedAmount) continue;

      const ageDays = calculateAgeDays(line.voucher.voucherDate, asOnDate);
      const bucketIndex = findAgeingBucketIndex(ageDays, buckets);
      if (bucketIndex < 0) continue;

      bucketValues[bucketIndex] = roundValue(
        bucketValues[bucketIndex] + signedAmount,
      );
      pending = roundValue(pending + signedAmount);
    }

    const roundedBucketValues = bucketValues.map((value) => roundValue(value));
    const roundedPending = roundValue(pending);

    if (!includeZero && roundedPending === 0) continue;

    for (let i = 0; i < roundedBucketValues.length; i++) {
      totals.bucketAmounts[i] = roundValue(
        totals.bucketAmounts[i] + roundedBucketValues[i],
      );
    }

    totals.pending = roundValue(totals.pending + roundedPending);

    rows.push({
      ledger,
      pending: roundedPending,
      bucketAmounts: toAgeingBucketAmounts(buckets, roundedBucketValues),
    });
  }

  return {
    asOnDate,
    bucketDefinitions: buckets,
    rows,
    totals: {
      pending: roundValue(totals.pending),
      bucketAmounts: toAgeingBucketAmounts(
        buckets,
        totals.bucketAmounts.map((value) => roundValue(value)),
      ),
    },
  };
};

const getPendingAdvance = (
  dr: number,
  cr: number,
  type: "payable" | "receivable",
) => {
  const diff = Number(type === "receivable" ? dr - cr : cr - dr);
  return {
    pending: diff > 0 ? diff : "",
    advance: diff < 0 ? Math.abs(diff) : "",
  };
};

// ── Amount formatter for Pdf ──
const fmtPdfAmt = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(value);
  if (isNaN(num)) return String(value);
  return num.toFixed(2);
};

const reportServiceRaw = {
  async getTrialBalance(
    input: TrialBalanceRequestInput,
  ): Promise<TrialBalanceResponse> {
    logger.info("entering::getTrialBalance::report::service");

    await validateTrialBalanceServiceValidation(input);
    const { companyId, ledgerIds, includeZero = false } = input;

    // const store = requestStorage.getStore();
    // const settings = store?.settings;
    // const roundingPrecision = settings?.roundingPrecision ?? 2;
    // const roundingMethod = settings?.roundingMethod ?? RoundFormat.TO_FIXED;

    // 1) ledger balances (numbers only)
    const balances = await getLedgerBalancesNumber(input);

    // 2) ledger master data

    /**
     * const ledgerMaster = await getLedgersByCompanyIdAndLedgerIds({ companyId, ledgerIds });
     */
    const allLedgers = (await commonGetService.getAllElements<"Ledger">({
      cacheCode: "LEDGER",
      canNullReturnable: true,
      modelName: "Ledger",
      shortCode: "LEDGER",
      useActiveFlag: true,
    })) as Ledger[];

    const ledgerMaster = allLedgers.filter(
      (l) =>
        l.companyId === companyId &&
        (ledgerIds?.length ? ledgerIds.includes(l.id) : true),
    ) as Ledger[];

    const ledgerDtos = await toLedgerDtoForTrialBalance(ledgerMaster);
    const ledgerMap = new Map<number, LedgerDTOForTrialBalance>();
    for (const l of ledgerDtos) {
      ledgerMap.set(l.id, l);
    }

    // 3) build rows
    let rows: TrialBalanceRow[] = [];
    let openingDr = 0,
      openingCr = 0,
      periodDr = 0,
      periodCr = 0,
      closingDr = 0,
      closingCr = 0;

    for (const b of balances) {
      const meta = ledgerMap.get(b.ledger?.id ?? 0);
      if (!meta) continue; // ledger might be inactive or filtered out

      const row: TrialBalanceRow = {
        ledger: toIdValue(meta, "name"),
        group: meta.group,
        parentGroup: meta.parentGroup,
        opening: b.opening,
        period: b.period,
        closing: b.closing,
      };

      if (!includeZero) {
        const allZero =
          row.opening.dr === 0 &&
          row.opening.cr === 0 &&
          row.period.dr === 0 &&
          row.period.cr === 0 &&
          row.closing.dr === 0 &&
          row.closing.cr === 0;
        if (allZero) continue;
      }

      openingDr += row.opening.dr;
      openingCr += row.opening.cr;
      periodDr += row.period.dr;
      periodCr += row.period.cr;
      closingDr += row.closing.dr;
      closingCr += row.closing.cr;

      rows.push(row);
    }

    // 4) sort rows
    rows.sort(
      (a, b) =>
        (a.group?.id ?? 0) - (b.group?.id ?? 0) ||
        (a.ledger?.id ?? 0) - (b.ledger?.id ?? 0),
    );

    //Opening balance difference in opening and closing balance check
    const openingDiff = openingDr - openingCr;

    const openingResult = addDifferenceNodeAdvanced<TrialBalanceRow>({
      items: rows,
      drTotal: openingDr,
      crTotal: openingCr,
      type: "OPENING",
      createNode: (diff: number, type: DifferenceType) => ({
        ledger: { id: -1, value: getDifferenceLabel(type) },
        group: null,
        parentGroup: null,
        opening:
          diff > 0
            ? { dr: 0, cr: Math.abs(diff) }
            : { dr: Math.abs(diff), cr: 0 },
        period: { dr: 0, cr: 0 },
        closing:
          diff > 0
            ? { dr: 0, cr: Math.abs(diff) }
            : { dr: Math.abs(diff), cr: 0 },
      }),
    });

    rows = openingResult.items;

    openingDr = openingResult.totals.dr;
    openingCr = openingResult.totals.cr;

    if (openingDiff > 0) {
      closingCr += Math.abs(openingDiff);
    } else if (openingDiff < 0) {
      closingDr += Math.abs(openingDiff);
    }

    // Unadjusted forex gain/loss: foreign-currency ledgers are revalued at the closing
    // rate inside getLedgerBalancesNumber, so add the contra entry that balances the
    // revalued closing figures.
    const forexResult = await getLedgerForexGainLossEngine(input);
    const forexGainLoss = forexResult.totals.forexGainLossAmount;
    if (forexGainLoss.drCr && forexGainLoss.amount !== 0) {
      const forexClosing = toDrCr(forexAmtToSigned(forexGainLoss));
      rows.push({
        ledger: {
          id: FOREX_GAIN_LOSS_VIRTUAL_ID,
          value: UNADJUSTED_FOREX_GAIN_LOSS_LABEL,
        },
        group: null,
        parentGroup: null,
        opening: zero(),
        period: zero(),
        closing: forexClosing,
      });
      closingDr += forexClosing.dr;
      closingCr += forexClosing.cr;
    }

    const finalTotals = {
      opening: { dr: openingDr, cr: openingCr },
      period: { dr: periodDr, cr: periodCr },
      closing: {
        dr: closingDr,
        cr: closingCr,
      },
    };
    logger.info("exiting::getTrialBalance::report::service");
    return {
      rows: rows,
      totals: finalTotals,
      isBalanced: {
        opening: almostEqual(finalTotals.opening.dr, finalTotals.opening.cr),
        period: almostEqual(finalTotals.period.dr, finalTotals.period.cr),
        closing: almostEqual(finalTotals.closing.dr, finalTotals.closing.cr),
      },
    };
  },

  async getLedgerBook(
    input: LedgerBookRequestInput,
  ): Promise<LedgerBookResponse> {
    logger.info("entering::getLedgerBook::report::service");
    const { companyId, financialYearId, ledgerId, fromDate, toDate, ccId } =
      input;
    const ledger = await validateLedgerBookServiceValidation(input);

    const store = requestStorage.getStore();
    const settings = store?.settings;
    const roundingPrecision = settings?.roundingPrecision ?? 2;
    const roundingMethod = settings?.roundingMethod ?? RoundFormat.TO_FIXED;

    const voucherTypes = await commonGetService.getAllElements<"VoucherType">({
      cacheCode: "VOUCHER_TYPE",
      canNullReturnable: true,
      modelName: "VoucherType",
      shortCode: "VOUCHER_TYPE",
      useActiveFlag: true,
    });

    const group = (await commonGetService.getElementById<"Group">({
      cacheCode: "GROUP",
      canNullReturnable: true,
      modelName: "Group",
      id: ledger.groupId,
      shortCode: "GROUP",
      useActiveFlag: true,
    })) as Group;

    if (!group) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", `Group for ledger ${ledger.name}`),
      );
    }

    const currencies = await currencyService.getAllCurrency();
    const currencyMap = new Map<number, Currency>();
    for (const currency of currencies) {
      currencyMap.set(currency.id, currency);
    }

    const [balance] = await getLedgerBalancesNumber({
      companyId,
      financialYearId,
      fromDate,
      toDate: toDate, // engine uses before-from and opening; toDate not needed for opening
      ccId,
      ledgerIds: [ledgerId],
      includeZero: true,
    });

    const opening = balance?.opening ?? { dr: 0, cr: 0 };

    let runningSigned = opening.dr - opening.cr;

    const lines = await getLedgerBookLines({
      companyId,
      financialYearId,
      ledgerId,
      fromDate,
      toDate,
      ccId,
    });

    let totalDr = 0;
    let totalCr = 0;

    const rows: LedgerBookRow[] = [];
    let virtualRow: VirtualRow | null = null;
    for (const l of lines) {
      const amt = decToNum(l.amount);
      const dr = l.drCr === DrCr.DR ? amt : 0;
      const cr = l.drCr === DrCr.CR ? amt : 0;

      totalDr += dr;
      totalCr += cr;

      runningSigned = addSigned(runningSigned, dr, cr);

      const voucherType = voucherTypes.find(
        (v) => v.id === l.voucher.voucherTypeId,
      );
      const createdBy = l.voucher.createdBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(l.voucher.createdBy)
        : null;
      const updatedBy = l.voucher.updatedBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(l.voucher.updatedBy)
        : null;
      const voucherHeadResponse: voucherHeadResponseForLedgerBook = {
        ...customOmit(l.voucher, [
          "voucherTypeId",
          "isActive",
          "createdBy",
          "createdAt",
          "updatedBy",
          "updatedAt",
          "deletedBy",
          "deletedAt",
        ]).rest,
        voucherType: voucherType ? toIdValue(voucherType, "name") : null,
        createdBy: toIdValue(createdBy, "name"),
        updatedBy: toIdValue(updatedBy, "name"),
      };

      const currency = voucherHeadResponse.currencyId
        ? (currencyMap.get(voucherHeadResponse.currencyId) ?? null)
        : null;
      //const createdBy

      rows.push({
        ...l,
        voucher: voucherHeadResponse,
        currency,
        runningBalance: toDrCr(runningSigned),
      });
    }
    // Add unadjusted forex row after normal voucher rows
    const forexEngineResult = await getLedgerForexGainLossEngine({
      companyId,
      financialYearId,
      fromDate,
      toDate,
      ccId,
      ledgerIds: [ledgerId],
      includeZero: false,
    });

    const ledgerForexRow = forexEngineResult.rows.find(
      (row) => row.ledger?.id === ledgerId,
    );

    if (ledgerForexRow) {
      const ledgerRevaluationSigned = applyRound(
        forexAmtToSigned(ledgerForexRow.ledgerRevaluationAmount),
        roundingMethod,
        roundingPrecision,
      );

      if (
        !isRoundedZero(
          ledgerRevaluationSigned,
          roundingMethod,
          roundingPrecision,
        )
      ) {
        const forexDr =
          ledgerRevaluationSigned > 0 ? Math.abs(ledgerRevaluationSigned) : 0;
        const forexCr =
          ledgerRevaluationSigned < 0 ? Math.abs(ledgerRevaluationSigned) : 0;

        totalDr += forexDr;
        totalCr += forexCr;

        runningSigned = addSigned(runningSigned, forexDr, forexCr);

        // Add the virtual forex gain/loss row

        virtualRow =
          ledgerRevaluationSigned !== 0
            ? {
                id: 999,
                value: "Unadjusted Forex Gain/Loss",
                amount: toDrCr(ledgerRevaluationSigned),
              }
            : null;
      }
    }

    const closing = toDrCr(runningSigned);

    logger.info("exiting::getLedgerBook::report::service");
    return {
      ledger: {
        id: ledger.id,
        name: ledger.name,
        isBankAccount: ledger.isBankAccount,
      },
      openingBalance: opening,
      rows,
      virtualRow,
      totals: {
        dr: applyRound(totalDr, roundingMethod, roundingPrecision),
        cr: applyRound(totalCr, roundingMethod, roundingPrecision),
      },
      closingBalance: closing,
    };
  },

  async getGroupSummaryTree(
    input: GroupSummaryRequestInput,
  ): Promise<GroupSummaryTreeResponse> {
    logger.info("entering::getGroupSummaryTree::report::service");

    await validateReportCommonServiceValidation(input);

    const {
      companyId,
      financialYearId,
      fromDate,
      toDate,
      ccId,
      includeZero = true,
      groupId,
      groupIds,
    } = input;

    /* ---------------- SELECT GROUP IDS ---------------- */

    const selectedGroupIds = [
      ...new Set(
        groupIds && groupIds.length ? groupIds : groupId ? [groupId] : [],
      ),
    ];

    if (!selectedGroupIds.length) {
      throw new ErrorHandler(400, "At least one groupId is required");
    }

    /* ---------------- SETTINGS ---------------- */

    const store = requestStorage.getStore();
    const settings = store?.settings;
    const roundingPrecision = settings?.roundingPrecision ?? 2;
    const roundingMethod = settings?.roundingMethod ?? RoundFormat.TO_FIXED;

    /* ---------------- GET GROUPS ---------------- */

    const allGroups: Group[] = await commonGetService.getAllElements<"Group">({
      cacheCode: "GROUP",
      canNullReturnable: true,
      modelName: "Group",
      shortCode: "GROUP",
      useActiveFlag: true,
    });

    const groups = allGroups.filter((g) => g.companyId === companyId);

    /* ---------------- MAPS ---------------- */

    const groupMap = new Map<number, Group>();
    const nodeMap = new Map<number, GroupSummaryNode>();
    const parentMap = new Map<number, number | null>();

    // pass 1
    for (const g of groups) {
      groupMap.set(g.id, g);
      parentMap.set(g.id, g.parentId ?? null);
    }

    // validate requested ids early
    for (const id of selectedGroupIds) {
      if (!groupMap.has(id)) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", `Group ${id} not found`),
        );
      }
    }

    // overlap validation
    const isAncestor = (ancestorId: number, nodeId: number): boolean => {
      let current = parentMap.get(nodeId) ?? null;

      while (current) {
        if (current === ancestorId) return true;
        current = parentMap.get(current) ?? null;
      }

      return false;
    };

    for (let i = 0; i < selectedGroupIds.length; i++) {
      for (let j = 0; j < selectedGroupIds.length; j++) {
        if (i === j) continue;

        if (isAncestor(selectedGroupIds[i], selectedGroupIds[j])) {
          throw new ErrorHandler(
            400,

            `Overlapping groups are not allowed: group ${selectedGroupIds[i]} is ancestor of ${selectedGroupIds[j]}`,
          );
        }
      }
    }

    // pass 2
    for (const g of groups) {
      nodeMap.set(g.id, {
        group: toIdValue(g, "name"),
        parent:
          g.parentId && groupMap.has(g.parentId)
            ? toIdValue(groupMap.get(g.parentId)!, "name")
            : null,
        opening: zero(),
        period: zero(),
        closing: zero(),
        children: [],
        ledger: [],
      });
    }

    /* ---------------- LEDGER BALANCES ---------------- */

    const ledgerBalances = await getLedgerBalancesNumber({
      companyId,
      financialYearId,
      fromDate,
      toDate,
      ccId,
      includeZero,
    });

    const ledgerBalanceMap = new Map<number, LedgerBalanceRowNum>();

    for (const lb of ledgerBalances) {
      if (lb.ledger?.id) {
        ledgerBalanceMap.set(lb.ledger.id, lb);
      }
    }

    const ledgerIds = [...ledgerBalanceMap.keys()];

    const ledgers = await getLedgersByCompanyIdAndLedgerIds({
      companyId,
      ledgerIds,
    });

    /* ---------------- PROCESS LEDGERS ---------------- */

    for (const ledger of ledgers) {
      const lb = ledgerBalanceMap.get(ledger.id);
      if (!lb) continue;

      const node = nodeMap.get(ledger.groupId);

      if (!node) {
        logger.warn(
          `Ledger ${ledger.id} has invalid groupId ${ledger.groupId}`,
        );
        continue;
      }

      node.ledger.push({
        ledger: toIdValue(ledger, "name"),
        opening: lb.opening,
        period: lb.period,
        closing: lb.closing,
      });

      node.opening = addDrCr(node.opening, lb.opening);
      node.period = addDrCr(node.period, lb.period);
      node.closing = addDrCr(node.closing, lb.closing);

      let parentId = parentMap.get(ledger.groupId);
      const visited = new Set<number>();

      while (parentId) {
        if (visited.has(parentId)) {
          logger.error(
            `Cycle detected in group hierarchy at group ${parentId}`,
          );
          break;
        }

        visited.add(parentId);

        const parentNode = nodeMap.get(parentId);
        if (!parentNode) break;

        parentNode.opening = addDrCr(parentNode.opening, lb.opening);
        parentNode.period = addDrCr(parentNode.period, lb.period);
        parentNode.closing = addDrCr(parentNode.closing, lb.closing);

        parentId = parentMap.get(parentId) ?? null;
      }
    }

    /* ---------------- BUILD TREE ---------------- */

    for (const g of groups) {
      const node = nodeMap.get(g.id)!;
      const parentId = parentMap.get(g.id);

      if (parentId && nodeMap.has(parentId)) {
        nodeMap.get(parentId)!.children.push(node);
      }
    }

    /** add closing stock node if it exists */
    // if (
    //   groupId &&
    //   groups.find((g) => g.id === groupId)?.name === CURRENT_ASSETS_GROUP_NAME
    // ) {
    //   //:TODO
    //   // const stockSummary = await inventoryRequests.getOpeningAndClosingStock({
    //   //   financialYearId,
    //   //   fromDate,
    //   //   toDate,
    //   //   ccId,
    //   // });

    //   const closingStockNode: GroupSummaryNode = {
    //     group: {
    //       id: CLOSING_STOCK_VIRTUAL_ID,
    //       value: CLOSING_STOCK_LABEL,
    //     },
    //     parent: {
    //       id: groupId,
    //       value: CURRENT_ASSETS_GROUP_NAME,
    //     },
    //     opening: toDrCr(stockSummary?.totals.openingAmount ?? 0),
    //     period: {
    //       dr: stockSummary?.totals.inAmount ?? 0,
    //       cr: stockSummary?.totals.outAmount ?? 0,
    //     },
    //     closing: toDrCr(stockSummary?.totals.closingAmount ?? 0),
    //     children: [],
    //     ledger: [],
    //   };
    //   const node = nodeMap.get(groupId);
    //   if (node) {
    //     node.children.push(closingStockNode);
    //     node.closing = addDrCr(node.closing, closingStockNode.closing);
    //     node.period = addDrCr(node.period, closingStockNode.period);
    //     node.opening = addDrCr(node.opening, closingStockNode.opening);
    //   }
    // }
    /* ---------------- FILTER ZERO ---------------- */

    const hasValue = (n: GroupSummaryNode) =>
      !!(
        n.opening.dr ||
        n.opening.cr ||
        n.period.dr ||
        n.period.cr ||
        n.closing.dr ||
        n.closing.cr
      );

    const filterTree = (node: GroupSummaryNode): GroupSummaryNode => {
      const newNode: GroupSummaryNode = {
        ...node,
        children: [],
        ledger: [],
      };

      newNode.children = node.children
        .map(filterTree)
        .filter((c) => includeZero || hasValue(c) || c.children.length);

      newNode.ledger = node.ledger.filter(
        (l) =>
          includeZero ||
          l.opening.dr ||
          l.opening.cr ||
          l.period.dr ||
          l.period.cr ||
          l.closing.dr ||
          l.closing.cr,
      );

      return newNode;
    };

    /* ---------------- ROOTS + TOTALS ---------------- */

    const roots: GroupSummaryNode[] = [];

    let totalOpening = zero();
    let totalPeriod = zero();
    let totalClosing = zero();

    for (const id of selectedGroupIds) {
      const node = nodeMap.get(id)!;

      totalOpening = addDrCr(totalOpening, node.opening);
      totalPeriod = addDrCr(totalPeriod, node.period);
      totalClosing = addDrCr(totalClosing, node.closing);

      const filtered = filterTree(node);

      if (
        includeZero ||
        hasValue(filtered) ||
        filtered.children.length ||
        filtered.ledger.length
      ) {
        roots.push(filtered);
      }
    }

    /* ---------------- SORT ---------------- */

    const sortTree = (node: GroupSummaryNode) => {
      node.children.sort((a, b) =>
        (a.group?.value ?? "").localeCompare(b.group?.value ?? ""),
      );
      node.ledger.sort(
        (a, b) =>
          (a.ledger?.value ?? "").localeCompare(b.ledger?.value ?? "") ||
          (a.ledger?.id ?? 0) - (b.ledger?.id ?? 0),
      );
      node.children.forEach(sortTree);
    };

    roots.forEach(sortTree);

    /* ---------------- TOTALS FORMAT ---------------- */

    const totals = {
      openingDr: applyRound(totalOpening.dr, roundingMethod, roundingPrecision),
      openingCr: applyRound(totalOpening.cr, roundingMethod, roundingPrecision),
      periodDr: applyRound(totalPeriod.dr, roundingMethod, roundingPrecision),
      periodCr: applyRound(totalPeriod.cr, roundingMethod, roundingPrecision),
      closingDr: applyRound(totalClosing.dr, roundingMethod, roundingPrecision),
      closingCr: applyRound(totalClosing.cr, roundingMethod, roundingPrecision),
    };

    logger.info("exiting::getGroupSummaryTree::report::service");

    return {
      roots,
      totals,
    };
  },

  async getProfitLoss(
    input: ReportCommonRequestInput,
    includeOpeningInPL: boolean = true,
  ): Promise<ProfitLossResponse> {
    logger.info("entering::getProfitLoss::report::service");

    await validateReportCommonServiceValidation(input);

    const {
      companyId,
      financialYearId,
      fromDate,
      toDate,
      ccId,
      includeZero = false,
    } = input;

    const store = requestStorage.getStore();
    const settings = store?.settings;
    const roundingPrecision = settings?.roundingPrecision ?? 2;
    const roundingMethod = settings?.roundingMethod ?? RoundFormat.TO_FIXED;

    const featureFlag = await featureFlagService.getFeatureFlagByShortCode(
      "PROFIT_LOSS_REPORT_ADD_OPENING",
      true,
    );

    const allGroups: Group[] = await commonGetService.getAllElements<"Group">({
      cacheCode: "GROUP",
      canNullReturnable: true,
      modelName: "Group",
      shortCode: "GROUP",
      useActiveFlag: true,
    });

    const filteredGroups = allGroups.filter(
      (g) =>
        g.companyId === companyId &&
        g.reportType === AccountingReportType.PROFIT_LOSS,
    );

    const groups: GroupMeta[] = filteredGroups.map((g) => ({
      id: g.id,
      name: g.name,
      parentId: g.parentId ?? null,
      primaryCategory: g.primaryCategory,
      affectsGrossProfit: Boolean(g.affectsGrossProfit),
    }));

    const ledgerBalances = await getLedgerBalancesNumber({
      companyId,
      financialYearId,
      fromDate,
      toDate,
      ccId,
      includeZero,
    });

    const ledgerIds = ledgerBalances
      .map((x) => x.ledger?.id)
      .filter((id) => id !== undefined);

    const ledgers = await getLedgersByCompanyIdAndLedgerIds({
      companyId,
      ledgerIds,
    });

    const ledgerToGroup = new Map<number, number>();
    for (const l of ledgers) {
      ledgerToGroup.set(l.id, l.groupId);
    }

    const nodeMap = new Map<number, InternalNode>();
    const ownAmountByGroup = new Map<number, DrCrAmt>();

    for (const g of groups) {
      nodeMap.set(g.id, {
        ...g,
        amount: zero(),
        children: [],
      });

      ownAmountByGroup.set(g.id, zero());
    }

    for (const lb of ledgerBalances) {
      const ledgerId = lb.ledger?.id;
      if (!ledgerId) continue;

      const groupId = ledgerToGroup.get(ledgerId);
      if (!groupId) continue;

      const node = nodeMap.get(groupId);
      if (!node) continue;

      const amountToAdd =
        featureFlag?.isEnabled && includeOpeningInPL
          ? addDrCr(lb.opening, lb.period)
          : lb.period;

      node.amount = addDrCr(node.amount, amountToAdd);

      ownAmountByGroup.set(
        groupId,
        addDrCr(ownAmountByGroup.get(groupId) ?? zero(), amountToAdd),
      );
    }

    const roots: InternalNode[] = [];

    for (const n of nodeMap.values()) {
      if (n.parentId && nodeMap.has(n.parentId)) {
        nodeMap.get(n.parentId)!.children.push(n);
      } else {
        roots.push(n);
      }
    }

    const rollup = (n: InternalNode) => {
      n.children.sort(
        (a, b) =>
          (a.id ?? 0) - (b.id ?? 0) ||
          (a.name ?? "").localeCompare(b.name ?? ""),
      );

      for (const c of n.children) {
        rollup(c);
        n.amount = addDrCr(n.amount, c.amount);
      }
    };

    roots.sort(
      (a, b) =>
        (a.id ?? 0) - (b.id ?? 0) || (a.name ?? "").localeCompare(b.name ?? ""),
    );

    for (const r of roots) {
      rollup(r);
    }

    const incomeRoots = roots.filter((r) => r.primaryCategory === "INCOME");
    const expenseRoots = roots.filter((r) => r.primaryCategory === "EXPENSE");

    const isZero = (amt: DrCrAmt) => amt.dr === 0 && amt.cr === 0;

    const filterTree = (nodes: InternalNode[]): InternalNode[] =>
      nodes
        .map((n) => ({
          ...n,
          children: filterTree(n.children),
        }))
        .filter(
          (n) => includeZero || !isZero(n.amount) || n.children.length > 0,
        );

    const incomeFiltered = filterTree(incomeRoots);
    const expenseFiltered = filterTree(expenseRoots);

    const stockSummary = await inventoryRequests.getOpeningAndClosingStock({
      financialYearId,
      fromDate,
      toDate,
      ccId,
    });

    const openingStockAmount = stockSummary?.totals.openingAmount ?? 0;
    const closingStockAmount = stockSummary?.totals.closingAmount ?? 0;

    const getEffectiveAffectsGrossProfit = (groupId: number): boolean => {
      let currentNode = nodeMap.get(groupId);
      let effectiveValue = Boolean(currentNode?.affectsGrossProfit);
      const visited = new Set<number>();

      while (
        currentNode?.parentId &&
        nodeMap.has(currentNode.parentId) &&
        !visited.has(currentNode.parentId)
      ) {
        visited.add(currentNode.parentId);
        currentNode = nodeMap.get(currentNode.parentId);
        effectiveValue = Boolean(currentNode?.affectsGrossProfit);
      }

      return effectiveValue;
    };

    const sumIncome = (nodes: InternalNode[], directOnly: boolean) => {
      let total = 0;

      const walk = (n: InternalNode) => {
        const ownAmount = ownAmountByGroup.get(n.id) ?? zero();

        if (getEffectiveAffectsGrossProfit(n.id) === directOnly) {
          total += netIncome(ownAmount);
        }

        n.children.forEach(walk);
      };

      nodes.forEach(walk);

      return applyRound(total, roundingMethod, roundingPrecision);
    };

    const sumExpense = (nodes: InternalNode[], directOnly: boolean) => {
      let total = 0;

      const walk = (n: InternalNode) => {
        const ownAmount = ownAmountByGroup.get(n.id) ?? zero();

        if (getEffectiveAffectsGrossProfit(n.id) === directOnly) {
          total += netExpense(ownAmount);
        }

        n.children.forEach(walk);
      };

      nodes.forEach(walk);

      return applyRound(total, roundingMethod, roundingPrecision);
    };

    const directIncomeBase = sumIncome(incomeRoots, true);
    const directExpenseBase = sumExpense(expenseRoots, true);
    const directIncome = applyRound(
      directIncomeBase + closingStockAmount,
      roundingMethod,
      roundingPrecision,
    );
    const directExpense = applyRound(
      directExpenseBase + openingStockAmount,
      roundingMethod,
      roundingPrecision,
    );
    const grossProfit = applyRound(
      directIncome - directExpense,
      roundingMethod,
      roundingPrecision,
    );

    const indirectIncome = sumIncome(incomeRoots, false);
    const indirectExpense = sumExpense(expenseRoots, false);
    const netProfit = applyRound(
      grossProfit + indirectIncome - indirectExpense,
      roundingMethod,
      roundingPrecision,
    );

    const toPlNode = (n: InternalNode): PlNode => {
      const parent = n.parentId ? nodeMap.get(n.parentId) : null;
      return {
        group: toPickFieldsWithoutNull(n, "id", "name", "affectsGrossProfit"),
        parent: parent
          ? {
              id: parent.id,
              name: parent.name,
              affectsGrossProfit: parent.affectsGrossProfit,
            }
          : null,
        amount: n.amount,
        children: n.children.map(toPlNode),
      };
    };

    const openingStockNode: PlNode = {
      group: {
        id: -1,
        name: "Opening Stock",
        affectsGrossProfit: true,
      },
      parent: null,
      amount: {
        dr: openingStockAmount,
        cr: 0,
      },
      children: [],
    };

    const closingStockNode: PlNode = {
      group: {
        id: -2,
        name: "Closing Stock",
        affectsGrossProfit: true,
      },
      parent: null,
      amount: {
        dr: 0,
        cr: closingStockAmount,
      },
      children: [],
    };

    const mappedIncomeNodes = incomeFiltered.map(toPlNode);
    const mappedExpenseNodes = expenseFiltered.map(toPlNode);

    if (includeZero || closingStockAmount !== 0) {
      mappedIncomeNodes.push(closingStockNode);
    }

    if (includeZero || openingStockAmount !== 0) {
      mappedExpenseNodes.push(openingStockNode);
    }

    const response: ProfitLossResponse = {
      income: mappedIncomeNodes,
      expense: mappedExpenseNodes,
      totals: {
        directIncome,
        directExpense,
        grossProfit,
        indirectIncome,
        indirectExpense,
        netProfit,
      },
    };
    logger.info("exiting::getProfitLoss::report::service");
    return response;
  },

  async getBalanceSheet(
    input: BalanceSheetRequestInput,
  ): Promise<BalanceSheetResponse> {
    logger.info("entering::getBalanceSheet::report::service");

    const fyMeta = await validateBalanceSheetServiceValidation(input);
    const { companyId, asOnDate, ccId, includeZero = false } = input;

    const store = requestStorage.getStore();
    const settings = store?.settings;
    const roundingPrecision = settings?.roundingPrecision ?? 2;
    const roundingMethod = settings?.roundingMethod ?? RoundFormat.TO_FIXED;

    /* ---------------- FETCH GROUPS ---------------- */

    const groups = (
      await commonGetService.getAllElements<"Group">({
        cacheCode: "GROUP",
        canNullReturnable: true,
        modelName: "Group",
        shortCode: "GROUP",
        useActiveFlag: true,
      })
    )
      .filter(
        (g) =>
          g.companyId === companyId &&
          g.reportType === AccountingReportType.BALANCE_SHEET,
      )
      .map((g) => ({
        id: g.id,
        name: g.name,
        parentId: g.parentId ?? null,
        primaryCategory: g.primaryCategory,
      }));

    /* ---------------- BUILD NODE MAP ---------------- */

    const nodeMap = new Map<number, InternalNodeForBalanceSheet>();

    for (const g of groups) {
      nodeMap.set(g.id, {
        ...g,
        openingBalance: zero(),
        periodBalance: zero(),
        amount: zero(),
        children: [],
      });
    }

    /* ---------------- BUILD TREE ---------------- */

    const roots: InternalNodeForBalanceSheet[] = [];

    for (const node of nodeMap.values()) {
      if (node.parentId && nodeMap.has(node.parentId)) {
        nodeMap.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    /* ---------------- LEDGER BALANCES ---------------- */

    const ledgerBalances = await getLedgerBalancesNumber({
      companyId,
      financialYearId: fyMeta.id,
      fromDate: fyMeta.booksBeginFrom,
      toDate: asOnDate,
      ccId,
      includeZero,
    });

    const ledgerIds = [
      ...new Set(ledgerBalances.map((l) => l.ledger?.id).filter(Boolean)),
    ] as number[];

    const ledgers = await getLedgersByCompanyIdAndLedgerIds({
      companyId,
      ledgerIds,
    });

    const ledgerGroup = new Map<number, number>();
    for (const l of ledgers) ledgerGroup.set(l.id, l.groupId);

    /* ---------------- ACCUMULATE BALANCES ---------------- */

    for (const lb of ledgerBalances) {
      const ledgerId = lb.ledger?.id;
      if (!ledgerId) continue;

      let groupId = ledgerGroup.get(ledgerId);

      while (groupId) {
        const node = nodeMap.get(groupId);
        if (!node) break;
        node.openingBalance = addDrCr(node.openingBalance, lb.opening);
        node.periodBalance = addDrCr(node.periodBalance, lb.period);
        node.amount = addDrCr(node.amount, lb.closing);
        // node.amount.dr += lb.closing.dr;
        // node.amount.cr += lb.closing.cr;

        groupId = node.parentId ?? undefined;
      }
    }

    /* ---------------- PROFIT & LOSS ---------------- */

    const pl = await reportServiceRaw.getProfitLoss(
      {
        companyId,
        financialYearId: fyMeta.id,
        fromDate: fyMeta.booksBeginFrom,
        toDate: asOnDate,
        ccId,
        includeZero: true,
      },
      false,
    );

    /* ---------------- CLOSING STOCK (FROM P&L) ---------------- */
    // if (featureFlagForAddOpeningAndClosingStockInPL?.isEnabled) {
    const findPlNodeByGroupId = (
      nodes: PlNode[],
      groupId: number,
    ): PlNode | undefined => {
      for (const node of nodes) {
        if (node.group.id === groupId) return node;
        const found = findPlNodeByGroupId(node.children, groupId);
        if (found) return found;
      }
      return undefined;
    };

    const closingStockAmountFromPlCr = (closingStockCr: number): DrCrAmt => {
      if (closingStockCr < 0) {
        return { dr: 0, cr: Math.abs(closingStockCr) };
      }
      return { dr: closingStockCr, cr: 0 };
    };

    const closingStockPlNode = findPlNodeByGroupId(
      pl.income,
      CLOSING_STOCK_VIRTUAL_ID,
    );
    if (closingStockPlNode) {
      const closingStockCr = closingStockPlNode.amount.cr;
      const closingStockAmount = closingStockAmountFromPlCr(closingStockCr);

      if (
        includeZero ||
        closingStockAmount.dr !== 0 ||
        closingStockAmount.cr !== 0
      ) {
        const currentAssetsGroup = [...nodeMap.values()].find(
          (g) => g.name === CURRENT_ASSETS_GROUP_NAME,
        );

        if (currentAssetsGroup) {
          currentAssetsGroup.children.push({
            id: CLOSING_STOCK_VIRTUAL_ID,
            name: CLOSING_STOCK_LABEL,
            parentId: currentAssetsGroup.id,
            primaryCategory: "ASSET",
            openingBalance: zero(),
            periodBalance: zero(),
            amount: closingStockAmount,
            children: [],
          });

          let groupId: number | undefined = currentAssetsGroup.id;
          while (groupId) {
            const node = nodeMap.get(groupId);
            if (!node) break;
            node.amount = addDrCr(node.amount, closingStockAmount);
            groupId = node.parentId ?? undefined;
          }
        }
      }
    }
    // }

    /* ---------------- REMOVE ZERO NODES ---------------- */

    const prune = (
      nodes: InternalNodeForBalanceSheet[],
    ): InternalNodeForBalanceSheet[] =>
      nodes
        .map((n) => ({ ...n, children: prune(n.children) }))
        .filter(
          (n) =>
            includeZero ||
            n.amount.dr !== 0 ||
            n.amount.cr !== 0 ||
            n.children.length,
        );

    const filteredRoots = prune(roots);

    const openingPL = 0;
    const currentPL = applyRound(
      pl.totals.netProfit,
      roundingMethod,
      roundingPrecision,
    );
    const totalPL = applyRound(
      openingPL + currentPL,
      roundingMethod,
      roundingPrecision,
    );

    const plSide: "LIABILITIES" | "ASSETS" =
      totalPL >= 0 ? "LIABILITIES" : "ASSETS";

    /* ---------------- CONVERT TO RESPONSE ---------------- */

    const toBsNode = (node: InternalNodeForBalanceSheet): BsNode => ({
      group: toIdValue(node, "name"),
      parent: node.parentId
        ? toIdValue(nodeMap.get(node.parentId)!, "name")
        : null,
      openingBalance: node.openingBalance,
      periodBalance: node.periodBalance,
      amount: node.amount,
      children: node.children.map(toBsNode),
    });

    const assets: BsNode[] = [];
    const liabilities: BsNode[] = [];

    for (const node of filteredRoots) {
      const bsNode = toBsNode(node);

      if (node.primaryCategory === "ASSET") {
        const net = netAsset(node.amount);
        if (net >= 0) {
          assets.push(bsNode);
        } else {
          liabilities.push(bsNode);
        }
      } else {
        const net = netLiability(node.amount);
        if (net >= 0) {
          liabilities.push(bsNode);
        } else {
          assets.push(bsNode);
        }
      }
    }
    /* ---------------- TOTALS ---------------- */

    let assetsTotal = 0;
    let assetsOpeningBalanceTotal = 0;
    let liabilitiesTotal = 0;
    let liabilitiesOpeningBalanceTotal = 0;

    for (const a of assets) {
      assetsTotal += Math.abs(a.amount.dr - a.amount.cr);
      assetsOpeningBalanceTotal += Math.abs(
        a.openingBalance.dr - a.openingBalance.cr,
      );
    }

    for (const l of liabilities) {
      liabilitiesTotal += Math.abs(l.amount.cr - l.amount.dr);
      liabilitiesOpeningBalanceTotal += Math.abs(
        l.openingBalance.cr - l.openingBalance.dr,
      );
    }

    if (plSide === "LIABILITIES") liabilitiesTotal += totalPL;
    else assetsTotal += Math.abs(totalPL);

    /* ---------------- UNADJUSTED FOREX GAIN/LOSS ---------------- */
    // Foreign-currency ledgers are revalued at the closing rate inside
    // getLedgerBalancesNumber; the contra forex gain/loss must appear so the revalued
    // assets/liabilities still balance (a gain sits on liabilities, a loss on assets).
    const forexResult = await getLedgerForexGainLossEngine({
      companyId,
      financialYearId: fyMeta.id,
      fromDate: fyMeta.booksBeginFrom,
      toDate: asOnDate,
      ccId,
      includeZero: true,
    });
    const forexGainLoss = forexResult.totals.forexGainLossAmount;
    if (forexGainLoss.drCr && forexGainLoss.amount !== 0) {
      const forexNode: BsNode = {
        group: {
          id: FOREX_GAIN_LOSS_VIRTUAL_ID,
          value: UNADJUSTED_FOREX_GAIN_LOSS_LABEL,
        },
        parent: null,
        openingBalance: zero(),
        periodBalance: zero(),
        amount:
          forexGainLoss.drCr === DrCr.DR
            ? { dr: forexGainLoss.amount, cr: 0 }
            : { dr: 0, cr: forexGainLoss.amount },
        children: [],
      };

      if (forexGainLoss.drCr === DrCr.DR) {
        assets.push(forexNode);
        assetsTotal = applyRound(
          assetsTotal + forexGainLoss.amount,
          roundingMethod,
          roundingPrecision,
        );
      } else {
        liabilities.push(forexNode);
        liabilitiesTotal = applyRound(
          liabilitiesTotal + forexGainLoss.amount,
          roundingMethod,
          roundingPrecision,
        );
      }
    }

    /* ---------------- DIFFERENCE ---------------- */
    // Opening balance difference

    const openingBalanceDifference = applyRound(
      assetsOpeningBalanceTotal - liabilitiesOpeningBalanceTotal,
      roundingMethod,
      roundingPrecision,
    );
    if (openingBalanceDifference > 0) {
      const openingDifferenceNode: BsNode = {
        group: { id: -1, value: getDifferenceLabel("OPENING") },
        parent: null,
        openingBalance: zero(),
        periodBalance: zero(),
        amount:
          openingBalanceDifference > 0
            ? { dr: 0, cr: Math.abs(openingBalanceDifference) }
            : { dr: Math.abs(openingBalanceDifference), cr: 0 },
        children: [],
      };

      if (openingBalanceDifference > 0) {
        liabilities.push(openingDifferenceNode);
        liabilitiesTotal = applyRound(
          liabilitiesTotal + Math.abs(openingBalanceDifference),
          roundingMethod,
          roundingPrecision,
        );
      } else {
        assets.push(openingDifferenceNode);
        assetsTotal = applyRound(
          assetsTotal + Math.abs(openingBalanceDifference),
          roundingMethod,
          roundingPrecision,
        );
      }
    }
    //CLOSING balance difference in assets and liabilities check
    const difference = applyRound(
      assetsTotal - liabilitiesTotal,
      roundingMethod,
      roundingPrecision,
    );
    const bsResult = addDifferenceNodeAdvanced<BsNode>({
      items: difference > 0 ? liabilities : assets,
      drTotal: assetsTotal,
      crTotal: liabilitiesTotal,
      type: "CLOSING",
      createNode: (diff: number, type: DifferenceType) => ({
        group: { id: -1, value: getDifferenceLabel(type) },
        parent: null,
        openingBalance: zero(),
        periodBalance: zero(),
        amount:
          diff > 0
            ? { dr: 0, cr: Math.abs(diff) }
            : { dr: Math.abs(diff), cr: 0 },
        children: [],
      }),
    });

    assetsTotal = bsResult.totals.dr;
    liabilitiesTotal = bsResult.totals.cr;
    const resTotal = applyRound(
      assetsTotal - liabilitiesTotal,
      roundingMethod,
      roundingPrecision,
    );
    logger.info("exiting::getBalanceSheet::report::service");

    return {
      periodStart: fyMeta.startDate,
      periodEnd: fyMeta.endDate,
      liabilities,
      assets,
      totals: {
        liabilities: applyRound(
          liabilitiesTotal,
          roundingMethod,
          roundingPrecision,
        ),
        assets: applyRound(assetsTotal, roundingMethod, roundingPrecision),
        difference: resTotal,
      },
      profitLoss: {
        openingBalance: Math.abs(openingPL),
        currentPeriod: Math.abs(currentPL),
        total: Math.abs(totalPL),
        side: plSide,
      },
    };
  },

  async getCashBankSummary(
    input: ReportCommonRequestInput,
  ): Promise<GroupSummaryTreeResponse> {
    logger.info("entering::getCashBankSummary::report::service");
    const {
      companyId,
      financialYearId,
      fromDate,
      toDate,
      ccId,
      includeZero = false,
    } = input;
    const allGroups = await commonGetService.getAllElements<"Group">({
      cacheCode: "GROUP",
      canNullReturnable: true,
      modelName: "Group",
      shortCode: "GROUP",
      useActiveFlag: true,
    });
    const cashBankGroups = allGroups.filter(
      (g) => CASH_BANK_GROUPS.includes(g.name) && g.companyId === companyId,
    );
    const groupIds = cashBankGroups.map((g) => g.id);
    const cashBankSummary = await reportServiceRaw.getGroupSummaryTree({
      companyId,
      financialYearId,
      fromDate,
      toDate,
      ccId,
      includeZero,
      groupIds,
    });
    logger.info("exiting::getCashBankSummary::report::service");
    return cashBankSummary;
  },

  async getReceivableSummary(
    input: ReportCommonRequestInput,
  ): Promise<GroupSummaryTreeResponse> {
    logger.info("entering::getReceivableSummary::report::service");
    const {
      companyId,
      financialYearId,
      fromDate,
      toDate,
      ccId,
      includeZero = false,
      ageing,
    } = input;

    const allGroups = await commonGetService.getAllElements<"Group">({
      cacheCode: "GROUP",
      canNullReturnable: true,
      modelName: "Group",
      shortCode: "GROUP",
      useActiveFlag: true,
    });

    const receivableGroups = allGroups.filter(
      (g) => RECEIVABLE_GROUPS.includes(g.name) && g.companyId === companyId,
    );
    const groupIds = receivableGroups.map((g) => g.id);

    const receivableSummary = await reportServiceRaw.getGroupSummaryTree({
      companyId,
      financialYearId,
      fromDate,
      toDate,
      ccId,
      includeZero,
      groupIds,
    });

    if (ageing?.buckets?.length) {
      receivableSummary.ageing = await buildAgeingSummary({
        companyId,
        financialYearId,
        fromDate,
        toDate,
        ccId,
        includeZero,
        roots: receivableSummary.roots,
        buckets: ageing.buckets,
        mode: "RECEIVABLE",
      });
    }
    logger.info("exiting::getReceivableSummary::report::service");
    return receivableSummary;
  },

  async getPayableSummary(
    input: ReportCommonRequestInput,
  ): Promise<GroupSummaryTreeResponse> {
    logger.info("entering::getPayableSummary::report::service");
    const {
      companyId,
      financialYearId,
      fromDate,
      toDate,
      ccId,
      includeZero = false,
      ageing,
    } = input;

    const allGroups = await commonGetService.getAllElements<"Group">({
      cacheCode: "GROUP",
      canNullReturnable: true,
      modelName: "Group",
      shortCode: "GROUP",
      useActiveFlag: true,
    });

    const payableGroups = allGroups.filter(
      (g) => PAYABLE_GROUPS.includes(g.name) && g.companyId === companyId,
    );
    const groupIds = payableGroups.map((g) => g.id);

    const payableSummary = await reportServiceRaw.getGroupSummaryTree({
      companyId,
      financialYearId,
      fromDate,
      toDate,
      ccId,
      includeZero,
      groupIds,
    });

    if (ageing?.buckets?.length) {
      payableSummary.ageing = await buildAgeingSummary({
        companyId,
        financialYearId,
        fromDate,
        toDate,
        ccId,
        includeZero,
        roots: payableSummary.roots,
        buckets: ageing.buckets,
        mode: "PAYABLE",
      });
    }
    logger.info("exiting::getPayableSummary::report::service");
    return payableSummary;
  },
  async getCashFlow(input: CashFlowRequestInput): Promise<CashFlowResponse> {
    logger.info("entering::getCashFlow::report::service");
    await validateCashFlowServiceValidation(input);
    const cashFlow = await cashFlowEngineService.getCashFlow(input);
    logger.info("exiting::getCashFlow::report::service");
    return cashFlow;
  },
  async getFundFlow(input: FundFlowRequestInput): Promise<FundFlowResponse> {
    logger.info("entering::getFundFlow::report::service");
    const fyMeta = await validateFundFlowServiceValidation(input);
    const fundFlow = await fundFlowEngineService.getFundFlow({ input, fyMeta });
    logger.info("exiting::getFundFlow::report::service");
    return fundFlow;
  },
  async getLedgerForexGainLoss(
    input: LedgerForexReportInput,
  ): Promise<LedgerForexGainLossEngineResult> {
    logger.info("entering::getLedgerForexGainLoss::report::service");
    await validateLedgerBalanceEngineServiceValidation(input);
    const forexGainLoss = await getLedgerForexGainLossEngine(input);
    logger.info("exiting::getLedgerForexGainLoss::report::service");
    return forexGainLoss;
  },
  async getForexGainLossStatement(
    input: ForexGainLossStatementInput,
  ): Promise<ForexGainLossStatementResult> {
    logger.info("entering::getForexGainLossStatement::report::service");

    await validateReportCommonServiceValidation(input);

    const {
      companyId,
      financialYearId,
      fromDate,
      toDate,
      ccId,
      includeZero = false,
      groupId,
    } = input;

    /* ---------------- SETTINGS ---------------- */

    const store = requestStorage.getStore();
    const settings = store?.settings;
    const roundingPrecision = settings?.roundingPrecision ?? 2;
    const roundingMethod = settings?.roundingMethod ?? RoundFormat.TO_FIXED;
    const round = (value: number) =>
      applyRound(value, roundingMethod, roundingPrecision);

    const toForexAmt = (signed: number): ForexDrCrAmt => ({
      amount: Math.abs(signed),
      drCr: signed > 0 ? DrCr.DR : signed < 0 ? DrCr.CR : null,
    });

    const toSigned = (amt: ForexDrCrAmt): number =>
      amt.drCr === DrCr.DR
        ? amt.amount
        : amt.drCr === DrCr.CR
          ? -amt.amount
          : 0;

    /* ---------------- GET GROUPS ---------------- */

    const allGroups: Group[] = await commonGetService.getAllElements<"Group">({
      cacheCode: "GROUP",
      canNullReturnable: true,
      modelName: "Group",
      shortCode: "GROUP",
      useActiveFlag: true,
    });

    const groups = allGroups.filter((g) => g.companyId === companyId);

    /* ---------------- MAPS ---------------- */

    type ForexBuildNode = {
      group: IdValue | null;
      parent: IdValue | null;
      transactedBaseSigned: number;
      currentBaseSigned: number;
      forexGainLossSigned: number;
      children: ForexBuildNode[];
      ledger: LedgerForexGainLossRow[];
    };

    const groupMap = new Map<number, Group>();
    const parentMap = new Map<number, number | null>();
    const nodeMap = new Map<number, ForexBuildNode>();

    for (const g of groups) {
      groupMap.set(g.id, g);
      parentMap.set(g.id, g.parentId ?? null);
    }

    /* ---------------- SELECT ROOT GROUP IDS ---------------- */

    // When a groupId is provided it is used as the single root; otherwise every
    // top-level group (no parent within the company) is treated as a root.
    if (groupId && !groupMap.has(groupId)) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", `Group ${groupId} not found`),
      );
    }

    const selectedGroupIds = groupId
      ? [groupId]
      : groups
          .filter((g) => !g.parentId || !groupMap.has(g.parentId))
          .map((g) => g.id);

    for (const g of groups) {
      nodeMap.set(g.id, {
        group: toIdValue(g, "name"),
        parent:
          g.parentId && groupMap.has(g.parentId)
            ? toIdValue(groupMap.get(g.parentId)!, "name")
            : null,
        transactedBaseSigned: 0,
        currentBaseSigned: 0,
        forexGainLossSigned: 0,
        children: [],
        ledger: [],
      });
    }

    /* ---------------- FOREX PER LEDGER (FLAT ENGINE) ---------------- */

    const flat = await getLedgerForexGainLossEngine({
      companyId,
      financialYearId,
      fromDate,
      toDate,
      ccId,
      includeZero: true,
    });

    /* ---------------- AGGREGATE INTO GROUP TREE ---------------- */

    for (const row of flat.rows) {
      const groupIdForLedger = row.group?.id;
      if (!groupIdForLedger) continue;

      const node = nodeMap.get(groupIdForLedger);
      if (!node) {
        logger.warn(
          `Ledger ${row.ledger?.id} has invalid groupId ${groupIdForLedger}`,
        );
        continue;
      }

      const transactedBaseSigned = toSigned(row.transactedBaseAmount);
      const currentBaseSigned = toSigned(row.currentBaseAmount);
      const forexGainLossSigned = toSigned(row.forexGainLossAmount);

      node.ledger.push(row);
      node.transactedBaseSigned += transactedBaseSigned;
      node.currentBaseSigned += currentBaseSigned;
      node.forexGainLossSigned += forexGainLossSigned;

      let parentId = parentMap.get(groupIdForLedger) ?? null;
      const visited = new Set<number>();

      while (parentId) {
        if (visited.has(parentId)) {
          logger.error(
            `Cycle detected in group hierarchy at group ${parentId}`,
          );
          break;
        }

        visited.add(parentId);

        const parentNode = nodeMap.get(parentId);
        if (!parentNode) break;

        parentNode.transactedBaseSigned += transactedBaseSigned;
        parentNode.currentBaseSigned += currentBaseSigned;
        parentNode.forexGainLossSigned += forexGainLossSigned;

        parentId = parentMap.get(parentId) ?? null;
      }
    }

    /* ---------------- BUILD TREE ---------------- */

    for (const g of groups) {
      const node = nodeMap.get(g.id)!;
      const parentId = parentMap.get(g.id);

      if (parentId && nodeMap.has(parentId)) {
        nodeMap.get(parentId)!.children.push(node);
      }
    }

    /* ---------------- FINALIZE (filter zero + round + sort) ---------------- */

    const rowHasValue = (row: LedgerForexGainLossRow): boolean =>
      row.transactedBaseAmount.amount !== 0 ||
      row.currentBaseAmount.amount !== 0 ||
      row.forexGainLossAmount.amount !== 0;

    const finalize = (node: ForexBuildNode): ForexGainLossNode | null => {
      const children = node.children
        .map(finalize)
        .filter((c): c is ForexGainLossNode => c !== null)
        .sort((a, b) =>
          (a.group?.value ?? "").localeCompare(b.group?.value ?? ""),
        );

      const ledger = node.ledger
        .filter((l) => includeZero || rowHasValue(l))
        .sort(
          (a, b) =>
            (a.ledger?.value ?? "").localeCompare(b.ledger?.value ?? "") ||
            (a.ledger?.id ?? 0) - (b.ledger?.id ?? 0),
        );

      const transactedBaseSigned = round(node.transactedBaseSigned);
      const currentBaseSigned = round(node.currentBaseSigned);
      const forexGainLossSigned = round(node.forexGainLossSigned);

      const nodeHasValue =
        transactedBaseSigned !== 0 ||
        currentBaseSigned !== 0 ||
        forexGainLossSigned !== 0;

      if (
        !includeZero &&
        !nodeHasValue &&
        children.length === 0 &&
        ledger.length === 0
      ) {
        return null;
      }

      return {
        group: node.group,
        parent: node.parent,
        transactedBaseAmount: toForexAmt(transactedBaseSigned),
        currentBaseAmount: toForexAmt(currentBaseSigned),
        forexGainLossAmount: toForexAmt(forexGainLossSigned),
        children,
        ledger,
      };
    };

    /* ---------------- ROOTS + TOTALS ---------------- */

    const roots: ForexGainLossNode[] = [];

    let totalTransactedBaseSigned = 0;
    let totalCurrentBaseSigned = 0;
    let totalForexGainLossSigned = 0;

    for (const id of selectedGroupIds) {
      const node = nodeMap.get(id)!;

      totalTransactedBaseSigned += node.transactedBaseSigned;
      totalCurrentBaseSigned += node.currentBaseSigned;
      totalForexGainLossSigned += node.forexGainLossSigned;

      const finalized = finalize(node);
      if (finalized) {
        roots.push(finalized);
      }
    }

    logger.info("exiting::getForexGainLossStatement::report::service");

    return {
      asOfDate: flat.asOfDate,
      baseCurrency: flat.baseCurrency,
      roots,
      totals: {
        transactedBaseAmount: toForexAmt(round(totalTransactedBaseSigned)),
        currentBaseAmount: toForexAmt(round(totalCurrentBaseSigned)),
        forexGainLossAmount: toForexAmt(round(totalForexGainLossSigned)),
      },
    };
  },

  // All Excel Reports
  async buildExcelForBalanceSheet(input: BalanceSheetRequestInput) {
    logger.info("entering::buildExcelForBalanceSheet::service");

    const { periodStart, periodEnd, liabilities, assets, totals, profitLoss } =
      await this.getBalanceSheet(input);

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Balance Sheet");

    ws.properties.defaultRowHeight = 18;

    const FIRST_COL = 1;
    const LAST_COL = 5;
    const GAP_COL = 3;
    const COLS = [1, 2, 3, 4, 5];

    ws.getColumn(1).width = 28;
    ws.getColumn(2).width = 16;
    ws.getColumn(3).width = 0.5;
    ws.getColumn(4).width = 28;
    ws.getColumn(5).width = 16;

    let rowIndex = 1;
    const dataStartRow = rowIndex;
    const titleRowIndex = rowIndex;
    const dateRowIndex = rowIndex + 1;
    const headerRowIndex = rowIndex + 2;

    ws.mergeCells(rowIndex, FIRST_COL, rowIndex, LAST_COL);
    const titleCell = ws.getCell(rowIndex, FIRST_COL);
    titleCell.value = "Balance Sheet";
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: false,
    };
    rowIndex++;

    ws.mergeCells(rowIndex, FIRST_COL, rowIndex, LAST_COL);
    const dateCell = ws.getCell(rowIndex, FIRST_COL);
    dateCell.value = `${dayjs(periodStart).format("DD MMM YYYY")} to ${dayjs(
      periodEnd,
    ).format("DD MMM YYYY")}`;
    dateCell.font = { italic: true, size: 10 };
    dateCell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: false,
    };
    rowIndex++;

    const header = ws.addRow(["LIABILITIES", "AMOUNT", "", "ASSETS", "AMOUNT"]);
    header.font = { bold: true };
    header.getCell(1).alignment = { horizontal: "center", wrapText: true };
    header.getCell(2).alignment = { horizontal: "center", wrapText: true };
    header.getCell(4).alignment = { horizontal: "center", wrapText: true };
    header.getCell(5).alignment = { horizontal: "center", wrapText: true };
    rowIndex++;

    const maxLength = Math.max(liabilities.length, assets.length);

    for (let i = 0; i < maxLength; i++) {
      const liability = liabilities[i];
      const asset = assets[i];

      const row = ws.addRow([
        liability?.group?.value || "",
        liability ? liability.amount.cr : "",
        "",
        asset?.group?.value || "",
        asset ? asset.amount.dr : "",
      ]);

      row.getCell(1).alignment = { wrapText: true, vertical: "middle" };
      row.getCell(2).alignment = {
        horizontal: "right",
        wrapText: true,
        vertical: "middle",
      };
      row.getCell(4).alignment = { wrapText: true, vertical: "middle" };
      row.getCell(5).alignment = {
        horizontal: "right",
        wrapText: true,
        vertical: "middle",
      };

      // ── Liability side ──
      if (liability) {
        if (liability.group?.id === -1) {
          row.getCell(1).font = { color: { argb: "FFFF0000" } };
          row.getCell(2).alignment = { horizontal: "left", vertical: "middle" };
        } else {
          row.getCell(1).font = { bold: true };
        }
      }

      // ── Asset side ──
      if (asset) {
        if (asset.group?.id === -1) {
          row.getCell(4).font = { color: { argb: "FFFF0000" } };
          row.getCell(5).alignment = { horizontal: "left", vertical: "middle" };
        } else {
          row.getCell(4).font = { bold: true };
        }
      }

      rowIndex++;
    }

    if (profitLoss) {
      const isLiability = profitLoss.side === "LIABILITIES";

      // Profit & Loss A/c
      const plRow = ws.addRow([
        isLiability ? "Profit & Loss A/c" : "",
        isLiability ? profitLoss.total : "",
        "",
        !isLiability ? "Profit & Loss A/c" : "",
        !isLiability ? profitLoss.total : "",
      ]);

      // Opening Balance
      const openingRow = ws.addRow([
        isLiability ? "Opening Balance" : "",
        isLiability ? profitLoss.openingBalance : "",
        "",
        !isLiability ? "Opening Balance" : "",
        !isLiability ? profitLoss.openingBalance : "",
      ]);

      // Current Period
      const currentRow = ws.addRow([
        isLiability ? "Current Period" : "",
        isLiability ? profitLoss.currentPeriod : "",
        "",
        !isLiability ? "Current Period" : "",
        !isLiability ? profitLoss.currentPeriod : "",
      ]);

      // APPLY STYLING TO ALL ROWS
      [plRow].forEach((row) => {
        row.getCell(1).alignment = { wrapText: true, vertical: "middle" };
        row.getCell(2).alignment = {
          horizontal: "right",
          wrapText: true,
          vertical: "middle",
        };
        row.getCell(4).alignment = { wrapText: true, vertical: "middle" };
        row.getCell(5).alignment = {
          horizontal: "right",
          wrapText: true,
          vertical: "middle",
        };

        if (isLiability) {
          row.getCell(1).font = { bold: true };
          row.getCell(2).font = { bold: true };
        } else {
          row.getCell(4).font = { bold: true };
          row.getCell(5).font = { bold: true };
        }
      });

      [openingRow, currentRow].forEach((row) => {
        row.getCell(1).alignment = { wrapText: true, vertical: "middle" };
        row.getCell(2).alignment = {
          horizontal: "left",
          wrapText: true,
          vertical: "middle",
        };
        row.getCell(4).alignment = { wrapText: true, vertical: "middle" };
        row.getCell(5).alignment = {
          horizontal: "left",
          wrapText: true,
          vertical: "middle",
        };

        if (isLiability) row.getCell(1).font = { bold: false };
        else row.getCell(4).font = { bold: false };
      });

      rowIndex += 3;
    }

    ws.addRow([]);
    ws.addRow([]);
    ws.addRow([]);
    rowIndex += 3;

    const totalRow = ws.addRow([
      "TOTAL",
      totals.liabilities,
      "",
      "TOTAL",
      totals.assets,
    ]);
    totalRow.font = { bold: true };
    totalRow.getCell(2).alignment = { horizontal: "right", vertical: "middle" };
    totalRow.getCell(5).alignment = { horizontal: "right", vertical: "middle" };
    rowIndex++;

    const dataEndRow = rowIndex - 1;

    for (let r = dataStartRow; r <= dataEndRow; r++) {
      for (const c of COLS) {
        const cell = ws.getCell(r, c);

        const isFirstRow = r === dataStartRow;
        const isLastRow = r === dataEndRow;
        const isFirstCol = c === FIRST_COL;
        const isLastCol = c === LAST_COL;
        const isGapCol = c === GAP_COL;
        const isHeaderRow = r === headerRowIndex;
        const isTitleOrDate = r === titleRowIndex || r === dateRowIndex;

        if (isTitleOrDate) {
          continue;
        } else {
          cell.border = {
            top:
              isFirstRow || isLastRow
                ? { style: "thin" }
                : isHeaderRow
                  ? { style: "thin" }
                  : undefined,
            bottom: isLastRow
              ? { style: "thin" }
              : isHeaderRow
                ? { style: "thin" }
                : undefined,
            left: isFirstCol
              ? { style: "thin" }
              : isGapCol
                ? { style: "thin" }
                : undefined,
            right: isLastCol
              ? { style: "thin" }
              : c === 2
                ? { style: "thin" }
                : undefined,
          };
        }
      }
    }

    ws.getCell(titleRowIndex, FIRST_COL).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };

    ws.getCell(dateRowIndex, FIRST_COL).border = {
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };

    return wb;
  },

  async buildExcelForBalanceSheetWithChildren(input: BalanceSheetRequestInput) {
    logger.info("entering::buildExcelForBalanceSheetWithChildren::service");
    const { periodStart, periodEnd, liabilities, assets, totals, profitLoss } =
      await this.getBalanceSheet(input);

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Balance Sheet");

    ws.properties.defaultRowHeight = 18;

    const FIRST_COL = 1;
    const LAST_COL = 5;
    const GAP_COL = 3;
    const COLS = [1, 2, 3, 4, 5];

    ws.getColumn(1).width = 28;
    ws.getColumn(2).width = 16;
    ws.getColumn(3).width = 0.5;
    ws.getColumn(4).width = 28;
    ws.getColumn(5).width = 16;

    let rowIndex = 1;
    const dataStartRow = rowIndex;
    const titleRowIndex = rowIndex;
    const dateRowIndex = rowIndex + 1;
    const headerRowIndex = rowIndex + 2;

    ws.mergeCells(rowIndex, FIRST_COL, rowIndex, LAST_COL);
    const titleCell = ws.getCell(rowIndex, FIRST_COL);
    titleCell.value = "Balance Sheet";
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    rowIndex++;

    ws.mergeCells(rowIndex, FIRST_COL, rowIndex, LAST_COL);
    const dateCell = ws.getCell(rowIndex, FIRST_COL);
    dateCell.value = `${dayjs(periodStart).format("DD MMM YYYY")} to ${dayjs(
      periodEnd,
    ).format("DD MMM YYYY")}`;
    dateCell.font = { italic: true, size: 10 };
    dateCell.alignment = { horizontal: "center", vertical: "middle" };
    rowIndex++;

    const header = ws.addRow(["LIABILITIES", "AMOUNT", "", "ASSETS", "AMOUNT"]);
    header.font = { bold: true };
    header.getCell(1).alignment = { horizontal: "center" };
    header.getCell(2).alignment = { horizontal: "center" };
    header.getCell(4).alignment = { horizontal: "center" };
    header.getCell(5).alignment = { horizontal: "center" };
    rowIndex++;

    const flatten = (
      nodes: BsNode[],
      side: "liability" | "asset",
    ): {
      name: string;
      id: number;
      amount: number;
      level: number;
      isParent: boolean;
    }[] => {
      const result: {
        name: string;
        id: number;
        amount: number;
        level: number;
        isParent: boolean;
      }[] = [];

      for (const node of nodes) {
        if (node.group)
          result.push({
            name: node.group?.value,
            id: node.group?.id,
            amount: side === "liability" ? node.amount.cr : node.amount.dr,
            level: 0,
            isParent: node.parent ? false : true,
          });

        for (const child of node.children) {
          if (child.group)
            result.push({
              name: child.group?.value,
              id: child.group?.id,
              amount: side === "liability" ? child.amount.cr : child.amount.dr,
              level: 1,
              isParent: false,
            });
        }
      }

      return result;
    };

    const flatLiabilities = flatten(liabilities, "liability");
    const flatAssets = flatten(assets, "asset");

    const maxLength = Math.max(flatLiabilities.length, flatAssets.length);

    for (let i = 0; i < maxLength; i++) {
      const l = flatLiabilities[i];
      const a = flatAssets[i];

      const row = ws.addRow([
        l ? `${"   ".repeat(l.level)}${l.name}` : "",
        l ? l.amount : "",
        "",
        a ? `${"   ".repeat(a.level)}${a.name}` : "",
        a ? a.amount : "",
      ]);

      row.getCell(1).alignment = { wrapText: true, vertical: "middle" };
      row.getCell(2).alignment = { horizontal: "right", vertical: "middle" };
      row.getCell(4).alignment = { wrapText: true, vertical: "middle" };
      row.getCell(5).alignment = { horizontal: "right", vertical: "middle" };

      // ── Liability side ──
      if (l) {
        if (l.id === -1) {
          row.getCell(1).font = { color: { argb: "FFFF0000" } };
          row.getCell(2).alignment = { horizontal: "left", vertical: "middle" };
        } else {
          if (l.isParent) row.getCell(1).font = { bold: true };
        }
      }

      // ── Asset side ──
      if (a) {
        if (a.id === -1) {
          row.getCell(4).font = { color: { argb: "FFFF0000" } };
          row.getCell(5).alignment = { horizontal: "left", vertical: "middle" };
        } else {
          if (a.isParent) row.getCell(4).font = { bold: true };
        }
      }

      rowIndex++;
    }

    if (profitLoss) {
      const isLiability = profitLoss.side === "LIABILITIES";

      // Profit & Loss A/c
      const plRow = ws.addRow([
        isLiability ? "Profit & Loss A/c" : "",
        isLiability ? profitLoss.total : "",
        "",
        !isLiability ? "Profit & Loss A/c" : "",
        !isLiability ? profitLoss.total : "",
      ]);

      // Opening Balance
      const openingRow = ws.addRow([
        isLiability ? "Opening Balance" : "",
        isLiability ? profitLoss.openingBalance : "",
        "",
        !isLiability ? "Opening Balance" : "",
        !isLiability ? profitLoss.openingBalance : "",
      ]);

      // Current Period
      const currentRow = ws.addRow([
        isLiability ? "Current Period" : "",
        isLiability ? profitLoss.currentPeriod : "",
        "",
        !isLiability ? "Current Period" : "",
        !isLiability ? profitLoss.currentPeriod : "",
      ]);

      // APPLY STYLING TO ALL ROWS
      [plRow].forEach((row) => {
        row.getCell(1).alignment = { wrapText: true, vertical: "middle" };
        row.getCell(2).alignment = {
          horizontal: "right",
          wrapText: true,
          vertical: "middle",
        };
        row.getCell(4).alignment = { wrapText: true, vertical: "middle" };
        row.getCell(5).alignment = {
          horizontal: "right",
          wrapText: true,
          vertical: "middle",
        };

        if (isLiability) {
          row.getCell(1).font = { bold: true };
          row.getCell(2).font = { bold: true };
        } else {
          row.getCell(4).font = { bold: true };
          row.getCell(5).font = { bold: true };
        }
      });

      [openingRow, currentRow].forEach((row) => {
        row.getCell(1).alignment = { wrapText: true, vertical: "middle" };
        row.getCell(2).alignment = {
          horizontal: "left",
          wrapText: true,
          vertical: "middle",
        };
        row.getCell(4).alignment = { wrapText: true, vertical: "middle" };
        row.getCell(5).alignment = {
          horizontal: "left",
          wrapText: true,
          vertical: "middle",
        };

        if (isLiability) row.getCell(1).font = { bold: false };
        else row.getCell(4).font = { bold: false };
      });

      rowIndex += 3;
    }

    ws.addRow([]);
    ws.addRow([]);
    ws.addRow([]);
    rowIndex += 3;

    const totalRow = ws.addRow([
      "TOTAL",
      totals.liabilities,
      "",
      "TOTAL",
      totals.assets,
    ]);

    totalRow.font = { bold: true };
    totalRow.getCell(2).alignment = { horizontal: "right" };
    totalRow.getCell(5).alignment = { horizontal: "right" };

    rowIndex++;

    const dataEndRow = rowIndex - 1;

    for (let r = dataStartRow; r <= dataEndRow; r++) {
      if (r === titleRowIndex || r === dateRowIndex) continue;

      for (const c of COLS) {
        const cell = ws.getCell(r, c);

        const isFirstRow = r === dataStartRow;
        const isLastRow = r === dataEndRow;
        const isFirstCol = c === FIRST_COL;
        const isLastCol = c === LAST_COL;
        const isGapCol = c === GAP_COL;
        const isHeaderRow = r === headerRowIndex;

        cell.border = {
          top:
            isFirstRow || isLastRow
              ? { style: "thin" }
              : isHeaderRow
                ? { style: "thin" }
                : undefined,
          bottom: isLastRow
            ? { style: "thin" }
            : isHeaderRow
              ? { style: "thin" }
              : undefined,
          left: isFirstCol
            ? { style: "thin" }
            : isGapCol
              ? { style: "thin" }
              : undefined,
          right: isLastCol
            ? { style: "thin" }
            : c === 2
              ? { style: "thin" }
              : undefined,
        };
      }
    }

    ws.getCell(titleRowIndex, FIRST_COL).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };

    ws.getCell(dateRowIndex, FIRST_COL).border = {
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };

    return wb;
  },

  async buildExcelForLedgerBookReport(input: LedgerBookExcelRequestInput) {
    logger.info("entering::buildExcelForLedgerBookReport::service");
    const { closingBalance, ledger, openingBalance, rows, totals } =
      await this.getLedgerBook(input);

    const showNarration = input.showNarration;
    const showCreatedBy = input.showCreatedBy;
    const showUpdatedBy = input.showUpdatedBy;

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Ledger Book");

    ws.properties.defaultRowHeight = 18;

    // ============================================================
    // DYNAMIC COLUMN MAP
    // ============================================================
    let colIndex = 1;
    const COL = {
      DATE: colIndex++, // always col 1
      VOUCHER_NO: colIndex++, // always col 2
      VOUCHER_TYPE: colIndex++, // always col 3
      NARRATION: showNarration ? colIndex++ : null,
      CREATED_BY: showCreatedBy ? colIndex++ : null,
      UPDATED_BY: showUpdatedBy ? colIndex++ : null,
      DR: colIndex++,
      CR: colIndex++,
    };
    const TOTAL_COLS = colIndex - 1;

    // ============================================================
    // COLUMN WIDTHS
    // ============================================================
    ws.getColumn(COL.DATE).width = 18;
    ws.getColumn(COL.VOUCHER_NO).width = 28;
    ws.getColumn(COL.VOUCHER_TYPE).width = 20;
    if (COL.NARRATION) ws.getColumn(COL.NARRATION).width = 30;
    if (COL.CREATED_BY) ws.getColumn(COL.CREATED_BY).width = 20;
    if (COL.UPDATED_BY) ws.getColumn(COL.UPDATED_BY).width = 20;
    ws.getColumn(COL.DR).width = 15;
    ws.getColumn(COL.CR).width = 15;

    let rowIndex = 1;

    // ============================================================
    // TITLE SECTION
    // ============================================================
    const titleStart = rowIndex;

    // Title
    ws.mergeCells(rowIndex, 1, rowIndex, TOTAL_COLS);
    ws.getCell(rowIndex, 1).value = "Ledger Book";
    ws.getCell(rowIndex, 1).font = { bold: true, size: 16 };
    ws.getCell(rowIndex, 1).alignment = { horizontal: "center" };
    rowIndex++;

    // Ledger Name
    ws.mergeCells(rowIndex, 1, rowIndex, TOTAL_COLS);
    ws.getCell(rowIndex, 1).value = ledger?.name;
    ws.getCell(rowIndex, 1).font = { bold: true, size: 12 };
    ws.getCell(rowIndex, 1).alignment = { horizontal: "center" };
    rowIndex++;

    // Date Range
    ws.mergeCells(rowIndex, 1, rowIndex, TOTAL_COLS);
    ws.getCell(rowIndex, 1).value = `(${dayjs(input.fromDate).format(
      "DD MMM YYYY",
    )} – ${dayjs(input.toDate).format("DD MMM YYYY")})`;
    ws.getCell(rowIndex, 1).alignment = { horizontal: "center" };
    ws.getCell(rowIndex, 1).font = { size: 10 };
    rowIndex++;

    // ============================================================
    // HEADER ROW
    // ============================================================
    const headerRowIndex = rowIndex;

    ws.getCell(rowIndex, COL.DATE).value = "DATE";
    ws.getCell(rowIndex, COL.VOUCHER_NO).value = "VOUCHER NO";
    ws.getCell(rowIndex, COL.VOUCHER_TYPE).value = "VOUCHER TYPE";
    if (COL.NARRATION) ws.getCell(rowIndex, COL.NARRATION).value = "NARRATION";
    if (COL.CREATED_BY)
      ws.getCell(rowIndex, COL.CREATED_BY).value = "CREATED BY";
    if (COL.UPDATED_BY)
      ws.getCell(rowIndex, COL.UPDATED_BY).value = "UPDATED BY";
    ws.getCell(rowIndex, COL.DR).value = "DR";
    ws.getCell(rowIndex, COL.CR).value = "CR";

    for (let c = 1; c <= TOTAL_COLS; c++) {
      ws.getCell(rowIndex, c).font = { bold: true };
      ws.getCell(rowIndex, c).alignment = { horizontal: "center" };
    }
    rowIndex++;

    // ============================================================
    // DATA ROWS
    // ============================================================
    rows.forEach((r) => {
      const isDr = r.drCr === "DR";

      ws.getCell(rowIndex, COL.DATE).value = dayjs(
        r.voucher.voucherDate,
      ).format("DD MMM YYYY");
      ws.getCell(rowIndex, COL.VOUCHER_NO).value = r.voucher.voucherNo;
      ws.getCell(rowIndex, COL.VOUCHER_TYPE).value =
        r.voucher.voucherType?.value;
      if (COL.NARRATION)
        ws.getCell(rowIndex, COL.NARRATION).value = r.voucher.narration;
      if (COL.CREATED_BY)
        ws.getCell(rowIndex, COL.CREATED_BY).value = r.voucher.createdBy?.value;
      if (COL.UPDATED_BY)
        ws.getCell(rowIndex, COL.UPDATED_BY).value = r.voucher.updatedBy?.value;
      ws.getCell(rowIndex, COL.DR).value = isDr ? Number(r.amount) : "";
      ws.getCell(rowIndex, COL.CR).value = !isDr ? Number(r.amount) : "";

      for (let c = 1; c <= TOTAL_COLS; c++) {
        ws.getCell(rowIndex, c).alignment = { horizontal: "center" };
      }

      rowIndex++;
    });

    rowIndex++; // blank separator row before summary

    // ============================================================
    // SUMMARY SECTION
    // ============================================================
    const summaryStart = rowIndex;

    const formatDrCr = (dr: number, cr: number) => {
      if (dr === 0 && cr === 0) return { dr: 0, cr: 0 };
      return {
        dr: dr === 0 ? "" : dr,
        cr: cr === 0 ? "" : cr,
      };
    };

    const opening = formatDrCr(openingBalance.dr || 0, openingBalance.cr || 0);
    ws.mergeCells(rowIndex, COL.DATE, rowIndex, COL.DR - 1); // merge DATE to col before DR
    ws.getCell(rowIndex, COL.DATE).value = "Opening Balance";
    ws.getCell(rowIndex, COL.DR).value = opening.dr;
    ws.getCell(rowIndex, COL.CR).value = opening.cr;
    rowIndex++;

    const current = formatDrCr(totals.dr || 0, totals.cr || 0);
    ws.mergeCells(rowIndex, COL.DATE, rowIndex, COL.DR - 1);
    ws.getCell(rowIndex, COL.DATE).value = "Current Total";
    ws.getCell(rowIndex, COL.DR).value = current.dr;
    ws.getCell(rowIndex, COL.CR).value = current.cr;
    rowIndex++;

    const closing = formatDrCr(closingBalance.dr || 0, closingBalance.cr || 0);
    ws.mergeCells(rowIndex, COL.DATE, rowIndex, COL.DR - 1);
    ws.getCell(rowIndex, COL.DATE).value = "Closing Balance";
    ws.getCell(rowIndex, COL.DR).value = closing.dr;
    ws.getCell(rowIndex, COL.CR).value = closing.cr;

    const summaryEnd = rowIndex;

    // SUMMARY STYLING
    for (let r = summaryStart; r <= summaryEnd; r++) {
      ws.getCell(r, COL.DATE).font = { bold: true };
      ws.getCell(r, COL.DATE).alignment = { horizontal: "right" }; // right-aligned label
      ws.getCell(r, COL.DR).font = { bold: true };
      ws.getCell(r, COL.CR).font = { bold: true };
      ws.getCell(r, COL.DR).alignment = { horizontal: "right" };
      ws.getCell(r, COL.CR).alignment = { horizontal: "right" };
    }

    // SUMMARY STYLING
    for (let r = summaryStart; r <= summaryEnd; r++) {
      ws.getCell(r, COL.VOUCHER_TYPE).font = { bold: true };
      ws.getCell(r, COL.DR).font = { bold: true };
      ws.getCell(r, COL.CR).font = { bold: true };
      ws.getCell(r, COL.DR).alignment = { horizontal: "right" };
      ws.getCell(r, COL.CR).alignment = { horizontal: "right" };
    }

    // ============================================================
    // BORDERS
    // ============================================================
    const blockStart = headerRowIndex;
    const blockEnd = summaryEnd;

    // Unified LEFT and RIGHT border — continuous from titleStart to blockEnd
    for (let r = titleStart; r <= blockEnd; r++) {
      const cellL = ws.getCell(r, 1);
      const cellR = ws.getCell(r, TOTAL_COLS);
      cellL.border = { ...cellL.border, left: { style: "thin" } };
      cellR.border = { ...cellR.border, right: { style: "thin" } };
    }

    // TOP border on title row
    for (let c = 1; c <= TOTAL_COLS; c++) {
      const cell = ws.getCell(titleStart, c);
      cell.border = { ...cell.border, top: { style: "thin" } };
    }

    // TOP border on header row
    for (let c = 1; c <= TOTAL_COLS; c++) {
      const cell = ws.getCell(blockStart, c);
      cell.border = { ...cell.border, top: { style: "thin" } };
    }

    // BOTTOM border on last row
    for (let c = 1; c <= TOTAL_COLS; c++) {
      const cell = ws.getCell(blockEnd, c);
      cell.border = { ...cell.border, bottom: { style: "thin" } };
    }

    // BOTTOM border under header row
    for (let c = 1; c <= TOTAL_COLS; c++) {
      const cell = ws.getCell(headerRowIndex, c);
      cell.border = { ...cell.border, bottom: { style: "thin" } };
    }

    // DR column divider
    for (let r = blockStart; r <= blockEnd; r++) {
      const cell = ws.getCell(r, COL.DR);
      cell.border = {
        ...cell.border,
        left: { style: "thin" },
        right: { style: "thin" },
      };
    }

    // TOP border above summary section
    for (let c = 1; c <= TOTAL_COLS; c++) {
      const cell = ws.getCell(summaryStart, c);
      cell.border = { ...cell.border, top: { style: "thin" } };
    }

    return wb;
  },

  async buildExcelForTrialBalance(input: TrialBalanceRequestInput) {
    logger.info("entering::buildExcelForTrialBalance::service");
    const { rows, totals } = await this.getTrialBalance(input);

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Trial Balance");

    ws.properties.defaultRowHeight = 18;

    ws.getColumn(1).width = 45; // Particulars
    ws.getColumn(2).width = 16; // Opening DR
    ws.getColumn(3).width = 16; // Opening CR
    ws.getColumn(4).width = 16; // Period Debit
    ws.getColumn(5).width = 16; // Period Credit
    ws.getColumn(6).width = 16; // Closing DR
    ws.getColumn(7).width = 16; // Closing CR

    const COLS = 7;
    let rowIndex = 1;

    const titleRowIndex = rowIndex;
    const groupHeaderRowIndex = rowIndex + 2; // Opening | Transactions | Closing span row
    const headerRowIndex = rowIndex + 3; // DR | CR | Debit | Credit | DR | CR

    // TITLE
    ws.mergeCells(rowIndex, 1, rowIndex, COLS);
    const title = ws.getCell(rowIndex, 1);
    title.value = "Trial Balance";
    title.font = { bold: true, size: 16 };
    title.alignment = { horizontal: "center" };
    rowIndex++;

    // DATE RANGE
    ws.mergeCells(rowIndex, 1, rowIndex, COLS);
    const date = ws.getCell(rowIndex, 1);
    date.value = `(${dayjs(input.fromDate).format("MMM D, YYYY")} – ${dayjs(
      input.toDate,
    ).format("MMM D, YYYY")})`;
    date.alignment = { horizontal: "center" };
    date.font = { size: 10 };
    rowIndex++;

    // GROUP HEADER ROW — Opening (2) | Period Transactions (2) | Closing (2)
    ws.getCell(rowIndex, 1).value = "";

    ws.mergeCells(rowIndex, 2, rowIndex, 3);
    ws.getCell(rowIndex, 2).value = "Opening Balance";
    ws.getCell(rowIndex, 2).font = { bold: true };
    ws.getCell(rowIndex, 2).alignment = { horizontal: "center" };

    ws.mergeCells(rowIndex, 4, rowIndex, 5);
    ws.getCell(rowIndex, 4).value = "Period Transactions";
    ws.getCell(rowIndex, 4).font = { bold: true };
    ws.getCell(rowIndex, 4).alignment = { horizontal: "center" };

    ws.mergeCells(rowIndex, 6, rowIndex, 7);
    ws.getCell(rowIndex, 6).value = "Closing Balance";
    ws.getCell(rowIndex, 6).font = { bold: true };
    ws.getCell(rowIndex, 6).alignment = { horizontal: "center" };

    rowIndex++;

    // COLUMN LABELS ROW
    ws.getCell(rowIndex, 1).value = "PARTICULARS";
    ws.getCell(rowIndex, 2).value = "DR";
    ws.getCell(rowIndex, 3).value = "CR";
    ws.getCell(rowIndex, 4).value = "DR";
    ws.getCell(rowIndex, 5).value = "CR";
    ws.getCell(rowIndex, 6).value = "DR";
    ws.getCell(rowIndex, 7).value = "CR";

    for (let c = 1; c <= COLS; c++) {
      ws.getCell(rowIndex, c).font = { bold: true };
      ws.getCell(rowIndex, c).alignment = {
        horizontal: "center",
        wrapText: true,
      };
    }
    rowIndex++;

    // DATA
    rows.forEach((r) => {
      const row = ws.addRow([
        r.ledger?.value,
        r.opening?.dr || "",
        r.opening?.cr || "",
        r.closing.dr || "",
        r.closing.cr || "",
        r.closing?.dr || "",
        r.closing?.cr || "",
      ]);

      row.getCell(1).alignment = { wrapText: true, vertical: "middle" };
      for (let c = 2; c <= COLS; c++) {
        row.getCell(c).alignment = { horizontal: "right", vertical: "middle" };
      }

      rowIndex++;
    });

    // SPACER
    ws.addRow([]);
    rowIndex++;

    // TOTAL ROW
    const totalRow = ws.addRow([
      "Grand Total",
      totals.opening?.dr || "",
      totals.opening?.cr || "",
      totals.closing.dr || "",
      totals.closing.cr || "",
      totals.closing?.dr || "",
      totals.closing?.cr || "",
    ]);
    totalRow.font = { bold: true };
    for (let c = 2; c <= COLS; c++) {
      totalRow.getCell(c).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
    }
    rowIndex++;

    const dataEndRow = totalRow.number;

    // ============================================================
    // BORDERS
    // ============================================================

    const blockStart = groupHeaderRowIndex;
    const blockEnd = dataEndRow;

    // Unified LEFT and RIGHT — continuous from titleStart to blockEnd
    for (let r = titleRowIndex; r <= blockEnd; r++) {
      const c1 = ws.getCell(r, 1);
      const c7 = ws.getCell(r, COLS);
      c1.border = { ...c1.border, left: { style: "thin" } };
      c7.border = { ...c7.border, right: { style: "thin" } };
    }

    // TOP border on title row
    for (let c = 1; c <= COLS; c++) {
      const cell = ws.getCell(titleRowIndex, c);
      cell.border = { ...cell.border, top: { style: "thin" } };
    }

    // TOP border on group header row (separator between title and table)
    for (let c = 1; c <= COLS; c++) {
      const cell = ws.getCell(blockStart, c);
      cell.border = { ...cell.border, top: { style: "thin" } };
    }

    // BOTTOM border on last row
    for (let c = 1; c <= COLS; c++) {
      const cell = ws.getCell(blockEnd, c);
      cell.border = { ...cell.border, bottom: { style: "thin" } };
    }

    // BOTTOM border under column labels row
    for (let c = 1; c <= COLS; c++) {
      const cell = ws.getCell(headerRowIndex, c);
      cell.border = { ...cell.border, bottom: { style: "thin" } };
    }

    // Column dividers — after cols 1,2,3,4,5,6
    for (let r = blockStart; r <= blockEnd; r++) {
      for (const c of [1, 2, 3, 4, 5, 6]) {
        const cell = ws.getCell(r, c);
        cell.border = { ...cell.border, right: { style: "thin" } };
      }
    }

    // Bottom border under group spans (Opening | Transactions | Closing labels)
    //    Only on cols 2-7 (not col 1 — Particulars has no group label)
    for (let c = 2; c <= COLS; c++) {
      const cell = ws.getCell(groupHeaderRowIndex, c);
      cell.border = { ...cell.border, bottom: { style: "thin" } };
    }

    // TOP border on total row
    for (let c = 1; c <= COLS; c++) {
      const cell = ws.getCell(totalRow.number, c);
      cell.border = { ...cell.border, top: { style: "thin" } };
    }

    return wb;
  },

  async buildExcelForGroupSummary(input: GroupSummaryRequestInput) {
    logger.info("entering::buildExcelForGroupSummary::service");
    const { roots, totals } = await this.getGroupSummaryTree(input);

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Group Summary");

    ws.properties.defaultRowHeight = 18;

    ws.getColumn(1).width = 45; // Particulars
    ws.getColumn(2).width = 18; // Opening DR
    ws.getColumn(3).width = 18; // Opening CR
    ws.getColumn(4).width = 18; // Period DR
    ws.getColumn(5).width = 18; // Period CR
    ws.getColumn(6).width = 18; // Closing DR
    ws.getColumn(7).width = 18; // Closing CR
    const COLS = 7;
    let rowIndex = 1;

    const titleRowIndex = rowIndex;
    const groupHeaderRowIndex = rowIndex + 2;
    const headerRowIndex = rowIndex + 3;

    // TITLE
    ws.mergeCells(rowIndex, 1, rowIndex, COLS);
    const title = ws.getCell(rowIndex, 1);
    title.value = `Group Summary for - ${roots[0]?.group?.value ?? ""}`;
    title.font = { bold: true, size: 16 };
    title.alignment = { horizontal: "center" };
    rowIndex++;

    // DATE RANGE
    ws.mergeCells(rowIndex, 1, rowIndex, COLS);
    const date = ws.getCell(rowIndex, 1);
    date.value = `(${dayjs(input.fromDate).format("MMM D, YYYY")} – ${dayjs(
      input.toDate,
    ).format("MMM D, YYYY")})`;
    date.alignment = { horizontal: "center" };
    date.font = { size: 10 };
    rowIndex++;

    // GROUP HEADER ROW — Opening Balance" spanning DR+CR
    ws.getCell(rowIndex, 1).value = "";
    ws.mergeCells(rowIndex, 2, rowIndex, 3);
    ws.getCell(rowIndex, 2).value = "Opening Balance";
    ws.getCell(rowIndex, 2).font = { bold: true };
    ws.getCell(rowIndex, 2).alignment = { horizontal: "center" };
    //"Period Transaction" spanning DR+CR
    ws.mergeCells(rowIndex, 4, rowIndex, 5);
    ws.getCell(rowIndex, 4).value = "Period Transaction";
    ws.getCell(rowIndex, 4).font = { bold: true };
    ws.getCell(rowIndex, 4).alignment = { horizontal: "center" };
    //"Closing Balance" spanning DR+CR
    ws.mergeCells(rowIndex, 6, rowIndex, 7);
    ws.getCell(rowIndex, 6).value = "Closing Balance";
    ws.getCell(rowIndex, 6).font = { bold: true };
    ws.getCell(rowIndex, 6).alignment = { horizontal: "center" };
    rowIndex++;

    // COLUMN LABELS
    ws.getCell(rowIndex, 1).value = "PARTICULARS";
    ws.getCell(rowIndex, 2).value = "DR";
    ws.getCell(rowIndex, 3).value = "CR";
    ws.getCell(rowIndex, 4).value = "DR";
    ws.getCell(rowIndex, 5).value = "CR";
    ws.getCell(rowIndex, 6).value = "DR";
    ws.getCell(rowIndex, 7).value = "CR";
    for (let c = 1; c <= COLS; c++) {
      ws.getCell(rowIndex, c).font = { bold: true };
      ws.getCell(rowIndex, c).alignment = {
        horizontal: "center",
        wrapText: true,
      };
    }
    rowIndex++;

    roots.forEach((root) => {
      // If root has direct ledgers, show them
      root.ledger?.forEach((l) => {
        ws.getCell(rowIndex, 1).value = `${l.ledger?.value ?? ""}`;
        ws.getCell(rowIndex, 1).alignment = {
          wrapText: true,
          vertical: "middle",
        };
        ws.getCell(rowIndex, 2).value = l.opening?.dr || "";
        ws.getCell(rowIndex, 3).value = l.opening?.cr || "";
        ws.getCell(rowIndex, 4).value = l.period?.dr || "";
        ws.getCell(rowIndex, 5).value = l.period?.cr || "";
        ws.getCell(rowIndex, 6).value = l.closing?.dr || "";
        ws.getCell(rowIndex, 7).value = l.closing?.cr || "";
        ws.getCell(rowIndex, 2).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, 3).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, 4).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, 5).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, 6).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, 7).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        rowIndex++;
      });

      // First-order children groups
      root.children?.forEach((child) => {
        ws.getCell(rowIndex, 1).value = child.group?.value ?? "";
        ws.getCell(rowIndex, 1).font = { bold: true };
        ws.getCell(rowIndex, 1).alignment = {
          wrapText: true,
          vertical: "middle",
        };
        ws.getCell(rowIndex, 2).value = child.opening?.dr || "";
        ws.getCell(rowIndex, 3).value = child.opening?.cr || "";
        ws.getCell(rowIndex, 4).value = child.period?.dr || "";
        ws.getCell(rowIndex, 5).value = child.period?.cr || "";
        ws.getCell(rowIndex, 6).value = child.closing?.dr || "";
        ws.getCell(rowIndex, 7).value = child.closing?.cr || "";
        ws.getCell(rowIndex, 2).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, 3).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, 4).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, 5).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, 6).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, 7).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, 2).font = { bold: true };
        ws.getCell(rowIndex, 3).font = { bold: true };
        ws.getCell(rowIndex, 4).font = { bold: true };
        ws.getCell(rowIndex, 5).font = { bold: true };
        ws.getCell(rowIndex, 6).font = { bold: true };
        ws.getCell(rowIndex, 7).font = { bold: true };
        rowIndex++;

        // Child's ledgers (indented)
        child.ledger?.forEach((l) => {
          ws.getCell(rowIndex, 1).value = `  ${l.ledger?.value ?? ""}`;
          ws.getCell(rowIndex, 1).alignment = {
            wrapText: true,
            vertical: "middle",
          };
          ws.getCell(rowIndex, 2).value = l.opening?.dr || "";
          ws.getCell(rowIndex, 3).value = l.opening?.cr || "";
          ws.getCell(rowIndex, 4).value = l.period?.dr || "";
          ws.getCell(rowIndex, 5).value = l.period?.cr || "";
          ws.getCell(rowIndex, 6).value = l.closing?.dr || "";
          ws.getCell(rowIndex, 7).value = l.closing?.cr || "";
          ws.getCell(rowIndex, 2).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          ws.getCell(rowIndex, 3).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          ws.getCell(rowIndex, 4).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          ws.getCell(rowIndex, 5).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          ws.getCell(rowIndex, 6).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          ws.getCell(rowIndex, 7).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          rowIndex++;
        });
      });
    });

    // SPACER
    ws.addRow([]);
    rowIndex++;

    // TOTAL ROW
    const totalRow = ws.addRow([
      "Grand Total",
      totals.openingDr || "",
      totals.openingCr || "",
      totals.periodDr || "",
      totals.periodCr || "",
      totals.closingDr || "",
      totals.closingCr || "",
    ]);
    totalRow.font = { bold: true };
    totalRow.getCell(1).alignment = { vertical: "middle" };
    totalRow.getCell(2).alignment = { horizontal: "right", vertical: "middle" };
    totalRow.getCell(3).alignment = { horizontal: "right", vertical: "middle" };
    totalRow.getCell(4).alignment = { horizontal: "right", vertical: "middle" };
    totalRow.getCell(5).alignment = { horizontal: "right", vertical: "middle" };
    totalRow.getCell(6).alignment = { horizontal: "right", vertical: "middle" };
    totalRow.getCell(7).alignment = { horizontal: "right", vertical: "middle" };
    rowIndex++;

    const dataEndRow = totalRow.number;

    // ============================================================
    // BORDERS
    // ============================================================

    const blockStart = groupHeaderRowIndex;
    const blockEnd = dataEndRow;

    // Unified LEFT and RIGHT — continuous from titleStart to blockEnd
    for (let r = titleRowIndex; r <= blockEnd; r++) {
      const c1 = ws.getCell(r, 1);
      const c7 = ws.getCell(r, COLS);
      c1.border = { ...c1.border, left: { style: "thin" } };
      c7.border = { ...c7.border, right: { style: "thin" } };
    }

    // TOP border on title row
    for (let c = 1; c <= COLS; c++) {
      const cell = ws.getCell(titleRowIndex, c);
      cell.border = { ...cell.border, top: { style: "thin" } };
    }

    // TOP border on group header row (separator between title and table)
    for (let c = 1; c <= COLS; c++) {
      const cell = ws.getCell(blockStart, c);
      cell.border = { ...cell.border, top: { style: "thin" } };
    }

    // BOTTOM border on last row
    for (let c = 1; c <= COLS; c++) {
      const cell = ws.getCell(blockEnd, c);
      cell.border = { ...cell.border, bottom: { style: "thin" } };
    }

    // BOTTOM border under column labels row
    for (let c = 1; c <= COLS; c++) {
      const cell = ws.getCell(headerRowIndex, c);
      cell.border = { ...cell.border, bottom: { style: "thin" } };
    }

    // Column dividers — after col 1 and col 6
    for (let r = blockStart; r <= blockEnd; r++) {
      for (const c of [1, 2, 3, 4, 5, 6]) {
        const cell = ws.getCell(r, c);
        cell.border = { ...cell.border, right: { style: "thin" } };
      }
    }

    // Bottom border under "Closing Balance" group span (cols 2-7 only)
    for (let c = 2; c <= COLS; c++) {
      const cell = ws.getCell(groupHeaderRowIndex, c);
      cell.border = { ...cell.border, bottom: { style: "thin" } };
    }

    // TOP border on total row
    for (let c = 1; c <= COLS; c++) {
      const cell = ws.getCell(totalRow.number, c);
      cell.border = { ...cell.border, top: { style: "thin" } };
    }

    return wb;
  },

  async buildExcelForCashBankSummary(input: ReportCommonRequestInput) {
    logger.info("entering::buildExcelForCashBankSummary::service");
    const { roots, totals } = await this.getCashBankSummary(input);

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Cash Bank Summary");

    ws.properties.defaultRowHeight = 18;

    ws.getColumn(1).width = 45;
    ws.getColumn(2).width = 18; // Opening DR
    ws.getColumn(3).width = 18; // Opening CR
    ws.getColumn(4).width = 18; // Period DR
    ws.getColumn(5).width = 18; // Period CR
    ws.getColumn(6).width = 18; // Closing DR
    ws.getColumn(7).width = 18; // Closing CR

    const COLS = 7;
    let rowIndex = 1;

    const titleRowIndex = rowIndex;
    const groupHeaderRowIndex = rowIndex + 2;
    const headerRowIndex = rowIndex + 3;

    // TITLE
    ws.mergeCells(rowIndex, 1, rowIndex, COLS);
    const title = ws.getCell(rowIndex, 1);
    title.value = "Cash Bank Summary";
    title.font = { bold: true, size: 16 };
    title.alignment = { horizontal: "center" };
    rowIndex++;

    // DATE RANGE
    ws.mergeCells(rowIndex, 1, rowIndex, COLS);
    const date = ws.getCell(rowIndex, 1);
    date.value = `(${dayjs(input.fromDate).format("MMM D, YYYY")} – ${dayjs(
      input.toDate,
    ).format("MMM D, YYYY")})`;
    date.alignment = { horizontal: "center" };
    date.font = { size: 10 };
    rowIndex++;

    // GROUP HEADER ROW — Opening Balance" spanning DR+CR
    ws.getCell(rowIndex, 1).value = "";
    ws.mergeCells(rowIndex, 2, rowIndex, 3);
    ws.getCell(rowIndex, 2).value = "Opening Balance";
    ws.getCell(rowIndex, 2).font = { bold: true };
    ws.getCell(rowIndex, 2).alignment = { horizontal: "center" };
    //"Period Transaction" spanning DR+CR
    ws.mergeCells(rowIndex, 4, rowIndex, 5);
    ws.getCell(rowIndex, 4).value = "Period Transaction";
    ws.getCell(rowIndex, 4).font = { bold: true };
    ws.getCell(rowIndex, 4).alignment = { horizontal: "center" };
    //"Closing Balance" spanning DR+CR
    ws.mergeCells(rowIndex, 6, rowIndex, 7);
    ws.getCell(rowIndex, 6).value = "Closing Balance";
    ws.getCell(rowIndex, 6).font = { bold: true };
    ws.getCell(rowIndex, 6).alignment = { horizontal: "center" };
    rowIndex++;

    // COLUMN LABELS
    ws.getCell(rowIndex, 1).value = "PARTICULARS";
    ws.getCell(rowIndex, 2).value = "DR";
    ws.getCell(rowIndex, 3).value = "CR";
    ws.getCell(rowIndex, 4).value = "DR";
    ws.getCell(rowIndex, 5).value = "CR";
    ws.getCell(rowIndex, 6).value = "DR";
    ws.getCell(rowIndex, 7).value = "CR";
    for (let c = 1; c <= COLS; c++) {
      ws.getCell(rowIndex, c).font = { bold: true };
      ws.getCell(rowIndex, c).alignment = {
        horizontal: "center",
        wrapText: true,
      };
    }
    rowIndex++;

    // DATA — track group separator rows
    const groupSeparatorRows: number[] = [];

    roots.forEach((root, rootIndex) => {
      // Add separator before each group except the first
      if (rootIndex > 0) {
        groupSeparatorRows.push(rowIndex - 1); // bottom border on previous row
      }

      // Root group row (bold)
      ws.getCell(rowIndex, 1).value = root.group?.value ?? "";
      ws.getCell(rowIndex, 1).font = { bold: true };
      ws.getCell(rowIndex, 1).alignment = {
        wrapText: true,
        vertical: "middle",
      };
      ws.getCell(rowIndex, 2).value = root.opening?.dr || "";
      ws.getCell(rowIndex, 3).value = root.opening?.cr || "";
      ws.getCell(rowIndex, 4).value = root.period?.dr || "";
      ws.getCell(rowIndex, 5).value = root.period?.cr || "";
      ws.getCell(rowIndex, 6).value = root.closing?.dr || "";
      ws.getCell(rowIndex, 7).value = root.closing?.cr || "";
      ws.getCell(rowIndex, 2).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
      ws.getCell(rowIndex, 3).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
      ws.getCell(rowIndex, 4).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
      ws.getCell(rowIndex, 5).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
      ws.getCell(rowIndex, 6).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
      ws.getCell(rowIndex, 7).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
      ws.getCell(rowIndex, 2).font = { bold: true };
      ws.getCell(rowIndex, 3).font = { bold: true };
      ws.getCell(rowIndex, 4).font = { bold: true };
      ws.getCell(rowIndex, 5).font = { bold: true };
      ws.getCell(rowIndex, 6).font = { bold: true };
      ws.getCell(rowIndex, 7).font = { bold: true };
      rowIndex++;

      // Direct ledgers (italic + indented)
      root.ledger?.forEach((l) => {
        ws.getCell(rowIndex, 1).value = `  ${l.ledger?.value ?? ""}`;
        ws.getCell(rowIndex, 1).font = { italic: true };
        ws.getCell(rowIndex, 1).alignment = {
          wrapText: true,
          vertical: "middle",
        };
        ws.getCell(rowIndex, 2).value = l.opening?.dr || "";
        ws.getCell(rowIndex, 3).value = l.opening?.cr || "";
        ws.getCell(rowIndex, 4).value = l.period?.dr || "";
        ws.getCell(rowIndex, 5).value = l.period?.cr || "";
        ws.getCell(rowIndex, 6).value = l.closing?.dr || "";
        ws.getCell(rowIndex, 7).value = l.closing?.cr || "";
        ws.getCell(rowIndex, 2).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, 3).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, 4).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, 5).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, 6).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, 7).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        rowIndex++;
      });

      // First-order children groups
      root.children?.forEach((child) => {
        ws.getCell(rowIndex, 1).value = `  ${child.group?.value ?? ""}`;
        ws.getCell(rowIndex, 1).font = { bold: true };
        ws.getCell(rowIndex, 1).alignment = {
          wrapText: true,
          vertical: "middle",
        };
        ws.getCell(rowIndex, 2).value = child.opening?.dr || "";
        ws.getCell(rowIndex, 3).value = child.opening?.cr || "";
        ws.getCell(rowIndex, 4).value = child.period?.dr || "";
        ws.getCell(rowIndex, 5).value = child.period?.cr || "";
        ws.getCell(rowIndex, 6).value = child.closing?.dr || "";
        ws.getCell(rowIndex, 7).value = child.closing?.cr || "";
        ws.getCell(rowIndex, 2).font = { bold: true };
        ws.getCell(rowIndex, 3).font = { bold: true };
        ws.getCell(rowIndex, 4).font = { bold: true };
        ws.getCell(rowIndex, 5).font = { bold: true };
        ws.getCell(rowIndex, 6).font = { bold: true };
        ws.getCell(rowIndex, 7).font = { bold: true };
        ws.getCell(rowIndex, 2).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, 3).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, 4).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, 5).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, 6).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, 7).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        rowIndex++;

        // Child ledgers (italic + indented)
        child.ledger?.forEach((l) => {
          ws.getCell(rowIndex, 1).value = `    ${l.ledger?.value ?? ""}`;
          ws.getCell(rowIndex, 1).font = { italic: true };
          ws.getCell(rowIndex, 1).alignment = {
            wrapText: true,
            vertical: "middle",
          };
          ws.getCell(rowIndex, 2).value = l.opening?.dr || "";
          ws.getCell(rowIndex, 3).value = l.opening?.cr || "";
          ws.getCell(rowIndex, 4).value = l.period?.dr || "";
          ws.getCell(rowIndex, 5).value = l.period?.cr || "";
          ws.getCell(rowIndex, 6).value = l.closing?.dr || "";
          ws.getCell(rowIndex, 7).value = l.closing?.cr || "";
          ws.getCell(rowIndex, 2).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          ws.getCell(rowIndex, 3).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          ws.getCell(rowIndex, 4).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          ws.getCell(rowIndex, 5).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          ws.getCell(rowIndex, 6).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          ws.getCell(rowIndex, 7).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          rowIndex++;
        });
      });
    });

    // SPACER
    ws.addRow([]);
    rowIndex++;

    // TOTAL ROW
    const totalRow = ws.addRow([
      "Grand Total",
      totals.openingDr || "",
      totals.openingCr || "",
      totals.periodDr || "",
      totals.periodCr || "",
      totals.closingDr || "",
      totals.closingCr || "",
    ]);
    totalRow.font = { bold: true };
    totalRow.getCell(1).alignment = { vertical: "middle" };
    totalRow.getCell(2).alignment = { horizontal: "right", vertical: "middle" };
    totalRow.getCell(3).alignment = { horizontal: "right", vertical: "middle" };
    totalRow.getCell(4).alignment = { horizontal: "right", vertical: "middle" };
    totalRow.getCell(5).alignment = { horizontal: "right", vertical: "middle" };
    totalRow.getCell(6).alignment = { horizontal: "right", vertical: "middle" };
    totalRow.getCell(7).alignment = { horizontal: "right", vertical: "middle" };

    rowIndex++;

    const dataEndRow = totalRow.number;

    // ============================================================
    // BORDERS
    // ============================================================

    const blockStart = groupHeaderRowIndex;
    const blockEnd = dataEndRow;

    // Unified LEFT and RIGHT
    for (let r = titleRowIndex; r <= blockEnd; r++) {
      const c1 = ws.getCell(r, 1);
      const c7 = ws.getCell(r, COLS);
      c1.border = { ...c1.border, left: { style: "thin" } };
      c7.border = { ...c7.border, right: { style: "thin" } };
    }

    // TOP border on title row
    for (let c = 1; c <= COLS; c++) {
      const cell = ws.getCell(titleRowIndex, c);
      cell.border = { ...cell.border, top: { style: "thin" } };
    }

    // TOP border on group header row
    for (let c = 1; c <= COLS; c++) {
      const cell = ws.getCell(blockStart, c);
      cell.border = { ...cell.border, top: { style: "thin" } };
    }

    // BOTTOM border on last row
    for (let c = 1; c <= COLS; c++) {
      const cell = ws.getCell(blockEnd, c);
      cell.border = { ...cell.border, bottom: { style: "thin" } };
    }

    // BOTTOM border under column labels row
    for (let c = 1; c <= COLS; c++) {
      const cell = ws.getCell(headerRowIndex, c);
      cell.border = { ...cell.border, bottom: { style: "thin" } };
    }

    // Column dividers
    for (let r = blockStart; r <= blockEnd; r++) {
      for (const c of [1, 2, 3, 4, 5, 6]) {
        const cell = ws.getCell(r, c);
        cell.border = { ...cell.border, right: { style: "thin" } };
      }
    }

    // Bottom border under "Closing Balance" span
    for (let c = 2; c <= COLS; c++) {
      const cell = ws.getCell(groupHeaderRowIndex, c);
      cell.border = { ...cell.border, bottom: { style: "thin" } };
    }

    // TOP border on total row
    for (let c = 1; c <= COLS; c++) {
      const cell = ws.getCell(totalRow.number, c);
      cell.border = { ...cell.border, top: { style: "thin" } };
    }

    // Group separator — bottom border on last row of each group (except last root)
    groupSeparatorRows.forEach((separatorRow) => {
      for (let c = 1; c <= COLS; c++) {
        const cell = ws.getCell(separatorRow, c);
        cell.border = { ...cell.border, bottom: { style: "thin" } };
      }
    });

    return wb;
  },

  async buildExcelForReceivableSummary(input: ReportCommonRequestInput) {
    logger.info("entering::buildExcelForReceivableSummary::service");
    const { roots, totals, ageing } = await this.getReceivableSummary(input);

    const hasAgeing = !!ageing;
    const buckets = hasAgeing ? ageing.bucketDefinitions : [];

    const bucketCount = buckets.length;
    const COLS = hasAgeing ? 2 + bucketCount + 6 : 7;
    const openingPendingCol = hasAgeing ? 3 + bucketCount : 2;
    const openingAdvanceCol = openingPendingCol + 1;
    const periodPendingCol = openingAdvanceCol + 1;
    const periodAdvanceCol = periodPendingCol + 1;
    const closingPendingCol = periodAdvanceCol + 1;
    const closingAdvanceCol = closingPendingCol + 1;

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Receivable Summary");

    ws.properties.defaultRowHeight = 18;

    ws.getColumn(1).width = 45; // Particulars
    if (hasAgeing) {
      ws.getColumn(2).width = 18; // Pending Amount
      for (let i = 0; i < bucketCount; i++) {
        ws.getColumn(3 + i).width = 16; // each bucket
      }
    }
    ws.getColumn(openingPendingCol).width = 18;
    ws.getColumn(openingAdvanceCol).width = 18;
    ws.getColumn(periodPendingCol).width = 18;
    ws.getColumn(periodAdvanceCol).width = 18;
    ws.getColumn(closingPendingCol).width = 18;
    ws.getColumn(closingAdvanceCol).width = 18;

    let rowIndex = 1;

    const titleRowIndex = rowIndex;
    const groupHeaderRowIndex = rowIndex + 2;
    const headerRowIndex = rowIndex + 3;

    // TITLE
    ws.mergeCells(rowIndex, 1, rowIndex, COLS);
    const title = ws.getCell(rowIndex, 1);
    title.value = "Receivable Summary";
    title.font = { bold: true, size: 16 };
    title.alignment = { horizontal: "center" };
    rowIndex++;

    // DATE RANGE
    ws.mergeCells(rowIndex, 1, rowIndex, COLS);
    const date = ws.getCell(rowIndex, 1);
    date.value = `(${dayjs(input.fromDate).format("MMM D, YYYY")} – ${dayjs(
      input.toDate,
    ).format("MMM D, YYYY")})`;
    date.alignment = { horizontal: "center" };
    date.font = { size: 10 };
    rowIndex++;

    // GROUP HEADER ROW
    ws.getCell(rowIndex, 1).value = "";

    if (hasAgeing) {
      // Pending Amount — single col
      ws.getCell(rowIndex, 2).value = "";

      // Ageing span
      ws.mergeCells(rowIndex, 3, rowIndex, 2 + bucketCount);
      ws.getCell(rowIndex, 3).value = "Ageing";
      ws.getCell(rowIndex, 3).font = { bold: true };
      ws.getCell(rowIndex, 3).alignment = { horizontal: "center" };
    }

    // Opening Balance span
    ws.mergeCells(rowIndex, openingPendingCol, rowIndex, openingAdvanceCol);
    ws.getCell(rowIndex, openingPendingCol).value = "Opening Balance";
    ws.getCell(rowIndex, openingPendingCol).font = { bold: true };
    ws.getCell(rowIndex, openingPendingCol).alignment = {
      horizontal: "center",
    };

    // Period Transaction span
    ws.mergeCells(rowIndex, periodPendingCol, rowIndex, periodAdvanceCol);
    ws.getCell(rowIndex, periodPendingCol).value = "Period Transaction";
    ws.getCell(rowIndex, periodPendingCol).font = { bold: true };
    ws.getCell(rowIndex, periodPendingCol).alignment = { horizontal: "center" };

    // Closing Balance span
    ws.mergeCells(rowIndex, closingPendingCol, rowIndex, closingAdvanceCol);
    ws.getCell(rowIndex, closingPendingCol).value = "Closing Balance";
    ws.getCell(rowIndex, closingPendingCol).font = { bold: true };
    ws.getCell(rowIndex, closingPendingCol).alignment = {
      horizontal: "center",
    };
    rowIndex++;

    // COLUMN LABELS
    ws.getCell(rowIndex, 1).value = "PARTICULARS";

    if (hasAgeing) {
      ws.getCell(rowIndex, 2).value = "PENDING AMOUNT";
      ws.getCell(rowIndex, 2).font = { bold: true };
      ws.getCell(rowIndex, 2).alignment = {
        horizontal: "center",
        wrapText: true,
      };

      buckets.forEach((b, i) => {
        const label =
          b.to === 0 ? `> ${b.from} DAYS` : `${b.from} TO ${b.to} DAYS`;
        ws.getCell(rowIndex, 3 + i).value = label;
        ws.getCell(rowIndex, 3 + i).font = { bold: true };
        ws.getCell(rowIndex, 3 + i).alignment = {
          horizontal: "center",
          wrapText: true,
        };
      });
    }

    ws.getCell(rowIndex, openingPendingCol).value = "PENDING";
    ws.getCell(rowIndex, openingAdvanceCol).value = "ADVANCE";
    ws.getCell(rowIndex, periodPendingCol).value = "PENDING";
    ws.getCell(rowIndex, periodAdvanceCol).value = "ADVANCE";
    ws.getCell(rowIndex, closingPendingCol).value = "PENDING";
    ws.getCell(rowIndex, closingAdvanceCol).value = "ADVANCE";

    for (let c = 1; c <= COLS; c++) {
      ws.getCell(rowIndex, c).font = { bold: true };
      ws.getCell(rowIndex, c).alignment = {
        horizontal: "center",
        wrapText: true,
      };
    }
    rowIndex++;

    // Build ageing lookup map by ledger id
    const ageingMap = new Map<
      number,
      {
        ledger: { id: number; value: string };
        pending: number;
        bucketAmounts: { from: number; to: number; amount: number }[];
      }
    >();
    if (hasAgeing && ageing) {
      ageing.rows.forEach((r) => ageingMap.set(r.ledger.id, r));
    }

    // DATA
    const groupSeparatorRows: number[] = [];

    roots.forEach((root, rootIndex) => {
      if (rootIndex > 0) groupSeparatorRows.push(rowIndex - 1);

      // Direct ledgers
      root.ledger?.forEach((l) => {
        const ageingRow = hasAgeing ? ageingMap.get(l.ledger?.id ?? -1) : null;

        const lPA = getPendingAdvance(
          l.closing?.dr ?? 0,
          l.closing?.cr ?? 0,
          "receivable",
        );
        const OPA = getPendingAdvance(
          l.opening?.dr ?? 0,
          l.opening?.cr ?? 0,
          "receivable",
        );
        const PPA = getPendingAdvance(
          l.period?.dr ?? 0,
          l.period?.cr ?? 0,
          "receivable",
        );

        ws.getCell(rowIndex, 1).value = `${l.ledger?.value ?? ""}`;
        ws.getCell(rowIndex, 1).font = { italic: true };
        ws.getCell(rowIndex, 1).alignment = {
          wrapText: true,
          vertical: "middle",
        };

        if (hasAgeing) {
          ws.getCell(rowIndex, 2).value = ageingRow?.pending || "";
          ws.getCell(rowIndex, 2).alignment = {
            horizontal: "right",
            vertical: "middle",
          };

          buckets.forEach((b, i) => {
            const bucket = ageingRow?.bucketAmounts.find(
              (ba) => ba.from === b.from && ba.to === b.to,
            );
            const amount = bucket?.amount ?? 0;
            ws.getCell(rowIndex, 3 + i).value = amount > 0 ? amount : "";
            ws.getCell(rowIndex, 3 + i).alignment = {
              horizontal: "right",
              vertical: "middle",
            };
          });
        }

        ws.getCell(rowIndex, openingPendingCol).value = OPA.pending;
        ws.getCell(rowIndex, openingAdvanceCol).value = OPA.advance;
        ws.getCell(rowIndex, periodPendingCol).value = PPA.pending;
        ws.getCell(rowIndex, periodAdvanceCol).value = PPA.advance;
        ws.getCell(rowIndex, closingPendingCol).value = lPA.pending;
        ws.getCell(rowIndex, closingAdvanceCol).value = lPA.advance;
        ws.getCell(rowIndex, openingPendingCol).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, openingAdvanceCol).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, periodPendingCol).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, periodAdvanceCol).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, closingPendingCol).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, closingAdvanceCol).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        rowIndex++;
      });

      // First-order children
      root.children?.forEach((child) => {
        const childPA = getPendingAdvance(
          child.closing?.dr ?? 0,
          child.closing?.cr ?? 0,
          "receivable",
        );
        const childOPA = getPendingAdvance(
          child.opening?.dr ?? 0,
          child.opening?.cr ?? 0,
          "receivable",
        );
        const childPPA = getPendingAdvance(
          child.period?.dr ?? 0,
          child.period?.cr ?? 0,
          "receivable",
        );

        ws.getCell(rowIndex, 1).value = `${child.group?.value ?? ""}`;
        ws.getCell(rowIndex, 1).font = { bold: true };
        ws.getCell(rowIndex, 1).alignment = {
          wrapText: true,
          vertical: "middle",
        };
        if (hasAgeing) {
          ws.getCell(rowIndex, 2).value = childPA.pending;
          ws.getCell(rowIndex, 2).font = { bold: true };
          ws.getCell(rowIndex, 2).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
        }

        ws.getCell(rowIndex, openingPendingCol).value = childOPA.pending;
        ws.getCell(rowIndex, openingAdvanceCol).value = childOPA.advance;
        ws.getCell(rowIndex, periodPendingCol).value = childPPA.pending;
        ws.getCell(rowIndex, periodAdvanceCol).value = childPPA.advance;
        ws.getCell(rowIndex, closingPendingCol).value = childPA.pending;
        ws.getCell(rowIndex, closingAdvanceCol).value = childPA.advance;
        ws.getCell(rowIndex, openingPendingCol).font = { bold: true };
        ws.getCell(rowIndex, openingAdvanceCol).font = { bold: true };
        ws.getCell(rowIndex, periodPendingCol).font = { bold: true };
        ws.getCell(rowIndex, periodAdvanceCol).font = { bold: true };
        ws.getCell(rowIndex, closingPendingCol).font = { bold: true };
        ws.getCell(rowIndex, closingAdvanceCol).font = { bold: true };
        ws.getCell(rowIndex, openingPendingCol).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, openingAdvanceCol).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, periodPendingCol).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, periodAdvanceCol).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, closingPendingCol).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, closingAdvanceCol).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        rowIndex++;

        child.ledger?.forEach((l) => {
          const ageingRow = hasAgeing
            ? ageingMap.get(l.ledger?.id ?? -1)
            : null;

          ws.getCell(rowIndex, 1).value = `   ${l.ledger?.value ?? ""}`;
          ws.getCell(rowIndex, 1).font = { italic: true };
          ws.getCell(rowIndex, 1).alignment = {
            wrapText: true,
            vertical: "middle",
          };

          if (hasAgeing) {
            ws.getCell(rowIndex, 2).value = ageingRow?.pending || "";
            ws.getCell(rowIndex, 2).alignment = {
              horizontal: "right",
              vertical: "middle",
            };

            buckets.forEach((b, i) => {
              const bucket = ageingRow?.bucketAmounts.find(
                (ba) => ba.from === b.from && ba.to === b.to,
              );
              const amount = bucket?.amount ?? 0;
              ws.getCell(rowIndex, 3 + i).value = amount > 0 ? amount : "";
              ws.getCell(rowIndex, 3 + i).alignment = {
                horizontal: "right",
                vertical: "middle",
              };
            });
          }

          const lPA = getPendingAdvance(
            l.closing?.dr ?? 0,
            l.closing?.cr ?? 0,
            "receivable",
          );
          const OPA = getPendingAdvance(
            l.opening?.dr ?? 0,
            l.opening?.cr ?? 0,
            "receivable",
          );
          const PPA = getPendingAdvance(
            l.period?.dr ?? 0,
            l.period?.cr ?? 0,
            "receivable",
          );
          ws.getCell(rowIndex, openingPendingCol).value = OPA.pending;
          ws.getCell(rowIndex, openingAdvanceCol).value = OPA.advance;
          ws.getCell(rowIndex, periodPendingCol).value = PPA.pending;
          ws.getCell(rowIndex, periodAdvanceCol).value = PPA.advance;
          ws.getCell(rowIndex, closingPendingCol).value = lPA.pending;
          ws.getCell(rowIndex, closingAdvanceCol).value = lPA.advance;
          ws.getCell(rowIndex, openingPendingCol).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          ws.getCell(rowIndex, openingAdvanceCol).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          ws.getCell(rowIndex, periodPendingCol).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          ws.getCell(rowIndex, periodAdvanceCol).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          ws.getCell(rowIndex, closingPendingCol).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          ws.getCell(rowIndex, closingAdvanceCol).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          rowIndex++;
        });
      });
    });

    // SPACER
    ws.addRow([]);
    rowIndex++;

    // TOTAL ROW
    const totalRowData: (string | number)[] = ["Grand Total"];
    if (hasAgeing) {
      totalRowData.push(ageing.totals.pending || "");
      buckets.forEach((b) => {
        const bucket = ageing.totals.bucketAmounts.find(
          (ba) => ba.from === b.from && ba.to === b.to,
        );
        const amount = bucket?.amount ?? 0;
        totalRowData.push(amount > 0 ? amount : "");
      });
    }
    const TPA = getPendingAdvance(
      totals.closingDr ?? 0,
      totals.closingCr ?? 0,
      "receivable",
    );
    const TOPA = getPendingAdvance(
      totals.openingDr ?? 0,
      totals.openingCr ?? 0,
      "receivable",
    );
    const TPPA = getPendingAdvance(
      totals.periodDr ?? 0,
      totals.periodCr ?? 0,
      "receivable",
    );
    totalRowData.push(TOPA.pending || "");
    totalRowData.push(TOPA.advance || "");
    totalRowData.push(TPPA.pending || "");
    totalRowData.push(TPPA.advance || "");
    totalRowData.push(TPA.pending || "");
    totalRowData.push(TPA.advance || "");

    const totalRow = ws.addRow(totalRowData);
    totalRow.font = { bold: true };
    totalRow.getCell(1).alignment = { vertical: "middle" };
    for (let c = 2; c <= COLS; c++) {
      totalRow.getCell(c).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
    }
    rowIndex++;

    const dataEndRow = totalRow.number;

    // ============================================================
    // BORDERS
    // ============================================================

    const blockStart = groupHeaderRowIndex;
    const blockEnd = dataEndRow;

    // Unified LEFT and RIGHT
    for (let r = titleRowIndex; r <= blockEnd; r++) {
      ws.getCell(r, 1).border = {
        ...ws.getCell(r, 1).border,
        left: { style: "thin" },
      };
      ws.getCell(r, COLS).border = {
        ...ws.getCell(r, COLS).border,
        right: { style: "thin" },
      };
    }

    // TOP on title
    for (let c = 1; c <= COLS; c++) {
      ws.getCell(titleRowIndex, c).border = {
        ...ws.getCell(titleRowIndex, c).border,
        top: { style: "thin" },
      };
    }

    // TOP on group header row
    for (let c = 1; c <= COLS; c++) {
      ws.getCell(blockStart, c).border = {
        ...ws.getCell(blockStart, c).border,
        top: { style: "thin" },
      };
    }

    // BOTTOM on last row
    for (let c = 1; c <= COLS; c++) {
      ws.getCell(blockEnd, c).border = {
        ...ws.getCell(blockEnd, c).border,
        bottom: { style: "thin" },
      };
    }

    // BOTTOM under column labels row
    for (let c = 1; c <= COLS; c++) {
      ws.getCell(headerRowIndex, c).border = {
        ...ws.getCell(headerRowIndex, c).border,
        bottom: { style: "thin" },
      };
    }

    // Column dividers — after every col except last
    for (let r = blockStart; r <= blockEnd; r++) {
      for (let c = 1; c < COLS; c++) {
        ws.getCell(r, c).border = {
          ...ws.getCell(r, c).border,
          right: { style: "thin" },
        };
      }
    }

    // Bottom under group header spans (ageing + closing balance labels)
    for (let c = hasAgeing ? 3 : openingPendingCol; c <= COLS; c++) {
      ws.getCell(groupHeaderRowIndex, c).border = {
        ...ws.getCell(groupHeaderRowIndex, c).border,
        bottom: { style: "thin" },
      };
    }

    // TOP on total row
    for (let c = 1; c <= COLS; c++) {
      ws.getCell(totalRow.number, c).border = {
        ...ws.getCell(totalRow.number, c).border,
        top: { style: "thin" },
      };
    }

    // Group separators
    groupSeparatorRows.forEach((separatorRow) => {
      for (let c = 1; c <= COLS; c++) {
        ws.getCell(separatorRow, c).border = {
          ...ws.getCell(separatorRow, c).border,
          bottom: { style: "thin" },
        };
      }
    });

    return wb;
  },

  async buildExcelForPayableSummary(input: ReportCommonRequestInput) {
    logger.info("entering::buildExcelForPayableSummary::service");
    const { roots, totals, ageing } = await this.getPayableSummary(input);

    const hasAgeing = !!ageing;
    const buckets = hasAgeing ? ageing.bucketDefinitions : [];

    const bucketCount = buckets.length;
    const COLS = hasAgeing ? 2 + bucketCount + 6 : 7;
    const openingPendingCol = hasAgeing ? 3 + bucketCount : 2;
    const openingAdvanceCol = openingPendingCol + 1;
    const periodPendingCol = openingAdvanceCol + 1;
    const periodAdvanceCol = periodPendingCol + 1;
    const closingPendingCol = periodAdvanceCol + 1;
    const closingAdvanceCol = closingPendingCol + 1;

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Payable Summary");

    ws.properties.defaultRowHeight = 18;

    ws.getColumn(1).width = 45; // Particulars
    if (hasAgeing) {
      ws.getColumn(2).width = 18; // Pending Amount
      for (let i = 0; i < bucketCount; i++) {
        ws.getColumn(3 + i).width = 16; // each bucket
      }
    }
    ws.getColumn(openingPendingCol).width = 18;
    ws.getColumn(openingAdvanceCol).width = 18;
    ws.getColumn(periodPendingCol).width = 18;
    ws.getColumn(periodAdvanceCol).width = 18;
    ws.getColumn(closingPendingCol).width = 18;
    ws.getColumn(closingAdvanceCol).width = 18;

    let rowIndex = 1;

    const titleRowIndex = rowIndex;
    const groupHeaderRowIndex = rowIndex + 2;
    const headerRowIndex = rowIndex + 3;

    // TITLE
    ws.mergeCells(rowIndex, 1, rowIndex, COLS);
    const title = ws.getCell(rowIndex, 1);
    title.value = "Payable Summary";
    title.font = { bold: true, size: 16 };
    title.alignment = { horizontal: "center" };
    rowIndex++;

    // DATE RANGE
    ws.mergeCells(rowIndex, 1, rowIndex, COLS);
    const date = ws.getCell(rowIndex, 1);
    date.value = `(${dayjs(input.fromDate).format("MMM D, YYYY")} – ${dayjs(
      input.toDate,
    ).format("MMM D, YYYY")})`;
    date.alignment = { horizontal: "center" };
    date.font = { size: 10 };
    rowIndex++;

    // GROUP HEADER ROW
    ws.getCell(rowIndex, 1).value = "";

    if (hasAgeing) {
      // Pending Amount — single col
      ws.getCell(rowIndex, 2).value = "";

      // Ageing span
      ws.mergeCells(rowIndex, 3, rowIndex, 2 + bucketCount);
      ws.getCell(rowIndex, 3).value = "Ageing";
      ws.getCell(rowIndex, 3).font = { bold: true };
      ws.getCell(rowIndex, 3).alignment = { horizontal: "center" };
    }

    // Opening Balance span
    ws.mergeCells(rowIndex, openingPendingCol, rowIndex, openingAdvanceCol);
    ws.getCell(rowIndex, openingPendingCol).value = "Opening Balance";
    ws.getCell(rowIndex, openingPendingCol).font = { bold: true };
    ws.getCell(rowIndex, openingPendingCol).alignment = {
      horizontal: "center",
    };

    // Period Transaction span
    ws.mergeCells(rowIndex, periodPendingCol, rowIndex, periodAdvanceCol);
    ws.getCell(rowIndex, periodPendingCol).value = "Period Transaction";
    ws.getCell(rowIndex, periodPendingCol).font = { bold: true };
    ws.getCell(rowIndex, periodPendingCol).alignment = { horizontal: "center" };

    // Closing Balance span
    ws.mergeCells(rowIndex, closingPendingCol, rowIndex, closingAdvanceCol);
    ws.getCell(rowIndex, closingPendingCol).value = "Closing Balance";
    ws.getCell(rowIndex, closingPendingCol).font = { bold: true };
    ws.getCell(rowIndex, closingPendingCol).alignment = {
      horizontal: "center",
    };
    rowIndex++;

    // COLUMN LABELS
    ws.getCell(rowIndex, 1).value = "PARTICULARS";

    if (hasAgeing) {
      ws.getCell(rowIndex, 2).value = "PENDING AMOUNT";
      ws.getCell(rowIndex, 2).font = { bold: true };
      ws.getCell(rowIndex, 2).alignment = {
        horizontal: "center",
        wrapText: true,
      };

      buckets.forEach((b, i) => {
        const label =
          b.to === 0 ? `> ${b.from} DAYS` : `${b.from} TO ${b.to} DAYS`;
        ws.getCell(rowIndex, 3 + i).value = label;
        ws.getCell(rowIndex, 3 + i).font = { bold: true };
        ws.getCell(rowIndex, 3 + i).alignment = {
          horizontal: "center",
          wrapText: true,
        };
      });
    }

    ws.getCell(rowIndex, openingPendingCol).value = "PENDING";
    ws.getCell(rowIndex, openingAdvanceCol).value = "ADVANCE";
    ws.getCell(rowIndex, periodPendingCol).value = "PENDING";
    ws.getCell(rowIndex, periodAdvanceCol).value = "ADVANCE";
    ws.getCell(rowIndex, closingPendingCol).value = "PENDING";
    ws.getCell(rowIndex, closingAdvanceCol).value = "ADVANCE";

    for (let c = 1; c <= COLS; c++) {
      ws.getCell(rowIndex, c).font = { bold: true };
      ws.getCell(rowIndex, c).alignment = {
        horizontal: "center",
        wrapText: true,
      };
    }
    rowIndex++;

    // Build ageing lookup map by ledger id
    const ageingMap = new Map<
      number,
      {
        ledger: { id: number; value: string };
        pending: number;
        bucketAmounts: { from: number; to: number; amount: number }[];
      }
    >();
    if (hasAgeing && ageing) {
      ageing.rows.forEach((r) => ageingMap.set(r.ledger.id, r));
    }

    // DATA
    const groupSeparatorRows: number[] = [];

    roots.forEach((root, rootIndex) => {
      if (rootIndex > 0) groupSeparatorRows.push(rowIndex - 1);

      // Direct ledgers
      root.ledger?.forEach((l) => {
        const ageingRow = hasAgeing ? ageingMap.get(l.ledger?.id ?? -1) : null;

        const IPA = getPendingAdvance(
          l.closing?.dr ?? 0,
          l.closing?.cr ?? 0,
          "payable",
        );
        const OPA = getPendingAdvance(
          l.opening?.dr ?? 0,
          l.opening?.cr ?? 0,
          "payable",
        );
        const PPA = getPendingAdvance(
          l.period?.dr ?? 0,
          l.period?.cr ?? 0,
          "payable",
        );

        ws.getCell(rowIndex, 1).value = `${l.ledger?.value ?? ""}`;
        ws.getCell(rowIndex, 1).font = { italic: true };
        ws.getCell(rowIndex, 1).alignment = {
          wrapText: true,
          vertical: "middle",
        };

        if (hasAgeing) {
          ws.getCell(rowIndex, 2).value = ageingRow?.pending || "";
          ws.getCell(rowIndex, 2).alignment = {
            horizontal: "right",
            vertical: "middle",
          };

          buckets.forEach((b, i) => {
            const bucket = ageingRow?.bucketAmounts.find(
              (ba) => ba.from === b.from && ba.to === b.to,
            );
            const amount = bucket?.amount ?? 0;
            ws.getCell(rowIndex, 3 + i).value = amount > 0 ? amount : "";
            ws.getCell(rowIndex, 3 + i).alignment = {
              horizontal: "right",
              vertical: "middle",
            };
          });
        }

        ws.getCell(rowIndex, openingPendingCol).value = OPA.pending;
        ws.getCell(rowIndex, openingAdvanceCol).value = OPA.advance;
        ws.getCell(rowIndex, periodPendingCol).value = PPA.pending;
        ws.getCell(rowIndex, periodAdvanceCol).value = PPA.advance;
        ws.getCell(rowIndex, closingPendingCol).value = IPA.pending;
        ws.getCell(rowIndex, closingAdvanceCol).value = IPA.advance;
        ws.getCell(rowIndex, openingPendingCol).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, openingAdvanceCol).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, periodPendingCol).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, periodAdvanceCol).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, closingPendingCol).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, closingAdvanceCol).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        rowIndex++;
      });

      // First-order children
      root.children?.forEach((child) => {
        const CPA = getPendingAdvance(
          child.closing?.dr ?? 0,
          child.closing?.cr ?? 0,
          "payable",
        );
        const COPA = getPendingAdvance(
          child.opening?.dr ?? 0,
          child.opening?.cr ?? 0,
          "payable",
        );
        const CPPA = getPendingAdvance(
          child.period?.dr ?? 0,
          child.period?.cr ?? 0,
          "payable",
        );

        ws.getCell(rowIndex, 1).value = `${child.group?.value ?? ""}`;
        ws.getCell(rowIndex, 1).font = { bold: true };
        ws.getCell(rowIndex, 1).alignment = {
          wrapText: true,
          vertical: "middle",
        };
        if (hasAgeing) {
          ws.getCell(rowIndex, 2).value = CPA.pending;
          ws.getCell(rowIndex, 2).font = { bold: true };
          ws.getCell(rowIndex, 2).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
        }

        ws.getCell(rowIndex, openingPendingCol).value = COPA.pending;
        ws.getCell(rowIndex, openingAdvanceCol).value = COPA.advance;
        ws.getCell(rowIndex, periodPendingCol).value = CPPA.pending;
        ws.getCell(rowIndex, periodAdvanceCol).value = CPPA.advance;
        ws.getCell(rowIndex, closingPendingCol).value = CPA.pending;
        ws.getCell(rowIndex, closingAdvanceCol).value = CPA.advance;
        ws.getCell(rowIndex, openingPendingCol).font = { bold: true };
        ws.getCell(rowIndex, openingAdvanceCol).font = { bold: true };
        ws.getCell(rowIndex, periodPendingCol).font = { bold: true };
        ws.getCell(rowIndex, periodAdvanceCol).font = { bold: true };
        ws.getCell(rowIndex, closingPendingCol).font = { bold: true };
        ws.getCell(rowIndex, closingAdvanceCol).font = { bold: true };
        ws.getCell(rowIndex, openingPendingCol).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, openingAdvanceCol).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, periodPendingCol).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, periodAdvanceCol).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, closingPendingCol).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        ws.getCell(rowIndex, closingAdvanceCol).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
        rowIndex++;

        child.ledger?.forEach((l) => {
          const ageingRow = hasAgeing
            ? ageingMap.get(l.ledger?.id ?? -1)
            : null;

          ws.getCell(rowIndex, 1).value = `    ${l.ledger?.value ?? ""}`;
          ws.getCell(rowIndex, 1).font = { italic: true };
          ws.getCell(rowIndex, 1).alignment = {
            wrapText: true,
            vertical: "middle",
          };

          if (hasAgeing) {
            ws.getCell(rowIndex, 2).value = ageingRow?.pending || "";
            ws.getCell(rowIndex, 2).alignment = {
              horizontal: "right",
              vertical: "middle",
            };

            buckets.forEach((b, i) => {
              const bucket = ageingRow?.bucketAmounts.find(
                (ba) => ba.from === b.from && ba.to === b.to,
              );
              const amount = bucket?.amount ?? 0;
              ws.getCell(rowIndex, 3 + i).value = amount > 0 ? amount : "";
              ws.getCell(rowIndex, 3 + i).alignment = {
                horizontal: "right",
                vertical: "middle",
              };
            });
          }

          const lPA = getPendingAdvance(
            l.closing?.dr ?? 0,
            l.closing?.cr ?? 0,
            "payable",
          );
          const OPA = getPendingAdvance(
            l.opening?.dr ?? 0,
            l.opening?.cr ?? 0,
            "payable",
          );
          const PPA = getPendingAdvance(
            l.period?.dr ?? 0,
            l.period?.cr ?? 0,
            "payable",
          );
          ws.getCell(rowIndex, openingPendingCol).value = OPA.pending;
          ws.getCell(rowIndex, openingAdvanceCol).value = OPA.advance;
          ws.getCell(rowIndex, periodPendingCol).value = PPA.pending;
          ws.getCell(rowIndex, periodAdvanceCol).value = PPA.advance;
          ws.getCell(rowIndex, closingPendingCol).value = lPA.pending;
          ws.getCell(rowIndex, closingAdvanceCol).value = lPA.advance;
          ws.getCell(rowIndex, openingPendingCol).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          ws.getCell(rowIndex, openingAdvanceCol).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          ws.getCell(rowIndex, periodPendingCol).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          ws.getCell(rowIndex, periodAdvanceCol).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          ws.getCell(rowIndex, closingPendingCol).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          ws.getCell(rowIndex, closingAdvanceCol).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          rowIndex++;
        });
      });
    });

    // SPACER
    ws.addRow([]);
    rowIndex++;

    // TOTAL ROW
    const totalRowData: (string | number)[] = ["Grand Total"];
    if (hasAgeing) {
      totalRowData.push(ageing.totals.pending || "");
      buckets.forEach((b) => {
        const bucket = ageing.totals.bucketAmounts.find(
          (ba) => ba.from === b.from && ba.to === b.to,
        );
        const amount = bucket?.amount ?? 0;
        totalRowData.push(amount > 0 ? amount : "");
      });
    }
    const TPA = getPendingAdvance(
      totals.closingDr ?? 0,
      totals.closingCr ?? 0,
      "payable",
    );
    const TOPA = getPendingAdvance(
      totals.openingDr ?? 0,
      totals.openingCr ?? 0,
      "payable",
    );
    const TPPA = getPendingAdvance(
      totals.periodDr ?? 0,
      totals.periodCr ?? 0,
      "payable",
    );
    totalRowData.push(TOPA.pending || "");
    totalRowData.push(TOPA.advance || "");
    totalRowData.push(TPPA.pending || "");
    totalRowData.push(TPPA.advance || "");
    totalRowData.push(TPA.pending || "");
    totalRowData.push(TPA.advance || "");

    const totalRow = ws.addRow(totalRowData);
    totalRow.font = { bold: true };
    totalRow.getCell(1).alignment = { vertical: "middle" };
    for (let c = 2; c <= COLS; c++) {
      totalRow.getCell(c).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
    }
    rowIndex++;

    const dataEndRow = totalRow.number;

    // ============================================================
    // BORDERS
    // ============================================================

    const blockStart = groupHeaderRowIndex;
    const blockEnd = dataEndRow;

    // 1. Unified LEFT and RIGHT
    for (let r = titleRowIndex; r <= blockEnd; r++) {
      ws.getCell(r, 1).border = {
        ...ws.getCell(r, 1).border,
        left: { style: "thin" },
      };
      ws.getCell(r, COLS).border = {
        ...ws.getCell(r, COLS).border,
        right: { style: "thin" },
      };
    }

    // 2. TOP on title
    for (let c = 1; c <= COLS; c++) {
      ws.getCell(titleRowIndex, c).border = {
        ...ws.getCell(titleRowIndex, c).border,
        top: { style: "thin" },
      };
    }

    // 3. TOP on group header row
    for (let c = 1; c <= COLS; c++) {
      ws.getCell(blockStart, c).border = {
        ...ws.getCell(blockStart, c).border,
        top: { style: "thin" },
      };
    }

    // 4. BOTTOM on last row
    for (let c = 1; c <= COLS; c++) {
      ws.getCell(blockEnd, c).border = {
        ...ws.getCell(blockEnd, c).border,
        bottom: { style: "thin" },
      };
    }

    // 5. BOTTOM under column labels row
    for (let c = 1; c <= COLS; c++) {
      ws.getCell(headerRowIndex, c).border = {
        ...ws.getCell(headerRowIndex, c).border,
        bottom: { style: "thin" },
      };
    }

    // 6. Column dividers — after every col except last
    for (let r = blockStart; r <= blockEnd; r++) {
      for (let c = 1; c < COLS; c++) {
        ws.getCell(r, c).border = {
          ...ws.getCell(r, c).border,
          right: { style: "thin" },
        };
      }
    }

    // 7. Bottom under group header spans (ageing + opening/period/closing balance labels)
    for (let c = hasAgeing ? 3 : openingPendingCol; c <= COLS; c++) {
      ws.getCell(groupHeaderRowIndex, c).border = {
        ...ws.getCell(groupHeaderRowIndex, c).border,
        bottom: { style: "thin" },
      };
    }

    // 8. TOP on total row
    for (let c = 1; c <= COLS; c++) {
      ws.getCell(totalRow.number, c).border = {
        ...ws.getCell(totalRow.number, c).border,
        top: { style: "thin" },
      };
    }

    // 9. Group separators
    groupSeparatorRows.forEach((separatorRow) => {
      for (let c = 1; c <= COLS; c++) {
        ws.getCell(separatorRow, c).border = {
          ...ws.getCell(separatorRow, c).border,
          bottom: { style: "thin" },
        };
      }
    });

    return wb;
  },

  async buildExcelForProfitLoss(input: ReportCommonRequestInput) {
    logger.info("entering::buildExcelForProfitLoss::service");
    const { expense, income, totals } = await this.getProfitLoss(input);

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Profit & Loss");

    ws.properties.defaultRowHeight = 18;

    ws.getColumn(1).width = 40;
    ws.getColumn(2).width = 18;
    ws.getColumn(3).width = 40;
    ws.getColumn(4).width = 18;

    const COLS = 4;
    let rowIndex = 1;

    const titleRowIndex = rowIndex;
    const headerRowIndex = rowIndex + 2;

    // TITLE
    ws.mergeCells(rowIndex, 1, rowIndex, COLS);
    const title = ws.getCell(rowIndex, 1);
    title.value = "Profit & Loss Account";
    title.font = { bold: true, size: 16 };
    title.alignment = { horizontal: "center" };
    rowIndex++;

    // DATE RANGE
    ws.mergeCells(rowIndex, 1, rowIndex, COLS);
    const date = ws.getCell(rowIndex, 1);
    date.value = `(${dayjs(input.fromDate).format("MMM D, YYYY")} – ${dayjs(
      input.toDate,
    ).format("MMM D, YYYY")})`;
    date.alignment = { horizontal: "center" };
    date.font = { size: 10 };
    rowIndex++;

    // COLUMN HEADERS
    ws.getCell(rowIndex, 1).value = "PARTICULARS";
    ws.getCell(rowIndex, 2).value = "AMOUNT";
    ws.getCell(rowIndex, 3).value = "PARTICULARS";
    ws.getCell(rowIndex, 4).value = "AMOUNT";
    for (let c = 1; c <= COLS; c++) {
      ws.getCell(rowIndex, c).font = { bold: true };
      ws.getCell(rowIndex, c).alignment = {
        horizontal: "center",
        wrapText: true,
      };
    }
    rowIndex++;

    const gross = totals.grossProfit ?? 0;
    const net = totals.netProfit ?? 0;

    const expenseNet = (dr: number, cr: number) => dr - cr;
    const incomeNet = (dr: number, cr: number) => cr - dr;

    type DisplayLine = {
      label: string;
      amount: number | string;
      bold: boolean;
      isSubtotal: boolean;
      isEmpty: boolean;
    };

    const leftLines: DisplayLine[] = [];
    const rightLines: DisplayLine[] = [];

    if (gross >= 0) {
      // ============================================================
      // PROFIT CASE
      // LEFT:  direct expenses → Gross Profit c/o → [subtotal] → indirect expenses → Net Profit
      // RIGHT: direct incomes  → [subtotal] → Gross Profit b/f → indirect incomes
      // ============================================================

      // LEFT — direct expenses
      expense
        .filter((n) => n.group?.affectsGrossProfit === true)
        .forEach((node) => {
          leftLines.push({
            label: node.group?.name ?? "",
            amount: expenseNet(node.amount?.dr ?? 0, node.amount?.cr ?? 0),
            bold: false,
            isSubtotal: false,
            isEmpty: false,
          });
          node.children?.forEach((child) => {
            leftLines.push({
              label: `  ${child.group?.name ?? ""}`,
              amount: expenseNet(child.amount?.dr ?? 0, child.amount?.cr ?? 0),
              bold: false,
              isSubtotal: false,
              isEmpty: false,
            });
          });
        });

      // Gross Profit c/o BEFORE subtotal on left
      if (gross > 0) {
        leftLines.push({
          label: "Gross Profit c/o",
          amount: gross,
          bold: true,
          isSubtotal: false,
          isEmpty: false,
        });
      }

      const leftBeforeSubtotal = leftLines.length;

      // RIGHT — direct incomes
      income
        .filter((n) => n.group?.affectsGrossProfit === true)
        .forEach((node) => {
          rightLines.push({
            label: node.group?.name ?? "",
            amount: incomeNet(node.amount?.dr ?? 0, node.amount?.cr ?? 0),
            bold: false,
            isSubtotal: false,
            isEmpty: false,
          });
          node.children?.forEach((child) => {
            rightLines.push({
              label: `  ${child.group?.name ?? ""}`,
              amount: incomeNet(child.amount?.dr ?? 0, child.amount?.cr ?? 0),
              bold: false,
              isSubtotal: false,
              isEmpty: false,
            });
          });
        });

      const rightBeforeSubtotal = rightLines.length;

      // Pad to same row
      const maxBefore = Math.max(leftBeforeSubtotal, rightBeforeSubtotal);
      for (let i = leftBeforeSubtotal; i < maxBefore; i++) {
        leftLines.push({
          label: "",
          amount: "",
          bold: false,
          isSubtotal: false,
          isEmpty: true,
        });
      }
      for (let i = rightBeforeSubtotal; i < maxBefore; i++) {
        rightLines.push({
          label: "",
          amount: "",
          bold: false,
          isSubtotal: false,
          isEmpty: true,
        });
      }

      // Subtotal row
      const leftSubtotal = (totals.directExpense ?? 0) + gross;
      const rightSubtotal = totals.directIncome ?? 0;
      leftLines.push({
        label: "",
        amount: leftSubtotal || "",
        bold: true,
        isSubtotal: true,
        isEmpty: false,
      });
      rightLines.push({
        label: "",
        amount: rightSubtotal || "",
        bold: true,
        isSubtotal: true,
        isEmpty: false,
      });

      // LEFT post-subtotal — indirect expenses → Net Profit
      expense
        .filter((n) => n.group?.affectsGrossProfit === false)
        .forEach((node) => {
          leftLines.push({
            label: node.group?.name ?? "",
            amount: expenseNet(node.amount?.dr ?? 0, node.amount?.cr ?? 0),
            bold: false,
            isSubtotal: false,
            isEmpty: false,
          });
          node.children?.forEach((child) => {
            leftLines.push({
              label: `  ${child.group?.name ?? ""}`,
              amount: expenseNet(child.amount?.dr ?? 0, child.amount?.cr ?? 0),
              bold: false,
              isSubtotal: false,
              isEmpty: false,
            });
          });
        });
      if (net > 0) {
        leftLines.push({
          label: "Net Profit",
          amount: net,
          bold: true,
          isSubtotal: false,
          isEmpty: false,
        });
      }

      // RIGHT post-subtotal — Gross Profit b/f → indirect incomes
      if (gross > 0) {
        rightLines.push({
          label: "Gross Profit b/f",
          amount: gross,
          bold: true,
          isSubtotal: false,
          isEmpty: false,
        });
      }
      income
        .filter((n) => n.group?.affectsGrossProfit === false)
        .forEach((node) => {
          rightLines.push({
            label: node.group?.name ?? "",
            amount: incomeNet(node.amount?.dr ?? 0, node.amount?.cr ?? 0),
            bold: false,
            isSubtotal: false,
            isEmpty: false,
          });
          node.children?.forEach((child) => {
            rightLines.push({
              label: `  ${child.group?.name ?? ""}`,
              amount: incomeNet(child.amount?.dr ?? 0, child.amount?.cr ?? 0),
              bold: false,
              isSubtotal: false,
              isEmpty: false,
            });
          });
        });
    } else {
      // ============================================================
      // LOSS CASE
      // LEFT:  direct expenses → [subtotal] → Gross Loss b/f → indirect expenses
      // RIGHT: direct incomes  → Gross Loss c/o → [subtotal] → indirect incomes → Net Loss
      // ============================================================

      const absGross = Math.abs(gross);

      // LEFT — direct expenses
      expense
        .filter((n) => n.group?.affectsGrossProfit === true)
        .forEach((node) => {
          leftLines.push({
            label: node.group?.name ?? "",
            amount: expenseNet(node.amount?.dr ?? 0, node.amount?.cr ?? 0),
            bold: false,
            isSubtotal: false,
            isEmpty: false,
          });
          node.children?.forEach((child) => {
            leftLines.push({
              label: `  ${child.group?.name ?? ""}`,
              amount: expenseNet(child.amount?.dr ?? 0, child.amount?.cr ?? 0),
              bold: false,
              isSubtotal: false,
              isEmpty: false,
            });
          });
        });

      const leftBeforeSubtotal = leftLines.length;

      // RIGHT — direct incomes → Gross Loss c/o BEFORE subtotal
      income
        .filter((n) => n.group?.affectsGrossProfit === true)
        .forEach((node) => {
          rightLines.push({
            label: node.group?.name ?? "",
            amount: incomeNet(node.amount?.dr ?? 0, node.amount?.cr ?? 0),
            bold: false,
            isSubtotal: false,
            isEmpty: false,
          });
          node.children?.forEach((child) => {
            rightLines.push({
              label: `  ${child.group?.name ?? ""}`,
              amount: incomeNet(child.amount?.dr ?? 0, child.amount?.cr ?? 0),
              bold: false,
              isSubtotal: false,
              isEmpty: false,
            });
          });
        });
      rightLines.push({
        label: "Gross Loss c/o",
        amount: absGross,
        bold: true,
        isSubtotal: false,
        isEmpty: false,
      });

      const rightBeforeSubtotal = rightLines.length;

      // Pad to same row
      const maxBefore = Math.max(leftBeforeSubtotal, rightBeforeSubtotal);
      for (let i = leftBeforeSubtotal; i < maxBefore; i++) {
        leftLines.push({
          label: "",
          amount: "",
          bold: false,
          isSubtotal: false,
          isEmpty: true,
        });
      }
      for (let i = rightBeforeSubtotal; i < maxBefore; i++) {
        rightLines.push({
          label: "",
          amount: "",
          bold: false,
          isSubtotal: false,
          isEmpty: true,
        });
      }

      // Subtotal row
      const leftSubtotal = totals.directExpense ?? 0;
      const rightSubtotal = (totals.directIncome ?? 0) + absGross;
      leftLines.push({
        label: "",
        amount: leftSubtotal || "",
        bold: true,
        isSubtotal: true,
        isEmpty: false,
      });
      rightLines.push({
        label: "",
        amount: rightSubtotal || "",
        bold: true,
        isSubtotal: true,
        isEmpty: false,
      });

      // LEFT post-subtotal — Gross Loss b/f → indirect expenses
      leftLines.push({
        label: "Gross Loss b/f",
        amount: absGross,
        bold: true,
        isSubtotal: false,
        isEmpty: false,
      });
      expense
        .filter((n) => n.group?.affectsGrossProfit === false)
        .forEach((node) => {
          leftLines.push({
            label: node.group?.name ?? "",
            amount: expenseNet(node.amount?.dr ?? 0, node.amount?.cr ?? 0),
            bold: false,
            isSubtotal: false,
            isEmpty: false,
          });
          node.children?.forEach((child) => {
            leftLines.push({
              label: `  ${child.group?.name ?? ""}`,
              amount: expenseNet(child.amount?.dr ?? 0, child.amount?.cr ?? 0),
              bold: false,
              isSubtotal: false,
              isEmpty: false,
            });
          });
        });

      // RIGHT post-subtotal — indirect incomes → Net Loss
      income
        .filter((n) => n.group?.affectsGrossProfit === false)
        .forEach((node) => {
          rightLines.push({
            label: node.group?.name ?? "",
            amount: incomeNet(node.amount?.dr ?? 0, node.amount?.cr ?? 0),
            bold: false,
            isSubtotal: false,
            isEmpty: false,
          });
          node.children?.forEach((child) => {
            rightLines.push({
              label: `  ${child.group?.name ?? ""}`,
              amount: incomeNet(child.amount?.dr ?? 0, child.amount?.cr ?? 0),
              bold: false,
              isSubtotal: false,
              isEmpty: false,
            });
          });
        });
      if (net < 0) {
        rightLines.push({
          label: "Net Loss",
          amount: Math.abs(net),
          bold: true,
          isSubtotal: false,
          isEmpty: false,
        });
      }
    }

    // ============================================================
    // WRITE ROWS
    // ============================================================
    const subtotalRows: number[] = [];
    const maxRows = Math.max(leftLines.length, rightLines.length);

    for (let i = 0; i < maxRows; i++) {
      const left = leftLines[i];
      const right = rightLines[i];

      if (left?.isSubtotal || right?.isSubtotal) {
        subtotalRows.push(rowIndex);
      }

      if (left) {
        ws.getCell(rowIndex, 1).value =
          left.isSubtotal || left.isEmpty ? "" : left.label;
        ws.getCell(rowIndex, 1).font = { bold: left.bold };
        ws.getCell(rowIndex, 1).alignment = {
          wrapText: true,
          vertical: "middle",
        };
        ws.getCell(rowIndex, 2).value = left.isEmpty ? "" : left.amount;
        ws.getCell(rowIndex, 2).font = { bold: left.bold };
        ws.getCell(rowIndex, 2).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
      }

      if (right) {
        ws.getCell(rowIndex, 3).value =
          right.isSubtotal || right.isEmpty ? "" : right.label;
        ws.getCell(rowIndex, 3).font = { bold: right.bold };
        ws.getCell(rowIndex, 3).alignment = {
          wrapText: true,
          vertical: "middle",
        };
        ws.getCell(rowIndex, 4).value = right.isEmpty ? "" : right.amount;
        ws.getCell(rowIndex, 4).font = { bold: right.bold };
        ws.getCell(rowIndex, 4).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
      }

      rowIndex++;
    }

    // SPACER
    ws.addRow([]);
    rowIndex++;

    // TOTAL ROW
    let leftTotal = 0;
    let rightTotal = 0;

    if (gross > 0) {
      rightTotal += gross;
    } else {
      leftTotal += Math.abs(gross);
    }

    leftTotal += totals.indirectExpense ?? 0;
    rightTotal += totals.indirectIncome ?? 0;

    if (net > 0) {
      leftTotal += net;
    } else {
      rightTotal += Math.abs(net);
    }
    const totalRowIndex = rowIndex;
    ws.getCell(rowIndex, 1).value = "Total";
    ws.getCell(rowIndex, 2).value = leftTotal || "";
    ws.getCell(rowIndex, 3).value = "Total";
    ws.getCell(rowIndex, 4).value = rightTotal || "";
    for (let c = 1; c <= COLS; c++) {
      ws.getCell(rowIndex, c).font = { bold: true };
      ws.getCell(rowIndex, c).alignment = {
        horizontal: c % 2 === 0 ? "right" : "left",
        vertical: "middle",
      };
    }
    rowIndex++;

    const dataEndRow = totalRowIndex;

    // ============================================================
    // BORDERS
    // ============================================================

    const blockStart = headerRowIndex;
    const blockEnd = dataEndRow;

    for (let r = titleRowIndex; r <= blockEnd; r++) {
      ws.getCell(r, 1).border = {
        ...ws.getCell(r, 1).border,
        left: { style: "thin" },
      };
      ws.getCell(r, COLS).border = {
        ...ws.getCell(r, COLS).border,
        right: { style: "thin" },
      };
    }

    for (let c = 1; c <= COLS; c++) {
      ws.getCell(titleRowIndex, c).border = {
        ...ws.getCell(titleRowIndex, c).border,
        top: { style: "thin" },
      };
    }
    for (let c = 1; c <= COLS; c++) {
      ws.getCell(blockStart, c).border = {
        ...ws.getCell(blockStart, c).border,
        top: { style: "thin" },
      };
    }
    for (let c = 1; c <= COLS; c++) {
      ws.getCell(blockEnd, c).border = {
        ...ws.getCell(blockEnd, c).border,
        bottom: { style: "thin" },
      };
    }
    for (let c = 1; c <= COLS; c++) {
      ws.getCell(headerRowIndex, c).border = {
        ...ws.getCell(headerRowIndex, c).border,
        bottom: { style: "thin" },
      };
    }

    for (let r = blockStart; r <= blockEnd; r++) {
      for (const c of [1, 2, 3]) {
        ws.getCell(r, c).border = {
          ...ws.getCell(r, c).border,
          right: { style: "thin" },
        };
      }
    }

    for (let c = 1; c <= COLS; c++) {
      ws.getCell(totalRowIndex, c).border = {
        ...ws.getCell(totalRowIndex, c).border,
        top: { style: "thin" },
      };
    }

    subtotalRows.forEach((r) => {
      ws.getCell(r, 2).border = {
        ...ws.getCell(r, 2).border,
        top: { style: "thin" },
      };
      ws.getCell(r, 4).border = {
        ...ws.getCell(r, 4).border,
        top: { style: "thin" },
      };
    });

    return wb;
  },

  async buildExcelForCashFLow(input: CashFlowRequestInput) {
    logger.info("entering::buildExcelForCashFLow::service");
    const data: CashFlowResponse = await this.getCashFlow(input);

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Cash Flow");
    ws.properties.defaultRowHeight = 18;

    const dateRange = `(${dayjs(input.fromDate).format(
      "MMM D, YYYY",
    )} – ${dayjs(input.toDate).format("MMM D, YYYY")})`;

    // ============================================================
    // MONTHLY VIEW
    // ============================================================
    if (data.view === "MONTHLY") {
      const { months, totalInflow, totalOutflow, netFlow } = data;

      ws.getColumn(1).width = 45;
      ws.getColumn(2).width = 20;
      ws.getColumn(3).width = 20;
      ws.getColumn(4).width = 20;

      const COLS = 4;
      let rowIndex = 1;
      const titleRowIndex = rowIndex;
      const groupHeaderRowIndex = rowIndex + 2;
      const headerRowIndex = rowIndex + 3;

      // Title
      ws.mergeCells(rowIndex, 1, rowIndex, COLS);
      ws.getCell(rowIndex, 1).value = "Cash Flow";
      ws.getCell(rowIndex, 1).font = { bold: true, size: 16 };
      ws.getCell(rowIndex, 1).alignment = { horizontal: "center" };
      rowIndex++;

      // Date
      ws.mergeCells(rowIndex, 1, rowIndex, COLS);
      ws.getCell(rowIndex, 1).value = dateRange;
      ws.getCell(rowIndex, 1).alignment = { horizontal: "center" };
      ws.getCell(rowIndex, 1).font = { size: 10 };
      rowIndex++;

      // Group header
      ws.getCell(rowIndex, 1).value = "";
      ws.mergeCells(rowIndex, 2, rowIndex, 4);
      ws.getCell(rowIndex, 2).value = "Cash Movement";
      ws.getCell(rowIndex, 2).font = { bold: true };
      ws.getCell(rowIndex, 2).alignment = { horizontal: "center" };
      rowIndex++;

      // Column labels
      ws.getCell(rowIndex, 1).value = "PARTICULARS";
      ws.getCell(rowIndex, 2).value = "INFLOW";
      ws.getCell(rowIndex, 3).value = "OUTFLOW";
      ws.getCell(rowIndex, 4).value = "NET FLOW";
      for (let c = 1; c <= COLS; c++) {
        ws.getCell(rowIndex, c).font = { bold: true };
        ws.getCell(rowIndex, c).alignment = {
          horizontal: "center",
          wrapText: true,
        };
      }
      rowIndex++;

      // Data rows
      months.forEach((m: CashFlowMonthRow) => {
        const row = ws.addRow([
          m.name,
          m.amount.inflow || "",
          m.amount.outflow || "",
          m.amount.net || "",
        ]);
        row.getCell(1).alignment = { wrapText: true, vertical: "middle" };
        for (let c = 2; c <= COLS; c++) {
          row.getCell(c).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
        }
        rowIndex++;
      });

      // Spacer
      ws.addRow([]);
      rowIndex++;

      // Total row
      const totalRow = ws.addRow([
        "Grand Total",
        totalInflow || "",
        totalOutflow || "",
        netFlow || "",
      ]);
      totalRow.font = { bold: true };
      totalRow.getCell(1).alignment = { vertical: "middle" };
      for (let c = 2; c <= COLS; c++) {
        totalRow.getCell(c).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
      }
      rowIndex++;

      const dataEndRow = totalRow.number;
      const blockStart = groupHeaderRowIndex;
      const blockEnd = dataEndRow;

      for (let r = titleRowIndex; r <= blockEnd; r++) {
        ws.getCell(r, 1).border = {
          ...ws.getCell(r, 1).border,
          left: { style: "thin" },
        };
        ws.getCell(r, COLS).border = {
          ...ws.getCell(r, COLS).border,
          right: { style: "thin" },
        };
      }
      for (let c = 1; c <= COLS; c++) {
        ws.getCell(titleRowIndex, c).border = {
          ...ws.getCell(titleRowIndex, c).border,
          top: { style: "thin" },
        };
        ws.getCell(blockStart, c).border = {
          ...ws.getCell(blockStart, c).border,
          top: { style: "thin" },
        };
        ws.getCell(blockEnd, c).border = {
          ...ws.getCell(blockEnd, c).border,
          bottom: { style: "thin" },
        };
        ws.getCell(headerRowIndex, c).border = {
          ...ws.getCell(headerRowIndex, c).border,
          bottom: { style: "thin" },
        };
        ws.getCell(totalRow.number, c).border = {
          ...ws.getCell(totalRow.number, c).border,
          top: { style: "thin" },
        };
      }
      for (let r = blockStart; r <= blockEnd; r++) {
        for (const c of [1, 2, 3]) {
          ws.getCell(r, c).border = {
            ...ws.getCell(r, c).border,
            right: { style: "thin" },
          };
        }
      }
      for (let c = 2; c <= COLS; c++) {
        ws.getCell(groupHeaderRowIndex, c).border = {
          ...ws.getCell(groupHeaderRowIndex, c).border,
          bottom: { style: "thin" },
        };
      }
    }

    // ============================================================
    // MONTH_DETAIL VIEW
    // ============================================================
    else if (data.view === "MONTH_DETAIL") {
      const { inflows, outflows, totals } = data;

      ws.getColumn(1).width = 40;
      ws.getColumn(2).width = 18;
      ws.getColumn(3).width = 40;
      ws.getColumn(4).width = 18;

      const COLS = 4;
      let rowIndex = 1;
      const titleRowIndex = rowIndex;
      const headerRowIndex = rowIndex + 2;

      // Title
      ws.mergeCells(rowIndex, 1, rowIndex, COLS);
      ws.getCell(rowIndex, 1).value = "Cash Flow";
      ws.getCell(rowIndex, 1).font = { bold: true, size: 16 };
      ws.getCell(rowIndex, 1).alignment = { horizontal: "center" };
      rowIndex++;

      // Date
      ws.mergeCells(rowIndex, 1, rowIndex, COLS);
      ws.getCell(rowIndex, 1).value = dateRange;
      ws.getCell(rowIndex, 1).alignment = { horizontal: "center" };
      ws.getCell(rowIndex, 1).font = { size: 10 };
      rowIndex++;

      // Column headers
      ws.getCell(rowIndex, 1).value = "INFLOW";
      ws.getCell(rowIndex, 2).value = "AMOUNT";
      ws.getCell(rowIndex, 3).value = "OUTFLOW";
      ws.getCell(rowIndex, 4).value = "AMOUNT";
      for (let c = 1; c <= COLS; c++) {
        ws.getCell(rowIndex, c).font = { bold: true };
        ws.getCell(rowIndex, c).alignment = {
          horizontal: "center",
          wrapText: true,
        };
      }
      rowIndex++;

      type Line = {
        label: string;
        amount: number | string;
        bold: boolean;
        indent: number;
      };
      const leftLines: Line[] = [];
      const rightLines: Line[] = [];

      const addGroupLines = (
        nodes: CashFlowNode[],
        lines: Line[],
        type: string,
      ) => {
        nodes.forEach((node) => {
          lines.push({
            label: node.group?.value ?? "",
            amount:
              type === "inflows"
                ? node.amount.inflow || ""
                : node.amount.outflow || "",
            bold: false,
            indent: 0,
          });
        });
      };

      addGroupLines(inflows, leftLines, "inflows");
      addGroupLines(outflows, rightLines, "outflows");

      const maxRows = Math.max(leftLines.length, rightLines.length);
      for (let i = 0; i < maxRows; i++) {
        const left = leftLines[i];
        const right = rightLines[i];

        if (left) {
          ws.getCell(rowIndex, 1).value = left.label;
          ws.getCell(rowIndex, 1).font = { bold: left.bold };
          ws.getCell(rowIndex, 1).alignment = {
            wrapText: true,
            vertical: "middle",
          };
          ws.getCell(rowIndex, 2).value = left.amount;
          ws.getCell(rowIndex, 2).font = { bold: left.bold };
          ws.getCell(rowIndex, 2).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
        }
        if (right) {
          ws.getCell(rowIndex, 3).value = right.label;
          ws.getCell(rowIndex, 3).font = { bold: right.bold };
          ws.getCell(rowIndex, 3).alignment = {
            wrapText: true,
            vertical: "middle",
          };
          ws.getCell(rowIndex, 4).value = right.amount;
          ws.getCell(rowIndex, 4).font = { bold: right.bold };
          ws.getCell(rowIndex, 4).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
        }
        rowIndex++;
      }

      // Spacer
      ws.addRow([]);
      rowIndex++;

      // Total Inflow / Total Outflow row
      const totalInflowRow = rowIndex;
      ws.getCell(rowIndex, 1).value = "Total Inflow";
      ws.getCell(rowIndex, 2).value = totals.inflow || "";
      ws.getCell(rowIndex, 3).value = "Total Outflow";
      ws.getCell(rowIndex, 4).value = totals.outflow || "";
      for (let c = 1; c <= COLS; c++) {
        ws.getCell(rowIndex, c).font = { bold: true };
        ws.getCell(rowIndex, c).alignment = {
          horizontal: c % 2 === 0 ? "right" : "left",
          vertical: "middle",
        };
      }
      rowIndex++;

      // Net Flow row
      const netFlowRow = rowIndex;
      ws.getCell(rowIndex, 3).value = "Net Flow";
      ws.getCell(rowIndex, 4).value = totals.net || "";
      ws.getCell(rowIndex, 3).font = { bold: true };
      ws.getCell(rowIndex, 4).font = { bold: true };
      ws.getCell(rowIndex, 3).alignment = { vertical: "middle" };
      ws.getCell(rowIndex, 4).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
      rowIndex++;

      const dataEndRow = netFlowRow;
      const blockStart = headerRowIndex;
      const blockEnd = dataEndRow;

      for (let r = titleRowIndex; r <= blockEnd; r++) {
        ws.getCell(r, 1).border = {
          ...ws.getCell(r, 1).border,
          left: { style: "thin" },
        };
        ws.getCell(r, COLS).border = {
          ...ws.getCell(r, COLS).border,
          right: { style: "thin" },
        };
      }
      for (let c = 1; c <= COLS; c++) {
        ws.getCell(titleRowIndex, c).border = {
          ...ws.getCell(titleRowIndex, c).border,
          top: { style: "thin" },
        };
        ws.getCell(blockStart, c).border = {
          ...ws.getCell(blockStart, c).border,
          top: { style: "thin" },
        };
        ws.getCell(blockEnd, c).border = {
          ...ws.getCell(blockEnd, c).border,
          bottom: { style: "thin" },
        };
        ws.getCell(headerRowIndex, c).border = {
          ...ws.getCell(headerRowIndex, c).border,
          bottom: { style: "thin" },
        };
      }
      for (let r = blockStart; r <= blockEnd; r++) {
        for (const c of [1, 2, 3]) {
          ws.getCell(r, c).border = {
            ...ws.getCell(r, c).border,
            right: { style: "thin" },
          };
        }
      }
      for (let c = 1; c <= COLS; c++) {
        ws.getCell(totalInflowRow, c).border = {
          ...ws.getCell(totalInflowRow, c).border,
          top: { style: "thin" },
        };
      }
    }

    // ============================================================
    // GROUP_DETAIL VIEW
    // ============================================================
    else if (data.view === "GROUP_DETAIL") {
      const { groupTree, totals } = data;

      ws.getColumn(1).width = 45;
      ws.getColumn(2).width = 20;
      ws.getColumn(3).width = 20;
      ws.getColumn(4).width = 20;

      const COLS = 4;
      let rowIndex = 1;
      const titleRowIndex = rowIndex;
      const groupHeaderRowIndex = rowIndex + 2;
      const headerRowIndex = rowIndex + 3;

      // Title
      ws.mergeCells(rowIndex, 1, rowIndex, COLS);
      ws.getCell(rowIndex, 1).value = `Cash Flow Group Detail for ${
        groupTree?.group?.value ?? ""
      }`;
      ws.getCell(rowIndex, 1).font = { bold: true, size: 16 };
      ws.getCell(rowIndex, 1).alignment = { horizontal: "center" };
      rowIndex++;

      // Date
      ws.mergeCells(rowIndex, 1, rowIndex, COLS);
      ws.getCell(rowIndex, 1).value = dateRange;
      ws.getCell(rowIndex, 1).alignment = { horizontal: "center" };
      ws.getCell(rowIndex, 1).font = { size: 10 };
      rowIndex++;

      // Group header
      ws.getCell(rowIndex, 1).value = "";
      ws.mergeCells(rowIndex, 2, rowIndex, 4);
      ws.getCell(rowIndex, 2).value = "Cash Movement";
      ws.getCell(rowIndex, 2).font = { bold: true };
      ws.getCell(rowIndex, 2).alignment = { horizontal: "center" };
      rowIndex++;

      // Column labels
      ws.getCell(rowIndex, 1).value = "PARTICULARS";
      ws.getCell(rowIndex, 2).value = "INFLOW";
      ws.getCell(rowIndex, 3).value = "OUTFLOW";
      ws.getCell(rowIndex, 4).value = "NET FLOW";
      for (let c = 1; c <= COLS; c++) {
        ws.getCell(rowIndex, c).font = { bold: true };
        ws.getCell(rowIndex, c).alignment = {
          horizontal: "center",
          wrapText: true,
        };
      }
      rowIndex++;

      // Recursive renderer — typed properly
      const renderGroupNode = (
        node: CashFlowGroupRecursiveRow,
        indent: number,
      ) => {
        const label = `${"  ".repeat(indent)}${node.group?.value ?? ""}`;
        const row = ws.addRow([
          label,
          node.amount.inflow || "",
          node.amount.outflow || "",
          node.amount.net || "",
        ]);
        row.getCell(1).font = { bold: indent === 0 };
        row.getCell(1).alignment = { wrapText: true, vertical: "middle" };
        for (let c = 2; c <= COLS; c++) {
          row.getCell(c).font = { bold: indent === 0 };
          row.getCell(c).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
        }
        rowIndex++;

        // Render child groups recursively
        node.children.forEach((child) => renderGroupNode(child, indent + 1));

        // Render ledgers
        node.ledgers.forEach((ledger: CashFlowLedgerRow) => {
          const ledgerLabel = `${"  ".repeat(indent + 1)}${
            ledger.ledger?.value ?? ""
          }`;
          const ledgerRow = ws.addRow([
            ledgerLabel,
            ledger.amount.inflow || "",
            ledger.amount.outflow || "",
            ledger.amount.net || "",
          ]);
          ledgerRow.getCell(1).font = { italic: true };
          ledgerRow.getCell(1).alignment = {
            wrapText: true,
            vertical: "middle",
          };
          for (let c = 2; c <= COLS; c++) {
            ledgerRow.getCell(c).alignment = {
              horizontal: "right",
              vertical: "middle",
            };
          }
          rowIndex++;
        });
      };

      // Render children of root (skip root group itself per design)
      groupTree?.children.forEach((child) => renderGroupNode(child, 0));

      // Spacer
      ws.addRow([]);
      rowIndex++;

      // Total row
      const totalRow = ws.addRow([
        "Grand Total",
        totals.inflow || "",
        totals.outflow || "",
        totals.net || "",
      ]);
      totalRow.font = { bold: true };
      totalRow.getCell(1).alignment = { vertical: "middle" };
      for (let c = 2; c <= COLS; c++) {
        totalRow.getCell(c).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
      }
      rowIndex++;

      const dataEndRow = totalRow.number;
      const blockStart = groupHeaderRowIndex;
      const blockEnd = dataEndRow;

      for (let r = titleRowIndex; r <= blockEnd; r++) {
        ws.getCell(r, 1).border = {
          ...ws.getCell(r, 1).border,
          left: { style: "thin" },
        };
        ws.getCell(r, COLS).border = {
          ...ws.getCell(r, COLS).border,
          right: { style: "thin" },
        };
      }
      for (let c = 1; c <= COLS; c++) {
        ws.getCell(titleRowIndex, c).border = {
          ...ws.getCell(titleRowIndex, c).border,
          top: { style: "thin" },
        };
        ws.getCell(blockStart, c).border = {
          ...ws.getCell(blockStart, c).border,
          top: { style: "thin" },
        };
        ws.getCell(blockEnd, c).border = {
          ...ws.getCell(blockEnd, c).border,
          bottom: { style: "thin" },
        };
        ws.getCell(headerRowIndex, c).border = {
          ...ws.getCell(headerRowIndex, c).border,
          bottom: { style: "thin" },
        };
        ws.getCell(totalRow.number, c).border = {
          ...ws.getCell(totalRow.number, c).border,
          top: { style: "thin" },
        };
      }
      for (let r = blockStart; r <= blockEnd; r++) {
        for (const c of [1, 2, 3]) {
          ws.getCell(r, c).border = {
            ...ws.getCell(r, c).border,
            right: { style: "thin" },
          };
        }
      }
      for (let c = 2; c <= COLS; c++) {
        ws.getCell(groupHeaderRowIndex, c).border = {
          ...ws.getCell(groupHeaderRowIndex, c).border,
          bottom: { style: "thin" },
        };
      }
    }

    return wb;
  },

  async buildExcelForFundFLow(input: FundFlowRequestInput) {
    logger.info("entering::buildExcelForFundFLow::service");
    const data: FundFlowResponse = await this.getFundFlow(input);

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Fund Flow");
    ws.properties.defaultRowHeight = 18;

    const dateRange = `(${dayjs(input.fromDate).format(
      "MMM D, YYYY",
    )} – ${dayjs(input.toDate).format("MMM D, YYYY")})`;

    // ============================================================
    // MONTHLY VIEW
    // ============================================================
    if (data.view === "MONTHLY") {
      const { months, totals } = data;

      ws.getColumn(1).width = 45;
      ws.getColumn(2).width = 20;
      ws.getColumn(3).width = 20;
      ws.getColumn(4).width = 20;

      const COLS = 4;
      let rowIndex = 1;
      const titleRowIndex = rowIndex;
      const groupHeaderRowIndex = rowIndex + 2;
      const headerRowIndex = rowIndex + 3;

      // Title
      ws.mergeCells(rowIndex, 1, rowIndex, COLS);
      ws.getCell(rowIndex, 1).value = "Fund Flow";
      ws.getCell(rowIndex, 1).font = { bold: true, size: 16 };
      ws.getCell(rowIndex, 1).alignment = { horizontal: "center" };
      rowIndex++;

      // Date
      ws.mergeCells(rowIndex, 1, rowIndex, COLS);
      ws.getCell(rowIndex, 1).value = dateRange;
      ws.getCell(rowIndex, 1).alignment = { horizontal: "center" };
      ws.getCell(rowIndex, 1).font = { size: 10 };
      rowIndex++;

      // Group header
      ws.getCell(rowIndex, 1).value = "";
      ws.mergeCells(rowIndex, 2, rowIndex, 3);
      ws.getCell(rowIndex, 2).value = "Working Capital";
      ws.getCell(rowIndex, 2).font = { bold: true };
      ws.getCell(rowIndex, 2).alignment = { horizontal: "center" };
      rowIndex++;

      // Column labels
      ws.getCell(rowIndex, 1).value = "PARTICULARS";
      ws.getCell(rowIndex, 2).value = "OPENING";
      ws.getCell(rowIndex, 3).value = "CLOSING";
      ws.getCell(rowIndex, 4).value = "FUND FLOW";
      for (let c = 1; c <= COLS; c++) {
        ws.getCell(rowIndex, c).font = { bold: true };
        ws.getCell(rowIndex, c).alignment = {
          horizontal: "center",
          wrapText: true,
        };
      }
      rowIndex++;

      // Data rows
      months.forEach((m: FundFlowMonthlyRow) => {
        const row = ws.addRow([
          m.name,
          m.openingWorkingCapital || "",
          m.closingWorkingCapital || "",
          m.fundFlow || "",
        ]);
        row.getCell(1).alignment = { wrapText: true, vertical: "middle" };
        for (let c = 2; c <= COLS; c++) {
          row.getCell(c).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
        }
        rowIndex++;
      });

      // Spacer
      ws.addRow([]);
      rowIndex++;

      // Total row
      const totalRow = ws.addRow([
        "Grand Total",
        totals.openingWorkingCapital || "",
        totals.closingWorkingCapital || "",
        totals.fundFlow || "",
      ]);
      totalRow.font = { bold: true };
      totalRow.getCell(1).alignment = { vertical: "middle" };
      for (let c = 2; c <= COLS; c++) {
        totalRow.getCell(c).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
      }
      rowIndex++;

      const dataEndRow = totalRow.number;
      const blockStart = groupHeaderRowIndex;
      const blockEnd = dataEndRow;

      for (let r = titleRowIndex; r <= blockEnd; r++) {
        ws.getCell(r, 1).border = {
          ...ws.getCell(r, 1).border,
          left: { style: "thin" },
        };
        ws.getCell(r, COLS).border = {
          ...ws.getCell(r, COLS).border,
          right: { style: "thin" },
        };
      }
      for (let c = 1; c <= COLS; c++) {
        ws.getCell(titleRowIndex, c).border = {
          ...ws.getCell(titleRowIndex, c).border,
          top: { style: "thin" },
        };
        ws.getCell(blockStart, c).border = {
          ...ws.getCell(blockStart, c).border,
          top: { style: "thin" },
        };
        ws.getCell(blockEnd, c).border = {
          ...ws.getCell(blockEnd, c).border,
          bottom: { style: "thin" },
        };
        ws.getCell(headerRowIndex, c).border = {
          ...ws.getCell(headerRowIndex, c).border,
          bottom: { style: "thin" },
        };
        ws.getCell(totalRow.number, c).border = {
          ...ws.getCell(totalRow.number, c).border,
          top: { style: "thin" },
        };
      }
      for (let r = blockStart; r <= blockEnd; r++) {
        for (const c of [1, 2, 3]) {
          ws.getCell(r, c).border = {
            ...ws.getCell(r, c).border,
            right: { style: "thin" },
          };
        }
      }
      for (let c = 2; c <= 3; c++) {
        ws.getCell(groupHeaderRowIndex, c).border = {
          ...ws.getCell(groupHeaderRowIndex, c).border,
          bottom: { style: "thin" },
        };
      }
    }

    // ============================================================
    // SUMMARY VIEW
    // ============================================================
    else if (data.view === "SUMMARY") {
      const { sources, applications, workingCapital, totals } = data;

      ws.getColumn(1).width = 40;
      ws.getColumn(2).width = 18;
      ws.getColumn(3).width = 40;
      ws.getColumn(4).width = 18;

      const COLS = 4;
      let rowIndex = 1;
      const titleRowIndex = rowIndex;
      const headerRowIndex = rowIndex + 2;

      // Title
      ws.mergeCells(rowIndex, 1, rowIndex, COLS);
      ws.getCell(rowIndex, 1).value = "Fund Flow Summary";
      ws.getCell(rowIndex, 1).font = { bold: true, size: 16 };
      ws.getCell(rowIndex, 1).alignment = { horizontal: "center" };
      rowIndex++;

      // Date
      ws.mergeCells(rowIndex, 1, rowIndex, COLS);
      ws.getCell(rowIndex, 1).value = dateRange;
      ws.getCell(rowIndex, 1).alignment = { horizontal: "center" };
      ws.getCell(rowIndex, 1).font = { size: 10 };
      rowIndex++;

      // Column headers
      ws.getCell(rowIndex, 1).value = "SOURCES";
      ws.getCell(rowIndex, 2).value = "AMOUNT";
      ws.getCell(rowIndex, 3).value = "APPLICATIONS";
      ws.getCell(rowIndex, 4).value = "AMOUNT";
      for (let c = 1; c <= COLS; c++) {
        ws.getCell(rowIndex, c).font = { bold: true };
        ws.getCell(rowIndex, c).alignment = {
          horizontal: "center",
          wrapText: true,
        };
      }
      rowIndex++;

      type Line = { label: string; amount: number | string; bold: boolean };
      const leftLines: Line[] = [];
      const rightLines: Line[] = [];

      sources.forEach((s: FundFlowSummaryRow) => {
        leftLines.push({
          label: s.group?.value ?? "",
          amount: s.amount || "",
          bold: s.type === "GROUP",
        });
      });

      applications.forEach((a: FundFlowSummaryRow) => {
        rightLines.push({
          label: a.group?.value ?? "",
          amount: a.amount || "",
          bold: a.type === "GROUP",
        });
      });

      const maxRows = Math.max(leftLines.length, rightLines.length);
      for (let i = 0; i < maxRows; i++) {
        const left = leftLines[i];
        const right = rightLines[i];

        if (left) {
          ws.getCell(rowIndex, 1).value = left.label;
          ws.getCell(rowIndex, 1).font = { bold: left.bold };
          ws.getCell(rowIndex, 1).alignment = {
            wrapText: true,
            vertical: "middle",
          };
          ws.getCell(rowIndex, 2).value = left.amount;
          ws.getCell(rowIndex, 2).font = { bold: left.bold };
          ws.getCell(rowIndex, 2).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
        }
        if (right) {
          ws.getCell(rowIndex, 3).value = right.label;
          ws.getCell(rowIndex, 3).font = { bold: right.bold };
          ws.getCell(rowIndex, 3).alignment = {
            wrapText: true,
            vertical: "middle",
          };
          ws.getCell(rowIndex, 4).value = right.amount;
          ws.getCell(rowIndex, 4).font = { bold: right.bold };
          ws.getCell(rowIndex, 4).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
        }
        rowIndex++;
      }

      // Spacer
      ws.addRow([]);
      rowIndex++;

      // Total row
      const totalSourceRow = rowIndex;
      ws.getCell(rowIndex, 1).value = "Total";
      ws.getCell(rowIndex, 2).value = totals.sources || "";
      ws.getCell(rowIndex, 3).value = "Total";
      ws.getCell(rowIndex, 4).value = totals.applications || "";
      for (let c = 1; c <= COLS; c++) {
        ws.getCell(rowIndex, c).font = { bold: true };
        ws.getCell(rowIndex, c).alignment = {
          horizontal: c % 2 === 0 ? "right" : "left",
          vertical: "middle",
        };
      }
      rowIndex++;

      const sourcesEndRow = rowIndex - 1;

      // ── Working Capital section ──
      rowIndex++; // blank gap

      const wcHeaderRow = rowIndex;

      ws.getCell(rowIndex, 1).value = "PARTICULARS";
      ws.getCell(rowIndex, 2).value = "OPENING BALANCE";
      ws.getCell(rowIndex, 3).value = "CLOSING BALANCE";
      ws.getCell(rowIndex, 4).value = "WKG CAP INCREASE";
      for (let c = 1; c <= COLS; c++) {
        ws.getCell(rowIndex, c).font = { bold: true };
        ws.getCell(rowIndex, c).alignment = {
          horizontal: "center",
          wrapText: true,
        };
      }
      rowIndex++;

      const fmtBal = (dr: number, cr: number): string => {
        if (dr > 0) return `${dr} Dr`;
        if (cr > 0) return `${cr} Cr`;
        return "";
      };

      workingCapital.groups.forEach(
        (g: { group: IdValue | null; opening: DrCrAmt; closing: DrCrAmt }) => {
          const increase =
            g.closing.dr - g.opening.dr - (g.closing.cr - g.opening.cr);
          const row = ws.addRow([
            g.group?.value ?? "",
            fmtBal(g.opening.dr, g.opening.cr),
            fmtBal(g.closing.dr, g.closing.cr),
            increase || "",
          ]);
          row.getCell(1).font = { bold: true };
          row.getCell(1).alignment = { wrapText: true, vertical: "middle" };
          for (let c = 2; c <= COLS; c++) {
            row.getCell(c).font = { bold: true };
            row.getCell(c).alignment = {
              horizontal: "right",
              vertical: "middle",
            };
          }
          rowIndex++;
        },
      );

      // Working Capital total row
      const wcTotalRow = rowIndex;
      ws.getCell(rowIndex, 1).value = "Working Capital";
      ws.getCell(rowIndex, 2).value = fmtBal(
        workingCapital.openingWorkingCapital.dr,
        workingCapital.openingWorkingCapital.cr,
      );
      ws.getCell(rowIndex, 3).value = fmtBal(
        workingCapital.closingWorkingCapital.dr,
        workingCapital.closingWorkingCapital.cr,
      );
      ws.getCell(rowIndex, 4).value = workingCapital.increase || "";
      for (let c = 1; c <= COLS; c++) {
        ws.getCell(rowIndex, c).font = { bold: true };
        ws.getCell(rowIndex, c).alignment = {
          horizontal: c === 1 ? "left" : "right",
          vertical: "middle",
        };
      }
      rowIndex++;

      const dataEndRow = rowIndex - 1;

      // ── Borders: sources block ──
      const srcBlockStart = headerRowIndex;
      const srcBlockEnd = sourcesEndRow;

      for (let r = titleRowIndex; r <= dataEndRow; r++) {
        ws.getCell(r, 1).border = {
          ...ws.getCell(r, 1).border,
          left: { style: "thin" },
        };
        ws.getCell(r, COLS).border = {
          ...ws.getCell(r, COLS).border,
          right: { style: "thin" },
        };
      }
      for (let c = 1; c <= COLS; c++) {
        ws.getCell(titleRowIndex, c).border = {
          ...ws.getCell(titleRowIndex, c).border,
          top: { style: "thin" },
        };
        ws.getCell(srcBlockStart, c).border = {
          ...ws.getCell(srcBlockStart, c).border,
          top: { style: "thin" },
        };
        ws.getCell(srcBlockEnd, c).border = {
          ...ws.getCell(srcBlockEnd, c).border,
          bottom: { style: "thin" },
        };
        ws.getCell(headerRowIndex, c).border = {
          ...ws.getCell(headerRowIndex, c).border,
          bottom: { style: "thin" },
        };
        ws.getCell(totalSourceRow, c).border = {
          ...ws.getCell(totalSourceRow, c).border,
          top: { style: "thin" },
        };
      }
      for (let r = srcBlockStart; r <= srcBlockEnd; r++) {
        for (const c of [1, 2, 3]) {
          ws.getCell(r, c).border = {
            ...ws.getCell(r, c).border,
            right: { style: "thin" },
          };
        }
      }

      // ── Borders: working capital block ──
      for (let c = 1; c <= COLS; c++) {
        ws.getCell(wcHeaderRow, c).border = {
          ...ws.getCell(wcHeaderRow, c).border,
          top: { style: "thin" },
          bottom: { style: "thin" },
        };
        ws.getCell(dataEndRow, c).border = {
          ...ws.getCell(dataEndRow, c).border,
          bottom: { style: "thin" },
        };
        ws.getCell(wcTotalRow, c).border = {
          ...ws.getCell(wcTotalRow, c).border,
          top: { style: "thin" },
        };
      }
      for (let r = wcHeaderRow; r <= dataEndRow; r++) {
        for (const c of [1, 2, 3]) {
          ws.getCell(r, c).border = {
            ...ws.getCell(r, c).border,
            right: { style: "thin" },
          };
        }
      }
    }

    // ============================================================
    // GROUP_DETAIL VIEW
    // ============================================================
    else if (data.view === "GROUP_DETAIL") {
      const { groupTree, totals } = data;

      ws.getColumn(1).width = 45;
      ws.getColumn(2).width = 20;
      ws.getColumn(3).width = 18;
      ws.getColumn(4).width = 18;
      ws.getColumn(5).width = 20;

      const COLS = 5;
      let rowIndex = 1;
      const titleRowIndex = rowIndex;
      const groupNameRowIndex = rowIndex + 2; // "CAPITAL"
      const subHeaderRowIndex = rowIndex + 3; // "TRANSACTIONS" span
      const headerRowIndex = rowIndex + 4; // column labels

      // Title
      ws.mergeCells(rowIndex, 1, rowIndex, COLS);
      ws.getCell(rowIndex, 1).value = `Fund Flow Group Detail for ${
        groupTree?.group?.value ?? ""
      }`;
      ws.getCell(rowIndex, 1).font = { bold: true, size: 16 };
      ws.getCell(rowIndex, 1).alignment = { horizontal: "center" };
      rowIndex++;

      // Date
      ws.mergeCells(rowIndex, 1, rowIndex, COLS);
      ws.getCell(rowIndex, 1).value = dateRange;
      ws.getCell(rowIndex, 1).alignment = { horizontal: "center" };
      ws.getCell(rowIndex, 1).font = { size: 10 };
      rowIndex++;

      // Group name row — spans cols 2-5 only (NOT col 1 — Particulars stays separate)
      ws.getCell(rowIndex, 1).value = "";
      ws.mergeCells(rowIndex, 2, rowIndex, COLS);
      ws.getCell(rowIndex, 2).value = (
        groupTree?.group?.value ?? ""
      ).toUpperCase();
      ws.getCell(rowIndex, 2).font = { bold: true };
      ws.getCell(rowIndex, 2).alignment = { horizontal: "center" };
      rowIndex++;

      // Sub-header row — blank | blank | TRANSACTIONS (span 3-4) | blank
      ws.getCell(rowIndex, 1).value = "";
      ws.getCell(rowIndex, 2).value = "";
      ws.mergeCells(rowIndex, 3, rowIndex, 4);
      ws.getCell(rowIndex, 3).value = "TRANSACTIONS";
      ws.getCell(rowIndex, 3).font = { bold: true };
      ws.getCell(rowIndex, 3).alignment = { horizontal: "center" };
      ws.getCell(rowIndex, 5).value = "";
      rowIndex++;

      // Column labels row
      ws.getCell(rowIndex, 1).value = "PARTICULARS";
      ws.getCell(rowIndex, 2).value = "OPENING BALANCE";
      ws.getCell(rowIndex, 3).value = "DEBIT";
      ws.getCell(rowIndex, 4).value = "CREDIT";
      ws.getCell(rowIndex, 5).value = "CLOSING BALANCE";
      for (let c = 1; c <= COLS; c++) {
        ws.getCell(rowIndex, c).font = { bold: true };
        ws.getCell(rowIndex, c).alignment = {
          horizontal: "center",
          wrapText: true,
        };
      }
      rowIndex++;

      const fmtBal = (dr: number, cr: number): string => {
        if (dr > 0) return `${dr} Dr`;
        if (cr > 0) return `${cr} Cr`;
        return "";
      };

      const renderLedger = (ledger: FundFlowLedgerRow, indent: number) => {
        const label = `${"  ".repeat(indent)}${ledger.ledger?.value ?? ""}`;
        const row = ws.addRow([
          label,
          fmtBal(ledger.amount.opening.dr, ledger.amount.opening.cr),
          ledger.amount.debit || "",
          ledger.amount.credit || "",
          fmtBal(ledger.amount.closing.dr, ledger.amount.closing.cr),
        ]);
        row.getCell(1).alignment = { wrapText: true, vertical: "middle" };
        for (let c = 2; c <= COLS; c++) {
          row.getCell(c).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
        }
        rowIndex++;
      };

      const renderGroupNode = (
        node: FundFlowGroupRecursiveRow,
        indent: number,
      ) => {
        const label = `${"  ".repeat(indent)}${node.group?.value ?? ""}`;
        const row = ws.addRow([
          label,
          fmtBal(node.amount.opening.dr, node.amount.opening.cr),
          node.amount.debit || "",
          node.amount.credit || "",
          fmtBal(node.amount.closing.dr, node.amount.closing.cr),
        ]);
        row.getCell(1).font = { bold: indent === 0 };
        row.getCell(1).alignment = { wrapText: true, vertical: "middle" };
        for (let c = 2; c <= COLS; c++) {
          row.getCell(c).font = { bold: indent === 0 };
          row.getCell(c).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
        }
        rowIndex++;

        node.children.forEach((child) => renderGroupNode(child, indent + 1));
        node.ledgers.forEach((ledger) => renderLedger(ledger, indent + 1));
      };

      // Render root ledgers first, then children
      groupTree?.ledgers.forEach((ledger) => renderLedger(ledger, 0));
      groupTree?.children.forEach((child) => renderGroupNode(child, 0));

      // Spacer
      ws.addRow([]);
      rowIndex++;

      // Total row
      const totalRow = ws.addRow([
        "Grand Total",
        fmtBal(totals.opening.dr, totals.opening.cr),
        totals.debit || "",
        totals.credit || "",
        fmtBal(totals.closing.dr, totals.closing.cr),
      ]);
      totalRow.font = { bold: true };
      totalRow.getCell(1).alignment = { vertical: "middle" };
      for (let c = 2; c <= COLS; c++) {
        totalRow.getCell(c).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
      }
      rowIndex++;

      const dataEndRow = totalRow.number;
      const blockStart = groupNameRowIndex;
      const blockEnd = dataEndRow;

      // 1. Unified LEFT and RIGHT
      for (let r = titleRowIndex; r <= blockEnd; r++) {
        ws.getCell(r, 1).border = {
          ...ws.getCell(r, 1).border,
          left: { style: "thin" },
        };
        ws.getCell(r, COLS).border = {
          ...ws.getCell(r, COLS).border,
          right: { style: "thin" },
        };
      }

      // 2. TOP on title
      for (let c = 1; c <= COLS; c++) {
        ws.getCell(titleRowIndex, c).border = {
          ...ws.getCell(titleRowIndex, c).border,
          top: { style: "thin" },
        };
      }

      // 3. TOP on group name row (separator between title and table)
      for (let c = 1; c <= COLS; c++) {
        ws.getCell(blockStart, c).border = {
          ...ws.getCell(blockStart, c).border,
          top: { style: "thin" },
        };
      }

      // 4. BOTTOM on last row
      for (let c = 1; c <= COLS; c++) {
        ws.getCell(blockEnd, c).border = {
          ...ws.getCell(blockEnd, c).border,
          bottom: { style: "thin" },
        };
      }

      // 5. BOTTOM under column labels row
      for (let c = 1; c <= COLS; c++) {
        ws.getCell(headerRowIndex, c).border = {
          ...ws.getCell(headerRowIndex, c).border,
          bottom: { style: "thin" },
        };
      }

      // 6. TOP on total row
      for (let c = 1; c <= COLS; c++) {
        ws.getCell(totalRow.number, c).border = {
          ...ws.getCell(totalRow.number, c).border,
          top: { style: "thin" },
        };
      }

      // 7. Column dividers — after cols 1, 2, 3, 4
      for (let r = blockStart; r <= blockEnd; r++) {
        for (const c of [1, 2, 3, 4]) {
          ws.getCell(r, c).border = {
            ...ws.getCell(r, c).border,
            right: { style: "thin" },
          };
        }
      }

      // 8. Bottom border under group name row (cols 2-5 — separates "CAPITAL" from sub-header)
      for (let c = 2; c <= COLS; c++) {
        ws.getCell(groupNameRowIndex, c).border = {
          ...ws.getCell(groupNameRowIndex, c).border,
          bottom: { style: "thin" },
        };
      }

      // 9. Bottom border under "TRANSACTIONS" span (cols 3-4)
      for (let c = 3; c <= 4; c++) {
        ws.getCell(subHeaderRowIndex, c).border = {
          ...ws.getCell(subHeaderRowIndex, c).border,
          bottom: { style: "thin" },
        };
      }
    }

    return wb;
  },

  async buildPdfForBalanceSheet(
    input: BalanceSheetRequestInput,
  ): Promise<Buffer> {
    logger.info("entering::buildPdfForBalanceSheet::service");

    const { periodStart, periodEnd, liabilities, assets, totals, profitLoss } =
      await this.getBalanceSheet(input);

    const doc = new PDFDocument({ margin: 30, size: "A4", layout: "portrait" });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    const FONT_NORMAL = "Helvetica";
    const FONT_BOLD = "Helvetica-Bold";
    const FONT_ITALIC = "Helvetica-Oblique";

    const PAGE_LEFT = 30;
    const PAGE_WIDTH = doc.page.width - 60;
    const PAGE_BOTTOM = doc.page.height - 30;

    const TOTAL_EXCEL_W = 88.5;
    const col1W = PAGE_WIDTH * (28 / TOTAL_EXCEL_W);
    const col2W = PAGE_WIDTH * (16 / TOTAL_EXCEL_W);
    const col4W = PAGE_WIDTH * (28 / TOTAL_EXCEL_W);
    const col5W = PAGE_WIDTH * (16 / TOTAL_EXCEL_W);

    const col1X = PAGE_LEFT;
    const col2X = col1X + col1W;
    const midX = col2X + col2W;
    const col4X = midX;
    const col5X = col4X + col4W;

    const TOTAL_W = col1W + col2W + col4W + col5W;

    const ROW_H = 20;
    const FONT_SIZE = 9;

    let y = 30;

    const drawHLine = (x: number, yw: number, w: number) => {
      doc
        .moveTo(x, yw)
        .lineTo(x + w, yw)
        .stroke("#000000");
    };

    const drawVLine = (xv: number, yt: number, h: number) => {
      doc
        .moveTo(xv, yt)
        .lineTo(xv, yt + h)
        .stroke("#000000");
    };

    const writeCell = (
      text: string,
      x: number,
      yt: number,
      w: number,
      h: number,
      opts: {
        bold?: boolean;
        italic?: boolean;
        align?: "left" | "right" | "center";
        color?: string;
        fontSize?: number;
      } = {},
    ) => {
      doc
        .font(opts.bold ? FONT_BOLD : opts.italic ? FONT_ITALIC : FONT_NORMAL)
        .fontSize(opts.fontSize ?? FONT_SIZE)
        .fillColor(opts.color ?? "#000000")
        .text(String(text ?? ""), x + 3, yt + 5, {
          width: w - 6,
          height: h - 5,
          align: opts.align ?? "left",
          ellipsis: true,
          lineBreak: false,
        });
    };

    const drawRowBorders = (rowY: number, h: number = ROW_H) => {
      drawVLine(col1X, rowY, h);
      drawVLine(col2X, rowY, h);
      drawVLine(col2X + col2W, rowY, h);
      drawVLine(col5X, rowY, h);
      drawVLine(col5X + col5W, rowY, h);
    };

    // ── Draw table header ──
    const drawHeaders = () => {
      doc.rect(PAGE_LEFT, y, TOTAL_W, ROW_H).stroke();
      drawVLine(col2X, y, ROW_H);
      drawVLine(midX, y, ROW_H);
      drawVLine(col5X, y, ROW_H);

      writeCell("LIABILITIES", col1X, y, col1W, ROW_H, {
        bold: true,
        align: "center",
      });
      writeCell("AMOUNT", col2X, y, col2W, ROW_H, {
        bold: true,
        align: "center",
      });
      writeCell("ASSETS", col4X, y, col4W, ROW_H, {
        bold: true,
        align: "center",
      });
      writeCell("AMOUNT", col5X, y, col5W, ROW_H, {
        bold: true,
        align: "center",
      });

      y += ROW_H;
    };

    const checkPageBreak = () => {
      if (y + ROW_H > PAGE_BOTTOM) {
        drawHLine(PAGE_LEFT, y, TOTAL_W);
        doc.addPage();
        y = 30;
        drawHeaders();
      }
    };

    // ── TITLE ──
    const titleH = ROW_H + 4;
    doc.rect(PAGE_LEFT, y, TOTAL_W, titleH).stroke();
    writeCell("Balance Sheet", PAGE_LEFT, y, TOTAL_W, titleH, {
      bold: true,
      fontSize: 16,
      align: "center",
    });
    y += titleH;

    // ── DATE ──
    doc.rect(PAGE_LEFT, y, TOTAL_W, ROW_H).stroke();
    writeCell(
      `${dayjs(periodStart).format("DD MMM YYYY")} to ${dayjs(periodEnd).format(
        "DD MMM YYYY",
      )}`,
      PAGE_LEFT,
      y,
      TOTAL_W,
      ROW_H,
      {
        italic: true,
        fontSize: 10,
        align: "center",
      },
    );
    y += ROW_H;

    // ── Initial header ──
    drawHeaders();

    const dataStartY = y;

    // ── DATA ROWS ──
    const maxLength = Math.max(liabilities.length, assets.length);

    for (let i = 0; i < maxLength; i++) {
      checkPageBreak();

      const liability = liabilities[i];
      const asset = assets[i];

      drawRowBorders(y);

      if (liability) {
        const isSpecial = liability.group?.id === -1;
        writeCell(liability.group?.value ?? "", col1X, y, col1W, ROW_H, {
          bold: !isSpecial,
          color: isSpecial ? "#FF0000" : "#000000",
        });
        writeCell(
          fmtPdfAmt(liability.amount.cr ?? ""),
          col2X,
          y,
          col2W,
          ROW_H,
          {
            align: isSpecial ? "left" : "right",
          },
        );
      }

      if (asset) {
        const isSpecial = asset.group?.id === -1;
        writeCell(asset.group?.value ?? "", col4X, y, col4W, ROW_H, {
          bold: !isSpecial,
          color: isSpecial ? "#FF0000" : "#000000",
        });
        writeCell(fmtPdfAmt(asset.amount.dr ?? ""), col5X, y, col5W, ROW_H, {
          align: isSpecial ? "left" : "right",
        });
      }

      y += ROW_H;
    }

    // ── PROFIT & LOSS ROWS ──
    if (profitLoss) {
      const isLiability = profitLoss.side === "LIABILITIES";

      const plRows: { label: string; value: number | string; bold: boolean }[] =
        [
          { label: "Profit & Loss A/c", value: profitLoss.total, bold: true },
          {
            label: "Opening Balance",
            value: profitLoss.openingBalance,
            bold: false,
          },
          {
            label: "Current Period",
            value: profitLoss.currentPeriod,
            bold: false,
          },
        ];

      for (const r of plRows) {
        checkPageBreak();
        drawRowBorders(y);

        if (isLiability) {
          writeCell(r.label, col1X, y, col1W, ROW_H, { bold: r.bold });
          writeCell(fmtPdfAmt(r.value ?? ""), col2X, y, col2W, ROW_H, {
            bold: r.bold,
            align: r.bold ? "right" : "left",
          });
        } else {
          writeCell(r.label, col4X, y, col4W, ROW_H, { bold: r.bold });
          writeCell(fmtPdfAmt(r.value ?? ""), col5X, y, col5W, ROW_H, {
            bold: r.bold,
            align: r.bold ? "right" : "left",
          });
        }

        y += ROW_H;
      }
    }

    // ── SPACER ROWS ──
    for (let i = 0; i < 3; i++) {
      checkPageBreak();
      drawRowBorders(y);
      y += ROW_H;
    }

    const dataEndY = y;

    // ── Close data section borders ──
    drawHLine(PAGE_LEFT, dataStartY, TOTAL_W);
    drawHLine(PAGE_LEFT, dataEndY, TOTAL_W);

    // ── TOTAL ROW ──
    checkPageBreak();
    doc.rect(PAGE_LEFT, y, TOTAL_W, ROW_H).stroke();
    drawVLine(col2X, y, ROW_H);
    drawVLine(midX, y, ROW_H);
    drawVLine(col5X, y, ROW_H);

    writeCell("TOTAL", col1X, y, col1W, ROW_H, { bold: true });
    writeCell(fmtPdfAmt(totals.liabilities ?? ""), col2X, y, col2W, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell("TOTAL", col4X, y, col4W, ROW_H, { bold: true });
    writeCell(fmtPdfAmt(totals.assets ?? ""), col5X, y, col5W, ROW_H, {
      bold: true,
      align: "right",
    });

    y += ROW_H;

    doc.end();

    return new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });
  },

  async buildPdfForBalanceSheetWithChildren(
    input: BalanceSheetRequestInput,
  ): Promise<Buffer> {
    logger.info("entering::buildPdfForBalanceSheetWithChildren::service");

    const { periodStart, periodEnd, liabilities, assets, totals, profitLoss } =
      await this.getBalanceSheet(input);

    const doc = new PDFDocument({ margin: 30, size: "A4", layout: "portrait" });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    const FONT_NORMAL = "Helvetica";
    const FONT_BOLD = "Helvetica-Bold";
    const FONT_ITALIC = "Helvetica-Oblique";

    const PAGE_LEFT = 30;
    const PAGE_WIDTH = doc.page.width - 60;
    const PAGE_BOTTOM = doc.page.height - 30;

    const TOTAL_EXCEL_W = 88.5;
    const col1W = PAGE_WIDTH * (28 / TOTAL_EXCEL_W);
    const col2W = PAGE_WIDTH * (16 / TOTAL_EXCEL_W);
    const col4W = PAGE_WIDTH * (28 / TOTAL_EXCEL_W);
    const col5W = PAGE_WIDTH * (16 / TOTAL_EXCEL_W);

    const col1X = PAGE_LEFT;
    const col2X = col1X + col1W;
    const midX = col2X + col2W;
    const col4X = midX;
    const col5X = col4X + col4W;

    const TOTAL_W = col1W + col2W + col4W + col5W;

    const ROW_H = 20;
    const FONT_SIZE = 9;
    const INDENT = 10;

    let y = 30;

    const drawHLine = (x: number, yw: number, w: number) => {
      doc
        .moveTo(x, yw)
        .lineTo(x + w, yw)
        .stroke("#000000");
    };

    const drawVLine = (xv: number, yt: number, h: number) => {
      doc
        .moveTo(xv, yt)
        .lineTo(xv, yt + h)
        .stroke("#000000");
    };

    const writeCell = (
      text: string,
      x: number,
      yt: number,
      w: number,
      h: number,
      opts: {
        bold?: boolean;
        italic?: boolean;
        align?: "left" | "right" | "center";
        color?: string;
        fontSize?: number;
        indent?: number;
      } = {},
    ) => {
      const xOffset = opts.indent ?? 3;
      doc
        .font(opts.bold ? FONT_BOLD : opts.italic ? FONT_ITALIC : FONT_NORMAL)
        .fontSize(opts.fontSize ?? FONT_SIZE)
        .fillColor(opts.color ?? "#000000")
        .text(String(text ?? ""), x + xOffset, yt + 5, {
          width: w - xOffset - 3,
          height: h - 5,
          align: opts.align ?? "left",
          ellipsis: true,
          lineBreak: false,
        });
    };

    const drawRowBorders = (rowY: number, h: number = ROW_H) => {
      drawVLine(col1X, rowY, h);
      drawVLine(col2X, rowY, h);
      drawVLine(col2X + col2W, rowY, h);
      drawVLine(col5X, rowY, h);
      drawVLine(col5X + col5W, rowY, h);
    };

    // ── Flatten helper ──
    const flatten = (
      nodes: BsNode[],
      side: "liability" | "asset",
    ): {
      name: string;
      id: number;
      amount: number;
      level: number;
      isParent: boolean;
    }[] => {
      const result: {
        name: string;
        id: number;
        amount: number;
        level: number;
        isParent: boolean;
      }[] = [];

      for (const node of nodes) {
        if (node.group)
          result.push({
            name: node.group.value,
            id: node.group.id,
            amount: side === "liability" ? node.amount.cr : node.amount.dr,
            level: 0,
            isParent: node.parent ? false : true,
          });

        for (const child of node.children) {
          if (child.group)
            result.push({
              name: child.group.value,
              id: child.group.id,
              amount: side === "liability" ? child.amount.cr : child.amount.dr,
              level: 1,
              isParent: false,
            });
        }
      }

      return result;
    };

    const flatLiabilities = flatten(liabilities, "liability");
    const flatAssets = flatten(assets, "asset");

    // ── Draw table header ──
    const drawHeaders = () => {
      doc.rect(PAGE_LEFT, y, TOTAL_W, ROW_H).stroke();
      drawVLine(col2X, y, ROW_H);
      drawVLine(midX, y, ROW_H);
      drawVLine(col5X, y, ROW_H);

      writeCell("LIABILITIES", col1X, y, col1W, ROW_H, {
        bold: true,
        align: "center",
      });
      writeCell("AMOUNT", col2X, y, col2W, ROW_H, {
        bold: true,
        align: "center",
      });
      writeCell("ASSETS", col4X, y, col4W, ROW_H, {
        bold: true,
        align: "center",
      });
      writeCell("AMOUNT", col5X, y, col5W, ROW_H, {
        bold: true,
        align: "center",
      });

      y += ROW_H;
    };

    const checkPageBreak = () => {
      if (y + ROW_H > PAGE_BOTTOM) {
        drawHLine(PAGE_LEFT, y, TOTAL_W);
        doc.addPage();
        y = 30;
        drawHeaders();
      }
    };

    // ── TITLE ──
    const titleH = ROW_H + 4;
    doc.rect(PAGE_LEFT, y, TOTAL_W, titleH).stroke();
    writeCell("Balance Sheet", PAGE_LEFT, y, TOTAL_W, titleH, {
      bold: true,
      fontSize: 16,
      align: "center",
    });
    y += titleH;

    // ── DATE ──
    doc.rect(PAGE_LEFT, y, TOTAL_W, ROW_H).stroke();
    writeCell(
      `${dayjs(periodStart).format("DD MMM YYYY")} to ${dayjs(periodEnd).format(
        "DD MMM YYYY",
      )}`,
      PAGE_LEFT,
      y,
      TOTAL_W,
      ROW_H,
      {
        italic: true,
        fontSize: 10,
        align: "center",
      },
    );
    y += ROW_H;

    // ── Initial header ──
    drawHeaders();

    const dataStartY = y;

    // ── DATA ROWS ──
    const maxLength = Math.max(flatLiabilities.length, flatAssets.length);

    for (let i = 0; i < maxLength; i++) {
      checkPageBreak();

      const l = flatLiabilities[i];
      const a = flatAssets[i];

      drawRowBorders(y);

      if (l) {
        const isSpecial = l.id === -1;
        const lIndent = 3 + l.level * INDENT;
        writeCell(l.name, col1X, y, col1W, ROW_H, {
          bold: l.isParent && !isSpecial,
          color: isSpecial ? "#FF0000" : "#000000",
          indent: lIndent,
        });
        writeCell(fmtPdfAmt(l.amount ?? ""), col2X, y, col2W, ROW_H, {
          align: isSpecial ? "left" : "right",
        });
      }

      if (a) {
        const isSpecial = a.id === -1;
        const aIndent = 3 + a.level * INDENT;
        writeCell(a.name, col4X, y, col4W, ROW_H, {
          bold: a.isParent && !isSpecial,
          color: isSpecial ? "#FF0000" : "#000000",
          indent: aIndent,
        });
        writeCell(fmtPdfAmt(a.amount ?? ""), col5X, y, col5W, ROW_H, {
          align: isSpecial ? "left" : "right",
        });
      }

      y += ROW_H;
    }

    // ── PROFIT & LOSS ROWS ──
    if (profitLoss) {
      const isLiability = profitLoss.side === "LIABILITIES";

      const plRows: { label: string; value: number | string; bold: boolean }[] =
        [
          { label: "Profit & Loss A/c", value: profitLoss.total, bold: true },
          {
            label: "Opening Balance",
            value: profitLoss.openingBalance,
            bold: false,
          },
          {
            label: "Current Period",
            value: profitLoss.currentPeriod,
            bold: false,
          },
        ];

      for (const r of plRows) {
        checkPageBreak();
        drawRowBorders(y);

        if (isLiability) {
          writeCell(r.label, col1X, y, col1W, ROW_H, { bold: r.bold });
          writeCell(fmtPdfAmt(r.value ?? ""), col2X, y, col2W, ROW_H, {
            bold: r.bold,
            align: r.bold ? "right" : "left",
          });
        } else {
          writeCell(r.label, col4X, y, col4W, ROW_H, { bold: r.bold });
          writeCell(fmtPdfAmt(r.value ?? ""), col5X, y, col5W, ROW_H, {
            bold: r.bold,
            align: r.bold ? "right" : "left",
          });
        }

        y += ROW_H;
      }
    }

    // ── SPACER ROWS ──
    for (let i = 0; i < 3; i++) {
      checkPageBreak();
      drawRowBorders(y);
      y += ROW_H;
    }

    const dataEndY = y;

    // ── Close data section borders ──
    drawHLine(PAGE_LEFT, dataStartY, TOTAL_W);
    drawHLine(PAGE_LEFT, dataEndY, TOTAL_W);

    // ── TOTAL ROW ──
    checkPageBreak();
    doc.rect(PAGE_LEFT, y, TOTAL_W, ROW_H).stroke();
    drawVLine(col2X, y, ROW_H);
    drawVLine(midX, y, ROW_H);
    drawVLine(col5X, y, ROW_H);

    writeCell("TOTAL", col1X, y, col1W, ROW_H, { bold: true });
    writeCell(fmtPdfAmt(totals.liabilities ?? ""), col2X, y, col2W, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell("TOTAL", col4X, y, col4W, ROW_H, { bold: true });
    writeCell(fmtPdfAmt(totals.assets ?? ""), col5X, y, col5W, ROW_H, {
      bold: true,
      align: "right",
    });

    y += ROW_H;

    doc.end();

    return new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });
  },

  async buildPdfForLedgerBookReport(
    input: LedgerBookExcelRequestInput,
  ): Promise<Buffer> {
    logger.info("entering::buildPdfForLedgerBookReport::service");

    const { closingBalance, ledger, openingBalance, rows, totals } =
      await this.getLedgerBook(input);

    const showNarration = input.showNarration;
    const showCreatedBy = input.showCreatedBy;
    const showUpdatedBy = input.showUpdatedBy;

    const doc = new PDFDocument({ margin: 30, size: "A4", layout: "portrait" });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    const FONT_NORMAL = "Helvetica";
    const FONT_BOLD = "Helvetica-Bold";

    const PAGE_LEFT = 30;
    const PAGE_WIDTH = doc.page.width - 60;
    const PAGE_BOTTOM = doc.page.height - 30;

    // ============================================================
    // DYNAMIC COLUMN DEFINITIONS
    // ============================================================
    interface ColDef {
      key: string;
      label: string;
      excelW: number;
    }

    const columnDefs: ColDef[] = [
      { key: "DATE", label: "DATE", excelW: 18 },
      { key: "VOUCHER_NO", label: "VOUCHER NO", excelW: 28 },
      { key: "VOUCHER_TYPE", label: "VOUCHER TYPE", excelW: 25 },
      ...(showNarration
        ? [{ key: "NARRATION", label: "NARRATION", excelW: 20 }]
        : []),
      ...(showCreatedBy
        ? [{ key: "CREATED_BY", label: "CREATED BY", excelW: 20 }]
        : []),
      ...(showUpdatedBy
        ? [{ key: "UPDATED_BY", label: "UPDATED BY", excelW: 20 }]
        : []),
      { key: "DR", label: "DR", excelW: 15 },
      { key: "CR", label: "CR", excelW: 15 },
    ];

    const TOTAL_EXCEL_W = columnDefs.reduce((sum, c) => sum + c.excelW, 0);

    const cols = columnDefs.map((c) => ({
      ...c,
      w: PAGE_WIDTH * (c.excelW / TOTAL_EXCEL_W),
      x: 0,
    }));

    let runningX = PAGE_LEFT;
    cols.forEach((c) => {
      c.x = runningX;
      runningX += c.w;
    });

    const TOTAL_W = PAGE_WIDTH;

    const colX = (key: string) => cols.find((c) => c.key === key)!.x;
    const colW = (key: string) => cols.find((c) => c.key === key)!.w;

    const ROW_H = 20;
    const FONT_SIZE = 9;

    let y = 30;

    const fmtAmt = (value: number | string | null | undefined): string => {
      if (value === null || value === undefined || value === "") return "";
      const num = Number(value);
      if (isNaN(num) || num === 0) return "";
      return num.toFixed(2);
    };

    const drawHLine = (x: number, yw: number, w: number) => {
      doc
        .moveTo(x, yw)
        .lineTo(x + w, yw)
        .stroke("#000000");
    };

    const drawVLine = (xv: number, yt: number, h: number) => {
      doc
        .moveTo(xv, yt)
        .lineTo(xv, yt + h)
        .stroke("#000000");
    };

    const calcCellHeight = (
      text: string,
      w: number,
      opts: { fontSize?: number; bold?: boolean } = {},
    ): number => {
      doc
        .font(opts.bold ? FONT_BOLD : FONT_NORMAL)
        .fontSize(opts.fontSize ?? FONT_SIZE);
      const textHeight = doc.heightOfString(String(text ?? ""), {
        width: w - 6,
      });
      return Math.max(ROW_H, textHeight + 10);
    };

    const writeCell = (
      text: string,
      x: number,
      yt: number,
      w: number,
      h: number,
      opts: {
        bold?: boolean;
        align?: "left" | "right" | "center";
        fontSize?: number;
      } = {},
    ) => {
      doc
        .font(opts.bold ? FONT_BOLD : FONT_NORMAL)
        .fontSize(opts.fontSize ?? FONT_SIZE)
        .fillColor("#000000")
        .text(String(text ?? ""), x + 3, yt + 5, {
          width: w - 6,
          height: h - 5,
          align: opts.align ?? "left",
          lineBreak: true,
        });
    };

    const drawRowBorders = (rowY: number, h: number = ROW_H) => {
      cols.forEach((c) => drawVLine(c.x, rowY, h));
      drawVLine(PAGE_LEFT + TOTAL_W, rowY, h);
    };

    const checkPageBreak = (rowHeight: number = ROW_H) => {
      if (y + rowHeight > PAGE_BOTTOM) {
        drawHLine(PAGE_LEFT, y, TOTAL_W);
        doc.addPage();
        y = 30;
        drawHeaders();
      }
    };

    // ── Draw table header with dynamic height so labels wrap ──
    const drawHeaders = () => {
      // Calculate dynamic header height based on each label wrapping in its column
      const headerH = Math.max(
        ...cols.map((c) => calcCellHeight(c.label, c.w, { bold: true })),
      );

      drawHLine(PAGE_LEFT, y, TOTAL_W);
      drawRowBorders(y, headerH);

      cols.forEach((c) => {
        writeCell(c.label, c.x, y, c.w, headerH, {
          bold: true,
          align: "center",
        });
      });

      drawHLine(PAGE_LEFT, y + headerH, TOTAL_W);
      y += headerH;
    };

    // ============================================================
    // TITLE SECTION
    // ============================================================
    drawVLine(PAGE_LEFT, y, ROW_H + 4);
    drawVLine(PAGE_LEFT + TOTAL_W, y, ROW_H + 4);
    drawHLine(PAGE_LEFT, y, TOTAL_W);
    writeCell("Ledger Book", PAGE_LEFT, y, TOTAL_W, ROW_H + 4, {
      bold: true,
      fontSize: 16,
      align: "center",
    });
    y += ROW_H + 4;

    // Ledger Name
    drawVLine(PAGE_LEFT, y, ROW_H);
    drawVLine(PAGE_LEFT + TOTAL_W, y, ROW_H);
    writeCell(ledger?.name ?? "", PAGE_LEFT, y, TOTAL_W, ROW_H, {
      bold: true,
      fontSize: 12,
      align: "center",
    });
    y += ROW_H;

    // Date Range
    drawVLine(PAGE_LEFT, y, ROW_H);
    drawVLine(PAGE_LEFT + TOTAL_W, y, ROW_H);
    writeCell(
      `(${dayjs(input.fromDate).format("DD MMM YYYY")} – ${dayjs(
        input.toDate,
      ).format("DD MMM YYYY")})`,
      PAGE_LEFT,
      y,
      TOTAL_W,
      ROW_H,
      { fontSize: 10, align: "center" },
    );
    y += ROW_H;

    // ── Initial header ──
    drawHeaders();

    // ============================================================
    // DATA ROWS
    // ============================================================
    rows.forEach((r) => {
      const isDr = r.drCr === "DR";

      const cellContents: { text: string; w: number; bold?: boolean }[] = [
        {
          text: dayjs(r.voucher.voucherDate).format("DD MMM YYYY"),
          w: colW("DATE"),
        },
        { text: r.voucher.voucherNo ?? "", w: colW("VOUCHER_NO") },
        { text: r.voucher.voucherType?.value ?? "", w: colW("VOUCHER_TYPE") },
        ...(showNarration
          ? [{ text: r.voucher.narration ?? "", w: colW("NARRATION") }]
          : []),
        ...(showCreatedBy
          ? [{ text: r.voucher.createdBy?.value ?? "", w: colW("CREATED_BY") }]
          : []),
        ...(showUpdatedBy
          ? [{ text: r.voucher.updatedBy?.value ?? "", w: colW("UPDATED_BY") }]
          : []),
        { text: isDr ? fmtAmt(Number(r.amount)) : "", w: colW("DR") },
        { text: !isDr ? fmtAmt(Number(r.amount)) : "", w: colW("CR") },
      ];

      const dynamicH = Math.max(
        ...cellContents.map((c) =>
          calcCellHeight(c.text, c.w, { bold: c.bold }),
        ),
      );

      checkPageBreak(dynamicH);
      drawRowBorders(y, dynamicH);

      writeCell(
        dayjs(r.voucher.voucherDate).format("DD MMM YYYY"),
        colX("DATE"),
        y,
        colW("DATE"),
        dynamicH,
        {
          align: "center",
        },
      );
      writeCell(
        r.voucher.voucherNo ?? "",
        colX("VOUCHER_NO"),
        y,
        colW("VOUCHER_NO"),
        dynamicH,
        { align: "center" },
      );
      writeCell(
        r.voucher.voucherType?.value ?? "",
        colX("VOUCHER_TYPE"),
        y,
        colW("VOUCHER_TYPE"),
        dynamicH,
        {
          align: "center",
        },
      );

      if (showNarration) {
        writeCell(
          r.voucher.narration ?? "",
          colX("NARRATION"),
          y,
          colW("NARRATION"),
          dynamicH,
          { align: "center" },
        );
      }
      if (showCreatedBy) {
        writeCell(
          r.voucher.createdBy?.value ?? "",
          colX("CREATED_BY"),
          y,
          colW("CREATED_BY"),
          dynamicH,
          {
            align: "center",
          },
        );
      }
      if (showUpdatedBy) {
        writeCell(
          r.voucher.updatedBy?.value ?? "",
          colX("UPDATED_BY"),
          y,
          colW("UPDATED_BY"),
          dynamicH,
          {
            align: "center",
          },
        );
      }

      writeCell(
        isDr ? fmtAmt(Number(r.amount)) : "",
        colX("DR"),
        y,
        colW("DR"),
        dynamicH,
        { align: "center" },
      );
      writeCell(
        !isDr ? fmtAmt(Number(r.amount)) : "",
        colX("CR"),
        y,
        colW("CR"),
        dynamicH,
        { align: "center" },
      );

      y += dynamicH;
    });

    // Blank separator before summary
    checkPageBreak();
    drawRowBorders(y);
    y += ROW_H;

    // ============================================================
    // SUMMARY SECTION
    // ============================================================
    if (y + ROW_H * 3 > PAGE_BOTTOM) {
      drawHLine(PAGE_LEFT, y, TOTAL_W);
      doc.addPage();
      y = 30;
    }

    drawHLine(PAGE_LEFT, y, TOTAL_W);

    // ============================================================
    // SUMMARY SECTION
    // ============================================================
    if (y + ROW_H * 3 > PAGE_BOTTOM) {
      drawHLine(PAGE_LEFT, y, TOTAL_W);
      doc.addPage();
      y = 30;
    }

    drawHLine(PAGE_LEFT, y, TOTAL_W);

    const formatDrCr = (dr: number, cr: number) => {
      if (dr === 0 && cr === 0) return { dr: "", cr: "" };
      return { dr: dr === 0 ? "" : fmtAmt(dr), cr: cr === 0 ? "" : fmtAmt(cr) };
    };

    const summaryRows: { label: string; dr: string; cr: string }[] = [
      {
        label: "Opening Balance",
        ...formatDrCr(openingBalance.dr || 0, openingBalance.cr || 0),
      },
      { label: "Current Total", ...formatDrCr(totals.dr || 0, totals.cr || 0) },
      {
        label: "Closing Balance",
        ...formatDrCr(closingBalance.dr || 0, closingBalance.cr || 0),
      },
    ];

    // Label spans from very first col (DATE) to just before DR — full merged area
    const drCol = cols.find((c) => c.key === "DR")!;
    const crCol = cols.find((c) => c.key === "CR")!;
    const firstCol = cols[0];
    const labelW = drCol.x - firstCol.x;

    summaryRows.forEach((s) => {
      const summaryH = Math.max(
        calcCellHeight(s.label, labelW, { bold: true }),
        calcCellHeight(s.dr, colW("DR"), { bold: true }),
        calcCellHeight(s.cr, colW("CR"), { bold: true }),
      );

      // Only draw outer left, DR divider, CR divider, right edge — NO inner col lines, NO horizontal lines
      drawVLine(firstCol.x, y, summaryH);
      drawVLine(drCol.x, y, summaryH);
      drawVLine(crCol.x, y, summaryH);
      drawVLine(PAGE_LEFT + TOTAL_W, y, summaryH);

      writeCell(s.label, firstCol.x, y, labelW, summaryH, {
        bold: true,
        align: "right",
      });
      writeCell(s.dr, drCol.x, y, colW("DR"), summaryH, {
        bold: true,
        align: "right",
      });
      writeCell(s.cr, crCol.x, y, colW("CR"), summaryH, {
        bold: true,
        align: "right",
      });

      y += summaryH;
    });

    // Only top (already drawn before loop) and bottom border
    drawHLine(PAGE_LEFT, y, TOTAL_W);

    doc.end();

    return new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });
  },

  async buildPdfForTrialBalance(
    input: TrialBalanceRequestInput,
  ): Promise<Buffer> {
    logger.info("entering::buildPdfForTrialBalance::service");

    const { rows, totals } = await this.getTrialBalance(input);

    const doc = new PDFDocument({ margin: 30, size: "A4", layout: "portrait" });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    const FONT_NORMAL = "Helvetica";
    const FONT_BOLD = "Helvetica-Bold";

    const PAGE_LEFT = 30;
    const PAGE_WIDTH = doc.page.width - 60;
    const PAGE_BOTTOM = doc.page.height - 30;

    const TOTAL_EXCEL_W = 141;
    const col1W = PAGE_WIDTH * (45 / TOTAL_EXCEL_W);
    const col2W = PAGE_WIDTH * (16 / TOTAL_EXCEL_W);
    const col3W = PAGE_WIDTH * (16 / TOTAL_EXCEL_W);
    const col4W = PAGE_WIDTH * (16 / TOTAL_EXCEL_W);
    const col5W = PAGE_WIDTH * (16 / TOTAL_EXCEL_W);
    const col6W = PAGE_WIDTH * (16 / TOTAL_EXCEL_W);
    const col7W = PAGE_WIDTH * (16 / TOTAL_EXCEL_W);

    const col1X = PAGE_LEFT;
    const col2X = col1X + col1W;
    const col3X = col2X + col2W;
    const col4X = col3X + col3W;
    const col5X = col4X + col4W;
    const col6X = col5X + col5W;
    const col7X = col6X + col6W;

    const TOTAL_W = col1W + col2W + col3W + col4W + col5W + col6W + col7W;

    const ROW_H = 20;
    const FONT_SIZE = 8;

    const getRowHeight = (text: string, width: number) => {
      const textHeight = doc.heightOfString(String(text ?? ""), {
        width: width - 6,
      });

      return Math.max(20, textHeight + 10);
    };

    let y = 30;

    const fmtAmt = (value: number | string | null | undefined): string => {
      if (value === null || value === undefined || value === "") return "";
      const num = Number(value);
      if (isNaN(num) || num === 0) return "";
      return num.toFixed(2);
    };

    const drawHLine = (x: number, yw: number, w: number) => {
      doc
        .moveTo(x, yw)
        .lineTo(x + w, yw)
        .stroke("#000000");
    };

    const drawVLine = (xv: number, yt: number, h: number) => {
      doc
        .moveTo(xv, yt)
        .lineTo(xv, yt + h)
        .stroke("#000000");
    };

    const writeCell = (
      text: string,
      x: number,
      yt: number,
      w: number,
      h: number,
      opts: {
        bold?: boolean;
        align?: "left" | "right" | "center";
        fontSize?: number;
      } = {},
    ) => {
      doc
        .font(opts.bold ? FONT_BOLD : FONT_NORMAL)
        .fontSize(opts.fontSize ?? FONT_SIZE)
        .fillColor("#000000")
        .text(String(text ?? ""), x + 3, yt + 5, {
          width: w - 6,
          align: opts.align ?? "left",
        });
    };

    const drawRowBorders = (rowY: number, h: number = ROW_H) => {
      drawVLine(col1X, rowY, h);
      drawVLine(col2X, rowY, h);
      drawVLine(col3X, rowY, h);
      drawVLine(col4X, rowY, h);
      drawVLine(col5X, rowY, h);
      drawVLine(col6X, rowY, h);
      drawVLine(col7X, rowY, h);
      drawVLine(col7X + col7W, rowY, h);
    };

    // ── Draw table headers (group header + column labels) ──
    const drawHeaders = () => {
      // Group header row
      drawHLine(col1X, y, TOTAL_W);
      drawVLine(col1X, y, ROW_H);
      drawVLine(col2X, y, ROW_H);
      drawVLine(col4X, y, ROW_H);
      drawVLine(col6X, y, ROW_H);
      drawVLine(col7X + col7W, y, ROW_H);

      writeCell("Opening Balance", col2X, y, col2W + col3W, ROW_H, {
        bold: true,
        align: "center",
      });
      writeCell("Period Transactions", col4X, y, col4W + col5W, ROW_H, {
        bold: true,
        align: "center",
      });
      writeCell("Closing Balance", col6X, y, col6W + col7W, ROW_H, {
        bold: true,
        align: "center",
      });

      drawHLine(col2X, y + ROW_H, TOTAL_W - col1W);
      y += ROW_H;

      // Column labels row — only vertical borders, no top hline
      drawVLine(col1X, y, ROW_H);
      drawVLine(col2X, y, ROW_H);
      drawVLine(col3X, y, ROW_H);
      drawVLine(col4X, y, ROW_H);
      drawVLine(col5X, y, ROW_H);
      drawVLine(col6X, y, ROW_H);
      drawVLine(col7X, y, ROW_H);
      drawVLine(col7X + col7W, y, ROW_H);

      writeCell("PARTICULARS", col1X, y, col1W, ROW_H, {
        bold: true,
        align: "center",
      });
      writeCell("DR", col2X, y, col2W, ROW_H, { bold: true, align: "center" });
      writeCell("CR", col3X, y, col3W, ROW_H, { bold: true, align: "center" });
      writeCell("DR", col4X, y, col4W, ROW_H, { bold: true, align: "center" });
      writeCell("CR", col5X, y, col5W, ROW_H, { bold: true, align: "center" });
      writeCell("DR", col6X, y, col6W, ROW_H, { bold: true, align: "center" });
      writeCell("CR", col7X, y, col7W, ROW_H, { bold: true, align: "center" });

      drawHLine(col1X, y + ROW_H, TOTAL_W);
      y += ROW_H;
    };

    const checkPageBreak = () => {
      if (y + ROW_H > PAGE_BOTTOM) {
        // Close current page with bottom border
        drawHLine(col1X, y, TOTAL_W);

        doc.addPage();
        y = 30;
        drawHeaders();
      }
    };

    // ── TITLE ──
    const titleH = ROW_H + 4;
    drawVLine(col1X, y, titleH);
    drawVLine(col7X + col7W, y, titleH);
    drawHLine(col1X, y, TOTAL_W);
    writeCell("Trial Balance", col1X, y, TOTAL_W, titleH, {
      bold: true,
      fontSize: 16,
      align: "center",
    });
    y += titleH;

    // ── DATE ──
    drawVLine(col1X, y, ROW_H);
    drawVLine(col7X + col7W, y, ROW_H);
    writeCell(
      `(${dayjs(input.fromDate).format("MMM D, YYYY")} – ${dayjs(
        input.toDate,
      ).format("MMM D, YYYY")})`,
      col1X,
      y,
      TOTAL_W,
      ROW_H,
      { fontSize: 10, align: "center" },
    );
    y += ROW_H;

    // ── Initial headers ──
    drawHeaders();

    // ── DATA ROWS ──
    rows.forEach((r) => {
      checkPageBreak();
      const rowHeight = getRowHeight(r.ledger?.value ?? "", col1W);

      drawRowBorders(y, rowHeight);

      writeCell(r.ledger?.value ?? "", col1X, y, col1W, rowHeight);

      writeCell(fmtAmt(r.opening?.dr), col2X, y, col2W, rowHeight, {
        align: "right",
      });
      writeCell(fmtAmt(r.opening?.cr), col3X, y, col3W, rowHeight, {
        align: "right",
      });
      writeCell(fmtAmt(r.closing?.dr), col4X, y, col4W, rowHeight, {
        align: "right",
      });
      writeCell(fmtAmt(r.closing?.cr), col5X, y, col5W, rowHeight, {
        align: "right",
      });
      writeCell(fmtAmt(r.closing?.dr), col6X, y, col6W, rowHeight, {
        align: "right",
      });
      writeCell(fmtAmt(r.closing?.cr), col7X, y, col7W, rowHeight, {
        align: "right",
      });

      y += rowHeight;
    });

    // ── SPACER ROW ──
    checkPageBreak();
    drawRowBorders(y);
    y += ROW_H;

    // ── TOTAL ROW ──
    checkPageBreak();
    drawHLine(col1X, y, TOTAL_W);
    drawRowBorders(y);

    writeCell("Grand Total", col1X, y, col1W, ROW_H, { bold: true });
    writeCell(fmtAmt(totals.opening?.dr), col2X, y, col2W, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell(fmtAmt(totals.opening?.cr), col3X, y, col3W, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell(fmtAmt(totals.closing?.dr), col4X, y, col4W, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell(fmtAmt(totals.closing?.cr), col5X, y, col5W, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell(fmtAmt(totals.closing?.dr), col6X, y, col6W, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell(fmtAmt(totals.closing?.cr), col7X, y, col7W, ROW_H, {
      bold: true,
      align: "right",
    });

    drawHLine(col1X, y + ROW_H, TOTAL_W);
    y += ROW_H;

    doc.end();

    return new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });
  },

  async buildPdfForGroupSummary(
    input: GroupSummaryRequestInput,
  ): Promise<Buffer> {
    logger.info("entering::buildPdfForGroupSummary::service");

    const { roots, totals } = await this.getGroupSummaryTree(input);

    const doc = new PDFDocument({ margin: 30, size: "A4", layout: "portrait" });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    const FONT_NORMAL = "Helvetica";
    const FONT_BOLD = "Helvetica-Bold";

    const PAGE_LEFT = 30;
    const PAGE_WIDTH = doc.page.width - 60;
    const PAGE_BOTTOM = doc.page.height - 30;

    // Proportions: 45 : 18 : 18 : 18 : 18 : 18 : 18  (total = 153)
    const TOTAL_EXCEL_W = 153;
    const col1W = PAGE_WIDTH * (45 / TOTAL_EXCEL_W);
    const col2W = PAGE_WIDTH * (18 / TOTAL_EXCEL_W);
    const col3W = PAGE_WIDTH * (18 / TOTAL_EXCEL_W);
    const col4W = PAGE_WIDTH * (18 / TOTAL_EXCEL_W);
    const col5W = PAGE_WIDTH * (18 / TOTAL_EXCEL_W);
    const col6W = PAGE_WIDTH * (18 / TOTAL_EXCEL_W);
    const col7W = PAGE_WIDTH * (18 / TOTAL_EXCEL_W);

    const col1X = PAGE_LEFT;
    const col2X = col1X + col1W;
    const col3X = col2X + col2W;
    const col4X = col3X + col3W;
    const col5X = col4X + col4W;
    const col6X = col5X + col5W;
    const col7X = col6X + col6W;

    const TOTAL_W = col1W + col2W + col3W + col4W + col5W + col6W + col7W;

    const ROW_H = 20;
    const FONT_SIZE = 8;
    const getRowHeight = (text: string, width: number) => {
      const textHeight = doc.heightOfString(String(text ?? ""), {
        width: width - 6,
      });

      return Math.max(20, textHeight + 10);
    };

    let y = 30;

    const fmtAmt = (value: number | string | null | undefined): string => {
      if (value === null || value === undefined || value === "") return "";
      const num = Number(value);
      if (isNaN(num) || num === 0) return "";
      return num.toFixed(2);
    };

    const drawHLine = (x: number, yw: number, w: number) => {
      doc
        .moveTo(x, yw)
        .lineTo(x + w, yw)
        .stroke("#000000");
    };

    const drawVLine = (xv: number, yt: number, h: number) => {
      doc
        .moveTo(xv, yt)
        .lineTo(xv, yt + h)
        .stroke("#000000");
    };

    const writeCell = (
      text: string,
      x: number,
      yt: number,
      w: number,
      h: number,
      opts: {
        bold?: boolean;
        align?: "left" | "right" | "center";
        fontSize?: number;
        indent?: number;
      } = {},
    ) => {
      const xOffset = opts.indent ?? 3;
      doc
        .font(opts.bold ? FONT_BOLD : FONT_NORMAL)
        .fontSize(opts.fontSize ?? FONT_SIZE)
        .fillColor("#000000")
        .text(String(text ?? ""), x + xOffset, yt + 5, {
          width: w - xOffset - 3,
          height: h - 5,
          align: opts.align ?? "left",
        });
    };

    const drawRowBorders = (rowY: number, h: number = ROW_H) => {
      drawVLine(col1X, rowY, h);
      drawVLine(col2X, rowY, h);
      drawVLine(col3X, rowY, h);
      drawVLine(col4X, rowY, h);
      drawVLine(col5X, rowY, h);
      drawVLine(col6X, rowY, h);
      drawVLine(col7X, rowY, h);
      drawVLine(col7X + col7W, rowY, h);
    };

    // ── Draw table headers ──
    const drawHeaders = () => {
      // Group header row:
      // col1: empty | col2-3: "Opening Balance" | col4-5: "Period Transaction" | col6-7: "Closing Balance"
      drawHLine(col1X, y, TOTAL_W);
      drawVLine(col1X, y, ROW_H);
      drawVLine(col2X, y, ROW_H); // left edge of Opening Balance span
      drawVLine(col4X, y, ROW_H); // left edge of Period Transaction span
      drawVLine(col6X, y, ROW_H); // left edge of Closing Balance span
      drawVLine(col7X + col7W, y, ROW_H); // right edge

      writeCell("Opening Balance", col2X, y, col2W + col3W, ROW_H, {
        bold: true,
        align: "center",
      });
      writeCell("Period Transaction", col4X, y, col4W + col5W, ROW_H, {
        bold: true,
        align: "center",
      });
      writeCell("Closing Balance", col6X, y, col6W + col7W, ROW_H, {
        bold: true,
        align: "center",
      });

      // Bottom border under the span labels only (col2 onwards)
      drawHLine(
        col2X,
        y + ROW_H,
        col2W + col3W + col4W + col5W + col6W + col7W,
      );
      y += ROW_H;

      // Column labels row
      drawRowBorders(y);
      writeCell("PARTICULARS", col1X, y, col1W, ROW_H, {
        bold: true,
        align: "center",
      });
      writeCell("DR", col2X, y, col2W, ROW_H, { bold: true, align: "center" });
      writeCell("CR", col3X, y, col3W, ROW_H, { bold: true, align: "center" });
      writeCell("DR", col4X, y, col4W, ROW_H, { bold: true, align: "center" });
      writeCell("CR", col5X, y, col5W, ROW_H, { bold: true, align: "center" });
      writeCell("DR", col6X, y, col6W, ROW_H, { bold: true, align: "center" });
      writeCell("CR", col7X, y, col7W, ROW_H, { bold: true, align: "center" });

      drawHLine(col1X, y + ROW_H, TOTAL_W);
      y += ROW_H;
    };

    const checkPageBreak = () => {
      if (y + ROW_H > PAGE_BOTTOM) {
        drawHLine(col1X, y, TOTAL_W);
        doc.addPage();
        y = 30;
        drawHeaders();
      }
    };

    // ── TITLE ── (spans full width)
    const titleH = ROW_H + 4;
    drawVLine(col1X, y, titleH);
    drawVLine(col7X + col7W, y, titleH);
    drawHLine(col1X, y, TOTAL_W);
    writeCell(
      `Group Summary for - ${roots[0]?.group?.value ?? ""}`,
      col1X,
      y,
      TOTAL_W,
      titleH,
      {
        bold: true,
        fontSize: 16,
        align: "center",
      },
    );
    y += titleH;

    // ── DATE ── (spans full width)
    drawVLine(col1X, y, ROW_H);
    drawVLine(col7X + col7W, y, ROW_H);
    writeCell(
      `(${dayjs(input.fromDate).format("MMM D, YYYY")} – ${dayjs(
        input.toDate,
      ).format("MMM D, YYYY")})`,
      col1X,
      y,
      TOTAL_W,
      ROW_H,
      { fontSize: 10, align: "center" },
    );
    y += ROW_H;

    // ── Initial headers ──
    drawHeaders();

    // ── DATA ROWS ──
    roots.forEach((root) => {
      // Direct ledgers
      root.ledger?.forEach((l) => {
        checkPageBreak();
        const rowHeight = getRowHeight(l.ledger?.value ?? "", col1W);

        drawRowBorders(y, rowHeight);
        writeCell(l.ledger?.value ?? "", col1X, y, col1W, rowHeight);
        writeCell(fmtAmt(l.opening?.dr), col2X, y, col2W, rowHeight, {
          align: "right",
        });
        writeCell(fmtAmt(l.opening?.cr), col3X, y, col3W, rowHeight, {
          align: "right",
        });
        writeCell(fmtAmt(l.period?.dr), col4X, y, col4W, rowHeight, {
          align: "right",
        });
        writeCell(fmtAmt(l.period?.cr), col5X, y, col5W, rowHeight, {
          align: "right",
        });
        writeCell(fmtAmt(l.closing?.dr), col6X, y, col6W, rowHeight, {
          align: "right",
        });
        writeCell(fmtAmt(l.closing?.cr), col7X, y, col7W, rowHeight, {
          align: "right",
        });
        y += rowHeight;
      });

      // First-order children groups
      root.children?.forEach((child) => {
        checkPageBreak();
        const rowHeight = getRowHeight(child.group?.value ?? "", col1W);

        drawRowBorders(y, rowHeight);
        writeCell(child.group?.value ?? "", col1X, y, col1W, rowHeight, {
          bold: true,
        });
        writeCell(fmtAmt(child.opening?.dr), col2X, y, col2W, rowHeight, {
          bold: true,
          align: "right",
        });
        writeCell(fmtAmt(child.opening?.cr), col3X, y, col3W, rowHeight, {
          bold: true,
          align: "right",
        });
        writeCell(fmtAmt(child.period?.dr), col4X, y, col4W, rowHeight, {
          bold: true,
          align: "right",
        });
        writeCell(fmtAmt(child.period?.cr), col5X, y, col5W, rowHeight, {
          bold: true,
          align: "right",
        });
        writeCell(fmtAmt(child.closing?.dr), col6X, y, col6W, rowHeight, {
          bold: true,
          align: "right",
        });
        writeCell(fmtAmt(child.closing?.cr), col7X, y, col7W, rowHeight, {
          bold: true,
          align: "right",
        });
        y += rowHeight;

        // Child's ledgers (indented)
        child.ledger?.forEach((l) => {
          checkPageBreak();
          const rowHeight = getRowHeight(l.ledger?.value ?? "", col1W);
          drawRowBorders(y, rowHeight);
          writeCell(l.ledger?.value ?? "", col1X, y, col1W, rowHeight, {
            indent: 12,
          });
          writeCell(fmtAmt(l.opening?.dr), col2X, y, col2W, rowHeight, {
            align: "right",
          });
          writeCell(fmtAmt(l.opening?.cr), col3X, y, col3W, rowHeight, {
            align: "right",
          });
          writeCell(fmtAmt(l.period?.dr), col4X, y, col4W, rowHeight, {
            align: "right",
          });
          writeCell(fmtAmt(l.period?.cr), col5X, y, col5W, rowHeight, {
            align: "right",
          });
          writeCell(fmtAmt(l.closing?.dr), col6X, y, col6W, rowHeight, {
            align: "right",
          });
          writeCell(fmtAmt(l.closing?.cr), col7X, y, col7W, rowHeight, {
            align: "right",
          });
          y += rowHeight;
        });
      });
    });

    // ── SPACER ROW ──
    checkPageBreak();
    drawRowBorders(y);
    y += ROW_H;

    // ── TOTAL ROW ──
    checkPageBreak();
    drawHLine(col1X, y, TOTAL_W);
    drawRowBorders(y);

    writeCell("Grand Total", col1X, y, col1W, ROW_H, { bold: true });
    writeCell(fmtAmt(totals.openingDr), col2X, y, col2W, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell(fmtAmt(totals.openingCr), col3X, y, col3W, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell(fmtAmt(totals.periodDr), col4X, y, col4W, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell(fmtAmt(totals.periodCr), col5X, y, col5W, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell(fmtAmt(totals.closingDr), col6X, y, col6W, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell(fmtAmt(totals.closingCr), col7X, y, col7W, ROW_H, {
      bold: true,
      align: "right",
    });

    drawHLine(col1X, y + ROW_H, TOTAL_W);
    y += ROW_H;

    doc.end();

    return new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });
  },

  async buildPdfForCashBankSummary(
    input: ReportCommonRequestInput,
  ): Promise<Buffer> {
    logger.info("entering::buildPdfForCashBankSummary::service");

    const { roots, totals } = await this.getCashBankSummary(input);

    const doc = new PDFDocument({ margin: 30, size: "A4", layout: "portrait" });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    const FONT_NORMAL = "Helvetica";
    const FONT_BOLD = "Helvetica-Bold";
    const FONT_ITALIC = "Helvetica-Oblique";

    const PAGE_LEFT = 30;
    const PAGE_WIDTH = doc.page.width - 60;
    const PAGE_BOTTOM = doc.page.height - 30;

    // 45 + 6×18 = 153
    const TOTAL_EXCEL_W = 153;
    const col1W = PAGE_WIDTH * (45 / TOTAL_EXCEL_W);
    const col2W = PAGE_WIDTH * (18 / TOTAL_EXCEL_W);
    const col3W = PAGE_WIDTH * (18 / TOTAL_EXCEL_W);
    const col4W = PAGE_WIDTH * (18 / TOTAL_EXCEL_W);
    const col5W = PAGE_WIDTH * (18 / TOTAL_EXCEL_W);
    const col6W = PAGE_WIDTH * (18 / TOTAL_EXCEL_W);
    const col7W = PAGE_WIDTH * (18 / TOTAL_EXCEL_W);

    const col1X = PAGE_LEFT;
    const col2X = col1X + col1W;
    const col3X = col2X + col2W;
    const col4X = col3X + col3W;
    const col5X = col4X + col4W;
    const col6X = col5X + col5W;
    const col7X = col6X + col6W;

    const TOTAL_W = col1W + col2W + col3W + col4W + col5W + col6W + col7W;

    const ROW_H = 20;
    const FONT_SIZE = 7;

    let y = 30;

    const fmtAmt = (value: number | string | null | undefined): string => {
      if (value === null || value === undefined || value === "") return "";
      const num = Number(value);
      if (isNaN(num) || num === 0) return "";
      return num.toFixed(2);
    };

    const drawHLine = (x: number, yw: number, w: number) => {
      doc
        .moveTo(x, yw)
        .lineTo(x + w, yw)
        .stroke("#000000");
    };

    const drawVLine = (xv: number, yt: number, h: number) => {
      doc
        .moveTo(xv, yt)
        .lineTo(xv, yt + h)
        .stroke("#000000");
    };

    const writeCell = (
      text: string,
      x: number,
      yt: number,
      w: number,
      h: number,
      opts: {
        bold?: boolean;
        italic?: boolean;
        align?: "left" | "right" | "center";
        fontSize?: number;
        indent?: number;
        wrap?: boolean;
      } = {},
    ) => {
      const xOffset = opts.indent ?? 3;
      doc
        .font(opts.bold ? FONT_BOLD : opts.italic ? FONT_ITALIC : FONT_NORMAL)
        .fontSize(opts.fontSize ?? FONT_SIZE)
        .fillColor("#000000")
        .text(String(text ?? ""), x + xOffset, yt + 5, {
          width: w - xOffset - 3,
          height: h - 5,
          align: opts.align ?? "left",
          ellipsis: !opts.wrap,
          lineBreak: !!opts.wrap,
        });
    };

    const getRowHeight = (
      text: string,
      w: number,
      opts: { bold?: boolean; italic?: boolean; indent?: number } = {},
    ): number => {
      const xOffset = opts.indent ?? 3;
      doc
        .font(opts.bold ? FONT_BOLD : opts.italic ? FONT_ITALIC : FONT_NORMAL)
        .fontSize(FONT_SIZE);
      const textH = doc.heightOfString(text, {
        width: w - xOffset - 3,
        lineBreak: true,
      });
      return Math.max(ROW_H, textH + 5 + 4);
    };

    const drawRowBorders = (rowY: number, h: number = ROW_H) => {
      drawVLine(col1X, rowY, h);
      drawVLine(col2X, rowY, h);
      drawVLine(col3X, rowY, h);
      drawVLine(col4X, rowY, h);
      drawVLine(col5X, rowY, h);
      drawVLine(col6X, rowY, h);
      drawVLine(col7X, rowY, h);
      drawVLine(col7X + col7W, rowY, h);
    };

    const checkPageBreakWithHeight = (h: number = ROW_H) => {
      if (y + h > PAGE_BOTTOM) {
        drawHLine(col1X, y, TOTAL_W);
        doc.addPage();
        y = 30;
        drawHeaders();
      }
    };

    const checkPageBreak = () => checkPageBreakWithHeight(ROW_H);

    // ── Draw table headers ──
    const drawHeaders = () => {
      // Group header row: col1 empty | col2-3: Opening Balance | col4-5: Period Transaction | col6-7: Closing Balance
      drawHLine(col1X, y, TOTAL_W);
      drawVLine(col1X, y, ROW_H);
      drawVLine(col2X, y, ROW_H);
      drawVLine(col4X, y, ROW_H);
      drawVLine(col6X, y, ROW_H);
      drawVLine(col7X + col7W, y, ROW_H);

      writeCell("Opening Balance", col2X, y, col2W + col3W, ROW_H, {
        bold: true,
        align: "center",
      });
      writeCell("Period Transaction", col4X, y, col4W + col5W, ROW_H, {
        bold: true,
        align: "center",
      });
      writeCell("Closing Balance", col6X, y, col6W + col7W, ROW_H, {
        bold: true,
        align: "center",
      });

      drawHLine(
        col2X,
        y + ROW_H,
        col2W + col3W + col4W + col5W + col6W + col7W,
      );
      y += ROW_H;

      // Column labels
      drawRowBorders(y);
      writeCell("PARTICULARS", col1X, y, col1W, ROW_H, {
        bold: true,
        align: "center",
      });
      writeCell("DR", col2X, y, col2W, ROW_H, { bold: true, align: "center" });
      writeCell("CR", col3X, y, col3W, ROW_H, { bold: true, align: "center" });
      writeCell("DR", col4X, y, col4W, ROW_H, { bold: true, align: "center" });
      writeCell("CR", col5X, y, col5W, ROW_H, { bold: true, align: "center" });
      writeCell("DR", col6X, y, col6W, ROW_H, { bold: true, align: "center" });
      writeCell("CR", col7X, y, col7W, ROW_H, { bold: true, align: "center" });

      drawHLine(col1X, y + ROW_H, TOTAL_W);
      y += ROW_H;
    };

    // ── TITLE ──
    const titleH = ROW_H + 4;
    drawVLine(col1X, y, titleH);
    drawVLine(col7X + col7W, y, titleH);
    drawHLine(col1X, y, TOTAL_W);
    writeCell("Cash Bank Summary", col1X, y, TOTAL_W, titleH, {
      bold: true,
      fontSize: 16,
      align: "center",
    });
    y += titleH;

    // ── DATE ──
    drawVLine(col1X, y, ROW_H);
    drawVLine(col7X + col7W, y, ROW_H);
    writeCell(
      `(${dayjs(input.fromDate).format("MMM D, YYYY")} – ${dayjs(
        input.toDate,
      ).format("MMM D, YYYY")})`,
      col1X,
      y,
      TOTAL_W,
      ROW_H,
      { fontSize: 10, align: "center" },
    );
    y += ROW_H;

    // ── Initial headers ──
    drawHeaders();

    // ── DATA ROWS ──
    roots.forEach((root, rootIndex) => {
      if (rootIndex > 0) {
        checkPageBreak();
        drawHLine(col1X, y, TOTAL_W);
      }

      // Root group row
      const rootText = root.group?.value ?? "";
      const rootOpts = { bold: true };
      const rootH = getRowHeight(rootText, col1W, rootOpts);
      checkPageBreakWithHeight(rootH);
      drawRowBorders(y, rootH);
      writeCell(rootText, col1X, y, col1W, rootH, { ...rootOpts, wrap: true });
      writeCell(fmtAmt(root.opening?.dr), col2X, y, col2W, rootH, {
        bold: true,
        align: "right",
      });
      writeCell(fmtAmt(root.opening?.cr), col3X, y, col3W, rootH, {
        bold: true,
        align: "right",
      });
      writeCell(fmtAmt(root.period?.dr), col4X, y, col4W, rootH, {
        bold: true,
        align: "right",
      });
      writeCell(fmtAmt(root.period?.cr), col5X, y, col5W, rootH, {
        bold: true,
        align: "right",
      });
      writeCell(fmtAmt(root.closing?.dr), col6X, y, col6W, rootH, {
        bold: true,
        align: "right",
      });
      writeCell(fmtAmt(root.closing?.cr), col7X, y, col7W, rootH, {
        bold: true,
        align: "right",
      });
      y += rootH;

      // Direct ledgers (italic + indented)
      root.ledger?.forEach((l) => {
        const text = l.ledger?.value ?? "";
        const opts = { italic: true, indent: 12 };
        const h = getRowHeight(text, col1W, opts);
        checkPageBreakWithHeight(h);
        drawRowBorders(y, h);
        writeCell(text, col1X, y, col1W, h, { ...opts, wrap: true });
        writeCell(fmtAmt(l.opening?.dr), col2X, y, col2W, h, {
          align: "right",
        });
        writeCell(fmtAmt(l.opening?.cr), col3X, y, col3W, h, {
          align: "right",
        });
        writeCell(fmtAmt(l.period?.dr), col4X, y, col4W, h, { align: "right" });
        writeCell(fmtAmt(l.period?.cr), col5X, y, col5W, h, { align: "right" });
        writeCell(fmtAmt(l.closing?.dr), col6X, y, col6W, h, {
          align: "right",
        });
        writeCell(fmtAmt(l.closing?.cr), col7X, y, col7W, h, {
          align: "right",
        });
        y += h;
      });

      // First-order children groups
      root.children?.forEach((child) => {
        const childText = child.group?.value ?? "";
        const childOpts = { bold: true, indent: 12 };
        const childH = getRowHeight(childText, col1W, childOpts);
        checkPageBreakWithHeight(childH);
        drawRowBorders(y, childH);
        writeCell(childText, col1X, y, col1W, childH, {
          ...childOpts,
          wrap: true,
        });
        writeCell(fmtAmt(child.opening?.dr), col2X, y, col2W, childH, {
          bold: true,
          align: "right",
        });
        writeCell(fmtAmt(child.opening?.cr), col3X, y, col3W, childH, {
          bold: true,
          align: "right",
        });
        writeCell(fmtAmt(child.period?.dr), col4X, y, col4W, childH, {
          bold: true,
          align: "right",
        });
        writeCell(fmtAmt(child.period?.cr), col5X, y, col5W, childH, {
          bold: true,
          align: "right",
        });
        writeCell(fmtAmt(child.closing?.dr), col6X, y, col6W, childH, {
          bold: true,
          align: "right",
        });
        writeCell(fmtAmt(child.closing?.cr), col7X, y, col7W, childH, {
          bold: true,
          align: "right",
        });
        y += childH;

        // Child ledgers (italic + double indented)
        child.ledger?.forEach((l) => {
          const text = l.ledger?.value ?? "";
          const opts = { italic: true, indent: 22 };
          const h = getRowHeight(text, col1W, opts);
          checkPageBreakWithHeight(h);
          drawRowBorders(y, h);
          writeCell(text, col1X, y, col1W, h, { ...opts, wrap: true });
          writeCell(fmtAmt(l.opening?.dr), col2X, y, col2W, h, {
            align: "right",
          });
          writeCell(fmtAmt(l.opening?.cr), col3X, y, col3W, h, {
            align: "right",
          });
          writeCell(fmtAmt(l.period?.dr), col4X, y, col4W, h, {
            align: "right",
          });
          writeCell(fmtAmt(l.period?.cr), col5X, y, col5W, h, {
            align: "right",
          });
          writeCell(fmtAmt(l.closing?.dr), col6X, y, col6W, h, {
            align: "right",
          });
          writeCell(fmtAmt(l.closing?.cr), col7X, y, col7W, h, {
            align: "right",
          });
          y += h;
        });
      });
    });

    // ── SPACER ROW ──
    checkPageBreak();
    drawRowBorders(y);
    y += ROW_H;

    // ── TOTAL ROW ──
    checkPageBreak();
    drawHLine(col1X, y, TOTAL_W);
    drawRowBorders(y);
    writeCell("Grand Total", col1X, y, col1W, ROW_H, { bold: true });
    writeCell(fmtAmt(totals.openingDr), col2X, y, col2W, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell(fmtAmt(totals.openingCr), col3X, y, col3W, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell(fmtAmt(totals.periodDr), col4X, y, col4W, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell(fmtAmt(totals.periodCr), col5X, y, col5W, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell(fmtAmt(totals.closingDr), col6X, y, col6W, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell(fmtAmt(totals.closingCr), col7X, y, col7W, ROW_H, {
      bold: true,
      align: "right",
    });
    drawHLine(col1X, y + ROW_H, TOTAL_W);
    y += ROW_H;

    doc.end();

    return new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });
  },

  async buildPdfForReceivableSummary(
    input: ReportCommonRequestInput,
  ): Promise<Buffer> {
    logger.info("entering::buildPdfForReceivableSummary::service");

    const { roots, totals, ageing } = await this.getReceivableSummary(input);

    const hasAgeing = !!ageing;
    const buckets = hasAgeing ? ageing.bucketDefinitions : [];
    const bucketCount = buckets.length;

    const doc = new PDFDocument({
      margin: 30,
      size: "A4",
      layout: hasAgeing ? "landscape" : "portrait",
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    const FONT_NORMAL = "Helvetica";
    const FONT_BOLD = "Helvetica-Bold";
    const FONT_ITALIC = "Helvetica-Oblique";

    const PAGE_LEFT = 30;
    const PAGE_WIDTH = doc.page.width - 60;
    const PAGE_BOTTOM = doc.page.height - 30;

    // Total excel column units: col1(45) + ageing cols + opening(18+18) + period(18+18) + closing(18+18)
    const TOTAL_EXCEL_W = hasAgeing
      ? 45 + 18 + bucketCount * 16 + 18 + 18 + 18 + 18 + 18 + 18
      : 45 + 18 + 18 + 18 + 18 + 18 + 18;

    const col1W = PAGE_WIDTH * (45 / TOTAL_EXCEL_W);
    const col2W = PAGE_WIDTH * (18 / TOTAL_EXCEL_W);
    const bucketWs = buckets.map(() => PAGE_WIDTH * (16 / TOTAL_EXCEL_W));
    const colPairW = PAGE_WIDTH * (18 / TOTAL_EXCEL_W); // width for each pending/advance col

    const col1X = PAGE_LEFT;
    const col2X = col1X + col1W;

    const bucketXs: number[] = [];
    let bx = col2X + (hasAgeing ? col2W : 0);
    buckets.forEach((_, i) => {
      bucketXs.push(bx);
      bx += bucketWs[i];
    });

    const openingPendingX = hasAgeing ? bx : col2X;
    const openingAdvanceX = openingPendingX + colPairW;
    const periodPendingX = openingAdvanceX + colPairW;
    const periodAdvanceX = periodPendingX + colPairW;
    const closingPendingX = periodAdvanceX + colPairW;
    const closingAdvanceX = closingPendingX + colPairW;
    const rightEdge = closingAdvanceX + colPairW;
    const TOTAL_W = rightEdge - PAGE_LEFT;

    const ROW_H = 18;
    const FONT_SIZE = hasAgeing ? 5 : 7;

    const getRowHeight = (text: string, width: number) => {
      const h = doc.heightOfString(String(text ?? ""), {
        width: width - 6,
        align: "left",
      });

      return Math.max(18, h + 8);
    };

    let y = 30;

    const fmtAmt = (value: number | string | null | undefined): string => {
      if (value === null || value === undefined || value === "") return "";
      const num = Number(value);
      if (isNaN(num) || num === 0) return "";
      return num.toFixed(2);
    };

    const drawHLine = (x: number, yw: number, w: number) => {
      doc
        .moveTo(x, yw)
        .lineTo(x + w, yw)
        .stroke("#000000");
    };

    const drawVLine = (xv: number, yt: number, h: number) => {
      doc
        .moveTo(xv, yt)
        .lineTo(xv, yt + h)
        .stroke("#000000");
    };

    const writeCell = (
      text: string,
      x: number,
      yt: number,
      w: number,
      h: number,
      opts: {
        bold?: boolean;
        italic?: boolean;
        align?: "left" | "right" | "center";
        fontSize?: number;
        indent?: number;
      } = {},
    ) => {
      const xOffset = opts.indent ?? 3;
      doc
        .font(opts.bold ? FONT_BOLD : opts.italic ? FONT_ITALIC : FONT_NORMAL)
        .fontSize(opts.fontSize ?? FONT_SIZE)
        .fillColor("#000000")
        .text(String(text ?? ""), x + xOffset, yt + 4, {
          width: w - xOffset - 4,
          align: opts.align ?? "left",
        });
    };

    const drawRowBorders = (rowY: number, h: number = ROW_H) => {
      drawVLine(col1X, rowY, h);
      drawVLine(col2X, rowY, h);
      if (hasAgeing) {
        drawVLine(col2X + col2W, rowY, h);
        bucketXs.forEach((bxPos, i) => {
          drawVLine(bxPos, rowY, h);
          if (i === bucketXs.length - 1) {
            drawVLine(bxPos + bucketWs[i], rowY, h);
          }
        });
      }
      drawVLine(openingPendingX, rowY, h);
      drawVLine(openingAdvanceX, rowY, h);
      drawVLine(periodPendingX, rowY, h);
      drawVLine(periodAdvanceX, rowY, h);
      drawVLine(closingPendingX, rowY, h);
      drawVLine(closingAdvanceX, rowY, h);
      drawVLine(rightEdge, rowY, h);
    };

    // ── Draw table headers ──
    const drawHeaders = () => {
      // Group header row
      drawHLine(col1X, y, TOTAL_W);
      drawVLine(col1X, y, ROW_H);
      drawVLine(col2X, y, ROW_H);
      drawVLine(rightEdge, y, ROW_H);

      if (hasAgeing) {
        drawVLine(col2X + col2W, y, ROW_H);
        const ageingSpanW =
          bucketXs.length > 0
            ? bucketXs[bucketXs.length - 1] +
              bucketWs[bucketWs.length - 1] -
              (col2X + col2W)
            : 0;
        writeCell("Ageing", col2X + col2W, y, ageingSpanW, ROW_H, {
          bold: true,
          align: "center",
        });
        drawVLine(col2X + col2W + ageingSpanW, y, ROW_H);
        drawHLine(col2X + col2W, y + ROW_H, ageingSpanW);
      }

      // Opening Balance span
      const openingSpanW = colPairW * 2;
      writeCell("Opening Balance", openingPendingX, y, openingSpanW, ROW_H, {
        bold: true,
        align: "center",
      });
      drawVLine(openingPendingX, y, ROW_H);
      drawHLine(openingPendingX, y + ROW_H, openingSpanW);

      // Period Transaction span
      const periodSpanW = colPairW * 2;
      writeCell("Period Transaction", periodPendingX, y, periodSpanW, ROW_H, {
        bold: true,
        align: "center",
      });
      drawVLine(periodPendingX, y, ROW_H);
      drawHLine(periodPendingX, y + ROW_H, periodSpanW);

      // Closing Balance span
      const closingSpanW = colPairW * 2;
      writeCell("Closing Balance", closingPendingX, y, closingSpanW, ROW_H, {
        bold: true,
        align: "center",
      });
      drawVLine(closingPendingX, y, ROW_H);
      drawHLine(closingPendingX, y + ROW_H, closingSpanW);
      y += ROW_H;

      // Column labels row
      drawRowBorders(y);
      writeCell("PARTICULARS", col1X, y, col1W, ROW_H, {
        bold: true,
        align: "center",
      });

      if (hasAgeing) {
        writeCell("PENDING AMOUNT", col2X, y, col2W, ROW_H, {
          bold: true,
          align: "center",
        });
        buckets.forEach((b, i) => {
          const label =
            b.to === 0 ? `> ${b.from} DAYS` : `${b.from} TO ${b.to} DAYS`;
          writeCell(label, bucketXs[i], y, bucketWs[i], ROW_H, {
            bold: true,
            align: "center",
          });
        });
      }

      writeCell("PENDING", openingPendingX, y, colPairW, ROW_H, {
        bold: true,
        align: "center",
      });
      writeCell("ADVANCE", openingAdvanceX, y, colPairW, ROW_H, {
        bold: true,
        align: "center",
      });
      writeCell("PENDING", periodPendingX, y, colPairW, ROW_H, {
        bold: true,
        align: "center",
      });
      writeCell("ADVANCE", periodAdvanceX, y, colPairW, ROW_H, {
        bold: true,
        align: "center",
      });
      writeCell("PENDING", closingPendingX, y, colPairW, ROW_H, {
        bold: true,
        align: "center",
      });
      writeCell("ADVANCE", closingAdvanceX, y, colPairW, ROW_H, {
        bold: true,
        align: "center",
      });

      drawHLine(col1X, y + ROW_H, TOTAL_W);
      y += ROW_H;
    };

    const checkPageBreak = () => {
      if (y + ROW_H > PAGE_BOTTOM) {
        drawHLine(col1X, y, TOTAL_W);
        doc.addPage();
        y = 30;
        drawHeaders();
      }
    };

    // ── TITLE ──
    const titleH = ROW_H + 4;
    drawVLine(col1X, y, titleH);
    drawVLine(rightEdge, y, titleH);
    drawHLine(col1X, y, TOTAL_W);
    writeCell("Receivable Summary", col1X, y, TOTAL_W, titleH, {
      bold: true,
      fontSize: 16,
      align: "center",
    });
    y += titleH;

    // ── DATE ──
    drawVLine(col1X, y, ROW_H);
    drawVLine(rightEdge, y, ROW_H);
    writeCell(
      `(${dayjs(input.fromDate).format("MMM D, YYYY")} – ${dayjs(
        input.toDate,
      ).format("MMM D, YYYY")})`,
      col1X,
      y,
      TOTAL_W,
      ROW_H,
      { fontSize: 10, align: "center" },
    );
    y += ROW_H;

    // ── Initial headers ──
    drawHeaders();

    // ── Ageing lookup ──
    const ageingMap = new Map<
      number,
      {
        ledger: { id: number; value: string };
        pending: number;
        bucketAmounts: { from: number; to: number; amount: number }[];
      }
    >();
    if (hasAgeing && ageing) {
      ageing.rows.forEach((r) => ageingMap.set(r.ledger.id, r));
    }

    // ── Helper: write a full data row ──
    const writeDataRow = (
      label: string,
      pendingAmt: number | string,
      bucketAmounts: (number | string)[],
      openingPending: number | string,
      openingAdvance: number | string,
      periodPending: number | string,
      periodAdvance: number | string,
      closingPending: number | string,
      closingAdvance: number | string,
      opts: { bold?: boolean; italic?: boolean; indent?: number } = {},
    ) => {
      checkPageBreak();
      const rowHeight = getRowHeight(label, col1W);

      drawRowBorders(y, rowHeight);
      writeCell(label, col1X, y, col1W, rowHeight, {
        bold: opts.bold,
        italic: opts.italic,
        indent: opts.indent ?? 3,
      });

      if (hasAgeing) {
        writeCell(fmtAmt(pendingAmt), col2X, y, col2W, rowHeight, {
          bold: opts.bold,
          align: "right",
        });
        buckets.forEach((_, i) => {
          writeCell(
            fmtAmt(bucketAmounts[i] ?? ""),
            bucketXs[i],
            y,
            bucketWs[i],
            rowHeight,
            { align: "right" },
          );
        });
      }

      writeCell(
        fmtAmt(openingPending),
        openingPendingX,
        y,
        colPairW,
        rowHeight,
        { bold: opts.bold, align: "right" },
      );
      writeCell(
        fmtAmt(openingAdvance),
        openingAdvanceX,
        y,
        colPairW,
        rowHeight,
        { bold: opts.bold, align: "right" },
      );
      writeCell(fmtAmt(periodPending), periodPendingX, y, colPairW, rowHeight, {
        bold: opts.bold,
        align: "right",
      });
      writeCell(fmtAmt(periodAdvance), periodAdvanceX, y, colPairW, rowHeight, {
        bold: opts.bold,
        align: "right",
      });
      writeCell(
        fmtAmt(closingPending),
        closingPendingX,
        y,
        colPairW,
        rowHeight,
        { bold: opts.bold, align: "right" },
      );
      writeCell(
        fmtAmt(closingAdvance),
        closingAdvanceX,
        y,
        colPairW,
        rowHeight,
        { bold: opts.bold, align: "right" },
      );
      y += rowHeight;
    };

    // ── DATA ROWS ──
    roots.forEach((root, rootIndex) => {
      if (rootIndex > 0) {
        checkPageBreak();
        drawHLine(col1X, y, TOTAL_W);
      }

      root.ledger?.forEach((l) => {
        const ageingRow = hasAgeing ? ageingMap.get(l.ledger?.id ?? -1) : null;
        const lPA = getPendingAdvance(
          l.closing?.dr ?? 0,
          l.closing?.cr ?? 0,
          "receivable",
        );
        const OPA = getPendingAdvance(
          l.opening?.dr ?? 0,
          l.opening?.cr ?? 0,
          "receivable",
        );
        const PPA = getPendingAdvance(
          l.period?.dr ?? 0,
          l.period?.cr ?? 0,
          "receivable",
        );
        const bAmounts = buckets.map((b) => {
          const bucket = ageingRow?.bucketAmounts.find(
            (ba) => ba.from === b.from && ba.to === b.to,
          );
          const amt = bucket?.amount ?? 0;
          return amt > 0 ? amt : "";
        });
        writeDataRow(
          l.ledger?.value ?? "",
          ageingRow?.pending ?? "",
          bAmounts,
          OPA.pending,
          OPA.advance,
          PPA.pending,
          PPA.advance,
          lPA.pending,
          lPA.advance,
          { italic: true },
        );
      });

      root.children?.forEach((child) => {
        const childPA = getPendingAdvance(
          child.closing?.dr ?? 0,
          child.closing?.cr ?? 0,
          "receivable",
        );
        const childOPA = getPendingAdvance(
          child.opening?.dr ?? 0,
          child.opening?.cr ?? 0,
          "receivable",
        );
        const childPPA = getPendingAdvance(
          child.period?.dr ?? 0,
          child.period?.cr ?? 0,
          "receivable",
        );
        writeDataRow(
          child.group?.value ?? "",
          childPA.pending,
          buckets.map(() => ""),
          childOPA.pending,
          childOPA.advance,
          childPPA.pending,
          childPPA.advance,
          childPA.pending,
          childPA.advance,
          { bold: true },
        );

        child.ledger?.forEach((l) => {
          const ageingRow = hasAgeing
            ? ageingMap.get(l.ledger?.id ?? -1)
            : null;
          const lPA = getPendingAdvance(
            l.closing?.dr ?? 0,
            l.closing?.cr ?? 0,
            "receivable",
          );
          const OPA = getPendingAdvance(
            l.opening?.dr ?? 0,
            l.opening?.cr ?? 0,
            "receivable",
          );
          const PPA = getPendingAdvance(
            l.period?.dr ?? 0,
            l.period?.cr ?? 0,
            "receivable",
          );
          const bAmounts = buckets.map((b) => {
            const bucket = ageingRow?.bucketAmounts.find(
              (ba) => ba.from === b.from && ba.to === b.to,
            );
            const amt = bucket?.amount ?? 0;
            return amt > 0 ? amt : "";
          });
          writeDataRow(
            l.ledger?.value ?? "",
            ageingRow?.pending ?? "",
            bAmounts,
            OPA.pending,
            OPA.advance,
            PPA.pending,
            PPA.advance,
            lPA.pending,
            lPA.advance,
            { italic: true, indent: 12 },
          );
        });
      });
    });

    // ── SPACER ROW ──
    checkPageBreak();
    drawRowBorders(y);
    y += ROW_H;

    // ── TOTAL ROW ──
    checkPageBreak();
    drawHLine(col1X, y, TOTAL_W);
    drawRowBorders(y);

    const TPA = getPendingAdvance(
      totals.closingDr ?? 0,
      totals.closingCr ?? 0,
      "receivable",
    );
    const TOPA = getPendingAdvance(
      totals.openingDr ?? 0,
      totals.openingCr ?? 0,
      "receivable",
    );
    const TPPA = getPendingAdvance(
      totals.periodDr ?? 0,
      totals.periodCr ?? 0,
      "receivable",
    );

    writeCell("Grand Total", col1X, y, col1W, ROW_H, { bold: true });

    if (hasAgeing && ageing) {
      writeCell(fmtAmt(ageing.totals.pending), col2X, y, col2W, ROW_H, {
        bold: true,
        align: "right",
      });
      buckets.forEach((b, i) => {
        const bucket = ageing.totals.bucketAmounts.find(
          (ba) => ba.from === b.from && ba.to === b.to,
        );
        const amt = bucket?.amount ?? 0;
        writeCell(
          amt > 0 ? fmtAmt(amt) : "",
          bucketXs[i],
          y,
          bucketWs[i],
          ROW_H,
          { bold: true, align: "right" },
        );
      });
    }

    writeCell(fmtAmt(TOPA.pending), openingPendingX, y, colPairW, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell(fmtAmt(TOPA.advance), openingAdvanceX, y, colPairW, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell(fmtAmt(TPPA.pending), periodPendingX, y, colPairW, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell(fmtAmt(TPPA.advance), periodAdvanceX, y, colPairW, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell(fmtAmt(TPA.pending), closingPendingX, y, colPairW, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell(fmtAmt(TPA.advance), closingAdvanceX, y, colPairW, ROW_H, {
      bold: true,
      align: "right",
    });

    drawHLine(col1X, y + ROW_H, TOTAL_W);
    y += ROW_H;

    doc.end();

    return new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });
  },

  async buildPdfForPayableSummary(
    input: ReportCommonRequestInput,
  ): Promise<Buffer> {
    logger.info("entering::buildPdfForPayableSummary::service");

    const { roots, totals, ageing } = await this.getPayableSummary(input);

    const hasAgeing = !!ageing;
    const buckets = hasAgeing ? ageing.bucketDefinitions : [];
    const bucketCount = buckets.length;

    const doc = new PDFDocument({
      margin: 30,
      size: "A4",
      layout: hasAgeing ? "landscape" : "portrait",
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    const FONT_NORMAL = "Helvetica";
    const FONT_BOLD = "Helvetica-Bold";
    const FONT_ITALIC = "Helvetica-Oblique";

    const PAGE_LEFT = 30;
    const PAGE_WIDTH = doc.page.width - 60;
    const PAGE_BOTTOM = doc.page.height - 30;

    const TOTAL_EXCEL_W = hasAgeing
      ? 45 + 18 + bucketCount * 16 + 18 + 18 + 18 + 18 + 18 + 18
      : 45 + 18 + 18 + 18 + 18 + 18 + 18;

    const col1W = PAGE_WIDTH * (45 / TOTAL_EXCEL_W);
    const col2W = PAGE_WIDTH * (18 / TOTAL_EXCEL_W);
    const bucketWs = buckets.map(() => PAGE_WIDTH * (16 / TOTAL_EXCEL_W));
    const colPairW = PAGE_WIDTH * (18 / TOTAL_EXCEL_W);

    const col1X = PAGE_LEFT;
    const col2X = col1X + col1W;

    const bucketXs: number[] = [];
    let bx = col2X + (hasAgeing ? col2W : 0);
    buckets.forEach((_, i) => {
      bucketXs.push(bx);
      bx += bucketWs[i];
    });

    const openingPendingX = hasAgeing ? bx : col2X;
    const openingAdvanceX = openingPendingX + colPairW;
    const periodPendingX = openingAdvanceX + colPairW;
    const periodAdvanceX = periodPendingX + colPairW;
    const closingPendingX = periodAdvanceX + colPairW;
    const closingAdvanceX = closingPendingX + colPairW;
    const rightEdge = closingAdvanceX + colPairW;
    const TOTAL_W = rightEdge - PAGE_LEFT;

    const ROW_H = 18;
    const FONT_SIZE = hasAgeing ? 5 : 7;

    const getRowHeight = (text: string, width: number) => {
      const h = doc.heightOfString(String(text ?? ""), {
        width: width - 6,
        align: "left",
      });

      return Math.max(18, h + 8);
    };

    let y = 30;

    const fmtAmt = (value: number | string | null | undefined): string => {
      if (value === null || value === undefined || value === "") return "";
      const num = Number(value);
      if (isNaN(num) || num === 0) return "";
      return num.toFixed(2);
    };

    const drawHLine = (x: number, yw: number, w: number) => {
      doc
        .moveTo(x, yw)
        .lineTo(x + w, yw)
        .stroke("#000000");
    };

    const drawVLine = (xv: number, yt: number, h: number) => {
      doc
        .moveTo(xv, yt)
        .lineTo(xv, yt + h)
        .stroke("#000000");
    };

    const writeCell = (
      text: string,
      x: number,
      yt: number,
      w: number,
      h: number,
      opts: {
        bold?: boolean;
        italic?: boolean;
        align?: "left" | "right" | "center";
        fontSize?: number;
        indent?: number;
      } = {},
    ) => {
      const xOffset = opts.indent ?? 3;
      doc
        .font(opts.bold ? FONT_BOLD : opts.italic ? FONT_ITALIC : FONT_NORMAL)
        .fontSize(opts.fontSize ?? FONT_SIZE)
        .fillColor("#000000")
        .text(String(text ?? ""), x + xOffset, yt + 4, {
          width: w - xOffset - 4,
          align: opts.align ?? "left",
        });
    };

    const drawRowBorders = (rowY: number, h: number = ROW_H) => {
      drawVLine(col1X, rowY, h);
      drawVLine(col2X, rowY, h);
      if (hasAgeing) {
        drawVLine(col2X + col2W, rowY, h);
        bucketXs.forEach((bxPos, i) => {
          drawVLine(bxPos, rowY, h);
          if (i === bucketXs.length - 1) {
            drawVLine(bxPos + bucketWs[i], rowY, h);
          }
        });
      }
      drawVLine(openingPendingX, rowY, h);
      drawVLine(openingAdvanceX, rowY, h);
      drawVLine(periodPendingX, rowY, h);
      drawVLine(periodAdvanceX, rowY, h);
      drawVLine(closingPendingX, rowY, h);
      drawVLine(closingAdvanceX, rowY, h);
      drawVLine(rightEdge, rowY, h);
    };

    // ── Draw table headers ──
    const drawHeaders = () => {
      drawHLine(col1X, y, TOTAL_W);
      drawVLine(col1X, y, ROW_H);
      drawVLine(col2X, y, ROW_H);
      drawVLine(rightEdge, y, ROW_H);

      if (hasAgeing) {
        drawVLine(col2X + col2W, y, ROW_H);
        const ageingSpanW =
          bucketXs.length > 0
            ? bucketXs[bucketXs.length - 1] +
              bucketWs[bucketWs.length - 1] -
              (col2X + col2W)
            : 0;
        writeCell("Ageing", col2X + col2W, y, ageingSpanW, ROW_H, {
          bold: true,
          align: "center",
        });
        drawVLine(col2X + col2W + ageingSpanW, y, ROW_H);
        drawHLine(col2X + col2W, y + ROW_H, ageingSpanW);
      }

      // Opening Balance span
      const openingSpanW = colPairW * 2;
      writeCell("Opening Balance", openingPendingX, y, openingSpanW, ROW_H, {
        bold: true,
        align: "center",
      });
      drawVLine(openingPendingX, y, ROW_H);
      drawHLine(openingPendingX, y + ROW_H, openingSpanW);

      // Period Transaction span
      const periodSpanW = colPairW * 2;
      writeCell("Period Transaction", periodPendingX, y, periodSpanW, ROW_H, {
        bold: true,
        align: "center",
      });
      drawVLine(periodPendingX, y, ROW_H);
      drawHLine(periodPendingX, y + ROW_H, periodSpanW);

      // Closing Balance span
      const closingSpanW = colPairW * 2;
      writeCell("Closing Balance", closingPendingX, y, closingSpanW, ROW_H, {
        bold: true,
        align: "center",
      });
      drawVLine(closingPendingX, y, ROW_H);
      drawHLine(closingPendingX, y + ROW_H, closingSpanW);
      y += ROW_H;

      // Column labels row
      drawRowBorders(y);
      writeCell("PARTICULARS", col1X, y, col1W, ROW_H, {
        bold: true,
        align: "center",
      });

      if (hasAgeing) {
        writeCell("PENDING AMOUNT", col2X, y, col2W, ROW_H, {
          bold: true,
          align: "center",
        });
        buckets.forEach((b, i) => {
          const label =
            b.to === 0 ? `> ${b.from} DAYS` : `${b.from} TO ${b.to} DAYS`;
          writeCell(label, bucketXs[i], y, bucketWs[i], ROW_H, {
            bold: true,
            align: "center",
          });
        });
      }

      writeCell("PENDING", openingPendingX, y, colPairW, ROW_H, {
        bold: true,
        align: "center",
      });
      writeCell("ADVANCE", openingAdvanceX, y, colPairW, ROW_H, {
        bold: true,
        align: "center",
      });
      writeCell("PENDING", periodPendingX, y, colPairW, ROW_H, {
        bold: true,
        align: "center",
      });
      writeCell("ADVANCE", periodAdvanceX, y, colPairW, ROW_H, {
        bold: true,
        align: "center",
      });
      writeCell("PENDING", closingPendingX, y, colPairW, ROW_H, {
        bold: true,
        align: "center",
      });
      writeCell("ADVANCE", closingAdvanceX, y, colPairW, ROW_H, {
        bold: true,
        align: "center",
      });

      drawHLine(col1X, y + ROW_H, TOTAL_W);
      y += ROW_H;
    };

    const checkPageBreak = () => {
      if (y + ROW_H > PAGE_BOTTOM) {
        drawHLine(col1X, y, TOTAL_W);
        doc.addPage();
        y = 30;
        drawHeaders();
      }
    };

    // ── TITLE ──
    const titleH = ROW_H + 4;
    drawVLine(col1X, y, titleH);
    drawVLine(rightEdge, y, titleH);
    drawHLine(col1X, y, TOTAL_W);
    writeCell("Payable Summary", col1X, y, TOTAL_W, titleH, {
      bold: true,
      fontSize: 16,
      align: "center",
    });
    y += titleH;

    // ── DATE ──
    drawVLine(col1X, y, ROW_H);
    drawVLine(rightEdge, y, ROW_H);
    writeCell(
      `(${dayjs(input.fromDate).format("MMM D, YYYY")} – ${dayjs(
        input.toDate,
      ).format("MMM D, YYYY")})`,
      col1X,
      y,
      TOTAL_W,
      ROW_H,
      { fontSize: 10, align: "center" },
    );
    y += ROW_H;

    // ── Initial headers ──
    drawHeaders();

    // ── Ageing lookup ──
    const ageingMap = new Map<
      number,
      {
        ledger: { id: number; value: string };
        pending: number;
        bucketAmounts: { from: number; to: number; amount: number }[];
      }
    >();
    if (hasAgeing && ageing) {
      ageing.rows.forEach((r) => ageingMap.set(r.ledger.id, r));
    }

    // ── Helper: write a full data row ──
    const writeDataRow = (
      label: string,
      pendingAmt: number | string,
      bucketAmounts: (number | string)[],
      openingPending: number | string,
      openingAdvance: number | string,
      periodPending: number | string,
      periodAdvance: number | string,
      closingPending: number | string,
      closingAdvance: number | string,
      opts: { bold?: boolean; italic?: boolean; indent?: number } = {},
    ) => {
      checkPageBreak();
      const rowHeight = getRowHeight(label, col1W);
      drawRowBorders(y, rowHeight);
      writeCell(label, col1X, y, col1W, rowHeight, {
        bold: opts.bold,
        italic: opts.italic,
        indent: opts.indent ?? 3,
      });

      if (hasAgeing) {
        writeCell(fmtAmt(pendingAmt), col2X, y, col2W, rowHeight, {
          bold: opts.bold,
          align: "right",
        });
        buckets.forEach((_, i) => {
          writeCell(
            fmtAmt(bucketAmounts[i] ?? ""),
            bucketXs[i],
            y,
            bucketWs[i],
            rowHeight,
            { align: "right" },
          );
        });
      }

      writeCell(
        fmtAmt(openingPending),
        openingPendingX,
        y,
        colPairW,
        rowHeight,
        { bold: opts.bold, align: "right" },
      );
      writeCell(
        fmtAmt(openingAdvance),
        openingAdvanceX,
        y,
        colPairW,
        rowHeight,
        { bold: opts.bold, align: "right" },
      );
      writeCell(fmtAmt(periodPending), periodPendingX, y, colPairW, rowHeight, {
        bold: opts.bold,
        align: "right",
      });
      writeCell(fmtAmt(periodAdvance), periodAdvanceX, y, colPairW, rowHeight, {
        bold: opts.bold,
        align: "right",
      });
      writeCell(
        fmtAmt(closingPending),
        closingPendingX,
        y,
        colPairW,
        rowHeight,
        { bold: opts.bold, align: "right" },
      );
      writeCell(
        fmtAmt(closingAdvance),
        closingAdvanceX,
        y,
        colPairW,
        rowHeight,
        { bold: opts.bold, align: "right" },
      );
      y += rowHeight;
    };

    // ── DATA ROWS ──
    roots.forEach((root, rootIndex) => {
      if (rootIndex > 0) {
        checkPageBreak();
        drawHLine(col1X, y, TOTAL_W);
      }

      root.ledger?.forEach((l) => {
        const ageingRow = hasAgeing ? ageingMap.get(l.ledger?.id ?? -1) : null;
        const IPA = getPendingAdvance(
          l.closing?.dr ?? 0,
          l.closing?.cr ?? 0,
          "payable",
        );
        const OPA = getPendingAdvance(
          l.opening?.dr ?? 0,
          l.opening?.cr ?? 0,
          "payable",
        );
        const PPA = getPendingAdvance(
          l.period?.dr ?? 0,
          l.period?.cr ?? 0,
          "payable",
        );
        const bAmounts = buckets.map((b) => {
          const bucket = ageingRow?.bucketAmounts.find(
            (ba) => ba.from === b.from && ba.to === b.to,
          );
          const amt = bucket?.amount ?? 0;
          return amt > 0 ? amt : "";
        });
        writeDataRow(
          l.ledger?.value ?? "",
          ageingRow?.pending ?? "",
          bAmounts,
          OPA.pending,
          OPA.advance,
          PPA.pending,
          PPA.advance,
          IPA.pending,
          IPA.advance,
          { italic: true },
        );
      });

      root.children?.forEach((child) => {
        const CPA = getPendingAdvance(
          child.closing?.dr ?? 0,
          child.closing?.cr ?? 0,
          "payable",
        );
        const COPA = getPendingAdvance(
          child.opening?.dr ?? 0,
          child.opening?.cr ?? 0,
          "payable",
        );
        const CPPA = getPendingAdvance(
          child.period?.dr ?? 0,
          child.period?.cr ?? 0,
          "payable",
        );
        writeDataRow(
          child.group?.value ?? "",
          CPA.pending,
          buckets.map(() => ""),
          COPA.pending,
          COPA.advance,
          CPPA.pending,
          CPPA.advance,
          CPA.pending,
          CPA.advance,
          { bold: true },
        );

        child.ledger?.forEach((l) => {
          const ageingRow = hasAgeing
            ? ageingMap.get(l.ledger?.id ?? -1)
            : null;
          const lPA = getPendingAdvance(
            l.closing?.dr ?? 0,
            l.closing?.cr ?? 0,
            "payable",
          );
          const OPA = getPendingAdvance(
            l.opening?.dr ?? 0,
            l.opening?.cr ?? 0,
            "payable",
          );
          const PPA = getPendingAdvance(
            l.period?.dr ?? 0,
            l.period?.cr ?? 0,
            "payable",
          );
          const bAmounts = buckets.map((b) => {
            const bucket = ageingRow?.bucketAmounts.find(
              (ba) => ba.from === b.from && ba.to === b.to,
            );
            const amt = bucket?.amount ?? 0;
            return amt > 0 ? amt : "";
          });
          writeDataRow(
            l.ledger?.value ?? "",
            ageingRow?.pending ?? "",
            bAmounts,
            OPA.pending,
            OPA.advance,
            PPA.pending,
            PPA.advance,
            lPA.pending,
            lPA.advance,
            { italic: true, indent: 12 },
          );
        });
      });
    });

    // ── SPACER ROW ──
    checkPageBreak();
    drawRowBorders(y);
    y += ROW_H;

    // ── TOTAL ROW ──
    checkPageBreak();
    drawHLine(col1X, y, TOTAL_W);
    drawRowBorders(y);

    const TPA = getPendingAdvance(
      totals.closingDr ?? 0,
      totals.closingCr ?? 0,
      "payable",
    );
    const TOPA = getPendingAdvance(
      totals.openingDr ?? 0,
      totals.openingCr ?? 0,
      "payable",
    );
    const TPPA = getPendingAdvance(
      totals.periodDr ?? 0,
      totals.periodCr ?? 0,
      "payable",
    );

    writeCell("Grand Total", col1X, y, col1W, ROW_H, { bold: true });

    if (hasAgeing && ageing) {
      writeCell(fmtAmt(ageing.totals.pending), col2X, y, col2W, ROW_H, {
        bold: true,
        align: "right",
      });
      buckets.forEach((b, i) => {
        const bucket = ageing.totals.bucketAmounts.find(
          (ba) => ba.from === b.from && ba.to === b.to,
        );
        const amt = bucket?.amount ?? 0;
        writeCell(
          amt > 0 ? fmtAmt(amt) : "",
          bucketXs[i],
          y,
          bucketWs[i],
          ROW_H,
          { bold: true, align: "right" },
        );
      });
    }

    writeCell(fmtAmt(TOPA.pending), openingPendingX, y, colPairW, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell(fmtAmt(TOPA.advance), openingAdvanceX, y, colPairW, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell(fmtAmt(TPPA.pending), periodPendingX, y, colPairW, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell(fmtAmt(TPPA.advance), periodAdvanceX, y, colPairW, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell(fmtAmt(TPA.pending), closingPendingX, y, colPairW, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell(fmtAmt(TPA.advance), closingAdvanceX, y, colPairW, ROW_H, {
      bold: true,
      align: "right",
    });

    drawHLine(col1X, y + ROW_H, TOTAL_W);
    y += ROW_H;

    doc.end();

    return new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });
  },

  async buildPdfForProfitLoss(
    input: ReportCommonRequestInput,
  ): Promise<Buffer> {
    logger.info("entering::buildPdfForProfitLoss::service");

    const { expense, income, totals } = await this.getProfitLoss(input);

    const doc = new PDFDocument({ margin: 30, size: "A4", layout: "portrait" });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    const FONT_NORMAL = "Helvetica";
    const FONT_BOLD = "Helvetica-Bold";

    const PAGE_LEFT = 30;
    const PAGE_WIDTH = doc.page.width - 60;
    const PAGE_BOTTOM = doc.page.height - 30;

    const TOTAL_EXCEL_W = 116;
    const col1W = PAGE_WIDTH * (40 / TOTAL_EXCEL_W);
    const col2W = PAGE_WIDTH * (18 / TOTAL_EXCEL_W);
    const col3W = PAGE_WIDTH * (40 / TOTAL_EXCEL_W);
    const col4W = PAGE_WIDTH * (18 / TOTAL_EXCEL_W);

    const col1X = PAGE_LEFT;
    const col2X = col1X + col1W;
    const col3X = col2X + col2W;
    const col4X = col3X + col3W;

    const TOTAL_W = col1W + col2W + col3W + col4W;

    const ROW_H = 20;
    const FONT_SIZE = 9;

    let y = 30;

    const fmtAmt = (value: number | string | null | undefined): string => {
      if (value === null || value === undefined || value === "") return "";
      const num = Number(value);
      if (isNaN(num) || num === 0) return "";
      return num.toFixed(2);
    };

    const drawHLine = (x: number, yw: number, w: number) => {
      doc
        .moveTo(x, yw)
        .lineTo(x + w, yw)
        .stroke("#000000");
    };

    const drawVLine = (xv: number, yt: number, h: number) => {
      doc
        .moveTo(xv, yt)
        .lineTo(xv, yt + h)
        .stroke("#000000");
    };

    const writeCell = (
      text: string,
      x: number,
      yt: number,
      w: number,
      h: number,
      opts: {
        bold?: boolean;
        align?: "left" | "right" | "center";
        fontSize?: number;
        indent?: number;
      } = {},
    ) => {
      const xOffset = opts.indent ?? 3;
      doc
        .font(opts.bold ? FONT_BOLD : FONT_NORMAL)
        .fontSize(opts.fontSize ?? FONT_SIZE)
        .fillColor("#000000")
        .text(String(text ?? ""), x + xOffset, yt + 5, {
          width: w - xOffset - 3,
          height: h - 5,
          align: opts.align ?? "left",
          ellipsis: true,
          lineBreak: false,
        });
    };

    const drawRowBorders = (rowY: number, h: number = ROW_H) => {
      drawVLine(col1X, rowY, h);
      drawVLine(col2X, rowY, h);
      drawVLine(col3X, rowY, h);
      drawVLine(col4X, rowY, h);
      drawVLine(col4X + col4W, rowY, h);
    };

    // ── Draw table headers ──
    const drawHeaders = () => {
      drawHLine(col1X, y, TOTAL_W);
      drawRowBorders(y);

      writeCell("PARTICULARS", col1X, y, col1W, ROW_H, {
        bold: true,
        align: "center",
      });
      writeCell("AMOUNT", col2X, y, col2W, ROW_H, {
        bold: true,
        align: "center",
      });
      writeCell("PARTICULARS", col3X, y, col3W, ROW_H, {
        bold: true,
        align: "center",
      });
      writeCell("AMOUNT", col4X, y, col4W, ROW_H, {
        bold: true,
        align: "center",
      });

      drawHLine(col1X, y + ROW_H, TOTAL_W);
      y += ROW_H;
    };

    const checkPageBreak = () => {
      if (y + ROW_H > PAGE_BOTTOM) {
        drawHLine(col1X, y, TOTAL_W);
        doc.addPage();
        y = 30;
        drawHeaders();
      }
    };

    // ── Build display lines ──
    const gross = totals.grossProfit ?? 0;
    const net = totals.netProfit ?? 0;

    const expenseNet = (dr: number, cr: number) => dr - cr;
    const incomeNet = (dr: number, cr: number) => cr - dr;

    type DisplayLine = {
      label: string;
      amount: number | string;
      bold: boolean;
      isSubtotal: boolean;
      isEmpty: boolean;
    };

    const leftLines: DisplayLine[] = [];
    const rightLines: DisplayLine[] = [];

    if (gross >= 0) {
      expense
        .filter((n) => n.group?.affectsGrossProfit === true)
        .forEach((node) => {
          leftLines.push({
            label: node.group?.name ?? "",
            amount: expenseNet(node.amount?.dr ?? 0, node.amount?.cr ?? 0),
            bold: false,
            isSubtotal: false,
            isEmpty: false,
          });
          node.children?.forEach((child) => {
            leftLines.push({
              label: `  ${child.group?.name ?? ""}`,
              amount: expenseNet(child.amount?.dr ?? 0, child.amount?.cr ?? 0),
              bold: false,
              isSubtotal: false,
              isEmpty: false,
            });
          });
        });
      if (gross > 0)
        leftLines.push({
          label: "Gross Profit c/o",
          amount: gross,
          bold: true,
          isSubtotal: false,
          isEmpty: false,
        });

      const leftBeforeSubtotal = leftLines.length;

      income
        .filter((n) => n.group?.affectsGrossProfit === true)
        .forEach((node) => {
          rightLines.push({
            label: node.group?.name ?? "",
            amount: incomeNet(node.amount?.dr ?? 0, node.amount?.cr ?? 0),
            bold: false,
            isSubtotal: false,
            isEmpty: false,
          });
          node.children?.forEach((child) => {
            rightLines.push({
              label: `  ${child.group?.name ?? ""}`,
              amount: incomeNet(child.amount?.dr ?? 0, child.amount?.cr ?? 0),
              bold: false,
              isSubtotal: false,
              isEmpty: false,
            });
          });
        });

      const rightBeforeSubtotal = rightLines.length;
      const maxBefore = Math.max(leftBeforeSubtotal, rightBeforeSubtotal);
      for (let i = leftBeforeSubtotal; i < maxBefore; i++)
        leftLines.push({
          label: "",
          amount: "",
          bold: false,
          isSubtotal: false,
          isEmpty: true,
        });
      for (let i = rightBeforeSubtotal; i < maxBefore; i++)
        rightLines.push({
          label: "",
          amount: "",
          bold: false,
          isSubtotal: false,
          isEmpty: true,
        });

      leftLines.push({
        label: "",
        amount: (totals.directExpense ?? 0) + gross || "",
        bold: true,
        isSubtotal: true,
        isEmpty: false,
      });
      rightLines.push({
        label: "",
        amount: (totals.directIncome ?? 0) || "",
        bold: true,
        isSubtotal: true,
        isEmpty: false,
      });

      expense
        .filter((n) => n.group?.affectsGrossProfit === false)
        .forEach((node) => {
          leftLines.push({
            label: node.group?.name ?? "",
            amount: expenseNet(node.amount?.dr ?? 0, node.amount?.cr ?? 0),
            bold: false,
            isSubtotal: false,
            isEmpty: false,
          });
          node.children?.forEach((child) => {
            leftLines.push({
              label: `  ${child.group?.name ?? ""}`,
              amount: expenseNet(child.amount?.dr ?? 0, child.amount?.cr ?? 0),
              bold: false,
              isSubtotal: false,
              isEmpty: false,
            });
          });
        });
      if (net > 0)
        leftLines.push({
          label: "Net Profit",
          amount: net,
          bold: true,
          isSubtotal: false,
          isEmpty: false,
        });

      if (gross > 0)
        rightLines.push({
          label: "Gross Profit b/f",
          amount: gross,
          bold: true,
          isSubtotal: false,
          isEmpty: false,
        });
      income
        .filter((n) => n.group?.affectsGrossProfit === false)
        .forEach((node) => {
          rightLines.push({
            label: node.group?.name ?? "",
            amount: incomeNet(node.amount?.dr ?? 0, node.amount?.cr ?? 0),
            bold: false,
            isSubtotal: false,
            isEmpty: false,
          });
          node.children?.forEach((child) => {
            rightLines.push({
              label: `  ${child.group?.name ?? ""}`,
              amount: incomeNet(child.amount?.dr ?? 0, child.amount?.cr ?? 0),
              bold: false,
              isSubtotal: false,
              isEmpty: false,
            });
          });
        });
    } else {
      const absGross = Math.abs(gross);

      expense
        .filter((n) => n.group?.affectsGrossProfit === true)
        .forEach((node) => {
          leftLines.push({
            label: node.group?.name ?? "",
            amount: expenseNet(node.amount?.dr ?? 0, node.amount?.cr ?? 0),
            bold: false,
            isSubtotal: false,
            isEmpty: false,
          });
          node.children?.forEach((child) => {
            leftLines.push({
              label: `  ${child.group?.name ?? ""}`,
              amount: expenseNet(child.amount?.dr ?? 0, child.amount?.cr ?? 0),
              bold: false,
              isSubtotal: false,
              isEmpty: false,
            });
          });
        });

      const leftBeforeSubtotal = leftLines.length;

      income
        .filter((n) => n.group?.affectsGrossProfit === true)
        .forEach((node) => {
          rightLines.push({
            label: node.group?.name ?? "",
            amount: incomeNet(node.amount?.dr ?? 0, node.amount?.cr ?? 0),
            bold: false,
            isSubtotal: false,
            isEmpty: false,
          });
          node.children?.forEach((child) => {
            rightLines.push({
              label: `  ${child.group?.name ?? ""}`,
              amount: incomeNet(child.amount?.dr ?? 0, child.amount?.cr ?? 0),
              bold: false,
              isSubtotal: false,
              isEmpty: false,
            });
          });
        });
      rightLines.push({
        label: "Gross Loss c/o",
        amount: absGross,
        bold: true,
        isSubtotal: false,
        isEmpty: false,
      });

      const rightBeforeSubtotal = rightLines.length;
      const maxBefore = Math.max(leftBeforeSubtotal, rightBeforeSubtotal);
      for (let i = leftBeforeSubtotal; i < maxBefore; i++)
        leftLines.push({
          label: "",
          amount: "",
          bold: false,
          isSubtotal: false,
          isEmpty: true,
        });
      for (let i = rightBeforeSubtotal; i < maxBefore; i++)
        rightLines.push({
          label: "",
          amount: "",
          bold: false,
          isSubtotal: false,
          isEmpty: true,
        });

      leftLines.push({
        label: "",
        amount: (totals.directExpense ?? 0) || "",
        bold: true,
        isSubtotal: true,
        isEmpty: false,
      });
      rightLines.push({
        label: "",
        amount: (totals.directIncome ?? 0) + absGross || "",
        bold: true,
        isSubtotal: true,
        isEmpty: false,
      });

      leftLines.push({
        label: "Gross Loss b/f",
        amount: absGross,
        bold: true,
        isSubtotal: false,
        isEmpty: false,
      });
      expense
        .filter((n) => n.group?.affectsGrossProfit === false)
        .forEach((node) => {
          leftLines.push({
            label: node.group?.name ?? "",
            amount: expenseNet(node.amount?.dr ?? 0, node.amount?.cr ?? 0),
            bold: false,
            isSubtotal: false,
            isEmpty: false,
          });
          node.children?.forEach((child) => {
            leftLines.push({
              label: `  ${child.group?.name ?? ""}`,
              amount: expenseNet(child.amount?.dr ?? 0, child.amount?.cr ?? 0),
              bold: false,
              isSubtotal: false,
              isEmpty: false,
            });
          });
        });

      income
        .filter((n) => n.group?.affectsGrossProfit === false)
        .forEach((node) => {
          rightLines.push({
            label: node.group?.name ?? "",
            amount: incomeNet(node.amount?.dr ?? 0, node.amount?.cr ?? 0),
            bold: false,
            isSubtotal: false,
            isEmpty: false,
          });
          node.children?.forEach((child) => {
            rightLines.push({
              label: `  ${child.group?.name ?? ""}`,
              amount: incomeNet(child.amount?.dr ?? 0, child.amount?.cr ?? 0),
              bold: false,
              isSubtotal: false,
              isEmpty: false,
            });
          });
        });
      if (net < 0)
        rightLines.push({
          label: "Net Loss",
          amount: Math.abs(net),
          bold: true,
          isSubtotal: false,
          isEmpty: false,
        });
    }

    // ── TITLE ──
    const titleH = ROW_H + 4;
    drawVLine(col1X, y, titleH);
    drawVLine(col4X + col4W, y, titleH);
    drawHLine(col1X, y, TOTAL_W);
    writeCell("Profit & Loss Account", col1X, y, TOTAL_W, titleH, {
      bold: true,
      fontSize: 16,
      align: "center",
    });
    y += titleH;

    // ── DATE ──
    drawVLine(col1X, y, ROW_H);
    drawVLine(col4X + col4W, y, ROW_H);
    writeCell(
      `(${dayjs(input.fromDate).format("MMM D, YYYY")} – ${dayjs(
        input.toDate,
      ).format("MMM D, YYYY")})`,
      col1X,
      y,
      TOTAL_W,
      ROW_H,
      { fontSize: 10, align: "center" },
    );
    y += ROW_H;

    // ── Initial headers ──
    drawHeaders();

    // ── DATA ROWS ──
    const subtotalYs: number[] = [];
    const maxRows = Math.max(leftLines.length, rightLines.length);

    for (let i = 0; i < maxRows; i++) {
      checkPageBreak();

      const left = leftLines[i];
      const right = rightLines[i];

      if (left?.isSubtotal || right?.isSubtotal) {
        subtotalYs.push(y);
      }

      drawRowBorders(y);

      if (left && !left.isEmpty) {
        writeCell(left.isSubtotal ? "" : left.label, col1X, y, col1W, ROW_H, {
          bold: left.bold,
        });
        writeCell(
          left.isSubtotal ? fmtAmt(left.amount) : fmtAmt(left.amount),
          col2X,
          y,
          col2W,
          ROW_H,
          {
            bold: left.bold,
            align: "right",
          },
        );
      }

      if (right && !right.isEmpty) {
        writeCell(right.isSubtotal ? "" : right.label, col3X, y, col3W, ROW_H, {
          bold: right.bold,
        });
        writeCell(
          right.isSubtotal ? fmtAmt(right.amount) : fmtAmt(right.amount),
          col4X,
          y,
          col4W,
          ROW_H,
          {
            bold: right.bold,
            align: "right",
          },
        );
      }

      y += ROW_H;
    }

    // ── SPACER ROW ──
    checkPageBreak();
    drawRowBorders(y);
    y += ROW_H;

    // ── TOTAL ROW ──
    let leftTotal = 0;
    let rightTotal = 0;

    if (gross > 0) rightTotal += gross;
    else leftTotal += Math.abs(gross);

    leftTotal += totals.indirectExpense ?? 0;
    rightTotal += totals.indirectIncome ?? 0;

    if (net > 0) leftTotal += net;
    else rightTotal += Math.abs(net);

    checkPageBreak();
    drawHLine(col1X, y, TOTAL_W);
    drawRowBorders(y);

    writeCell("Total", col1X, y, col1W, ROW_H, { bold: true });
    writeCell(fmtAmt(leftTotal), col2X, y, col2W, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell("Total", col3X, y, col3W, ROW_H, { bold: true });
    writeCell(fmtAmt(rightTotal), col4X, y, col4W, ROW_H, {
      bold: true,
      align: "right",
    });

    drawHLine(col1X, y + ROW_H, TOTAL_W);
    y += ROW_H;

    // ── Subtotal top border lines ──
    subtotalYs.forEach((sy) => {
      drawHLine(col2X, sy, col2W);
      drawHLine(col4X, sy, col4W);
    });

    doc.end();

    return new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });
  },

  async buildPdfForCashFlow(input: CashFlowRequestInput): Promise<Buffer> {
    logger.info("entering::buildPdfForCashFlow::service");

    const data: CashFlowResponse = await this.getCashFlow(input);

    const doc = new PDFDocument({ margin: 30, size: "A4", layout: "portrait" });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    const FONT_NORMAL = "Helvetica";
    const FONT_BOLD = "Helvetica-Bold";
    const FONT_ITALIC = "Helvetica-Oblique";

    const PAGE_LEFT = 30;
    const PAGE_WIDTH = doc.page.width - 60;
    const PAGE_BOTTOM = doc.page.height - 30;

    const dateRange = `(${dayjs(input.fromDate).format(
      "MMM D, YYYY",
    )} – ${dayjs(input.toDate).format("MMM D, YYYY")})`;

    const ROW_H = 20;
    const FONT_SIZE = 9;

    let y = 30;

    const fmtAmt = (value: number | string | null | undefined): string => {
      if (value === null || value === undefined || value === "") return "";
      const num = Number(value);
      if (isNaN(num) || num === 0) return "";
      return num.toFixed(2);
    };

    const drawHLine = (x: number, yw: number, w: number) => {
      doc
        .moveTo(x, yw)
        .lineTo(x + w, yw)
        .stroke("#000000");
    };

    const drawVLine = (xv: number, yt: number, h: number) => {
      doc
        .moveTo(xv, yt)
        .lineTo(xv, yt + h)
        .stroke("#000000");
    };

    const writeCell = (
      text: string,
      x: number,
      yt: number,
      w: number,
      h: number,
      opts: {
        bold?: boolean;
        italic?: boolean;
        align?: "left" | "right" | "center";
        fontSize?: number;
        indent?: number;
      } = {},
    ) => {
      const xOffset = opts.indent ?? 3;
      doc
        .font(opts.bold ? FONT_BOLD : opts.italic ? FONT_ITALIC : FONT_NORMAL)
        .fontSize(opts.fontSize ?? FONT_SIZE)
        .fillColor("#000000")
        .text(String(text ?? ""), x + xOffset, yt + 5, {
          width: w - xOffset - 3,
          height: h - 5,
          align: opts.align ?? "left",
          ellipsis: true,
          lineBreak: false,
        });
    };

    // ============================================================
    // 🔷 MONTHLY VIEW
    // ============================================================
    if (data.view === "MONTHLY") {
      const { months, totalInflow, totalOutflow, netFlow } = data;

      const TOTAL_EXCEL_W = 105;
      const col1W = PAGE_WIDTH * (45 / TOTAL_EXCEL_W);
      const col2W = PAGE_WIDTH * (20 / TOTAL_EXCEL_W);
      const col3W = PAGE_WIDTH * (20 / TOTAL_EXCEL_W);
      const col4W = PAGE_WIDTH * (20 / TOTAL_EXCEL_W);

      const col1X = PAGE_LEFT;
      const col2X = col1X + col1W;
      const col3X = col2X + col2W;
      const col4X = col3X + col3W;
      const TOTAL_W = col1W + col2W + col3W + col4W;

      const drawRowBorders = (rowY: number, h: number = ROW_H) => {
        drawVLine(col1X, rowY, h);
        drawVLine(col2X, rowY, h);
        drawVLine(col3X, rowY, h);
        drawVLine(col4X, rowY, h);
        drawVLine(col4X + col4W, rowY, h);
      };

      const drawHeaders = () => {
        // Group header — "Cash Movement" spans col2-col4
        drawHLine(col1X, y, TOTAL_W);
        drawVLine(col1X, y, ROW_H);
        drawVLine(col2X, y, ROW_H);
        drawVLine(col4X + col4W, y, ROW_H);
        writeCell("Cash Movement", col2X, y, col2W + col3W + col4W, ROW_H, {
          bold: true,
          align: "center",
        });
        drawHLine(col2X, y + ROW_H, col2W + col3W + col4W);
        y += ROW_H;

        // Column labels
        drawRowBorders(y);
        writeCell("PARTICULARS", col1X, y, col1W, ROW_H, {
          bold: true,
          align: "center",
        });
        writeCell("INFLOW", col2X, y, col2W, ROW_H, {
          bold: true,
          align: "center",
        });
        writeCell("OUTFLOW", col3X, y, col3W, ROW_H, {
          bold: true,
          align: "center",
        });
        writeCell("NET FLOW", col4X, y, col4W, ROW_H, {
          bold: true,
          align: "center",
        });
        drawHLine(col1X, y + ROW_H, TOTAL_W);
        y += ROW_H;
      };

      const checkPageBreak = () => {
        if (y + ROW_H > PAGE_BOTTOM) {
          drawHLine(col1X, y, TOTAL_W);
          doc.addPage();
          y = 30;
          drawHeaders();
        }
      };

      // Title
      const titleH = ROW_H + 4;
      drawVLine(col1X, y, titleH);
      drawVLine(col4X + col4W, y, titleH);
      drawHLine(col1X, y, TOTAL_W);
      writeCell("Cash Flow", col1X, y, TOTAL_W, titleH, {
        bold: true,
        fontSize: 16,
        align: "center",
      });
      y += titleH;

      // Date
      drawVLine(col1X, y, ROW_H);
      drawVLine(col4X + col4W, y, ROW_H);
      writeCell(dateRange, col1X, y, TOTAL_W, ROW_H, {
        fontSize: 10,
        align: "center",
      });
      y += ROW_H;

      drawHeaders();

      months.forEach((m: CashFlowMonthRow) => {
        checkPageBreak();
        drawRowBorders(y);
        writeCell(m.name, col1X, y, col1W, ROW_H);
        writeCell(fmtAmt(m.amount.inflow), col2X, y, col2W, ROW_H, {
          align: "right",
        });
        writeCell(fmtAmt(m.amount.outflow), col3X, y, col3W, ROW_H, {
          align: "right",
        });
        writeCell(fmtAmt(m.amount.net), col4X, y, col4W, ROW_H, {
          align: "right",
        });
        y += ROW_H;
      });

      checkPageBreak();
      drawRowBorders(y);
      y += ROW_H;

      checkPageBreak();
      drawHLine(col1X, y, TOTAL_W);
      drawRowBorders(y);
      writeCell("Grand Total", col1X, y, col1W, ROW_H, { bold: true });
      writeCell(fmtAmt(totalInflow), col2X, y, col2W, ROW_H, {
        bold: true,
        align: "right",
      });
      writeCell(fmtAmt(totalOutflow), col3X, y, col3W, ROW_H, {
        bold: true,
        align: "right",
      });
      writeCell(fmtAmt(netFlow), col4X, y, col4W, ROW_H, {
        bold: true,
        align: "right",
      });
      drawHLine(col1X, y + ROW_H, TOTAL_W);
      y += ROW_H;
    }

    // ============================================================
    // 🔷 MONTH_DETAIL VIEW
    // ============================================================
    else if (data.view === "MONTH_DETAIL") {
      const { inflows, outflows, totals } = data;

      const TOTAL_EXCEL_W = 116;
      const col1W = PAGE_WIDTH * (40 / TOTAL_EXCEL_W);
      const col2W = PAGE_WIDTH * (18 / TOTAL_EXCEL_W);
      const col3W = PAGE_WIDTH * (40 / TOTAL_EXCEL_W);
      const col4W = PAGE_WIDTH * (18 / TOTAL_EXCEL_W);

      const col1X = PAGE_LEFT;
      const col2X = col1X + col1W;
      const col3X = col2X + col2W;
      const col4X = col3X + col3W;
      const TOTAL_W = col1W + col2W + col3W + col4W;

      const drawRowBorders = (rowY: number, h: number = ROW_H) => {
        drawVLine(col1X, rowY, h);
        drawVLine(col2X, rowY, h);
        drawVLine(col3X, rowY, h);
        drawVLine(col4X, rowY, h);
        drawVLine(col4X + col4W, rowY, h);
      };

      const drawHeaders = () => {
        drawHLine(col1X, y, TOTAL_W);
        drawRowBorders(y);
        writeCell("INFLOW", col1X, y, col1W, ROW_H, {
          bold: true,
          align: "center",
        });
        writeCell("AMOUNT", col2X, y, col2W, ROW_H, {
          bold: true,
          align: "center",
        });
        writeCell("OUTFLOW", col3X, y, col3W, ROW_H, {
          bold: true,
          align: "center",
        });
        writeCell("AMOUNT", col4X, y, col4W, ROW_H, {
          bold: true,
          align: "center",
        });
        drawHLine(col1X, y + ROW_H, TOTAL_W);
        y += ROW_H;
      };

      const checkPageBreak = () => {
        if (y + ROW_H > PAGE_BOTTOM) {
          drawHLine(col1X, y, TOTAL_W);
          doc.addPage();
          y = 30;
          drawHeaders();
        }
      };

      // Title
      const titleH = ROW_H + 4;
      drawVLine(col1X, y, titleH);
      drawVLine(col4X + col4W, y, titleH);
      drawHLine(col1X, y, TOTAL_W);
      writeCell("Cash Flow", col1X, y, TOTAL_W, titleH, {
        bold: true,
        fontSize: 16,
        align: "center",
      });
      y += titleH;

      // Date
      drawVLine(col1X, y, ROW_H);
      drawVLine(col4X + col4W, y, ROW_H);
      writeCell(dateRange, col1X, y, TOTAL_W, ROW_H, {
        fontSize: 10,
        align: "center",
      });
      y += ROW_H;

      drawHeaders();

      type Line = { label: string; amount: number | string; bold: boolean };
      const leftLines: Line[] = [];
      const rightLines: Line[] = [];

      inflows.forEach((node: CashFlowNode) => {
        leftLines.push({
          label: node.group?.value ?? "",
          amount: node.amount.inflow || "",
          bold: false,
        });
      });
      outflows.forEach((node: CashFlowNode) => {
        rightLines.push({
          label: node.group?.value ?? "",
          amount: node.amount.outflow || "",
          bold: false,
        });
      });

      const maxRows = Math.max(leftLines.length, rightLines.length);
      for (let i = 0; i < maxRows; i++) {
        checkPageBreak();
        const left = leftLines[i];
        const right = rightLines[i];
        drawRowBorders(y);
        if (left) {
          writeCell(left.label, col1X, y, col1W, ROW_H, { bold: left.bold });
          writeCell(fmtAmt(left.amount), col2X, y, col2W, ROW_H, {
            bold: left.bold,
            align: "right",
          });
        }
        if (right) {
          writeCell(right.label, col3X, y, col3W, ROW_H, { bold: right.bold });
          writeCell(fmtAmt(right.amount), col4X, y, col4W, ROW_H, {
            bold: right.bold,
            align: "right",
          });
        }
        y += ROW_H;
      }

      checkPageBreak();
      drawRowBorders(y);
      y += ROW_H;

      checkPageBreak();
      drawHLine(col1X, y, TOTAL_W);
      drawRowBorders(y);
      writeCell("Total Inflow", col1X, y, col1W, ROW_H, { bold: true });
      writeCell(fmtAmt(totals.inflow), col2X, y, col2W, ROW_H, {
        bold: true,
        align: "right",
      });
      writeCell("Total Outflow", col3X, y, col3W, ROW_H, { bold: true });
      writeCell(fmtAmt(totals.outflow), col4X, y, col4W, ROW_H, {
        bold: true,
        align: "right",
      });
      y += ROW_H;

      checkPageBreak();
      drawRowBorders(y);
      writeCell("Net Flow", col3X, y, col3W, ROW_H, { bold: true });
      writeCell(fmtAmt(totals.net), col4X, y, col4W, ROW_H, {
        bold: true,
        align: "right",
      });
      drawHLine(col1X, y + ROW_H, TOTAL_W);
      y += ROW_H;
    }

    // ============================================================
    // 🔷 GROUP_DETAIL VIEW
    // ============================================================
    else if (data.view === "GROUP_DETAIL") {
      const { groupTree, totals } = data;

      const TOTAL_EXCEL_W = 105;
      const col1W = PAGE_WIDTH * (45 / TOTAL_EXCEL_W);
      const col2W = PAGE_WIDTH * (20 / TOTAL_EXCEL_W);
      const col3W = PAGE_WIDTH * (20 / TOTAL_EXCEL_W);
      const col4W = PAGE_WIDTH * (20 / TOTAL_EXCEL_W);

      const col1X = PAGE_LEFT;
      const col2X = col1X + col1W;
      const col3X = col2X + col2W;
      const col4X = col3X + col3W;
      const TOTAL_W = col1W + col2W + col3W + col4W;

      const drawRowBorders = (rowY: number, h: number = ROW_H) => {
        drawVLine(col1X, rowY, h);
        drawVLine(col2X, rowY, h);
        drawVLine(col3X, rowY, h);
        drawVLine(col4X, rowY, h);
        drawVLine(col4X + col4W, rowY, h);
      };

      const drawHeaders = () => {
        drawHLine(col1X, y, TOTAL_W);
        drawVLine(col1X, y, ROW_H);
        drawVLine(col2X, y, ROW_H);
        drawVLine(col4X + col4W, y, ROW_H);
        writeCell("Cash Movement", col2X, y, col2W + col3W + col4W, ROW_H, {
          bold: true,
          align: "center",
        });
        drawHLine(col2X, y + ROW_H, col2W + col3W + col4W);
        y += ROW_H;

        drawRowBorders(y);
        writeCell("PARTICULARS", col1X, y, col1W, ROW_H, {
          bold: true,
          align: "center",
        });
        writeCell("INFLOW", col2X, y, col2W, ROW_H, {
          bold: true,
          align: "center",
        });
        writeCell("OUTFLOW", col3X, y, col3W, ROW_H, {
          bold: true,
          align: "center",
        });
        writeCell("NET FLOW", col4X, y, col4W, ROW_H, {
          bold: true,
          align: "center",
        });
        drawHLine(col1X, y + ROW_H, TOTAL_W);
        y += ROW_H;
      };

      const checkPageBreak = () => {
        if (y + ROW_H > PAGE_BOTTOM) {
          drawHLine(col1X, y, TOTAL_W);
          doc.addPage();
          y = 30;
          drawHeaders();
        }
      };

      // Title
      const titleH = ROW_H + 4;
      drawVLine(col1X, y, titleH);
      drawVLine(col4X + col4W, y, titleH);
      drawHLine(col1X, y, TOTAL_W);
      writeCell(
        `Cash Flow Group Detail for ${groupTree?.group?.value ?? ""}`,
        col1X,
        y,
        TOTAL_W,
        titleH,
        {
          bold: true,
          fontSize: 14,
          align: "center",
        },
      );
      y += titleH;

      // Date
      drawVLine(col1X, y, ROW_H);
      drawVLine(col4X + col4W, y, ROW_H);
      writeCell(dateRange, col1X, y, TOTAL_W, ROW_H, {
        fontSize: 10,
        align: "center",
      });
      y += ROW_H;

      drawHeaders();

      const renderGroupNode = (
        node: CashFlowGroupRecursiveRow,
        indent: number,
      ) => {
        checkPageBreak();
        drawRowBorders(y);
        writeCell(node.group?.value ?? "", col1X, y, col1W, ROW_H, {
          bold: indent === 0,
          indent: 3 + indent * 10,
        });
        writeCell(fmtAmt(node.amount.inflow), col2X, y, col2W, ROW_H, {
          bold: indent === 0,
          align: "right",
        });
        writeCell(fmtAmt(node.amount.outflow), col3X, y, col3W, ROW_H, {
          bold: indent === 0,
          align: "right",
        });
        writeCell(fmtAmt(node.amount.net), col4X, y, col4W, ROW_H, {
          bold: indent === 0,
          align: "right",
        });
        y += ROW_H;

        node.children.forEach((child) => renderGroupNode(child, indent + 1));

        node.ledgers.forEach((ledger: CashFlowLedgerRow) => {
          checkPageBreak();
          drawRowBorders(y);
          writeCell(ledger.ledger?.value ?? "", col1X, y, col1W, ROW_H, {
            italic: true,
            indent: 3 + (indent + 1) * 10,
          });
          writeCell(fmtAmt(ledger.amount.inflow), col2X, y, col2W, ROW_H, {
            align: "right",
          });
          writeCell(fmtAmt(ledger.amount.outflow), col3X, y, col3W, ROW_H, {
            align: "right",
          });
          writeCell(fmtAmt(ledger.amount.net), col4X, y, col4W, ROW_H, {
            align: "right",
          });
          y += ROW_H;
        });
      };

      groupTree?.children.forEach((child) => renderGroupNode(child, 0));

      checkPageBreak();
      drawRowBorders(y);
      y += ROW_H;

      checkPageBreak();
      drawHLine(col1X, y, TOTAL_W);
      drawRowBorders(y);
      writeCell("Grand Total", col1X, y, col1W, ROW_H, { bold: true });
      writeCell(fmtAmt(totals.inflow), col2X, y, col2W, ROW_H, {
        bold: true,
        align: "right",
      });
      writeCell(fmtAmt(totals.outflow), col3X, y, col3W, ROW_H, {
        bold: true,
        align: "right",
      });
      writeCell(fmtAmt(totals.net), col4X, y, col4W, ROW_H, {
        bold: true,
        align: "right",
      });
      drawHLine(col1X, y + ROW_H, TOTAL_W);
      y += ROW_H;
    }

    doc.end();

    return new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });
  },

  async buildPdfForFundFlow(input: FundFlowRequestInput): Promise<Buffer> {
    logger.info("entering::buildPdfForFundFlow::service");

    const data: FundFlowResponse = await this.getFundFlow(input);

    const doc = new PDFDocument({ margin: 30, size: "A4", layout: "portrait" });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    const FONT_NORMAL = "Helvetica";
    const FONT_BOLD = "Helvetica-Bold";

    const PAGE_LEFT = 30;
    const PAGE_WIDTH = doc.page.width - 60;
    const PAGE_BOTTOM = doc.page.height - 30;

    const dateRange = `(${dayjs(input.fromDate).format(
      "MMM D, YYYY",
    )} – ${dayjs(input.toDate).format("MMM D, YYYY")})`;

    const ROW_H = 20;
    const FONT_SIZE = 7;

    let y = 30;

    const fmtAmt = (value: number | string | null | undefined): string => {
      if (value === null || value === undefined || value === "") return "";
      const num = Number(value);
      if (isNaN(num) || num === 0) return "";
      return num.toFixed(2);
    };

    const fmtBal = (dr: number, cr: number): string => {
      if (dr > 0) return `${dr.toFixed(2)} Dr`;
      if (cr > 0) return `${cr.toFixed(2)} Cr`;
      return "";
    };

    const drawHLine = (x: number, yw: number, w: number) => {
      doc
        .moveTo(x, yw)
        .lineTo(x + w, yw)
        .stroke("#000000");
    };

    const drawVLine = (xv: number, yt: number, h: number) => {
      doc
        .moveTo(xv, yt)
        .lineTo(xv, yt + h)
        .stroke("#000000");
    };

    const writeCell = (
      text: string,
      x: number,
      yt: number,
      w: number,
      h: number,
      opts: {
        bold?: boolean;
        align?: "left" | "right" | "center";
        fontSize?: number;
        indent?: number;
      } = {},
    ) => {
      const xOffset = opts.indent ?? 3;
      doc
        .font(opts.bold ? FONT_BOLD : FONT_NORMAL)
        .fontSize(opts.fontSize ?? FONT_SIZE)
        .fillColor("#000000")
        .text(String(text ?? ""), x + xOffset, yt + 5, {
          width: w - xOffset - 3,
          height: h - 5,
          align: opts.align ?? "left",
          ellipsis: true,
          lineBreak: false,
        });
    };

    // ============================================================
    // 🔷 MONTHLY VIEW
    // ============================================================
    if (data.view === "MONTHLY") {
      const { months, totals } = data;

      const TOTAL_EXCEL_W = 105;
      const col1W = PAGE_WIDTH * (45 / TOTAL_EXCEL_W);
      const col2W = PAGE_WIDTH * (20 / TOTAL_EXCEL_W);
      const col3W = PAGE_WIDTH * (20 / TOTAL_EXCEL_W);
      const col4W = PAGE_WIDTH * (20 / TOTAL_EXCEL_W);

      const col1X = PAGE_LEFT;
      const col2X = col1X + col1W;
      const col3X = col2X + col2W;
      const col4X = col3X + col3W;
      const TOTAL_W = col1W + col2W + col3W + col4W;

      const drawRowBorders = (rowY: number, h: number = ROW_H) => {
        drawVLine(col1X, rowY, h);
        drawVLine(col2X, rowY, h);
        drawVLine(col3X, rowY, h);
        drawVLine(col4X, rowY, h);
        drawVLine(col4X + col4W, rowY, h);
      };

      const drawHeaders = () => {
        // Group header — "Working Capital" spans col2-col3 only
        drawHLine(col1X, y, TOTAL_W);
        drawVLine(col1X, y, ROW_H);
        drawVLine(col2X, y, ROW_H);
        drawVLine(col4X, y, ROW_H);
        drawVLine(col4X + col4W, y, ROW_H);
        writeCell("Working Capital", col2X, y, col2W + col3W, ROW_H, {
          bold: true,
          align: "center",
        });
        drawHLine(col2X, y + ROW_H, col2W + col3W);
        y += ROW_H;

        drawRowBorders(y);
        writeCell("PARTICULARS", col1X, y, col1W, ROW_H, {
          bold: true,
          align: "center",
        });
        writeCell("OPENING", col2X, y, col2W, ROW_H, {
          bold: true,
          align: "center",
        });
        writeCell("CLOSING", col3X, y, col3W, ROW_H, {
          bold: true,
          align: "center",
        });
        writeCell("FUND FLOW", col4X, y, col4W, ROW_H, {
          bold: true,
          align: "center",
        });
        drawHLine(col1X, y + ROW_H, TOTAL_W);
        y += ROW_H;
      };

      const checkPageBreak = () => {
        if (y + ROW_H > PAGE_BOTTOM) {
          drawHLine(col1X, y, TOTAL_W);
          doc.addPage();
          y = 30;
          drawHeaders();
        }
      };

      // Title
      const titleH = ROW_H + 4;
      drawVLine(col1X, y, titleH);
      drawVLine(col4X + col4W, y, titleH);
      drawHLine(col1X, y, TOTAL_W);
      writeCell("Fund Flow", col1X, y, TOTAL_W, titleH, {
        bold: true,
        fontSize: 16,
        align: "center",
      });
      y += titleH;

      // Date
      drawVLine(col1X, y, ROW_H);
      drawVLine(col4X + col4W, y, ROW_H);
      writeCell(dateRange, col1X, y, TOTAL_W, ROW_H, {
        fontSize: 10,
        align: "center",
      });
      y += ROW_H;

      drawHeaders();

      months.forEach((m: FundFlowMonthlyRow) => {
        checkPageBreak();
        drawRowBorders(y);
        writeCell(m.name, col1X, y, col1W, ROW_H);
        writeCell(fmtAmt(m.openingWorkingCapital), col2X, y, col2W, ROW_H, {
          align: "right",
        });
        writeCell(fmtAmt(m.closingWorkingCapital), col3X, y, col3W, ROW_H, {
          align: "right",
        });
        writeCell(fmtAmt(m.fundFlow), col4X, y, col4W, ROW_H, {
          align: "right",
        });
        y += ROW_H;
      });

      checkPageBreak();
      drawRowBorders(y);
      y += ROW_H;

      checkPageBreak();
      drawHLine(col1X, y, TOTAL_W);
      drawRowBorders(y);
      writeCell("Grand Total", col1X, y, col1W, ROW_H, { bold: true });
      writeCell(fmtAmt(totals.openingWorkingCapital), col2X, y, col2W, ROW_H, {
        bold: true,
        align: "right",
      });
      writeCell(fmtAmt(totals.closingWorkingCapital), col3X, y, col3W, ROW_H, {
        bold: true,
        align: "right",
      });
      writeCell(fmtAmt(totals.fundFlow), col4X, y, col4W, ROW_H, {
        bold: true,
        align: "right",
      });
      drawHLine(col1X, y + ROW_H, TOTAL_W);
      y += ROW_H;
    }

    // ============================================================
    // 🔷 SUMMARY VIEW
    // ============================================================
    else if (data.view === "SUMMARY") {
      const { sources, applications, workingCapital, totals } = data;

      const TOTAL_EXCEL_W = 116;
      const col1W = PAGE_WIDTH * (40 / TOTAL_EXCEL_W);
      const col2W = PAGE_WIDTH * (18 / TOTAL_EXCEL_W);
      const col3W = PAGE_WIDTH * (40 / TOTAL_EXCEL_W);
      const col4W = PAGE_WIDTH * (18 / TOTAL_EXCEL_W);

      const col1X = PAGE_LEFT;
      const col2X = col1X + col1W;
      const col3X = col2X + col2W;
      const col4X = col3X + col3W;
      const TOTAL_W = col1W + col2W + col3W + col4W;

      const drawRowBorders = (rowY: number, h: number = ROW_H) => {
        drawVLine(col1X, rowY, h);
        drawVLine(col2X, rowY, h);
        drawVLine(col3X, rowY, h);
        drawVLine(col4X, rowY, h);
        drawVLine(col4X + col4W, rowY, h);
      };

      // Sources/Applications headers
      const drawSourceHeaders = () => {
        drawHLine(col1X, y, TOTAL_W);
        drawRowBorders(y);
        writeCell("SOURCES", col1X, y, col1W, ROW_H, {
          bold: true,
          align: "center",
        });
        writeCell("AMOUNT", col2X, y, col2W, ROW_H, {
          bold: true,
          align: "center",
        });
        writeCell("APPLICATIONS", col3X, y, col3W, ROW_H, {
          bold: true,
          align: "center",
        });
        writeCell("AMOUNT", col4X, y, col4W, ROW_H, {
          bold: true,
          align: "center",
        });
        drawHLine(col1X, y + ROW_H, TOTAL_W);
        y += ROW_H;
      };

      // WC section headers
      const drawWcHeaders = () => {
        drawHLine(col1X, y, TOTAL_W);
        drawRowBorders(y);
        writeCell("PARTICULARS", col1X, y, col1W, ROW_H, {
          bold: true,
          align: "center",
        });
        writeCell("OPENING BALANCE", col2X, y, col2W, ROW_H, {
          bold: true,
          align: "center",
        });
        writeCell("CLOSING BALANCE", col3X, y, col3W, ROW_H, {
          bold: true,
          align: "center",
        });
        writeCell("WKG CAP INCREASE", col4X, y, col4W, ROW_H, {
          bold: true,
          align: "center",
        });
        drawHLine(col1X, y + ROW_H, TOTAL_W);
        y += ROW_H;
      };

      const checkPageBreakSource = () => {
        if (y + ROW_H > PAGE_BOTTOM) {
          drawHLine(col1X, y, TOTAL_W);
          doc.addPage();
          y = 30;
          drawSourceHeaders();
        }
      };

      const checkPageBreakWc = () => {
        if (y + ROW_H > PAGE_BOTTOM) {
          drawHLine(col1X, y, TOTAL_W);
          doc.addPage();
          y = 30;
          drawWcHeaders();
        }
      };

      // Title
      const titleH = ROW_H + 4;
      drawVLine(col1X, y, titleH);
      drawVLine(col4X + col4W, y, titleH);
      drawHLine(col1X, y, TOTAL_W);
      writeCell("Fund Flow Summary", col1X, y, TOTAL_W, titleH, {
        bold: true,
        fontSize: 16,
        align: "center",
      });
      y += titleH;

      // Date
      drawVLine(col1X, y, ROW_H);
      drawVLine(col4X + col4W, y, ROW_H);
      writeCell(dateRange, col1X, y, TOTAL_W, ROW_H, {
        fontSize: 10,
        align: "center",
      });
      y += ROW_H;

      drawSourceHeaders();

      // Source/Application data rows
      type Line = { label: string; amount: number | string; bold: boolean };
      const leftLines: Line[] = [];
      const rightLines: Line[] = [];

      sources.forEach((s: FundFlowSummaryRow) => {
        leftLines.push({
          label: s.group?.value ?? "",
          amount: s.amount || "",
          bold: s.type === "GROUP",
        });
      });
      applications.forEach((a: FundFlowSummaryRow) => {
        rightLines.push({
          label: a.group?.value ?? "",
          amount: a.amount || "",
          bold: a.type === "GROUP",
        });
      });

      const maxRows = Math.max(leftLines.length, rightLines.length);
      for (let i = 0; i < maxRows; i++) {
        checkPageBreakSource();
        const left = leftLines[i];
        const right = rightLines[i];
        drawRowBorders(y);
        if (left) {
          writeCell(left.label, col1X, y, col1W, ROW_H, { bold: left.bold });
          writeCell(fmtAmt(left.amount), col2X, y, col2W, ROW_H, {
            bold: left.bold,
            align: "right",
          });
        }
        if (right) {
          writeCell(right.label, col3X, y, col3W, ROW_H, { bold: right.bold });
          writeCell(fmtAmt(right.amount), col4X, y, col4W, ROW_H, {
            bold: right.bold,
            align: "right",
          });
        }
        y += ROW_H;
      }

      // Spacer
      checkPageBreakSource();
      drawRowBorders(y);
      y += ROW_H;

      // Total Sources / Applications row
      checkPageBreakSource();
      drawHLine(col1X, y, TOTAL_W);
      drawRowBorders(y);
      writeCell("Total", col1X, y, col1W, ROW_H, { bold: true });
      writeCell(fmtAmt(totals.sources), col2X, y, col2W, ROW_H, {
        bold: true,
        align: "right",
      });
      writeCell("Total", col3X, y, col3W, ROW_H, { bold: true });
      writeCell(fmtAmt(totals.applications), col4X, y, col4W, ROW_H, {
        bold: true,
        align: "right",
      });
      drawHLine(col1X, y + ROW_H, TOTAL_W);
      y += ROW_H;

      // Blank gap before WC section
      y += ROW_H;

      // WC section
      drawWcHeaders();

      workingCapital.groups.forEach(
        (g: { group: IdValue | null; opening: DrCrAmt; closing: DrCrAmt }) => {
          checkPageBreakWc();
          const increase =
            g.closing.dr - g.opening.dr - (g.closing.cr - g.opening.cr);
          drawRowBorders(y);
          writeCell(g.group?.value ?? "", col1X, y, col1W, ROW_H, {
            bold: true,
          });
          writeCell(
            fmtBal(g.opening.dr, g.opening.cr),
            col2X,
            y,
            col2W,
            ROW_H,
            { bold: true, align: "right" },
          );
          writeCell(
            fmtBal(g.closing.dr, g.closing.cr),
            col3X,
            y,
            col3W,
            ROW_H,
            { bold: true, align: "right" },
          );
          writeCell(
            increase !== 0 ? increase.toFixed(2) : "",
            col4X,
            y,
            col4W,
            ROW_H,
            { bold: true, align: "right" },
          );
          y += ROW_H;
        },
      );

      checkPageBreakWc();
      drawHLine(col1X, y, TOTAL_W);
      drawRowBorders(y);
      writeCell("Working Capital", col1X, y, col1W, ROW_H, { bold: true });
      writeCell(
        fmtBal(
          workingCapital.openingWorkingCapital.dr,
          workingCapital.openingWorkingCapital.cr,
        ),
        col2X,
        y,
        col2W,
        ROW_H,
        { bold: true, align: "right" },
      );
      writeCell(
        fmtBal(
          workingCapital.closingWorkingCapital.dr,
          workingCapital.closingWorkingCapital.cr,
        ),
        col3X,
        y,
        col3W,
        ROW_H,
        { bold: true, align: "right" },
      );
      writeCell(
        workingCapital.increase !== 0 ? workingCapital.increase.toFixed(2) : "",
        col4X,
        y,
        col4W,
        ROW_H,
        {
          bold: true,
          align: "right",
        },
      );
      drawHLine(col1X, y + ROW_H, TOTAL_W);
      y += ROW_H;
    }

    // ============================================================
    // 🔷 GROUP_DETAIL VIEW
    // ============================================================
    else if (data.view === "GROUP_DETAIL") {
      const { groupTree, totals } = data;

      const TOTAL_EXCEL_W = 121;
      const col1W = PAGE_WIDTH * (45 / TOTAL_EXCEL_W);
      const col2W = PAGE_WIDTH * (20 / TOTAL_EXCEL_W);
      const col3W = PAGE_WIDTH * (18 / TOTAL_EXCEL_W);
      const col4W = PAGE_WIDTH * (18 / TOTAL_EXCEL_W);
      const col5W = PAGE_WIDTH * (20 / TOTAL_EXCEL_W);

      const col1X = PAGE_LEFT;
      const col2X = col1X + col1W;
      const col3X = col2X + col2W;
      const col4X = col3X + col3W;
      const col5X = col4X + col4W;
      const TOTAL_W = col1W + col2W + col3W + col4W + col5W;

      const drawRowBorders = (rowY: number, h: number = ROW_H) => {
        drawVLine(col1X, rowY, h);
        drawVLine(col2X, rowY, h);
        drawVLine(col3X, rowY, h);
        drawVLine(col4X, rowY, h);
        drawVLine(col5X, rowY, h);
        drawVLine(col5X + col5W, rowY, h);
      };

      const drawHeaders = () => {
        // Sub-header — "TRANSACTIONS" spans col3-col4
        drawHLine(col1X, y, TOTAL_W);
        drawVLine(col1X, y, ROW_H);
        drawVLine(col2X, y, ROW_H);
        drawVLine(col3X, y, ROW_H);
        drawVLine(col5X, y, ROW_H);
        drawVLine(col5X + col5W, y, ROW_H);
        writeCell("TRANSACTIONS", col3X, y, col3W + col4W, ROW_H, {
          bold: true,
          align: "center",
        });
        drawHLine(col3X, y + ROW_H, col3W + col4W);
        y += ROW_H;

        // Column labels
        drawRowBorders(y);
        writeCell("PARTICULARS", col1X, y, col1W, ROW_H, {
          bold: true,
          align: "center",
        });
        writeCell("OPENING BALANCE", col2X, y, col2W, ROW_H, {
          bold: true,
          align: "center",
        });
        writeCell("DEBIT", col3X, y, col3W, ROW_H, {
          bold: true,
          align: "center",
        });
        writeCell("CREDIT", col4X, y, col4W, ROW_H, {
          bold: true,
          align: "center",
        });
        writeCell("CLOSING BALANCE", col5X, y, col5W, ROW_H, {
          bold: true,
          align: "center",
        });
        drawHLine(col1X, y + ROW_H, TOTAL_W);
        y += ROW_H;
      };

      const checkPageBreak = () => {
        if (y + ROW_H > PAGE_BOTTOM) {
          drawHLine(col1X, y, TOTAL_W);
          doc.addPage();
          y = 30;
          drawHeaders();
        }
      };

      // Title
      const titleH = ROW_H + 4;
      drawVLine(col1X, y, titleH);
      drawVLine(col5X + col5W, y, titleH);
      drawHLine(col1X, y, TOTAL_W);
      writeCell(
        `Fund Flow Group Detail for ${groupTree?.group?.value ?? ""}`,
        col1X,
        y,
        TOTAL_W,
        titleH,
        {
          bold: true,
          fontSize: 13,
          align: "center",
        },
      );
      y += titleH;

      // Date
      drawVLine(col1X, y, ROW_H);
      drawVLine(col5X + col5W, y, ROW_H);
      writeCell(dateRange, col1X, y, TOTAL_W, ROW_H, {
        fontSize: 10,
        align: "center",
      });
      y += ROW_H;

      // Group name row — col1 empty | cols 2-5 = group name
      drawHLine(col1X, y, TOTAL_W);
      drawVLine(col1X, y, ROW_H);
      drawVLine(col2X, y, ROW_H);
      drawVLine(col5X + col5W, y, ROW_H);
      writeCell(
        (groupTree?.group?.value ?? "").toUpperCase(),
        col2X,
        y,
        col2W + col3W + col4W + col5W,
        ROW_H,
        {
          bold: true,
          align: "center",
        },
      );
      drawHLine(col2X, y + ROW_H, col2W + col3W + col4W + col5W);
      y += ROW_H;

      drawHeaders();

      const renderLedger = (ledger: FundFlowLedgerRow, indent: number) => {
        checkPageBreak();
        drawRowBorders(y);
        writeCell(ledger.ledger?.value ?? "", col1X, y, col1W, ROW_H, {
          indent: 3 + indent * 10,
        });
        writeCell(
          fmtBal(ledger.amount.opening.dr, ledger.amount.opening.cr),
          col2X,
          y,
          col2W,
          ROW_H,
          {
            align: "right",
          },
        );
        writeCell(fmtAmt(ledger.amount.debit), col3X, y, col3W, ROW_H, {
          align: "right",
        });
        writeCell(fmtAmt(ledger.amount.credit), col4X, y, col4W, ROW_H, {
          align: "right",
        });
        writeCell(
          fmtBal(ledger.amount.closing.dr, ledger.amount.closing.cr),
          col5X,
          y,
          col5W,
          ROW_H,
          {
            align: "right",
          },
        );
        y += ROW_H;
      };

      const renderGroupNode = (
        node: FundFlowGroupRecursiveRow,
        indent: number,
      ) => {
        checkPageBreak();
        drawRowBorders(y);
        writeCell(node.group?.value ?? "", col1X, y, col1W, ROW_H, {
          bold: indent === 0,
          indent: 3 + indent * 10,
        });
        writeCell(
          fmtBal(node.amount.opening.dr, node.amount.opening.cr),
          col2X,
          y,
          col2W,
          ROW_H,
          {
            bold: indent === 0,
            align: "right",
          },
        );
        writeCell(fmtAmt(node.amount.debit), col3X, y, col3W, ROW_H, {
          bold: indent === 0,
          align: "right",
        });
        writeCell(fmtAmt(node.amount.credit), col4X, y, col4W, ROW_H, {
          bold: indent === 0,
          align: "right",
        });
        writeCell(
          fmtBal(node.amount.closing.dr, node.amount.closing.cr),
          col5X,
          y,
          col5W,
          ROW_H,
          {
            bold: indent === 0,
            align: "right",
          },
        );
        y += ROW_H;

        node.children.forEach((child) => renderGroupNode(child, indent + 1));
        node.ledgers.forEach((ledger) => renderLedger(ledger, indent + 1));
      };

      groupTree?.ledgers.forEach((ledger) => renderLedger(ledger, 0));
      groupTree?.children.forEach((child) => renderGroupNode(child, 0));

      checkPageBreak();
      drawRowBorders(y);
      y += ROW_H;

      checkPageBreak();
      drawHLine(col1X, y, TOTAL_W);
      drawRowBorders(y);
      writeCell("Grand Total", col1X, y, col1W, ROW_H, { bold: true });
      writeCell(
        fmtBal(totals.opening.dr, totals.opening.cr),
        col2X,
        y,
        col2W,
        ROW_H,
        { bold: true, align: "right" },
      );
      writeCell(fmtAmt(totals.debit), col3X, y, col3W, ROW_H, {
        bold: true,
        align: "right",
      });
      writeCell(fmtAmt(totals.credit), col4X, y, col4W, ROW_H, {
        bold: true,
        align: "right",
      });
      writeCell(
        fmtBal(totals.closing.dr, totals.closing.cr),
        col5X,
        y,
        col5W,
        ROW_H,
        { bold: true, align: "right" },
      );
      drawHLine(col1X, y + ROW_H, TOTAL_W);
      y += ROW_H;
    }

    doc.end();

    return new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });
  },
};

export const reportService = auditProxy.createAuditedService(
  "report",
  reportServiceRaw,
);
