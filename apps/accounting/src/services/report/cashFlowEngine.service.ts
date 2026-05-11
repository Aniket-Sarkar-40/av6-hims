import dayjs from "dayjs";
import { RoundFormat, applyRound, toIdValue } from "av6-utils";

import { requestStorage } from "@/config/requestContext.js";
import { getCashFlowVouchersFromDb } from "@/repository/voucher/voucher.repository.js";
import { commonGetService } from "@/services/common.service.js";
import { getLedgerBalancesNumber } from "@/services/report/ledgerBalanceEngine.service.js";
import {
  CashFlowAmount,
  CashFlowGroupDetailResponse,
  CashFlowGroupRecursiveRow,
  CashFlowLedgerRow,
  CashFlowMonthDetailResponse,
  CashFlowMonthlyResponse,
  CashFlowMovementRow,
  CashFlowNode,
  CashFlowRequestInput,
  CashFlowResponse,
  InternalCashFlowNode,
} from "@/types/reports/cashFlow.js";
import { DrCr, Group, Ledger } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";

const zeroCashFlowAmount = (): CashFlowAmount => ({
  inflow: 0,
  outflow: 0,
  net: 0,
});

const addCashFlowAmount = (
  a: CashFlowAmount,
  b: CashFlowAmount
): CashFlowAmount => ({
  inflow: a.inflow + b.inflow,
  outflow: a.outflow + b.outflow,
  net: a.net + b.net,
});

const isZeroCashFlowAmount = (amount: CashFlowAmount) =>
  amount.inflow === 0 && amount.outflow === 0 && amount.net === 0;

const getMonthKey = (date: Date) => dayjs(date).format("YYYY-MM");

const getMonthName = (month: string) =>
  dayjs(`${month}-01`).format("MMMM YYYY");

const getMonthDateRange = (month: string) => {
  const start = dayjs(`${month}-01`).startOf("month");
  const end = dayjs(`${month}-01`).endOf("month");

  return {
    fromDate: start.toDate(),
    toDate: end.toDate(),
  };
};

const roundAmount = (
  amount: CashFlowAmount,
  method: RoundFormat,
  precision: number
): CashFlowAmount => ({
  inflow: applyRound(amount.inflow, method, precision),
  outflow: applyRound(amount.outflow, method, precision),
  net: applyRound(amount.net, method, precision),
});

const createGroupMap = (groups: Group[]) => {
  const map = new Map<number, Group>();
  for (const group of groups) map.set(group.id, group);
  return map;
};

const createLedgerMap = (ledgers: Ledger[]) => {
  const map = new Map<number, Ledger>();
  for (const ledger of ledgers) map.set(ledger.id, ledger);
  return map;
};

const createChildrenGroupMap = (groups: Group[]) => {
  const map = new Map<number | null, Group[]>();

  for (const group of groups) {
    const key = group.parentId ?? null;
    const list = map.get(key) ?? [];
    list.push(group);
    map.set(key, list);
  }

  for (const list of map.values()) {
    list.sort((a, b) => a.id - b.id || a.name.localeCompare(b.name));
  }

  return map;
};

const createGroupAncestorsMap = (groups: Group[]) => {
  const groupMap = createGroupMap(groups);
  const result = new Map<number, number[]>();

  for (const group of groups) {
    const ancestors: number[] = [];
    let currentId: number | null = group.id;

    while (currentId) {
      ancestors.push(currentId);
      const current = groupMap.get(currentId);
      currentId = current?.parentId ?? null;
    }

    result.set(group.id, ancestors);
  }

  return result;
};

const createLedgersByGroupMap = (ledgers: Ledger[]) => {
  const map = new Map<number, Ledger[]>();

  for (const ledger of ledgers) {
    const list = map.get(ledger.groupId) ?? [];
    list.push(ledger);
    map.set(ledger.groupId, list);
  }

  for (const list of map.values()) {
    list.sort((a, b) => a.id - b.id || a.name.localeCompare(b.name));
  }

  return map;
};

