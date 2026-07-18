import { RoundFormat, applyRound, toIdValue } from "av6-utils";
import dayjs from "dayjs";

import { requestStorage } from "@/config/requestContext.js";
import { commonGetService } from "@/services/common.service.js";
import { getLedgerBalancesNumber } from "@/services/report/ledgerBalanceEngine.service.js";
import { reportService } from "@/services/report/report.service.js";
import {
  FundFlowGroupDetailResponse,
  FundFlowGroupMovementRow,
  FundFlowGroupRecursiveRow,
  FundFlowLedgerAmount,
  FundFlowLedgerRow,
  FundFlowMonthlyResponse,
  FundFlowMonthlyRow,
  FundFlowRequestInput,
  FundFlowResponse,
  FundFlowSummaryResponse,
  FundFlowSummaryRow,
} from "@/types/reports/fundFlow.js";
import { DrCrAmt } from "@/types/reports/ledgerBalanceEngine.js";
import {
  AccountingPrimaryCategory,
  AccountingReportType,
} from "@repo/db/generated/prisma/enums.js";
import {
  CompanyFinancialYear,
  Group,
  Ledger,
} from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";

const zeroDrCr = (): DrCrAmt => ({ dr: 0, cr: 0 });

const addDrCr = (a: DrCrAmt, b: DrCrAmt): DrCrAmt => ({
  dr: a.dr + b.dr,
  cr: a.cr + b.cr,
});

const isZeroDrCr = (amt: DrCrAmt) => amt.dr === 0 && amt.cr === 0;

const roundDrCr = (
  amt: DrCrAmt,
  method: RoundFormat,
  precision: number,
): DrCrAmt => ({
  dr: applyRound(amt.dr, method, precision),
  cr: applyRound(amt.cr, method, precision),
});

const getMonthName = (month: string) =>
  dayjs(`${month}-01`).format("MMMM YYYY");

const getMonthRange = (month: string) => ({
  fromDate: dayjs(`${month}-01`).startOf("month").toDate(),
  toDate: dayjs(`${month}-01`).endOf("month").toDate(),
});

const getSignedAmount = (
  amt: DrCrAmt,
  primaryCategory: AccountingPrimaryCategory,
): number => {
  if (primaryCategory === AccountingPrimaryCategory.ASSET) {
    return amt.dr - amt.cr;
  }
  return amt.cr - amt.dr;
};

const toAssetDrCr = (value: number): DrCrAmt => {
  if (value >= 0) {
    return { dr: value, cr: 0 };
  }

  return { dr: 0, cr: Math.abs(value) };
};

const toLiabilityDrCr = (value: number): DrCrAmt => {
  if (value >= 0) {
    return { dr: 0, cr: value };
  }

  return { dr: Math.abs(value), cr: 0 };
};

const classifyMovement = (
  opening: DrCrAmt,
  closing: DrCrAmt,
  primaryCategory: AccountingPrimaryCategory,
) => {
  const openingSigned = getSignedAmount(opening, primaryCategory);
  const closingSigned = getSignedAmount(closing, primaryCategory);
  const movement = closingSigned - openingSigned;

  if (primaryCategory === AccountingPrimaryCategory.ASSET) {
    return {
      openingSigned,
      closingSigned,
      movement,
      source: movement < 0 ? Math.abs(movement) : 0,
      application: movement > 0 ? movement : 0,
    };
  }

  return {
    openingSigned,
    closingSigned,
    movement,
    source: movement > 0 ? movement : 0,
    application: movement < 0 ? Math.abs(movement) : 0,
  };
};

const getPeriodInput = (input: FundFlowRequestInput) => {
  if (input.month) return getMonthRange(input.month);
  return { fromDate: input.fromDate, toDate: input.toDate };
};

