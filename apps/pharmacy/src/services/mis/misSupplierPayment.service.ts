import { fetchSupplierPaymentSchedule } from "@/repository/mis/misSupplierPayment.repository.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import dayjs from "dayjs";
import ExcelJs from "exceljs";

export const misSupplierPaymentService = {
  async SupplierPaymentMisList(startDate?: Date, endDate?: Date) {
    logger.info("entering::misBranchService::branchMisList");

    const result = await fetchSupplierPaymentSchedule(startDate, endDate);

    logger.info("exiting::misBranchService::branchMisList");
    return result;
  },

  async buildSupplierPaymentScheduleWorkbook(
    startDate?: Date,
    endDate?: Date,
  ): Promise<ExcelJs.Workbook> {
    const { rows: data, totalAmount } = await fetchSupplierPaymentSchedule(
      startDate,
      endDate,
    );
    if (!data?.length) {
      throw new ErrorHandler(404, generateErrorMessage("EXCEL"));
    }

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Supplier Payment Schedule", {
      properties: { defaultRowHeight: 18 },
    });

    const title = ws.addRow(["SUPPLIER PAYMENT SCHEDULE"]);
    title.font = { bold: true, size: 14 };
    ws.mergeCells(title.number, 1, title.number, 9);
    title.alignment = { horizontal: "center" };

    const headers = [
      "S/N",
      "Supplier",
      "Amount",
      "Invoice No",
      "Branch",
      "Credit Days",
      "Invoice Date",
      "Date Supplied",
      "Due Date",
    ];
    const rows = data.map((d, i) => [
      i + 1,
      d.supplier ?? "",
      d.amount ?? 0,
      d.invoiceNo ?? "",
      d.branch ?? "",
      d.creditDays ?? "",
      d.invoiceDate ? dayjs(d.invoiceDate).format("YYYY-MM-DD") : "",
      d.dateSupplied ? dayjs(d.dateSupplied).format("YYYY-MM-DD") : "",
      d.dueDate ? dayjs(d.dueDate).format("YYYY-MM-DD") : "",
    ]);

    ws.addTable({
      name: "SupplierSchedule",
      ref: `A${title.number + 2}`,
      headerRow: true,
      style: { theme: "TableStyleMedium2", showRowStripes: true },
      columns: headers.map((h) => ({ name: h, filterButton: true })),
      rows,
    });

    ws.getColumn(3).numFmt = "#,##0.00";

    ws.addRow([" "]);
    const totalRow = ws.addRow([]);
    totalRow.getCell(2).value = "TOTAL AMOUNT";
    totalRow.getCell(3).value = totalAmount;

    totalRow.getCell(2).font = { bold: true };
    totalRow.getCell(3).font = { bold: true };
    totalRow.getCell(3).alignment = { horizontal: "right", vertical: "middle" };
    totalRow.getCell(3).numFmt = "#,##0.00";

    totalRow.eachCell((cell) => {
      cell.border = {
        top: { style: "medium" },
        bottom: { style: "medium" },
        left: { style: "medium" },
        right: { style: "medium" },
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