const createRowsByGroupIdMap = (rows: CashFlowMovementRow[]) => {
  const map = new Map<number, CashFlowMovementRow[]>();

  for (const row of rows) {
    const groupId = row.group?.id;
    if (!groupId) continue;

    const list = map.get(groupId) ?? [];
    list.push(row);
    map.set(groupId, list);
  }

  return map;
};

const createRowsByLedgerIdMap = (rows: CashFlowMovementRow[]) => {
  const map = new Map<number, CashFlowMovementRow[]>();

  for (const row of rows) {
    const ledgerId = row.ledger?.id;
    if (!ledgerId) continue;

    const list = map.get(ledgerId) ?? [];
    list.push(row);
    map.set(ledgerId, list);
  }

  return map;
};

const getTotalsFromMovementRows = (
  rows: CashFlowMovementRow[],
  roundingMethod: RoundFormat,
  roundingPrecision: number
): CashFlowAmount => {
  const total = rows.reduce(
    (acc, row) => ({
      inflow: acc.inflow + row.inflow,
      outflow: acc.outflow + row.outflow,
      net: acc.net + row.net,
    }),
    zeroCashFlowAmount()
  );

  return roundAmount(total, roundingMethod, roundingPrecision);
};

const getCashBankBalance = async (input: {
  companyId: number;
  financialYearId: number;
  fromDate: Date;
  toDate: Date;
  ccId?: number;
  cashBankLedgerIds: number[];
}) => {
  const balances = await getLedgerBalancesNumber({
    companyId: input.companyId,
    financialYearId: input.financialYearId,
    fromDate: input.fromDate,
    toDate: input.toDate,
    ccId: input.ccId,
    ledgerIds: input.cashBankLedgerIds,
    includeZero: true,
  });

  let opening = 0;
  let closing = 0;

  for (const row of balances) {
    opening += row.opening.dr - row.opening.cr;
    closing += row.closing.dr - row.closing.cr;
  }

  return { opening, closing };
};

const buildMovementRows = async (params: {
  input: CashFlowRequestInput;
  groups: Group[];
  ledgers: Ledger[];
}): Promise<CashFlowMovementRow[]> => {
  const { input, groups, ledgers } = params;

  const ledgerMap = createLedgerMap(ledgers);
  const groupMap = createGroupMap(groups);

  const vouchers = await getCashFlowVouchersFromDb({
    companyId: input.companyId,
    financialYearId: input.financialYearId,
    fromDate: input.fromDate,
    toDate: input.toDate,
    ccId: input.ccId,
  });

  const rows: CashFlowMovementRow[] = [];

  for (const voucher of vouchers) {
    const cashBankLines = voucher.voucherLines.filter((line) => {
      const ledger = ledgerMap.get(line.ledgerId);
      return Boolean(ledger?.isCashAccount) || Boolean(ledger?.isBankAccount);
    });

    const oppositeLines = voucher.voucherLines.filter((line) => {
      const ledger = ledgerMap.get(line.ledgerId);
      return !ledger?.isCashAccount && !ledger?.isBankAccount;
    });

    if (!cashBankLines.length || !oppositeLines.length) continue;

    const totalOppositeAmount = oppositeLines.reduce(
      (sum, line) => sum + Number(line.amount ?? 0),
      0
    );
    if (totalOppositeAmount <= 0) continue;

    for (const cashLine of cashBankLines) {
      const cashAmount = Number(cashLine.amount ?? 0);
      if (cashAmount <= 0) continue;

      const inflow = cashLine.drCr === DrCr.DR ? cashAmount : 0;
      const outflow = cashLine.drCr === DrCr.CR ? cashAmount : 0;

      if (inflow <= 0 && outflow <= 0) continue;

      for (const oppositeLine of oppositeLines) {
        const oppositeAmount = Number(oppositeLine.amount ?? 0);
        if (oppositeAmount <= 0) continue;

        const oppositeLedger = ledgerMap.get(oppositeLine.ledgerId);
        if (!oppositeLedger?.groupId) continue;

        const group = groupMap.get(oppositeLedger.groupId);
        if (!group) continue;

        const parentGroup = group.parentId
          ? groupMap.get(group.parentId)
          : undefined;
        const ratio = oppositeAmount / totalOppositeAmount;

        const allocatedInflow = inflow * ratio;
        const allocatedOutflow = outflow * ratio;

        rows.push({
          voucherId: voucher.id,
          voucherNo: voucher.voucherNo,
          voucherDate: voucher.voucherDate,
          narration: voucher.narration,
          month: getMonthKey(voucher.voucherDate),
          group: toIdValue(group, "name"),
          parentGroup: toIdValue(parentGroup, "name"),
          ledger: toIdValue(oppositeLedger, "name"),
          inflow: allocatedInflow,
          outflow: allocatedOutflow,
          net: allocatedOutflow - allocatedInflow,
        });
      }
    }
  }

  return rows;
};