const getLedgerRowsAsOnDate = async (params: {
  companyId: number;
  financialYearId: number;
  booksBeginFrom: Date;
  asOnDate: Date;
  includeZero: boolean;
  ccId?: number;
  ledgerIds?: number[];
}) => {
  return getLedgerBalancesNumber({
    companyId: params.companyId,
    financialYearId: params.financialYearId,
    fromDate: params.booksBeginFrom,
    toDate: params.asOnDate,
    ccId: params.ccId,
    ledgerIds: params.ledgerIds,
    includeZero: params.includeZero,
  });
};

const getLedgerRowsForPeriod = async (params: {
  companyId: number;
  financialYearId: number;
  fromDate: Date;
  toDate: Date;
  ccId?: number;
  ledgerIds?: number[];
  includeZero: boolean;
}) => {
  return getLedgerBalancesNumber({
    companyId: params.companyId,
    financialYearId: params.financialYearId,
    fromDate: params.fromDate,
    toDate: params.toDate,
    ccId: params.ccId,
    ledgerIds: params.ledgerIds,
    includeZero: params.includeZero,
  });
};

const buildLedgerBalanceMap = (
  rows: Awaited<ReturnType<typeof getLedgerRowsAsOnDate>>,
): Map<number, (typeof rows)[number]> => {
  const map = new Map<number, (typeof rows)[number]>();
  for (const row of rows) {
    if (row.ledger?.id) map.set(row.ledger.id, row);
  }
  return map;
};

const buildGroupAncestorsMap = (groups: Group[]) => {
  const groupMap = new Map<number, Group>();
  groups.forEach((g) => groupMap.set(g.id, g));

  const res = new Map<number, number[]>();

  for (const group of groups) {
    const ids: number[] = [];
    let current: Group | undefined = group;

    while (current) {
      ids.push(current.id);
      current = current.parentId ? groupMap.get(current.parentId) : undefined;
    }

    res.set(group.id, ids);
  }

  return res;
};

const getDescendantGroupIds = (rootGroupId: number, groups: Group[]) => {
  const result: number[] = [];
  const childMap = new Map<number | null, Group[]>();

  for (const group of groups) {
    const key = group.parentId ?? null;
    const arr = childMap.get(key) ?? [];
    arr.push(group);
    childMap.set(key, arr);
  }

  for (const arr of childMap.values()) {
    arr.sort((a, b) => a.id - b.id || a.name.localeCompare(b.name));
  }

  const walk = (groupId: number) => {
    result.push(groupId);
    for (const child of childMap.get(groupId) ?? []) {
      walk(child.id);
    }
  };

  walk(rootGroupId);
  return result;
};

const preloadGroupDetailBalances = async (params: {
  companyId: number;
  financialYearId: number;
  booksBeginFrom: Date;
  fromDate: Date;
  toDate: Date;
  ccId?: number;
  ledgerIds: number[];
  includeZero: boolean;
}) => {
  const openingAsOn = dayjs(params.fromDate)
    .subtract(1, "day")
    .endOf("day")
    .toDate();

  const [periodRows, openingRows, closingRows] = await Promise.all([
    getLedgerRowsForPeriod({
      companyId: params.companyId,
      financialYearId: params.financialYearId,
      fromDate: params.fromDate,
      toDate: params.toDate,
      ccId: params.ccId,
      ledgerIds: params.ledgerIds,
      includeZero: params.includeZero,
    }),
    getLedgerRowsAsOnDate({
      companyId: params.companyId,
      financialYearId: params.financialYearId,
      booksBeginFrom: params.booksBeginFrom,
      asOnDate: openingAsOn,
      ccId: params.ccId,
      ledgerIds: params.ledgerIds,
      includeZero: params.includeZero,
    }),
    getLedgerRowsAsOnDate({
      companyId: params.companyId,
      financialYearId: params.financialYearId,
      booksBeginFrom: params.booksBeginFrom,
      asOnDate: params.toDate,
      ccId: params.ccId,
      ledgerIds: params.ledgerIds,
      includeZero: params.includeZero,
    }),
  ]);

  return {
    periodMap: buildLedgerBalanceMap(periodRows),
    openingMap: buildLedgerBalanceMap(openingRows),
    closingMap: buildLedgerBalanceMap(closingRows),
  };
};

