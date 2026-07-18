import { auditProxy } from "@/config/audit.config.js";
import {
  ChartOfAccountsResponse,
  ChartOfAccountsSection,
  GroupForChartOfAccounts,
} from "@/types/master/chartOfAccounts.js";
import { validateIdCompany } from "@/validations/service/company/company.service.validation.js";
import { commonGetService } from "../common.service.js";
import ExcelJs from "exceljs";
import { logger } from "@repo/platform/logging/logger.js";
import { toRequiredIdValue } from "@repo/shared/utils/helper.utils.js";

const chartOfAccountsServiceRaw = {
  async fetchChartOfAccounts(
    companyId: number,
  ): Promise<ChartOfAccountsResponse> {
    logger.info("entering::fetchChartOfAccounts::service");

    await validateIdCompany(companyId);

    const allGroups = await commonGetService.getAllElements<"Group">({
      cacheCode: "GROUP",
      canNullReturnable: true,
      modelName: "Group",
      shortCode: "GROUP",
      useActiveFlag: true,
    });

    const allLedgers = await commonGetService.getAllElements<"Ledger">({
      cacheCode: "LEDGER",
      canNullReturnable: true,
      modelName: "Ledger",
      shortCode: "LEDGER",
      useActiveFlag: true,
    });

    const groups = allGroups
      .filter((g) => g.companyId === companyId)
      .sort((a, b) => a.name.localeCompare(b.name));

    const ledgers = allLedgers
      .filter((l) => l.companyId === companyId)
      .sort((a, b) => a.name.localeCompare(b.name));

    const getSectionKey = (
      primaryCategory: string,
    ): keyof ChartOfAccountsResponse | null => {
      switch (primaryCategory) {
        case "ASSET":
          return "assets";
        case "LIABILITY":
          return "liabilities";
        case "INCOME":
          return "income";
        case "EXPENSE":
          return "expenses";
        default:
          return null;
      }
    };

    const response: ChartOfAccountsResponse = {
      assets: {
        name: "Assets",
        groups: [],
      },
      liabilities: {
        name: "Liabilities",
        groups: [],
      },
      income: {
        name: "Income",
        groups: [],
      },
      expenses: {
        name: "Expenses",
        groups: [],
      },
      totalGroups: groups.length,
      totalLedgers: ledgers.length,
    };

    const groupMap = new Map<number, GroupForChartOfAccounts>();

    for (const group of groups) {
      groupMap.set(group.id, {
        group: toRequiredIdValue(group, "name"),
        parent: null,
        children: [],
        ledgers: [],
      });
    }

    for (const ledger of ledgers) {
      const groupNode = groupMap.get(ledger.groupId);

      if (!groupNode) {
        continue;
      }

      groupNode.ledgers.push({
        ledger: toRequiredIdValue(ledger, "name"),
        parent: groupNode.group,
      });
    }

    for (const group of groups) {
      const groupNode = groupMap.get(group.id);

      if (!groupNode) {
        continue;
      }

      const parentId = group.parentId ?? null;

      if (parentId) {
        const parentNode = groupMap.get(parentId);

        if (parentNode) {
          groupNode.parent = parentNode.group;
          parentNode.children.push(groupNode);
          continue;
        }
      }

      const sectionKey = getSectionKey(group.primaryCategory);

      if (!sectionKey) {
        continue;
      }

      (response[sectionKey] as ChartOfAccountsSection).groups.push(groupNode);
    }

    logger.info("exiting::fetchChartOfAccounts::service");

    return response;
  },
  async exportChartOfAccountsExcel(companyId: number) {
    logger.info("entering::exportChartOfAccountsExcel::service");

    const company = await validateIdCompany(companyId);
    const chartOfAccounts = await this.fetchChartOfAccounts(companyId);

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Chart of Accounts");

    ws.columns = [{ key: "name", width: 55 }];

    ws.views = [{ showGridLines: true }];

    const borderColor = { argb: "FF000000" };

    const cellBorder = {
      top: { style: "thin" as const, color: borderColor },
      left: { style: "thin" as const, color: borderColor },
      bottom: { style: "thin" as const, color: borderColor },
      right: { style: "thin" as const, color: borderColor },
    };

    const setCommonCellStyle = (cell: ExcelJs.Cell, indent: number) => {
      cell.alignment = {
        horizontal: "left",
        vertical: "middle",
        indent,
      };

      cell.border = cellBorder;
    };
    const setHeaderCellStyle = (cell: ExcelJs.Cell) => {
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      cell.border = cellBorder;
    };

    ws.getCell(1, 1).value = company.name;
    ws.getCell(1, 1).font = {
      name: "Arial",
      size: 14,
      bold: true,
      italic: false,
    };
    setHeaderCellStyle(ws.getCell(1, 1));

    ws.getCell(2, 1).value = "Chart of Accounts";
    ws.getCell(2, 1).font = {
      name: "Arial",
      size: 11,
      bold: true,
      italic: false,
    };
    setHeaderCellStyle(ws.getCell(2, 1));

    let rowNo = 3;

    const addSectionRow = (name: string) => {
      const row = ws.getRow(rowNo);
      row.height = 20;

      const cell = ws.getCell(rowNo, 1);
      cell.value = name;
      cell.font = {
        name: "Arial",
        size: 14,
        bold: true,
        italic: false,
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFA6A6A6" },
      };

      setCommonCellStyle(cell, 0);

      rowNo++;
    };

    const addGroupRow = (name: string, level: number) => {
      const isMainGroup = level === 0;

      const row = ws.getRow(rowNo);
      row.height = 18;

      const cell = ws.getCell(rowNo, 1);
      cell.value = name;
      cell.font = {
        name: "Arial",
        size: 10,
        bold: true,
        italic: !isMainGroup,
      };

      setCommonCellStyle(cell, isMainGroup ? 0 : level);

      rowNo++;
    };

    const addLedgerRow = (name: string, level: number) => {
      const row = ws.getRow(rowNo);
      row.height = 18;

      const cell = ws.getCell(rowNo, 1);
      cell.value = name;
      cell.font = {
        name: "Arial",
        size: 10,
        bold: false,
        italic: true,
      };

      setCommonCellStyle(cell, level);

      rowNo++;
    };

    const addGroupWithChildren = (
      group: GroupForChartOfAccounts,
      level: number,
    ) => {
      addGroupRow(group.group.value, level);

      for (const ledger of group.ledgers ?? []) {
        addLedgerRow(ledger.ledger.value, level + 1);
      }

      for (const child of group.children ?? []) {
        addGroupWithChildren(child, level + 1);
      }
    };

    const addSection = (section: ChartOfAccountsSection) => {
      addSectionRow(section.name);

      for (const group of section.groups ?? []) {
        addGroupWithChildren(group, 0);
      }
    };

    addSection(chartOfAccounts.assets);
    addSection(chartOfAccounts.liabilities);
    addSection(chartOfAccounts.expenses);
    addSection(chartOfAccounts.income);

    ws.getCell(rowNo, 1).value =
      `Total ${chartOfAccounts.totalGroups} Group(s) and ${chartOfAccounts.totalLedgers} Ledger(s)`;
    ws.getCell(rowNo, 1).font = {
      name: "Arial",
      size: 10,
      bold: true,
      italic: false,
    };
    setHeaderCellStyle(ws.getCell(rowNo, 1));
    rowNo++;
    logger.info("exiting::exportChartOfAccountsExcel::service");

    return wb;
  },
};

export const chartOfAccountsService = auditProxy.createAuditedService(
  "chartOfAccounts",
  chartOfAccountsServiceRaw,
);