const buildCashFlowGroupTree = (params: {
  groups: Group[];
  movementRows: CashFlowMovementRow[];
  includeZero: boolean;
  roundingMethod: RoundFormat;
  roundingPrecision: number;
}) => {
  const {
    groups,
    movementRows,
    includeZero,
    roundingMethod,
    roundingPrecision,
  } = params;

  const nodeMap = new Map<number, InternalCashFlowNode>();

  for (const group of groups) {
    nodeMap.set(group.id, {
      id: group.id,
      name: group.name,
      parentId: group.parentId ?? null,
      amount: zeroCashFlowAmount(),
      children: [],
    });
  }

  for (const row of movementRows) {
    let groupId = row.group?.id ?? null;

    while (groupId) {
      const node = nodeMap.get(groupId);
      if (!node) break;

      node.amount = addCashFlowAmount(node.amount, {
        inflow: row.inflow,
        outflow: row.outflow,
        net: row.net,
      });

      groupId = node.parentId;
    }
  }

  const roots: InternalCashFlowNode[] = [];

  for (const node of nodeMap.values()) {
    if (node.parentId && nodeMap.has(node.parentId))
      nodeMap.get(node.parentId)!.children.push(node);
    else roots.push(node);
  }

  const sortTree = (nodes: InternalCashFlowNode[]) => {
    nodes.sort((a, b) => a.id - b.id || a.name.localeCompare(b.name));
    for (const node of nodes) sortTree(node.children);
  };

  sortTree(roots);

  const prune = (nodes: InternalCashFlowNode[]): InternalCashFlowNode[] =>
    nodes
      .map((node) => ({
        ...node,
        amount: roundAmount(node.amount, roundingMethod, roundingPrecision),
        children: prune(node.children),
      }))
      .filter(
        (node) =>
          includeZero ||
          !isZeroCashFlowAmount(node.amount) ||
          node.children.length > 0
      );

  const filteredRoots = prune(roots);

  const toCashFlowNode = (node: InternalCashFlowNode): CashFlowNode => ({
    group: toIdValue(node, "name"),
    parent: node.parentId
      ? toIdValue(nodeMap.get(node.parentId), "name")
      : null,
    amount: node.amount,
    children: node.children.map(toCashFlowNode),
  });

  return filteredRoots.map(toCashFlowNode);
};