const getWorkingCapitalSnapshot = async (params: {
  companyId: number;
  financialYearId: number;
  booksBeginFrom: Date;
  asOnDate: Date;
  ccId?: number;
  currentAssetLedgerIds: number[];
  currentLiabilityLedgerIds: number[];
  includeZero: boolean;
}) => {
  const [assetRows, liabilityRows] = await Promise.all([
    getLedgerRowsAsOnDate({
      companyId: params.companyId,
      financialYearId: params.financialYearId,
      booksBeginFrom: params.booksBeginFrom,
      asOnDate: params.asOnDate,
      ccId: params.ccId,
      ledgerIds: params.currentAssetLedgerIds,
      includeZero: params.includeZero,
    }),
    getLedgerRowsAsOnDate({
      companyId: params.companyId,
      financialYearId: params.financialYearId,
      booksBeginFrom: params.booksBeginFrom,
      asOnDate: params.asOnDate,
      ccId: params.ccId,
      ledgerIds: params.currentLiabilityLedgerIds,
      includeZero: params.includeZero,
    }),
  ]);

  const currentAssets = assetRows.reduce(
    (sum, row) => sum + (row.closing.dr - row.closing.cr),
    0,
  );
  const currentLiabilities = liabilityRows.reduce(
    (sum, row) => sum + (row.closing.cr - row.closing.dr),
    0,
  );

  return {
    currentAssets,
    currentLiabilities,
    workingCapital: currentAssets - currentLiabilities,
  };
};

const buildMonthlyRows = async (params: {
  companyId: number;
  financialYearId: number;
  booksBeginFrom: Date;
  fromDate: Date;
  toDate: Date;
  ccId?: number;
  currentAssetLedgerIds: number[];
  currentLiabilityLedgerIds: number[];
  roundingMethod: RoundFormat;
  roundingPrecision: number;
  includeZero: boolean;
}): Promise<FundFlowMonthlyRow[]> => {
  const rows: FundFlowMonthlyRow[] = [];
  const checkpoints = new Map<
    string,
    {
      date: Date;
      snapshot?: {
        currentAssets: number;
        currentLiabilities: number;
        workingCapital: number;
      };
    }
  >();

  let cursor = dayjs(params.fromDate).startOf("month");
  const end = dayjs(params.toDate).startOf("month");

  while (cursor.isSame(end) || cursor.isBefore(end)) {
    const monthStart = cursor.startOf("month");
    const monthEnd = cursor.endOf("month");
    const beforeMonthStart = monthStart.subtract(1, "day").endOf("day");

    checkpoints.set(beforeMonthStart.toISOString(), {
      date: beforeMonthStart.toDate(),
    });
    checkpoints.set(monthEnd.toISOString(), { date: monthEnd.toDate() });

    cursor = cursor.add(1, "month");
  }

  await Promise.all(
    Array.from(checkpoints.values()).map(async (entry) => {
      entry.snapshot = await getWorkingCapitalSnapshot({
        companyId: params.companyId,
        financialYearId: params.financialYearId,
        booksBeginFrom: params.booksBeginFrom,
        asOnDate: entry.date,
        ccId: params.ccId,
        currentAssetLedgerIds: params.currentAssetLedgerIds,
        currentLiabilityLedgerIds: params.currentLiabilityLedgerIds,
        includeZero: params.includeZero,
      });
    }),
  );

  cursor = dayjs(params.fromDate).startOf("month");

  while (cursor.isSame(end) || cursor.isBefore(end)) {
    const month = cursor.format("YYYY-MM");
    const monthStart = cursor.startOf("month");
    const monthEnd = cursor.endOf("month");
    const beforeMonthStart = monthStart.subtract(1, "day").endOf("day");

    const opening = checkpoints.get(beforeMonthStart.toISOString())!.snapshot!;
    const closing = checkpoints.get(monthEnd.toISOString())!.snapshot!;

    rows.push({
      month,
      name: getMonthName(month),
      openingWorkingCapital: applyRound(
        opening.workingCapital,
        params.roundingMethod,
        params.roundingPrecision,
      ),
      closingWorkingCapital: applyRound(
        closing.workingCapital,
        params.roundingMethod,
        params.roundingPrecision,
      ),
      fundFlow: applyRound(
        closing.workingCapital - opening.workingCapital,
        params.roundingMethod,
        params.roundingPrecision,
      ),
    });

    cursor = cursor.add(1, "month");
  }

  return rows;
};

