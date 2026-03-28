import {
  itemStock,
  itemStockSummary,
} from "@/repository/stock/stock.repository.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ExcelJs from "exceljs";

export const itemStockService = {
  async getAllItemStockSummary(ccId: number) {
    logger.info("entering::getAllItemStock::service");
    validIdCheck(ccId);

    const stocks = await itemStockSummary(ccId);

    logger.info("exiting::getAllItemStock::service");
    return stocks;
  },
  async getAllItemStock(ccId: number) {
    logger.info("entering::getAllItemStock::service");
    validIdCheck(ccId);

    const stocks = await itemStock(ccId);

    logger.info("exiting::getAllItemStock::service");
    return stocks;
  },

  async itemStockExcelExport(ccId: number): Promise<ExcelJs.Workbook> {
    logger.info("entering::itemStockExcelExport::service");
    validIdCheck(ccId);

    const stocks = await itemStock(ccId);
    if (!Array.isArray(stocks) || stocks.length === 0) {
      throw new ErrorHandler(404, generateErrorMessage("EXCEL"));
    }
    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Item Stock");
    ws.properties.defaultRowHeight = 18;

    ws.columns = [
      { header: "S.No", key: "s_no" },
      // { header: "Item ID", key: "item_id" },
      { header: "Item Name", key: "item_name" },
      { header: "Item Code", key: "item_code" },
      { header: "Item Description", key: "item_description" },
      { header: "Base Price", key: "base_price" },
      { header: "Purchase Price", key: "purchase_price" },
      // { header: "Is Batch Number", key: "is_batch_number" },
      // { header: "Is Expire Date", key: "is_expire_date" },
      // { header: "Is Returnable", key: "is_returnable" },
      // { header: "Is Lock", key: "is_lock" },
      // { header: "Item Is Active", key: "item_is_active" },
      // { header: "Category ID", key: "category_id" },
      { header: "Category Name", key: "category_name" },
      // { header: "Unit ID", key: "unit_id" },
      { header: "Unit Name", key: "unit_name" },
      { header: "Unit Size", key: "unit_size" },
      // { header: "CC ID", key: "cc_id" },
      // { header: "Location Type", key: "location_type" },
      { header: "Location Name", key: "location_name" },
      { header: "Batch No", key: "batch_no" },
      // { header: "Stock ID List", key: "stock_id_list" },
      { header: "In Hand Qty", key: "in_hand_qty" },
      // { header: "Branch In Hand Qty", key: "branch_in_hand_qty" },
      // { header: "Warehouse In Hand Qty", key: "warehouse_in_hand_qty" },
      { header: "SR Req Qty", key: "sr_req_qty" },
      { header: "SR Assigned Qty", key: "sr_assigned_qty" },
      { header: "SR Acknowledged Qty", key: "sr_acknowledged_qty" },
      { header: "SR Pending Qty", key: "sr_pending_qty_srr_sra" },
      { header: "Location Stock(RQ-CQ)", key: "location_stock_rq_cq" },
      { header: "Ack Pending Qty(RQ-AQ)", key: "ack_pending_qty_rq_aq" },
      { header: "GRN Ordered Qty", key: "grn_ordered_qty" },
      { header: "GRN Received Qty", key: "grn_received_qty" },
      { header: "GRN Returned Qty", key: "grn_returned_qty" },
      { header: "Cons Req Qty", key: "consumption_requested_qty" },
      { header: "Consumed Qty", key: "consumed_qty" },
      { header: "PO Ordered Qty", key: "po_ordered_qty" },
      { header: "PO Received Qty", key: "po_received_qty" },
      { header: "PO Pend Qty(poq-prq)", key: "po_pending_qty_poq_prq" },
      { header: "Total Stock", key: "total_stock_ppq_sq_srrq+cq" },
      {
        header: "GRN(ReqQT-RetrQty-ConsQTY)Stock",
        key: "grn_recQT_retrQty_consQTY_stock",
      },
      // { header: "Variance vs Stock", key: "variance_vs_stock" },
    ];

    const headerRow = ws.getRow(1);
    headerRow.height = 18;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    stocks.forEach((stock, index) => {
      ws.addRow({ s_no: index + 1, ...stock });
    });

    ws.columns.forEach((col) => {
      let max = col.header?.toString().length || 10;
      col.eachCell?.({ includeEmpty: true }, (cell) => {
        const len = cell.value ? cell.value.toString().length : 0;
        if (len > max) max = len;
      });
      col.width = max + 2;
    });

    logger.info("exiting::itemStockExcelExport::service");
    return wb;
  },
};
