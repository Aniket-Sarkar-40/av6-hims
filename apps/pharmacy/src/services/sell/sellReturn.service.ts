import { toSellReturnDTO } from "@/mapper/sell/sellReturn.mapper.js";
import {
  approvedSellReturnInDb,
  createSellReturnInDb,
  deleteSellReturnFromDb,
  getSellReturnExcelFromDb,
  getSellReturnFromDb,
  rejectSellReturnInDb,
  updateSellReturnInDb,
} from "@/repository/sell/sellReturn.repository.js";
import {
  SellReturnDTO,
  SellReturnExcelFilter,
  SellReturnInput,
} from "@/types/sell/sellReturn.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import {
  approveSellReturnServiceValidation,
  createSellReturnServiceValidation,
  deleteSellReturnServiceValidation,
  rejectSellReturnServiceValidation,
  updateSellReturnServiceValidation,
  validateIdSellReturn,
} from "@/validations/service/sell/sellReturn.service.validation.js";
import dayjs from "dayjs";
import ExcelJs from "exceljs";

export const sellReturnService = {
  async createSellReturn(input: SellReturnInput) {
    logger.info("entering::createSellReturn::service");
    await createSellReturnServiceValidation(input);
    const createdSellReturn = await createSellReturnInDb(input);
    logger.info("exiting::createSellReturn::service");
    return createdSellReturn;
  },

  async updateSellReturn(input: SellReturnInput) {
    logger.info("entering::updateSellReturn::service");

    await updateSellReturnServiceValidation(input);

    const updatedPO = await updateSellReturnInDb(input);

    logger.info("exiting::updateSellReturn::service");
    return updatedPO;
  },

  async approveSellReturn(input: SellReturnInput) {
    logger.info("entering::approveSellReturn::service");

    await approveSellReturnServiceValidation(input);

    const updatedPO = await approvedSellReturnInDb(input);

    logger.info("exiting::approveSellReturn::service");
    return updatedPO;
  },

  async rejectedSellReturn(input: { id: number; sellId: number }) {
    logger.info("entering::rejectedSellReturn::service");

    await rejectSellReturnServiceValidation(input);

    const updatedPO = await rejectSellReturnInDb(input);

    logger.info("exiting::rejectedSellReturn::service");
    return updatedPO;
  },

  async deleteSellReturn(id: number): Promise<void> {
    logger.info("entering::deleteSellReturn::service id=" + id);

    await deleteSellReturnServiceValidation(id);
    await deleteSellReturnFromDb(id);

    logger.info("exiting::deleteSellReturn::service id=" + id);
  },

  async getAllSellReturn(): Promise<SellReturnDTO[]> {
    logger.info("entering::getAllSellReturn::service");
    const sellReturn = await getSellReturnFromDb();
    logger.info("exiting::getAllSellReturn::service");
    const sellDto = await Promise.all(
      sellReturn.map(async (sellReturn) => toSellReturnDTO(sellReturn)),
    );
    return sellDto;
  },

  async getSellReturnById(id: number): Promise<SellReturnDTO | null> {
    logger.info("entering::getSellReturnById::service");
    const sell = await validateIdSellReturn(id);
    logger.info("exiting::getSellReturnById::service");
    return toSellReturnDTO(sell);
  },
  async buildExcelJSWorkbookForSellReturn(input: SellReturnExcelFilter) {
    logger.info("entering::buildExcelJSWorkbookForSell::service");
    const sellReturns = await getSellReturnExcelFromDb(input);
    if (sellReturns.length === 0) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Sell Return"),
      );
    }
    const sellReturnDto = await Promise.all(
      sellReturns.map(async (sellReturn) => toSellReturnDTO(sellReturn)),
    );
    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Sell Return Report");

    ws.properties.defaultRowHeight = 18;
    let rowIndex = 1;

    for (const sellReturn of sellReturnDto) {
      // Header section
      ws.mergeCells(rowIndex, 1, rowIndex, 18);
      ws.getCell(rowIndex, 1).value =
        `Sell Return Ref No: ${sellReturn.sellReturnRefNumber}`;
      ws.getCell(rowIndex, 1).font = { bold: true };
      rowIndex++;

      // Details section

      const startInd = rowIndex;

      ws.addRow([
        "Sell Ref No",
        sellReturn.sellNumber,
        "Sell Date",
        sellReturn.billDate,
        "Sell Return by",
        `${sellReturn.staff?.name} ${sellReturn.staff?.surname}`,
      ]);
      rowIndex++;

      ws.addRow([
        "Branch",
        sellReturn.cc.colName,
        "Delivery Type",
        sellReturn.deliveryType,
        "Insurance No",
        sellReturn.insuranceId ? sellReturn.insuranceId : "NA",
      ]);
      rowIndex++;

      ws.addRow([
        "Home Delivery",
        sellReturn.isHomeDelivery ? "Yes" : "No",
        "Customar Name",
        sellReturn.customer ? sellReturn.customer.patientName : "N/A",
        "Customer Mobile",
        sellReturn.customer ? sellReturn.customer.mobileNo : "N/A",
      ]);
      rowIndex++;

      ws.addRow([
        "Billing For",
        sellReturn.billingFor,
        "Doctor",
        `${sellReturn.doctor.name} ${sellReturn.doctor.surname}`,
        "Date",
        dayjs(sellReturn.returnDate).format("YYYY-MM-DD"),
      ]);
      rowIndex++;

      ws.addRow([
        "Total",
        String(sellReturn.totalAmount),
        "Paid",
        String(sellReturn.paidAmount),
        "Payment Mode",
        sellReturn.paymentMode,
      ]);
      rowIndex++;

      ws.addRow([
        "Payment Status",
        sellReturn.paymentStatus,
        "Status",
        sellReturn.status,
        "Credit Note No",
        sellReturn.creditNoteNo ? sellReturn.creditNoteNo : "NA",
      ]);
      rowIndex++;
      for (let row = startInd; row < rowIndex; row++) {
        [1, 3, 5].map((col) => {
          ws.getCell(row, col).font = { bold: true, color: { argb: "666161" } };
        });
      }

      if (sellReturn.sellReturnDetails.length === 0) {
        ws.addRow(["No item associated with this sell return."]);
        rowIndex++;
        continue;
      }

      /* --- Sell Detail Table Header --- */
      const sellReturnDetailTitles = [
        "Medicine Name",
        "Medicine No",
        "Category Name",
        "Medicine Type",
        "Medicine Composition",
        "Medicine Unit",
        "Medicine Manufacturer",
        "Medicine Pack Size",
        "Medicine Drug Type",
        "Sell Qty",
        "Batch No",
        "Expiry Date",
        "Mrp",
        "Qty",
        "Net Amount",
        "Net Discount",
        "Net Tax",
        "Total Amount",
      ];
      ws.addRow(sellReturnDetailTitles).font = { bold: true };
      rowIndex++;
      let totalCost = 0;
      /* --- Sell Detail Rows --- */
      sellReturn.sellReturnDetails.forEach((s) => {
        const item = s.item;
        ws.addRow([
          item?.medicineName,
          item?.itemNumber,
          s.itemCategoryName,
          s.medType,
          s.medComp,
          s.medUnit,
          s.manufacturer,
          s.packSize,
          s.drugType,
          s.sellQuantity,
          s.batchNo,
          s.expiryDate,
          s.mrp,
          s.quantity,
          s.netAmount,
          s.netDiscount,
          s.netTax,
          s.totalAmount,
        ]);
        rowIndex++;
        totalCost += s.totalAmount || 0;
      });
      ws.getCell(rowIndex, 18).value = totalCost.toFixed(2);
      ws.getCell(rowIndex, 18).font = { bold: true };
      ws.getCell(rowIndex, 18).border = { top: { style: "thin" } };
      /* Add a blank line */
      rowIndex++;
      rowIndex++;
    }
    /* Auto size the columns */
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
