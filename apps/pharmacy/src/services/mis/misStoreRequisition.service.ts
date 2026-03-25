import { fetchStoreRequisitionByItemPaginated } from "@/repository/mis/misStoreRequisition.repository.js";
import { SearchRequestMisStoreRequisition } from "@/types/mis/misStoreRequisition.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ExcelJs from "exceljs";
import { branchService } from "../master/branch.service.js";

export const misStoreRequisitionService = {
  async storeRequisistionMisList(params: SearchRequestMisStoreRequisition) {
    logger.info("entering::misStoreRequisitionService::branchMisList");

    const { pageNo, pageSize, sortDir = "DESC", branchId } = params;
    validIdCheck(branchId);
    await branchService.getBranchById(branchId);
    const page = typeof pageNo === "string" ? parseInt(pageNo, 10) : pageNo;
    const perPage =
      typeof pageSize === "string" ? parseInt(pageSize, 10) : pageSize;
    const order = sortDir.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const result = await fetchStoreRequisitionByItemPaginated(
      page,
      perPage,
      branchId,
      order,
    );

    logger.info("exiting::misStoreRequisitionService::branchMisList");
    return result;
  },

  async buildStoreRequisitionReportWorkbook(
    pageNo: number,
    pageSize: number,
    order: "ASC" | "DESC" = "DESC",
    branchId: number,
  ): Promise<ExcelJs.Workbook> {
    const FIRST_PAGE = 1;
    const EVERY_ROW = Number.MAX_SAFE_INTEGER;
    const { data } = await fetchStoreRequisitionByItemPaginated(
      FIRST_PAGE,
      EVERY_ROW,
      branchId,
      order,
    );
    if (!data?.length) {
      throw new ErrorHandler(404, generateErrorMessage("EXCEL"));
    }

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Store Requisition By Item", {
      properties: { defaultRowHeight: 18 },
    });

    ws.addRow([]);

    const titleRow = ws.addRow(["STORE REQUISITION BY ITEM"]);
    titleRow.font = { bold: true, size: 14 };
    ws.mergeCells(titleRow.number, 1, titleRow.number, 8);
    titleRow.alignment = { horizontal: "center" };

    const headers = [
      "S/N",
      "Description",
      "Monthly Demand",
      "Quarterly Demand",
      "Quantity In Store",
      "Requested Quantity",
      "Unit Cost",
      "Total",
    ];

    const rows = data.map((d, i) => [
      i + 1,
      d.description,
      d.monthlyDemand,
      d.quarterlyDemand,
      d.qtyInStore,
      d.requestedQty,
      d.unitCost,
      d.total,
    ]);

    ws.addTable({
      name: "Requisition",
      ref: `A${titleRow.number + 2}`,
      headerRow: true,
      style: { theme: "TableStyleMedium2", showRowStripes: true },
      columns: headers.map((h) => ({ name: h, filterButton: true })),
      rows,
    });

    const UNIT_COL = 7;
    const TOTAL_COL = 8;
    ws.getColumn(UNIT_COL).numFmt = "#,##0.00";
    ws.getColumn(TOTAL_COL).numFmt = "#,##0.00";

    const grandTotal = rows.reduce(
      (sum, r) => sum + (+r[TOTAL_COL - 1] || 0),
      0,
    );

    ws.addRow([]); // spacer
    const gRow = ws.addRow(["GRAND TOTAL", "", "", "", "", "", "", grandTotal]);
    ws.mergeCells(gRow.number, 1, gRow.number, TOTAL_COL - 1);

    gRow.font = { bold: true, size: 10 };
    gRow.alignment = { vertical: "middle" };
    gRow.getCell(TOTAL_COL).alignment = {
      horizontal: "right",
      vertical: "middle",
    };
    gRow.getCell(TOTAL_COL).numFmt = "#,##0.00";
    gRow.eachCell((c) => {
      c.border = { top: { style: "medium" }, bottom: { style: "medium" } };
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