const buildGroupMovementRows = async (params: {
  companyId: number;
  financialYearId: number;
  booksBeginFrom: Date;
  fromDate: Date;
  toDate: Date;
  ccId?: number;
  groups: Group[];
  ledgers: Ledger[];
  includeZero: boolean;
}) => {
  const openingAsOn = dayjs(params.fromDate)
    .subtract(1, "day")
    .endOf("day")
    .toDate();

  const [openingRows, closingRows] = await Promise.all([
    getLedgerRowsAsOnDate({
      companyId: params.companyId,
      financialYearId: params.financialYearId,
      booksBeginFrom: params.booksBeginFrom,
      asOnDate: openingAsOn,
      ccId: params.ccId,
      includeZero: params.includeZero,
    }),
    getLedgerRowsAsOnDate({
      companyId: params.companyId,
      financialYearId: params.financialYearId,
      booksBeginFrom: params.booksBeginFrom,
      asOnDate: params.toDate,
      ccId: params.ccId,
      includeZero: params.includeZero,
    }),
  ]);

  const openingMap = buildLedgerBalanceMap(openingRows);
  const closingMap = buildLedgerBalanceMap(closingRows);

  const groupMap = new Map<number, Group>();
  params.groups.forEach((g) => groupMap.set(g.id, g));

  const grouped = new Map<number, FundFlowGroupMovementRow>();

  for (const ledger of params.ledgers) {
    const group = groupMap.get(ledger.groupId);
    if (!group) continue;

    const opening = openingMap.get(ledger.id)?.closing ?? zeroDrCr();
    const closing = closingMap.get(ledger.id)?.closing ?? zeroDrCr();

    const classified = classifyMovement(
      opening,
      closing,
      group.primaryCategory,
    );

    let currentGroupId: number | null = group.id;

    while (currentGroupId) {
      const currentGroup = groupMap.get(currentGroupId);
      if (!currentGroup) break;

      const existing = grouped.get(currentGroupId) ?? {
        groupId: currentGroup.id,
        groupName: currentGroup.name,
        parentId: currentGroup.parentId ?? null,
        primaryCategory: currentGroup.primaryCategory,
        opening: zeroDrCr(),
        closing: zeroDrCr(),
        openingSigned: 0,
        closingSigned: 0,
        movement: 0,
        source: 0,
        application: 0,
      };

      existing.opening = addDrCr(existing.opening, opening);
      existing.closing = addDrCr(existing.closing, closing);
      existing.openingSigned += classified.openingSigned;
      existing.closingSigned += classified.closingSigned;
      existing.movement += classified.movement;
      existing.source += classified.source;
      existing.application += classified.application;

      grouped.set(currentGroupId, existing);
      currentGroupId = currentGroup.parentId ?? null;
    }
  }

  const rows = Array.from(grouped.values()).sort(
    (a, b) => a.groupId - b.groupId,
  );

  if (params.includeZero) return rows;

  return rows.filter(
    (row) =>
      row.source !== 0 ||
      row.application !== 0 ||
      !isZeroDrCr(row.opening) ||
      !isZeroDrCr(row.closing),
  );
};