const buildRecursiveGroupDetailTree = (params: {
  rootGroupId: number;
  groups: Group[];
  ledgers: Ledger[];
  movementRows: CashFlowMovementRow[];
  includeZero: boolean;
  roundingMethod: RoundFormat;
  roundingPrecision: number;
}): CashFlowGroupRecursiveRow | null => {
  const {
    rootGroupId,
    groups,
    ledgers,
    movementRows,
    includeZero,
    roundingMethod,
    roundingPrecision,
  } = params;

  const groupMap = createGroupMap(groups);
  const childrenGroupMap = createChildrenGroupMap(groups);
  const ledgersByGroupMap = createLedgersByGroupMap(ledgers);
  const rowsByGroupIdMap = createRowsByGroupIdMap(movementRows);
  const rowsByLedgerIdMap = createRowsByLedgerIdMap(movementRows);

  const buildNode = (groupId: number): CashFlowGroupRecursiveRow | null => {
    const currentGroup = groupMap.get(groupId);
    if (!currentGroup) return null;

    const currentRows = rowsByGroupIdMap.get(groupId) ?? [];
    const currentAmount = getTotalsFromMovementRows(
      currentRows,
      roundingMethod,
      roundingPrecision
    );

    const directLedgers = (ledgersByGroupMap.get(groupId) ?? [])
      .map((ledger): CashFlowLedgerRow => {
        const ledgerRows = rowsByLedgerIdMap.get(ledger.id) ?? [];

        return {
          type: "LEDGER",
          ledger: toIdValue(ledger, "name"),
          group: toIdValue(currentGroup, "name"),
          amount: getTotalsFromMovementRows(
            ledgerRows,
            roundingMethod,
            roundingPrecision
          ),
        };
      })
      .filter((row) => includeZero || !isZeroCashFlowAmount(row.amount));

    const children = (childrenGroupMap.get(groupId) ?? [])
      .map((childGroup) => buildNode(childGroup.id))
      .filter((item): item is CashFlowGroupRecursiveRow => Boolean(item));

    const node: CashFlowGroupRecursiveRow = {
      type: "GROUP",
      group: toIdValue(currentGroup, "name"),
      parent: currentGroup.parentId
        ? toIdValue(groupMap.get(currentGroup.parentId), "name")
        : null,
      amount: currentAmount,
      ledgers: directLedgers,
      children,
    };

    if (!includeZero) {
      const hasOwnAmount = !isZeroCashFlowAmount(node.amount);
      const hasLedgers = node.ledgers.length > 0;
      const hasChildren = node.children.length > 0;

      if (!hasOwnAmount && !hasLedgers && !hasChildren) return null;
    }

    return node;
  };

  return buildNode(rootGroupId);
};

const filterRowsByMonth = (rows: CashFlowMovementRow[], month?: string) => {
  if (!month) return rows;
  return rows.filter((row) => row.month === month);
};

const filterRowsByGroupScope = (
  rows: CashFlowMovementRow[],
  selectedGroupId: number | undefined,
  groups: Group[]
) => {
  if (!selectedGroupId) return rows;

  const groupAncestorsMap = createGroupAncestorsMap(groups);

  return rows.filter((row) => {
    const groupId = row.group?.id;
    if (!groupId) return false;

    const ancestors = groupAncestorsMap.get(groupId) ?? [];
    return ancestors.includes(selectedGroupId);
  });
};

