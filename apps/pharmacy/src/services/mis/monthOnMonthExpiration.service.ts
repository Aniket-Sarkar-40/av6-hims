import { getMonthOnMonthExpirationMis } from "@/repository/mis/monthOnMonthExpiration.repository.js";
import {
  MonthOnMonthExpiration,
  QuarterlyExpiration,
} from "@/types/mis/monthOnMonthExpiration.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { toArrayBuffer } from "@repo/shared/utils/helper.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import ExcelJs from "exceljs";

export const monthOnMonthExpirationService = {
  async getMonthOnMonthExpiration(): Promise<{
    monthWise: MonthOnMonthExpiration[];
    quarterWise: QuarterlyExpiration[];
  }> {
    logger.info("entering::createCity::service");
    const data = await getMonthOnMonthExpirationMis();
    logger.info("exiting::createCity::service");
    return data;
  },

  async buildExpirationMisWorkbook(): Promise<ExcelJs.Workbook> {
    const { monthWise, quarterWise } = await getMonthOnMonthExpirationMis();
    if (!monthWise?.length) {
      throw new ErrorHandler(404, generateErrorMessage("EXCEL"));
    }

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Expiration Summary", {
      properties: { defaultRowHeight: 18 },
    });
    ws.pageSetup = { orientation: "landscape", fitToPage: true, fitToWidth: 1 };

    ws.addRow([]);

    const monthTitle = ws.addRow(["MONTH ON MONTH EXPIRATION REPORT"]);
    monthTitle.font = { bold: true, size: 14 };
    ws.mergeCells(monthTitle.number, 1, monthTitle.number, 3);
    monthTitle.alignment = { horizontal: "center" };

    ws.addTable({
      name: "MonthExp",
      ref: `A${monthTitle.number + 2}`,
      headerRow: true,
      style: { theme: "TableStyleMedium2", showRowStripes: true },
      columns: [
        { name: "S/N", filterButton: true },
        { name: "MONTH", filterButton: true },
        { name: "AMOUNT", filterButton: true },
      ],
      rows: monthWise.map((m, i) => [i + 1, m.expiryMonth, m.amount]),
    });
    ws.getColumn(3).numFmt = "#,##0.00";

    const CHART_W = 480;
    const CHART_H = 265;

    const MONTH_COLORS = [
      "#4472C4",
      "#ED7D31",
      "#A5A5A5",
      "#FFC000",
      "#5B9BD5",
      "#70AD47",
      "#255E91",
      "#9E480E",
      "#768D23",
      "#AF458E",
      "#548235",
      "#4BACC6",
    ];

    const cnc = new ChartJSNodeCanvas({
      width: CHART_W,
      height: CHART_H,
      backgroundColour: "white",
    });

    const monthLabels = monthWise.map((m) => m.expiryMonth);
    const monthValues = monthWise.map((m) => m.amount);
    const monthHasData = monthValues.some((v) => v > 0);

    if (monthHasData) {
      // Pie
      const pieBuf = await cnc.renderToBuffer({
        type: "pie",
        data: {
          labels: monthLabels,
          datasets: [
            {
              data: monthValues,
              backgroundColor: MONTH_COLORS.slice(0, monthLabels.length),
              borderColor: MONTH_COLORS.slice(0, monthLabels.length),
              borderWidth: 1,
            },
          ],
        },
        options: {
          plugins: { legend: { position: "right", labels: { color: "#333" } } },
        },
      });

      const pieId = wb.addImage({
        buffer: toArrayBuffer(pieBuf),
        extension: "png",
      });

      const monthChartRow = monthTitle.number + 2;
      ws.addImage(pieId, {
        tl: { col: 6, row: monthChartRow },
        ext: { width: CHART_W, height: CHART_H },
      });

      // Bar
      const barBuf = await cnc.renderToBuffer({
        type: "bar",
        data: {
          labels: monthLabels,
          datasets: [
            {
              data: monthValues,
              backgroundColor: MONTH_COLORS.slice(0, monthLabels.length),
              borderColor: MONTH_COLORS.slice(0, monthLabels.length),
              borderWidth: 1,
            },
          ],
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: "#333", maxRotation: 60, minRotation: 60 },
            },
            y: {
              beginAtZero: true,
              grid: { color: "#E0E0E0" },
              ticks: { color: "#333" },
            },
          },
        },
      });

      const barId = wb.addImage({
        buffer: toArrayBuffer(barBuf),
        extension: "png",
      });

      ws.addImage(barId, {
        tl: { col: 12, row: monthChartRow },
        ext: { width: CHART_W, height: CHART_H },
      });
    }

    const qStart = ws.lastRow!.number + (monthHasData ? 3 : 2);
    ws.getCell(`A${qStart}`).value = "QUARTERLY EXPIRATION REPORT";
    ws.getCell(`A${qStart}`).font = { bold: true, size: 12 };
    ws.mergeCells(qStart, 1, qStart, 3);

    const quarterRows = quarterWise
      .filter((q) => q.expiryQuarter.toUpperCase() !== "TOTAL")
      .map((q, i) => [i + 1, q.expiryQuarter, q.amount]);

    ws.addTable({
      name: "QuarterExp",
      ref: `A${qStart + 1}`,
      headerRow: true,
      style: { theme: "TableStyleMedium2", showRowStripes: true },
      columns: [
        { name: "S/N", filterButton: true },
        { name: "PERIOD", filterButton: true },
        { name: "AMOUNT", filterButton: true },
      ],
      rows: quarterRows,
    });
    ws.getColumn(3).numFmt = "#,##0.00";

    const qLabels = quarterRows.map((r) => r[1] as string);
    const qValues = quarterRows.map((r) => r[2] as number);
    const quarterHasData = qValues.some((v) => v > 0);

    if (quarterHasData) {
      const QUARTER_COLORS = ["#2E75B6", "#ED7D31", "#70AD47", "#5B9BD5"];

      // Pie
      const qPieBuf = await cnc.renderToBuffer({
        type: "pie",
        data: {
          labels: qLabels,
          datasets: [
            {
              data: qValues,
              backgroundColor: QUARTER_COLORS,
              borderColor: QUARTER_COLORS,
              borderWidth: 1,
            },
          ],
        },
        options: {
          plugins: { legend: { position: "right", labels: { color: "#333" } } },
        },
      });

      const qPieId = wb.addImage({
        buffer: toArrayBuffer(qPieBuf),
        extension: "png",
      });

      ws.addImage(qPieId, {
        tl: { col: 6, row: qStart + 1 },
        ext: { width: CHART_W, height: CHART_H },
      });

      // Bar
      const qBarBuf = await cnc.renderToBuffer({
        type: "bar",
        data: {
          labels: qLabels,
          datasets: [
            {
              data: qValues,
              backgroundColor: QUARTER_COLORS,
              borderColor: QUARTER_COLORS,
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

      const qBarId = wb.addImage({
        buffer: toArrayBuffer(qBarBuf),
        extension: "png",
      });

      ws.addImage(qBarId, {
        tl: { col: 12, row: qStart + 1 },
        ext: { width: CHART_W, height: CHART_H },
      });
    }

    ws.columns.forEach((col) => {
      let max = 12;
      col.eachCell?.({ includeEmpty: true }, (cell) => {
        const len = cell.value ? String(cell.value).length : 0;
        if (len > max) max = len;
      });
      col.width = max + 2;
    });

    return wb;
  },
};
