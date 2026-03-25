import { fetchGoodReceiveDashboard } from "@/repository/mis/misPurchaseReport.repository.js";
import { GoodReceiveDashboardData } from "@/types/mis/misBranch.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { toArrayBuffer } from "@repo/shared/utils/helper.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import ExcelJs from "exceljs";

export const misPurchaseReportService = {
  async purchaseReportMisList() {
    logger.info("entering::misPurchaseReportService::purchaseReportMisList");

    const result = await fetchGoodReceiveDashboard();

    logger.info("exiting::misPurchaseReportService::purchaseReportMisList");
    return result;
  },

  async buildGoodReceiveDashboardWorkbook(): Promise<ExcelJs.Workbook> {
    const { monthWise, quarterWise }: GoodReceiveDashboardData =
      await fetchGoodReceiveDashboard();

    if (!monthWise?.length) {
      throw new ErrorHandler(404, generateErrorMessage("EXCEL"));
    }

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Drug Purchases Summary", {
      properties: { defaultRowHeight: 18 },
    });

    ws.pageSetup = { fitToPage: true, fitToWidth: 1, orientation: "landscape" };

    const titleRow = ws.addRow(["MONTHLY DRUG PURCHASES"]);
    titleRow.font = { bold: true, size: 14 };
    ws.mergeCells(titleRow.number, 1, titleRow.number, 2);
    titleRow.alignment = { horizontal: "center" };

    ws.addTable({
      name: "MonthDrug",
      ref: `A${titleRow.number + 2}`,
      headerRow: true,
      style: { theme: "TableStyleMedium2", showRowStripes: true },
      columns: ["Month", "Drugs"].map((h) => ({ name: h, filterButton: true })),
      rows: monthWise.map((m) => [m.month, m.amount]),
    });

    const chartW = 420;
    const chartH = 260;

    const cnc = new ChartJSNodeCanvas({
      width: chartW,
      height: chartH,
      backgroundColour: "white",
    });

    const monthLabels = monthWise
      .filter((m) => m.month.toUpperCase() !== "TOTAL")
      .map((m) => m.month);

    const monthValues = monthWise
      .filter((m) => m.month.toUpperCase() !== "TOTAL")
      .map((m) => m.amount);

    const monthBuf = await cnc.renderToBuffer({
      type: "bar",
      data: {
        labels: monthLabels,
        datasets: [
          {
            label: "Drugs",
            data: monthValues,
            backgroundColor: "#4472C4",
            borderColor: "#4472C4",
            borderWidth: 1,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { maxRotation: 60, minRotation: 60, color: "#333" },
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            ticks: { color: "#333" },
            grid: { color: "#E0E0E0" },
          },
        },
      },
    });

    const monthImageId = wb.addImage({
      buffer: toArrayBuffer(monthBuf),
      extension: "png",
    });

    ws.addImage(monthImageId, {
      tl: { col: 4, row: titleRow.number + 2 },
      ext: { width: chartW, height: chartH },
    });

    const qStart = ws.lastRow!.number + 3;
    ws.getCell(`A${qStart}`).value = "QUARTERLY DRUG PURCHASES";
    ws.getCell(`A${qStart}`).font = { bold: true, size: 12 };
    ws.mergeCells(qStart, 1, qStart, 2);

    ws.addTable({
      name: "QuarterDrug",
      ref: `A${qStart + 1}`,
      headerRow: true,
      style: { theme: "TableStyleMedium2", showRowStripes: true },
      columns: ["Quarter", "Drugs"].map((h) => ({
        name: h,
        filterButton: true,
      })),
      rows: quarterWise.map((q) => [q.period, q.amount]),
    });

    const qLabels = quarterWise
      .filter((q) => q.period.toUpperCase() !== "TOTAL")
      .map((q) => q.period);

    const qValues = quarterWise
      .filter((q) => q.period.toUpperCase() !== "TOTAL")
      .map((q) => q.amount);

    const quarterBuf = await cnc.renderToBuffer({
      type: "bar",
      data: {
        labels: qLabels,
        datasets: [
          {
            label: "Drugs",
            data: qValues,
            backgroundColor: "#4472C4",
            borderColor: "#4472C4",
            borderWidth: 1,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: "#333" } },
          y: {
            beginAtZero: true,
            grid: { color: "#E0E0E0" },
            ticks: { color: "#333" },
          },
        },
      },
    });

    const quarterImageId = wb.addImage({
      buffer: toArrayBuffer(quarterBuf),
      extension: "png",
    });

    ws.addImage(quarterImageId, {
      tl: { col: 4, row: qStart + 1 },
      ext: { width: chartW, height: chartH },
    });

    ws.columns.forEach((col) => {
      let max = 10;
      col.eachCell?.({ includeEmpty: true }, (cell) => {
        const len = cell.value ? String(cell.value).length : 0;
        if (len > max) max = len;
      });
      col.width = max + 2;
    });

    return wb;
  },
};