export const cashFlowEngineService = {
  async getCashFlow(input: CashFlowRequestInput): Promise<CashFlowResponse> {
    logger.info("entering::getCashFlow::report::service");

    const store = requestStorage.getStore();
    const settings = store?.settings;
    const roundingPrecision = settings?.roundingPrecision ?? 2;
    const roundingMethod = settings?.roundingMethod ?? RoundFormat.TO_FIXED;

    const { companyId, financialYearId, ccId, includeZero = false } = input;

    const allGroups = (await commonGetService.getAllElements<"Group">({
      cacheCode: "GROUP",
      canNullReturnable: true,
      modelName: "Group",
      shortCode: "GROUP",
      useActiveFlag: true,
    })) as Group[];

    const groups = allGroups.filter((group) => group.companyId === companyId);

    const allLedgers = (await commonGetService.getAllElements<"Ledger">({
      cacheCode: "LEDGER",
      canNullReturnable: true,
      modelName: "Ledger",
      shortCode: "LEDGER",
      useActiveFlag: true,
    })) as Ledger[];

    const ledgers = allLedgers.filter(
      (ledger) => ledger.companyId === companyId
    );

    const cashBankLedgerIds = ledgers
      .filter(
        (ledger) =>
          Boolean(ledger.isCashAccount) || Boolean(ledger.isBankAccount)
      )
      .map((ledger) => ledger.id);

    if (!cashBankLedgerIds.length) {
      return {
        view: "MONTHLY",
        openingBalance: 0,
        closingBalance: 0,
        totalInflow: 0,
        totalOutflow: 0,
        netFlow: 0,
        months: [],
      };
    }

    const balanceRange =
      input.month && input.view !== "MONTHLY"
        ? getMonthDateRange(input.month)
        : { fromDate: input.fromDate, toDate: input.toDate };

    const balance = await getCashBankBalance({
      companyId,
      financialYearId,
      fromDate: balanceRange.fromDate,
      toDate: balanceRange.toDate,
      ccId,
      cashBankLedgerIds,
    });

    const allMovementRows = await buildMovementRows({ input, groups, ledgers });
    const monthFilteredRows = filterRowsByMonth(allMovementRows, input.month);

    if (input.view === "MONTHLY") {
      const totals = getTotalsFromMovementRows(
        monthFilteredRows,
        roundingMethod,
        roundingPrecision
      );
      const monthMap = new Map<string, CashFlowAmount>();

      for (const row of monthFilteredRows) {
        const existing = monthMap.get(row.month) ?? zeroCashFlowAmount();

        monthMap.set(
          row.month,
          addCashFlowAmount(existing, {
            inflow: row.inflow,
            outflow: row.outflow,
            net: row.net,
          })
        );
      }

      let runningOpening = balance.opening;

      const months = Array.from(monthMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, amount]) => {
          const roundedAmount = roundAmount(
            amount,
            roundingMethod,
            roundingPrecision
          );
          const openingBalance = applyRound(
            runningOpening,
            roundingMethod,
            roundingPrecision
          );
          const closingBalance = applyRound(
            runningOpening + roundedAmount.net,
            roundingMethod,
            roundingPrecision
          );

          runningOpening = closingBalance;

          return {
            month,
            name: getMonthName(month),
            openingBalance,
            closingBalance,
            amount: roundedAmount,
          };
        });

      const response: CashFlowMonthlyResponse = {
        view: "MONTHLY",
        openingBalance: applyRound(
          balance.opening,
          roundingMethod,
          roundingPrecision
        ),
        closingBalance: applyRound(
          balance.closing,
          roundingMethod,
          roundingPrecision
        ),
        totalInflow: totals.inflow,
        totalOutflow: totals.outflow,
        netFlow: totals.net,
        months,
      };

      logger.info("exiting::getCashFlow::report::service");
      return response;
    }

    if (input.view === "MONTH_DETAIL") {
      const totals = getTotalsFromMovementRows(
        monthFilteredRows,
        roundingMethod,
        roundingPrecision
      );
      const inflowRows = monthFilteredRows.filter((row) => row.inflow > 0);
      const outflowRows = monthFilteredRows.filter((row) => row.outflow > 0);

      const response: CashFlowMonthDetailResponse = {
        view: "MONTH_DETAIL",
        month: input.month!,
        openingBalance: applyRound(
          balance.opening,
          roundingMethod,
          roundingPrecision
        ),
        closingBalance: applyRound(
          balance.closing,
          roundingMethod,
          roundingPrecision
        ),
        inflows: buildCashFlowGroupTree({
          groups,
          movementRows: inflowRows,
          includeZero,
          roundingMethod,
          roundingPrecision,
        }),
        outflows: buildCashFlowGroupTree({
          groups,
          movementRows: outflowRows,
          includeZero,
          roundingMethod,
          roundingPrecision,
        }),
        totals,
      };

      logger.info("exiting::getCashFlow::report::service");
      return response;
    }

    const groupScopedRows = filterRowsByGroupScope(
      monthFilteredRows,
      input.groupId,
      groups
    );
    const totals = getTotalsFromMovementRows(
      groupScopedRows,
      roundingMethod,
      roundingPrecision
    );

    const groupTree =
      input.groupId !== undefined
        ? buildRecursiveGroupDetailTree({
            rootGroupId: input.groupId,
            groups,
            ledgers,
            movementRows: groupScopedRows,
            includeZero,
            roundingMethod,
            roundingPrecision,
          })
        : null;

    const response: CashFlowGroupDetailResponse = {
      view: "GROUP_DETAIL",
      month: input.month,
      openingBalance: applyRound(
        balance.opening,
        roundingMethod,
        roundingPrecision
      ),
      closingBalance: applyRound(
        balance.closing,
        roundingMethod,
        roundingPrecision
      ),
      groupTree,
      totals,
    };

    logger.info("exiting::getCashFlow::report::service");
    return response;
  },
};
