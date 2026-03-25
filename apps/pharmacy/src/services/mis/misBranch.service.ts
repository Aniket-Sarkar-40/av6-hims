import { fetchItemStockPaginated } from "@/repository/mis/misBranchReport.repository.js";
import { SearchRequestMisBranch } from "@/types/mis/misBranch.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import dayjs from "dayjs";
import ExcelJs from "exceljs";

export const misBranchService = {
  async branchMisList(params: SearchRequestMisBranch) {
    logger.info("entering::misBranchService::branchMisList");

    const result = await fetchItemStockPaginated(params);

    logger.info("exiting::misBranchService::branchMisList");
    return result;
  },

  async buildItemStockReportWorkbook(
    params: SearchRequestMisBranch,
  ): Promise<ExcelJs.Workbook> {
    const { data } = await fetchItemStockPaginated(params);
    if (!data?.length) {
      throw new ErrorHandler(404, generateErrorMessage("EXCEL"));
    }

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Item Stock Report", {
      properties: { defaultRowHeight: 18 },
    });

    const title = ws.addRow(["ITEM STOCK REPORT"]);
    title.font = { bold: true, size: 14 };
    ws.mergeCells(title.number, 1, title.number, 11);
    title.alignment = { horizontal: "center" };

    const headers = [
      "Sl No.",
      "Code",
      "Item",
      "Category",
      "Branch",
      "Warehouse",
      "Physical Quantity",
      "Batch no",
      "Expiry Date",
      "Unit Cost",
      "Total",
    ];

    const rows = data.map((d, i) => [
      i + 1,
      d.code,
      d.description,
      d.category,
      d.branchName || "",
      d.warehouseName || "",
      d.physicalQty,
      d.batchNo || "",
      d.expiryDate ? dayjs(d.expiryDate).format("YYYY-MM-DD") : "",
      d.unitCost,
      d.total,
    ]);

    const tableRef = `A${title.number + 2}`;
    ws.addTable({
      name: "StockTable",
      ref: tableRef,
      headerRow: true,
      style: { theme: "TableStyleMedium2", showRowStripes: true },
      columns: headers.map((h) => ({ name: h, filterButton: true })),
      rows,
    });

    const grandTotal = data.reduce((sum, d) => sum + (Number(d.total) || 0), 0);
    ws.addRow([]);
    const grandRow = ws.addRow([
      "GRAND TOTAL",
      "",
      "",
      "",
      "",
      "",
      "",
      grandTotal,
    ]);

    ws.mergeCells(grandRow.number, 1, grandRow.number, 7);

    grandRow.font = { bold: true, size: 12 };
    grandRow.alignment = { vertical: "middle" };
    grandRow.getCell(8).numFmt = "#,##0.00";
    grandRow.getCell(8).alignment = { horizontal: "right", vertical: "middle" };

    grandRow.eachCell((c) => {
      c.border = {
        top: { style: "medium" },
        bottom: { style: "medium" },
      };
    });

    ws.columns.forEach((col) => {
      let max = 10;
      if (typeof col.eachCell === "function") {
        col.eachCell({ includeEmpty: true }, (cell) => {
          const len = cell.value != null ? String(cell.value).length : 0;
          if (len > max) max = len;
        });
      }
      col.width = max + 2;
    });

    return wb;
  },
};
