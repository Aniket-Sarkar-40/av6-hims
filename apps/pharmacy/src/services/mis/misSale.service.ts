import ExcelJs from "exceljs";
import {
  fetchBranchMonthlySales,
  fetchSellInformationWithPagination,
} from "@/repository/mis/misDrugSales.repository.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { SellInformationFilters } from "@/types/mis/sellMis.js";
import { toArrayBuffer } from "@repo/shared/utils/helper.utils.js";

export const misSaleService = {
  async saleMisList() {
    logger.info("entering::misSaleService::saleMisList");

    const result = await fetchBranchMonthlySales();

    logger.info("exiting::misSaleService::saleMisList");
    return result;
  },

  async buildMisSaleReportWorkbook(): Promise<ExcelJs.Workbook> {
    const misData = await fetchBranchMonthlySales();
    if (!misData) throw new ErrorHandler(404, generateErrorMessage("EXCEL"));

    const { monthWise, quarterWise } = misData;

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("MIS Sales Summary", {
      properties: { defaultRowHeight: 18 },
    });

    ws.pageSetup = { fitToPage: true, fitToWidth: 1, orientation: "landscape" };

    const monthCols = [
      "Sl No.",
      "Branches",
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const titleRow = ws.addRow(["DRUG SALES 2025"]);
    titleRow.font = { bold: true, size: 14 };
    ws.mergeCells(titleRow.number, 1, titleRow.number, monthCols.length);
    titleRow.alignment = { horizontal: "center" };

    const monthTableRows = monthWise.map((m, i) => [
      i + 1,
      m.branches,
      m.January,
      m.February,
      m.March,
      m.April,
      m.May,
      m.June,
      m.July,
      m.August,
      m.September,
      m.October,
      m.November,
      m.December,
    ]);

    ws.addTable({
      name: "Monthly",
      ref: `A${titleRow.number + 2}`,
      headerRow: true,
      style: { theme: "TableStyleMedium2", showRowStripes: true },
      columns: monthCols.map((c) => ({ name: c, filterButton: true })),
      rows: monthTableRows,
    });

    const qStart = ws.lastRow!.number + 2;
    ws.getCell(`A${qStart}`).value = "Quarterly Summary";
    ws.getCell(`A${qStart}`).font = { bold: true, size: 12 };
    ws.mergeCells(qStart, 1, qStart, 3);

    const qCols = ["Sl No.", "Period", "Amount"];
    const qRows = quarterWise.map((q, i) => [i + 1, q.period, q.amount]);

    ws.addTable({
      name: "Quarterly",
      ref: `A${qStart + 1}`,
      headerRow: true,
      style: { theme: "TableStyleMedium2", showRowStripes: true },
      columns: qCols.map((c) => ({ name: c, filterButton: true })),
      rows: qRows,
    });

    ws.columns.forEach((col) => {
      let max = 10;
      col.eachCell?.({ includeEmpty: true }, (cell) => {
        const len = cell.value ? String(cell.value).length : 0;
        if (len > max) max = len;
      });
      col.width = max + 2;
    });

    const W = 360;
    const H = 260;

    const cnc = new ChartJSNodeCanvas({
      width: W,
      height: H,
      backgroundColour: "white",
    });

    const pieLabels = quarterWise
      .filter((q) => q.period.toUpperCase() !== "TOTAL")
      .map((q) => q.period);

    const pieData = quarterWise
      .filter((q) => q.period.toUpperCase() !== "TOTAL")
      .map((q) => q.amount);

    const pieBuf = await cnc.renderToBuffer({
      type: "pie",
      data: {
        labels: pieLabels,
        datasets: [
          {
            data: pieData,
            backgroundColor: ["#2E75B6", "#ED7D31", "#70AD47", "#5B9BD5"],
            borderColor: ["#2E75B6", "#ED7D31", "#70AD47", "#5B9BD5"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        plugins: {
          legend: { position: "bottom", labels: { color: "#333" } },
        },
      },
    });

    const barBuf = await cnc.renderToBuffer({
      type: "bar",
      data: {
        labels: pieLabels,
        datasets: [
          {
            label: "Amount",
            data: pieData,
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

    const imgRow = qStart + qRows.length + 2;

    const pieId = wb.addImage({
      buffer: toArrayBuffer(pieBuf),
      extension: "png",
    });

    const barId = wb.addImage({
      buffer: toArrayBuffer(barBuf),
      extension: "png",
    });

    ws.addImage(pieId, {
      tl: { col: 1, row: imgRow },
      ext: { width: W, height: H },
    });

    ws.addImage(barId, {
      tl: { col: 7, row: imgRow },
      ext: { width: W, height: H },
    });

    return wb;
  },

  async getSellMis(
    filters: SellInformationFilters = { pageNo: 1, pageSize: 10 },
  ) {
    logger.info("entering::misSaleService::saleMisList");

    const result = await fetchSellInformationWithPagination(filters);

    logger.info("exiting::misSaleService::saleMisList");
    return result;
  },

  async buildSellInformationWorkbook(
    filters: SellInformationFilters = { pageNo: 1, pageSize: 10 },
  ): Promise<ExcelJs.Workbook> {
    const { data } = await fetchSellInformationWithPagination(filters);
    if (!data?.length)
      throw new ErrorHandler(404, generateErrorMessage("EXCEL"));

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Sell Information Report", {
      properties: { defaultRowHeight: 18 },
    });
    ws.pageSetup = { fitToPage: true, fitToWidth: 1, orientation: "landscape" };
    const columns = [
      "Sl No.",
      "Sell No",
      "Apt No",
      "Bill No",
      "Patient Name",
      "Patient Mobile",
      "Patient Email",
      "Doctor Name",
      "Date",
      "Sale Items",
      "Total Qty",
      "Insurance Name",
      "Corporate Name",
      "Delivery Type",
      "Status",
      "Gross Amount",
      "Co-Pay Amount",
      "Customer Pay Amount",
      "Returned Gross Amount",
      "Returned Co-Pay Amount",
      "Returned Customer Pay Amount",
      "Adjusted Gross Amount",
      "Adjusted Co-Pay Amount",
      "Adjusted Customer Pay Amount",
      "Adjusted Discount Amount",
      "Paid Amount",
      "Refunded Amount",
      "Due or Settled",
    ];

    // Add title row
    const titleRow = ws.addRow(["SELL INFORMATION REPORT 2025"]);
    titleRow.font = { bold: true, size: 14 };
    ws.mergeCells(titleRow.number, 1, titleRow.number, columns.length);
    titleRow.alignment = { horizontal: "center" };

    // Add date range info if available
    if (filters.startDate || filters.endDate) {
      const dateInfo = ws.addRow([
        `Period: ${filters.startDate || "Start"} to ${filters.endDate || "End"}`,
      ]);
      dateInfo.font = { italic: true, size: 10 };
      ws.mergeCells(dateInfo.number, 1, dateInfo.number, columns.length);
      dateInfo.alignment = { horizontal: "center" };
    }

    // Prepare table rows
    const tableRows = data.map((item, index) => [
      index + 1,
      item.sellNo,
      item.aptNo,
      item.billNo || "",
      item.patientName,
      item.mobileNo,
      item.email,
      item.doctorName,
      item.date.toLocaleDateString(),
      item.saleItems,
      item.totalQty,
      item.insuranceName || "",
      item.corporateName || "",
      item.deliveryType || "",
      item.status,
      item.grossAmount,
      item.coPayAmount,
      item.customerPayAmount,
      item.returnGrossAmount,
      item.returnCoPayAmount,
      item.returnCustomerPayAmount,
      item.adjustedGrossAmount,
      item.adjustedCoPayAmount,
      item.adjustedCustomerPayAmount,
      item.adjustedDiscountAmount,
      item.paidAmount,
      item.refundedAmount,
      item.dueOrSettled,
    ]);

    // Add main data table
    ws.addTable({
      name: "SellInformation",
      ref: `A${titleRow.number + 2}`,
      headerRow: true,
      style: { theme: "TableStyleMedium2", showRowStripes: true },
      columns: columns.map((c) => ({ name: c, filterButton: true })),
      rows: tableRows,
    });

    // Add summary section
    const summaryStart = ws.lastRow!.number + 3;
    ws.getCell(`A${summaryStart}`).value = "Summary";
    ws.getCell(`A${summaryStart}`).font = { bold: true, size: 12 };
    ws.mergeCells(summaryStart, 1, summaryStart, 4);

    // Calculate summary data
    const totalRecords = data.length;
    const totalGross = data.reduce((sum, item) => sum + item.grossAmount, 0);
    const totalReturnedGross = data.reduce(
      (sum, item) => sum + item.returnGrossAmount,
      0,
    );
    const totalCustomerPay = data.reduce(
      (sum, item) => sum + item.customerPayAmount,
      0,
    );
    const totalReturnedCustomerPay = data.reduce(
      (sum, item) => sum + item.returnCustomerPayAmount,
      0,
    );
    const totalAdjustedGross = data.reduce(
      (sum, item) => sum + item.adjustedGrossAmount,
      0,
    );
    const totalAdjustedCustomerPay = data.reduce(
      (sum, item) => sum + item.adjustedCustomerPayAmount,
      0,
    );
    const totalPaid = data.reduce((sum, item) => sum + item.paidAmount, 0);
    const totalRefunded = data.reduce(
      (sum, item) => sum + item.refundedAmount,
      0,
    );
    const totalDue = data.reduce((sum, item) => sum + item.dueOrSettled, 0);

    const summaryData = [
      ["Total Records", totalRecords.toString()],
      ["Total Gross Amount", totalGross.toFixed(2)],
      ["Total Customer Pay Amount", totalCustomerPay.toFixed(2)],
      ["Total Returned Gross Amount", totalReturnedGross.toFixed(2)],
      [
        "Total Returned Customer Pay Amount",
        totalReturnedCustomerPay.toFixed(2),
      ],
      ["Total Adjusted Gross Amount", totalAdjustedGross.toFixed(2)],
      [
        "Total Adjusted Customer Pay Amount",
        totalAdjustedCustomerPay.toFixed(2),
      ],
      ["Total Paid Amount", totalPaid.toFixed(2)],
      ["Total Refunded Amount", totalRefunded.toFixed(2)],
      ["Total Due Amount", totalDue.toFixed(2)],
    ];

    // Add summary table
    ws.addTable({
      name: "Summary",
      ref: `A${summaryStart + 1}`,
      headerRow: true,
      style: { theme: "TableStyleMedium1", showRowStripes: true },
      columns: [
        { name: "Metric", filterButton: false },
        { name: "Value", filterButton: false },
      ],
      rows: summaryData,
    });

    // Auto-adjust column widths
    // Simple approach with reasonable limits
    ws.columns?.forEach((col, colIndex) => {
      let max = 8;
      col.eachCell?.({ includeEmpty: true }, (cell) => {
        if (cell.row == "1" || cell.row == "2") return;
        let len = cell.value ? String(cell.value).length : 0;
        if (colIndex === 7) {
          // Estimate lines from \n or (for long text) from length
          const saleItemsValue = cell.value ? String(cell.value) : "";
          const lines = saleItemsValue.split(/\r?\n/);
          len = lines.reduce((max, line) => Math.max(max, line.length), 0);
        }
        if (len > max) max = len;
      });

      // Cap between 8 and 30 characters with small padding
      // col.width = Math.min(Math.max(max + 4, 8), 30);
      col.width = Math.max(max + 4, 8);
    });

    ws.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.alignment = {
          vertical: "middle", // Vertically center the text
          horizontal: "center", // Optional: center text horizontally
          wrapText: true, // Optional: wrap text for long content
        };
      });
      // Adjust only data rows, skip title and summary rows if needed
      if (rowNumber >= 3 && rowNumber < ws.lastRow!.number) {
        const saleItemsCell = row.getCell(8);
        saleItemsCell.alignment = { wrapText: true }; // Enable wrap

        // Estimate lines from \n or (for long text) from length
        const saleItemsValue = saleItemsCell.value
          ? String(saleItemsCell.value)
          : "";
        const lineCount = saleItemsValue.split(/\r?\n/).length;
        // Minimum 18 (default), add extra height for more lines
        row.height = Math.max(18, 18 + (lineCount - 1) * 14); // Adjust 14 as per font size
      }
    });

    // Format currency columns
    const currencyColumns = [9, 10, 11, 12, 13, 14]; // Adjust based on your column positions
    currencyColumns.forEach((colIndex) => {
      ws.getColumn(colIndex).numFmt = "#,##0.00";
    });

    return wb;
  },
};
