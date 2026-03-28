import {
  branchOnMonthExpiration,
  branchOnMonthExpirationAmt,
  getHighestAmountSellDrugByBranch,
  getHighestAmountSellDrugByBranchAll,
  getHighestSellingDrugByBranch,
  getHighestSellingDrugByBranchExcel,
} from "@/repository/mis/branchOnMonthExpiration.repository.js";
import {
  HighestDrugSold,
  HighestDrugSoldReq,
  SearchReqExcelWithDateRange,
} from "@/types/mis/branchOnMonthExpiration.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import dayjs from "dayjs";
import ExcelJs from "exceljs";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";

import { toArrayBuffer } from "@repo/shared/utils/helper.utils.js";

Chart.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
);

export const branchOnMonthExpirationService = {
  async branchOnMonthExpiration(input: SearchReqExcelWithDateRange) {
    logger.info("entering::branchOnMonthExpiration::service");

    const {
      pageNo,
      pageSize,
      sortDir = "DESC",
      searchText,
      categoryId,
      startDate,
      endDate,
    } = input;
    const page = typeof pageNo === "string" ? parseInt(pageNo, 10) : pageNo;
    const perPage =
      typeof pageSize === "string" ? parseInt(pageSize, 10) : pageSize;
    const order = sortDir.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const result = await branchOnMonthExpiration(
      page,
      perPage,
      order,
      searchText,
      categoryId,
      startDate,
      endDate,
    );

    logger.info("exiting::branchOnMonthExpiration::service");
    return result;
  },

  async branchesOnMonthExpirationAmt() {
    logger.info("entering::branchOnMonthExpiration::service");

    const result = await branchOnMonthExpirationAmt();

    logger.info("exiting::branchOnMonthExpiration::service");
    return result;
  },

  async highestSellingDrugByBranch(input: HighestDrugSoldReq) {
    logger.info("entering::highestSellingDrugByBranch::service");

    const {
      pageNo,
      pageSize,
      sortDir = "DESC",
      searchText,
      id: branchId,
      categoryId,
      startDate,
      endDate,
    } = input;
    const page = typeof pageNo === "string" ? parseInt(pageNo, 10) : pageNo;
    const perPage =
      typeof pageSize === "string" ? parseInt(pageSize, 10) : pageSize;
    const order = sortDir.toUpperCase() === "ASC" ? "ASC" : "DESC";
    const id = typeof branchId === "string" ? parseInt(branchId, 10) : branchId;

    const result = await getHighestSellingDrugByBranch(
      page,
      perPage,
      order,
      searchText,
      id,
      categoryId,
      startDate,
      endDate,
    );
    logger.info("exiting::highestSellingDrugByBranch::service");
    return result;
  },

  async highestAmountSellDrugByBranch(params: HighestDrugSoldReq) {
    logger.info("entering::highestSellingDrugByBranch::service");

    const {
      pageNo,
      pageSize,
      sortDir = "DESC",
      searchText,
      id: branchId,
      categoryId,
      startDate,
      endDate,
    } = params;
    const page = typeof pageNo === "string" ? parseInt(pageNo, 10) : pageNo;
    const perPage =
      typeof pageSize === "string" ? parseInt(pageSize, 10) : pageSize;
    const order = sortDir.toUpperCase() === "ASC" ? "ASC" : "DESC";
    const id = typeof branchId === "string" ? parseInt(branchId, 10) : branchId;

    const result = await getHighestAmountSellDrugByBranch(
      page,
      perPage,
      order,
      searchText,
      id,
      categoryId,
      startDate,
      endDate,
    );
    logger.info("exiting::highestSellingDrugByBranch::service");
    return result;
  },

  async buildHighestSellingDrugByBranchWorkbook(
    id: number,
    searchText?: string,
    categoryId?: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<ExcelJs.Workbook> {
    const data: HighestDrugSold[] = await getHighestSellingDrugByBranchExcel(
      id,
      searchText,
      categoryId,
      startDate,
      endDate,
    );
    if (!data.length) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Top Selling Drugs"),
      );
    }

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("HIGHEST QUANTITY SOLD DRUGS BY BRANCH", {
      properties: { defaultRowHeight: 18 },
      pageSetup: { fitToPage: true, fitToWidth: 1, orientation: "landscape" },
    });

    const title = ws.addRow(["HIGHEST SELLING DRUGS BY BRANCH"]);
    title.font = { bold: true, size: 14 };
    ws.mergeCells(title.number, 1, title.number, 6); // merge A-F
    title.alignment = { horizontal: "center" };

    const tableHeaders = [
      "S/N",
      "Item Name",
      "Category",
      "Quantity Sold",
      "MRP",
      "Total",
    ];
    const tableRows = data.map((d, i) => [
      i + 1,
      d.itemName,
      d.category,
      d.quantitySold,
      d.mrp,
      d.total,
    ]);

    ws.addTable({
      name: "HighestSelling",
      ref: `A${title.number + 2}`,
      headerRow: true,
      style: { theme: "TableStyleMedium2", showRowStripes: true },
      columns: tableHeaders.map((h) => ({ name: h, filterButton: true })),
      rows: tableRows,
    });

    ws.getColumn(5).numFmt = "#,##0.00";
    ws.getColumn(6).numFmt = "#,##0.00";

    const grandTotal = data.reduce((sum, d) => sum + (d.total ?? 0), 0);

    ws.addRow([]);

    const totRow = ws.addRow(["TOTAL AMOUNT", "", "", "", "", grandTotal]);

    ws.mergeCells(totRow.number, 1, totRow.number, 5);

    totRow.getCell(1).font = { bold: true };
    totRow.getCell(1).alignment = { horizontal: "center" };
    totRow.getCell(6).numFmt = "#,##0.00";
    totRow.getCell(6).font = { bold: true };
    totRow.getCell(6).alignment = { horizontal: "right" };

    totRow.eachCell((cell) => {
      cell.border = {
        top: { style: "medium" },
        left: { style: "medium" },
        right: { style: "medium" },
        bottom: { style: "medium" },
      };
    });

    ws.columns.forEach((col) => {
      let max = 10;
      if (typeof col.eachCell === "function") {
        col.eachCell({ includeEmpty: true }, (cell) => {
          const len = cell.value ? String(cell.value).length : 0;
          if (len > max) max = len;
        });
      }
      col.width = max + 2;
    });

    return wb;
  },

  async buildHighestAmtSellingDrugByBranchWorkbook(
    id: number,
    searchText?: string,
    categoryId?: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<ExcelJs.Workbook> {
    const data: HighestDrugSold[] = await getHighestAmountSellDrugByBranchAll(
      id,
      searchText,
      categoryId,
      startDate,
      endDate,
    );
    if (!data.length) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Top Amount Selling Drugs"),
      );
    }
    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("HIGHEST AMOUNT SELLING DRUGS BY BRANCH", {
      properties: { defaultRowHeight: 18 },
    });
    ws.pageSetup = { fitToPage: true, fitToWidth: 1, orientation: "landscape" };

    const titleRow = ws.addRow(["HIGHEST SALES AMOUNT DRUG BY BRANCH"]);
    titleRow.font = { bold: true, size: 14 };
    ws.mergeCells(titleRow.number, 1, titleRow.number, 6);
    titleRow.alignment = { horizontal: "center", vertical: "middle" };

    const headers = [
      "Id",
      "Item Name",
      "Category",
      "Quantity Sold",
      "MRP",
      "Total",
    ];
    const tableRows = data.map((d) => [
      d.id,
      d.itemName,
      d.category,
      d.quantitySold,
      d.mrp,
      d.total,
    ]);

    ws.addTable({
      name: "HighestSelling",
      ref: `A${titleRow.number + 2}`,
      headerRow: true,
      style: { theme: "TableStyleMedium2", showRowStripes: true },
      columns: headers.map((h) => ({ name: h, filterButton: true })),
      rows: tableRows,
    });

    ws.getColumn(5).numFmt = "#,##0.00";
    ws.getColumn(6).numFmt = "#,##0.00";

    ws.addRow([]);

    const grandTotal = data.reduce((sum, d) => sum + (d.total ?? 0), 0);
    const totRow = ws.addRow(["GRAND TOTAL", "", "", "", "", grandTotal]);

    ws.mergeCells(totRow.number, 1, totRow.number, 5);

    totRow.getCell(1).font = { bold: true };
    totRow.getCell(1).alignment = { horizontal: "center" };
    totRow.getCell(6).numFmt = "#,##0.00";
    totRow.getCell(6).font = { bold: true };
    totRow.getCell(6).alignment = { horizontal: "right" };

    totRow.eachCell((cell) => {
      cell.border = {
        top: { style: "medium" },
        left: { style: "medium" },
        right: { style: "medium" },
        bottom: { style: "medium" },
      };
    });

    ws.columns.forEach((col) => {
      let max = 10;
      if (typeof col.eachCell === "function") {
        col.eachCell({ includeEmpty: true }, (cell) => {
          const len = cell.value ? String(cell.value).length : 0;
          if (len > max) max = len;
        });
      }
      col.width = max + 2;
    });

    return wb;
  },

  async buildBranchMonthExpirationWorkbook(
    input: SearchReqExcelWithDateRange,
  ): Promise<ExcelJs.Workbook> {
    const {
      pageNo,
      pageSize,
      sortDir = "DESC",
      searchText,
      categoryId,
      startDate,
      endDate,
    } = input;

    const FIRST_PAGE = !Number.isFinite(pageNo) || pageNo < 1 ? 1 : pageNo;
    const EVERY_ROW = Number.MAX_SAFE_INTEGER;

    const { data: rows } = await branchOnMonthExpiration(
      FIRST_PAGE,
      !Number.isFinite(pageSize) || pageSize <= 0 ? EVERY_ROW : pageSize,
      sortDir,
      searchText,
      categoryId,
      startDate,
      endDate,
    );

    if (!rows?.length) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Branch month expiration"),
      );
    }

    const branchTotals = await branchOnMonthExpirationAmt();

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Expiration-APR", {
      properties: { defaultRowHeight: 18 },
      pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1 },
    });

    const monthStr = dayjs(rows[0].expiryDate).format("MMMM").toUpperCase();

    const title = ws.addRow([`EXPIRATION REPORT FOR THE MONTH OF ${monthStr}`]);
    title.font = { bold: true, size: 14 };
    ws.mergeCells(title.number, 1, title.number, 7);
    title.alignment = { horizontal: "center" };

    const headers = [
      "S/N",
      "DESCRIPTION",
      "PHYSICAL QUANTITY",
      "EXPIRY DATE",
      "SELLING PRICE",
      "TOTAL",
      "BRANCH",
    ];

    const itemRows = rows.map((r, i) => [
      i + 1,
      r.itemName,
      r.physicalQty,
      dayjs(r.expiryDate).format("MMM-YY"),
      r.sellingPrice,
      r.total,
      r.branch,
    ]);

    ws.addTable({
      name: `ItemExp_${Date.now()}`,
      ref: `A${title.number + 1}`,
      headerRow: true,
      style: { theme: "TableStyleMedium2", showRowStripes: true },
      columns: headers.map((h) => ({ name: h, filterButton: true })),
      rows: itemRows,
    });

    ws.getColumn(5).numFmt = "#,##0.00";
    ws.getColumn(6).numFmt = "#,##0.00";

    const itemGrand = rows.reduce((s, r) => s + (r.total ?? 0), 0);
    ws.addRow([]);
    const gRow = ws.addRow(["TOTAL", "", "", "", "", itemGrand, ""]);
    ws.mergeCells(gRow.number, 1, gRow.number, 5);
    gRow.getCell(6).numFmt = "#,##0.00";
    gRow.getCell(6).font = { bold: true };
    gRow.getCell(6).alignment = { horizontal: "right" };

    ws.addRow([]);

    const branchStart = ws.lastRow!.number + 1;
    ws.addTable({
      name: `BranchExp_${Date.now()}`,
      ref: `A${branchStart}`,
      headerRow: true,
      style: { theme: "TableStyleMedium2", showRowStripes: true },
      columns: [
        { name: "BRANCH", filterButton: true },
        { name: "AMOUNT", filterButton: true },
      ],
      rows: branchTotals.map((b) => [b.branch, b.amount]),
    });

    ws.getColumn(2).numFmt = "#,##0.00";

    const branchGrand = branchTotals.reduce((s, b) => s + b.amount, 0);
    const brTotRow = ws.addRow(["TOTAL", branchGrand]);
    brTotRow.getCell(2).numFmt = "#,##0.00";
    brTotRow.getCell(2).font = { bold: true };
    brTotRow.getCell(2).alignment = { horizontal: "right" };

    const CH_W = 380;
    const CH_H = 300;
    const CH_ROW = brTotRow.number + 1;

    const COLORS = [
      "#355fd2ff",
      "#ED7D31",
      "#70AD47",
      "#5B9BD5",
      "#A5A5A5",
      "#FFC000",
    ];
    const labels = branchTotals.map((b) => b.branch);
    const values = branchTotals.map((b) => b.amount);

    if (values.some((v) => v > 0)) {
      const palette = labels.map((_, i) => COLORS[i % COLORS.length]);
      const cnc = new ChartJSNodeCanvas({
        width: CH_W,
        height: CH_H,
        backgroundColour: "white",
      });

      const pieBuffer = await cnc.renderToBuffer({
        type: "pie",
        data: {
          labels,
          datasets: [{ data: values, backgroundColor: palette }],
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: `EXPIRATION REPORT FOR THE MONTH OF ${monthStr}`,
              font: { size: 14, style: "italic" },
            },
            legend: { position: "bottom" },
          },
        },
      });

      const barBuffer = await cnc.renderToBuffer({
        type: "bar",
        data: {
          labels,
          datasets: [{ data: values, backgroundColor: palette }],
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: `EXPIRATION REPORT FOR THE MONTH OF ${monthStr}`,
              font: { size: 14, style: "italic" },
            },
            legend: { display: false },
          },
        },
      });

      const pieId = wb.addImage({
        buffer: toArrayBuffer(pieBuffer),
        extension: "png",
      });

      const barId = wb.addImage({
        buffer: toArrayBuffer(barBuffer),
        extension: "png",
      });

      ws.addImage(pieId, {
        tl: { col: 3, row: CH_ROW },
        ext: { width: CH_W, height: CH_H },
      });
      ws.addImage(barId, {
        tl: { col: 6, row: CH_ROW },
        ext: { width: CH_W, height: CH_H },
      });
    }

    return wb;
  },
};