const buildGroupDetailTree = async (params: {
  companyId: number;
  financialYearId: number;
  booksBeginFrom: Date;
  fromDate: Date;
  toDate: Date;
  ccId?: number;
  groupId: number;
  groups: Group[];
  ledgers: Ledger[];
  includeZero: boolean;
  roundingMethod: RoundFormat;
  roundingPrecision: number;
}): Promise<FundFlowGroupRecursiveRow | null> => {
  const groupMap = new Map<number, Group>();
  params.groups.forEach((g) => groupMap.set(g.id, g));

  const childMap = new Map<number | null, Group[]>();
  for (const group of params.groups) {
    const key = group.parentId ?? null;
    const arr = childMap.get(key) ?? [];
    arr.push(group);
    childMap.set(key, arr);
  }

  for (const arr of childMap.values()) {
    arr.sort((a, b) => a.id - b.id || a.name.localeCompare(b.name));
  }

  const descendantGroupIds = getDescendantGroupIds(
    params.groupId,
    params.groups,
  );
  const descendantGroupIdSet = new Set(descendantGroupIds);

  const relevantLedgers = params.ledgers
    .filter((ledger) => descendantGroupIdSet.has(ledger.groupId))
    .sort((a, b) => a.id - b.id || a.name.localeCompare(b.name));

  const relevantLedgerIds = relevantLedgers.map((ledger) => ledger.id);

  const { periodMap, openingMap, closingMap } =
    await preloadGroupDetailBalances({
      companyId: params.companyId,
      financialYearId: params.financialYearId,
      booksBeginFrom: params.booksBeginFrom,
      fromDate: params.fromDate,
      toDate: params.toDate,
      ccId: params.ccId,
      ledgerIds: relevantLedgerIds,
      includeZero: params.includeZero,
    });

  const ledgersByGroupId = new Map<number, Ledger[]>();
  for (const ledger of relevantLedgers) {
    const arr = ledgersByGroupId.get(ledger.groupId) ?? [];
    arr.push(ledger);
    ledgersByGroupId.set(ledger.groupId, arr);
  }

  const buildNode = (groupId: number): FundFlowGroupRecursiveRow | null => {
    const group = groupMap.get(groupId);
    if (!group) return null;

    const directLedgers = ledgersByGroupId.get(groupId) ?? [];

    const ledgers: FundFlowLedgerRow[] = directLedgers
      .map((ledger): FundFlowLedgerRow => {
        const period = periodMap.get(ledger.id)?.period ?? zeroDrCr();
        const opening = openingMap.get(ledger.id)?.closing ?? zeroDrCr();
        const closing = closingMap.get(ledger.id)?.closing ?? zeroDrCr();

        return {
          type: "LEDGER",
          ledger: toIdValue(ledger, "name"),
          group: toIdValue(group, "name"),
          amount: {
            opening: roundDrCr(
              opening,
              params.roundingMethod,
              params.roundingPrecision,
            ),
            debit: applyRound(
              period.dr,
              params.roundingMethod,
              params.roundingPrecision,
            ),
            credit: applyRound(
              period.cr,
              params.roundingMethod,
              params.roundingPrecision,
            ),
            closing: roundDrCr(
              closing,
              params.roundingMethod,
              params.roundingPrecision,
            ),
          },
        };
      })
      .filter(
        (row) =>
          params.includeZero ||
          !isZeroDrCr(row.amount.opening) ||
          row.amount.debit !== 0 ||
          row.amount.credit !== 0 ||
          !isZeroDrCr(row.amount.closing),
      );

    const children = (childMap.get(groupId) ?? [])
      .map((child) => buildNode(child.id))
      .filter((item): item is FundFlowGroupRecursiveRow => Boolean(item));

    const totalOpening = ledgers.reduce(
      (acc, row) => addDrCr(acc, row.amount.opening),
      zeroDrCr(),
    );
    const totalClosing = ledgers.reduce(
      (acc, row) => addDrCr(acc, row.amount.closing),
      zeroDrCr(),
    );
    const totalDebit = ledgers.reduce((sum, row) => sum + row.amount.debit, 0);
    const totalCredit = ledgers.reduce(
      (sum, row) => sum + row.amount.credit,
      0,
    );

    for (const child of children) {
      totalOpening.dr += child.amount.opening.dr;
      totalOpening.cr += child.amount.opening.cr;
      totalClosing.dr += child.amount.closing.dr;
      totalClosing.cr += child.amount.closing.cr;
    }

    const node: FundFlowGroupRecursiveRow = {
      type: "GROUP",
      group: toIdValue(group, "name"),
      parent: group.parentId
        ? toIdValue(groupMap.get(group.parentId), "name")
        : null,
      primaryCategory: group.primaryCategory,
      amount: {
        opening: roundDrCr(
          totalOpening,
          params.roundingMethod,
          params.roundingPrecision,
        ),
        debit: applyRound(
          totalDebit +
            children.reduce((sum, item) => sum + item.amount.debit, 0),
          params.roundingMethod,
          params.roundingPrecision,
        ),
        credit: applyRound(
          totalCredit +
            children.reduce((sum, item) => sum + item.amount.credit, 0),
          params.roundingMethod,
          params.roundingPrecision,
        ),
        closing: roundDrCr(
          totalClosing,
          params.roundingMethod,
          params.roundingPrecision,
        ),
      },
      ledgers,
      children,
    };

    if (
      !params.includeZero &&
      isZeroDrCr(node.amount.opening) &&
      node.amount.debit === 0 &&
      node.amount.credit === 0 &&
      isZeroDrCr(node.amount.closing) &&
      node.ledgers.length === 0 &&
      node.children.length === 0
    ) {
      return null;
    }

    return node;
  };

  return buildNode(params.groupId);
};

export const fundFlowEngineService = {
  async getFundFlow(params: {
    input: FundFlowRequestInput;
    fyMeta: CompanyFinancialYear;
  }): Promise<FundFlowResponse> {
    logger.info("entering::getFundFlow::report::service");
    const { input, fyMeta } = params;

    const store = requestStorage.getStore();
    const settings = store?.settings;
    const roundingPrecision = settings?.roundingPrecision ?? 2;
    const roundingMethod = settings?.roundingMethod ?? RoundFormat.TO_FIXED;
    const includeZero = input.includeZero ?? false;

    const [allGroups, allLedgers] = await Promise.all([
      commonGetService.getAllElements<"Group">({
        cacheCode: "GROUP",
        canNullReturnable: true,
        modelName: "Group",
        shortCode: "GROUP",
        useActiveFlag: true,
      }) as Promise<Group[]>,
      commonGetService.getAllElements<"Ledger">({
        cacheCode: "LEDGER",
        canNullReturnable: true,
        modelName: "Ledger",
        shortCode: "LEDGER",
        useActiveFlag: true,
      }) as Promise<Ledger[]>,
    ]);

    const groups = allGroups.filter(
      (g) =>
        g.companyId === input.companyId &&
        g.reportType === AccountingReportType.BALANCE_SHEET,
    );
    const ledgers = allLedgers.filter((l) => l.companyId === input.companyId);

    const periodRange = getPeriodInput(input);
    const ancestorMap = buildGroupAncestorsMap(groups);

    const currentAssetRootGroup = groups.find(
      (g) => g.name === "Current Assets",
    );
    const currentLiabilityRootGroup = groups.find(
      (g) => g.name === "Current Liabilities",
    );
    const currentAssetRootIds = currentAssetRootGroup
      ? [currentAssetRootGroup.id]
      : [];
    const currentLiabilityRootIds = currentLiabilityRootGroup
      ? [currentLiabilityRootGroup.id]
      : [];

    const currentAssetGroupIds = groups
      .filter((g) => {
        const ancestors = ancestorMap.get(g.id) ?? [];
        return currentAssetRootIds.some((id) => ancestors.includes(id));
      })
      .map((g) => g.id);

    const currentLiabilityGroupIds = groups
      .filter((g) => {
        const ancestors = ancestorMap.get(g.id) ?? [];
        return currentLiabilityRootIds.some((id) => ancestors.includes(id));
      })
      .map((g) => g.id);

    const currentAssetLedgerIds = ledgers
      .filter((l) => currentAssetGroupIds.includes(l.groupId))
      .map((l) => l.id);
    const currentLiabilityLedgerIds = ledgers
      .filter((l) => currentLiabilityGroupIds.includes(l.groupId))
      .map((l) => l.id);

    if (input.view === "MONTHLY") {
      const months = await buildMonthlyRows({
        companyId: input.companyId,
        financialYearId: input.financialYearId,
        booksBeginFrom: fyMeta.booksBeginFrom,
        fromDate: input.fromDate,
        toDate: input.toDate,
        ccId: input.ccId,
        currentAssetLedgerIds,
        currentLiabilityLedgerIds,
        roundingMethod,
        roundingPrecision,
        includeZero,
      });

      const openingWorkingCapital = months.reduce(
        (acc, month) => acc + month.openingWorkingCapital,
        0,
      );
      const closingWorkingCapital = months.reduce(
        (acc, month) => acc + month.closingWorkingCapital,
        0,
      );
      const fundFlow = months.reduce((acc, month) => acc + month.fundFlow, 0);

      const response: FundFlowMonthlyResponse = {
        view: "MONTHLY",
        months,
        totals: {
          openingWorkingCapital,
          closingWorkingCapital,
          fundFlow,
        },
      };

      logger.info("exiting::getFundFlow::report::service");
      return response;
    }

    const groupRows = await buildGroupMovementRows({
      companyId: input.companyId,
      financialYearId: input.financialYearId,
      booksBeginFrom: fyMeta.booksBeginFrom,
      fromDate: periodRange.fromDate,
      toDate: periodRange.toDate,
      ccId: input.ccId,
      groups,
      ledgers,
      includeZero,
    });

    const isUnderRoot = (groupId: number, rootIds: number[]) => {
      const ancestors = ancestorMap.get(groupId) ?? [];
      return rootIds.some((id) => ancestors.includes(id));
    };

    const openingWc = await getWorkingCapitalSnapshot({
      companyId: input.companyId,
      financialYearId: input.financialYearId,
      booksBeginFrom: fyMeta.booksBeginFrom,
      asOnDate: dayjs(periodRange.fromDate)
        .subtract(1, "day")
        .endOf("day")
        .toDate(),
      ccId: input.ccId,
      currentAssetLedgerIds,
      currentLiabilityLedgerIds,
      includeZero,
    });

    const closingWc = await getWorkingCapitalSnapshot({
      companyId: input.companyId,
      financialYearId: input.financialYearId,
      booksBeginFrom: fyMeta.booksBeginFrom,
      asOnDate: periodRange.toDate,
      ccId: input.ccId,
      currentAssetLedgerIds,
      currentLiabilityLedgerIds,
      includeZero,
    });

    const diffWc = closingWc.workingCapital - openingWc.workingCapital;

    if (input.view === "SUMMARY") {
      const sourceRows: FundFlowSummaryRow[] = [];
      const applicationRows: FundFlowSummaryRow[] = [];

      const summaryLevel = input.summaryLevel ?? "LOWEST";

      const eligibleRows = groupRows.filter(
        (row) =>
          !isUnderRoot(row.groupId, currentAssetRootIds) &&
          !isUnderRoot(row.groupId, currentLiabilityRootIds) &&
          (includeZero || row.source !== 0 || row.application !== 0),
      );

      const hasChildInEligibleRows = (groupId: number) =>
        eligibleRows.some((row) => row.parentId === groupId);

      const summaryRows =
        summaryLevel === "ROOT"
          ? eligibleRows.filter((row) => row.parentId === null)
          : eligibleRows.filter((row) => !hasChildInEligibleRows(row.groupId));

      for (const row of summaryRows) {
        if (row.source > 0) {
          sourceRows.push({
            type: "GROUP",
            group: { id: row.groupId, value: row.groupName },
            amount: applyRound(row.source, roundingMethod, roundingPrecision),
          });
        }

        if (row.application > 0) {
          applicationRows.push({
            type: "GROUP",
            group: { id: row.groupId, value: row.groupName },
            amount: applyRound(
              row.application,
              roundingMethod,
              roundingPrecision,
            ),
          });
        }
      }

      const pl = await reportService.getProfitLoss({
        companyId: input.companyId,
        financialYearId: input.financialYearId,
        fromDate: periodRange.fromDate,
        toDate: periodRange.toDate,
        ccId: input.ccId,
        includeZero,
      });

      const netProfit = applyRound(
        pl.totals.netProfit,
        roundingMethod,
        roundingPrecision,
      );

      if (netProfit > 0) {
        sourceRows.push({
          type: "SYSTEM",
          group: { id: -1, value: "Net Profit" },
          amount: netProfit,
        });
      } else if (netProfit < 0) {
        applicationRows.push({
          type: "SYSTEM",
          group: { id: -1, value: "Net Loss" },
          amount: Math.abs(netProfit),
        });
      }

      const sourceTotal = sourceRows.reduce((sum, row) => sum + row.amount, 0);
      const applicationTotal = applicationRows.reduce(
        (sum, row) => sum + row.amount,
        0,
      );

      const workingCapital = {
        groups: [
          {
            group: toIdValue(currentAssetRootGroup, "name"),
            opening: roundDrCr(
              toAssetDrCr(openingWc.currentAssets),
              roundingMethod,
              roundingPrecision,
            ),
            closing: roundDrCr(
              toAssetDrCr(closingWc.currentAssets),
              roundingMethod,
              roundingPrecision,
            ),
          },
          {
            group: toIdValue(currentLiabilityRootGroup, "name"),
            opening: roundDrCr(
              toLiabilityDrCr(openingWc.currentLiabilities),
              roundingMethod,
              roundingPrecision,
            ),
            closing: roundDrCr(
              toLiabilityDrCr(closingWc.currentLiabilities),
              roundingMethod,
              roundingPrecision,
            ),
          },
        ],
        openingWorkingCapital: roundDrCr(
          toAssetDrCr(openingWc.workingCapital),
          roundingMethod,
          roundingPrecision,
        ),
        closingWorkingCapital: roundDrCr(
          toAssetDrCr(closingWc.workingCapital),
          roundingMethod,
          roundingPrecision,
        ),
        increase:
          diffWc > 0
            ? applyRound(diffWc, roundingMethod, roundingPrecision)
            : 0,
        decrease:
          diffWc < 0
            ? applyRound(Math.abs(diffWc), roundingMethod, roundingPrecision)
            : 0,
      };

      const response: FundFlowSummaryResponse = {
        view: "SUMMARY",
        month: input.month,
        sources: sourceRows,
        applications: applicationRows,
        workingCapital,
        totals: {
          sources: applyRound(sourceTotal, roundingMethod, roundingPrecision),
          applications: applyRound(
            applicationTotal,
            roundingMethod,
            roundingPrecision,
          ),
          difference: applyRound(
            sourceTotal - applicationTotal,
            roundingMethod,
            roundingPrecision,
          ),
        },
      };

      logger.info("exiting::getFundFlow::report::service");
      return response;
    }

    const groupTree =
      input.groupId !== undefined
        ? await buildGroupDetailTree({
            companyId: input.companyId,
            financialYearId: input.financialYearId,
            booksBeginFrom: fyMeta.booksBeginFrom,
            fromDate: periodRange.fromDate,
            toDate: periodRange.toDate,
            ccId: input.ccId,
            groupId: input.groupId,
            groups,
            ledgers,
            includeZero,
            roundingMethod,
            roundingPrecision,
          })
        : null;

    const totals: FundFlowLedgerAmount = groupTree
      ? groupTree.amount
      : {
          opening: zeroDrCr(),
          debit: 0,
          credit: 0,
          closing: zeroDrCr(),
        };

    const response: FundFlowGroupDetailResponse = {
      view: "GROUP_DETAIL",
      month: input.month,
      groupTree,
      totals,
    };

    logger.info("exiting::getFundFlow::report::service");
    return response;
  },
};
