import { toSellDTO, toSellDtoForReceipt } from "@/mapper/sell/sell.mapper.js";
import {
  createSellInDb,
  deleteSellFromDb,
  getPaymentTransactionsBySell,
  getSellByIdFromDb,
  getSellExcelFromDb,
  getSellFromDb,
  updateSellStatusInDb,
} from "@/repository/sell/sell.repository.js";
import {
  PaymentTransaction,
  PrinterResponse,
  SellDTO,
  SellDtoForReceipt,
  sellExcelFilter,
  SellInput,
  SellStockAdjustmentInput,
} from "@/types/sell/sell.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  createSellServiceValidation,
  deleteSellServiceValidation,
  sellStockAdjustServiceValidation,
  updateSellStatusServiceValidation,
} from "@/validations/service/sell/sell.service.validation.js";
import dayjs from "dayjs";
import ExcelJs from "exceljs";
import { printService } from "../print/print.service.js";
import {
  getAppointmentById,
  getNotCompetedOpdBillWithMedicinesDetails,
} from "@/repository/opd/opdList.repository.js";
import { sellStockAdjustment } from "@/utils/sell.utils.js";

export const sellService = {
  async createSell(input: SellInput): Promise<PrinterResponse | SellDTO> {
    logger.info("entering::createSell::service");
    await createSellServiceValidation(input);
    const createdSell = await createSellInDb(input);
    const sellDTO = await toSellDTO(createdSell);
    let response: PrinterResponse | SellDTO;
    if (input.isPrint && sellDTO.status === "COMPLETED") {
      const sellReceipt = await toSellDtoForReceipt(sellDTO);
      response = await printService.printSellReceipt(sellReceipt);
    } else {
      response = sellDTO;
    }
    logger.info("exiting::createSell::service");
    return response;
  },

  async getAllSell(): Promise<SellDTO[]> {
    logger.info("entering::getAllSell::service");
    const sell = await getSellFromDb();
    logger.info("exiting::getAllSell::service");
    const sellDto = await Promise.all(
      sell.map(async (sell) => toSellDTO(sell)),
    );
    return sellDto;
  },

  async getSellById(id: number, isAdjusted: boolean = false): Promise<SellDTO> {
    logger.info("entering::getAllSell::service");

    validIdCheck(id);
    const sell = await getSellByIdFromDb(id);
    if (!sell) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Sell"));
    }

    logger.info("exiting::getAllSell::service");
    const sellDTO = await toSellDTO(sell, isAdjusted);
    return sellDTO;
  },

  async getSellByIdForReceipt(id: number): Promise<SellDtoForReceipt | null> {
    logger.info("entering::getAllSell::service");

    validIdCheck(id);
    const sell = await getSellByIdFromDb(id);
    if (!sell) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Sell"));
    }

    logger.info("exiting::getAllSell::service");
    const sellDTO = await toSellDTO(sell);
    const sellReceipt = await toSellDtoForReceipt(sellDTO);
    return sellReceipt;
  },

  async updateSellStatus(input: SellInput): Promise<SellDTO> {
    logger.info("entering::updateSellStatus::service");
    await updateSellStatusServiceValidation(input);
    const sell = await updateSellStatusInDb(input);
    const sellDTO = await toSellDTO(sell);
    if (input.isPrint && sellDTO.status === "COMPLETED") {
      const sellReceipt = await toSellDtoForReceipt(sellDTO);
      await printService.printSellReceipt(sellReceipt);
    }
    logger.info("exiting::updateSellStatus::service");
    return sellDTO;
  },

  async buildExcelJSWorkbookForSell(input: sellExcelFilter) {
    logger.info("entering::buildExcelJSWorkbookForSell::service");
    const sells = await getSellExcelFromDb(input);
    if (sells.length === 0) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Sell"));
    }
    const sellDto = await Promise.all(
      sells.map(async (sell) => toSellDTO(sell)),
    );
    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Sell Report");

    ws.properties.defaultRowHeight = 18;
    let rowIndex = 1;

    for (const sell of sellDto) {
      // Header section
      ws.mergeCells(rowIndex, 1, rowIndex, 17);
      ws.getCell(rowIndex, 1).value = `Sell Ref No: ${sell.sellRefNo}`;
      ws.getCell(rowIndex, 1).font = { bold: true };
      rowIndex++;

      // Details section

      const startInd = rowIndex;

      ws.addRow([
        "Sell by",
        `${sell.staff?.name} ${sell.staff?.surname}`,
        "Branch",
        sell.cc.colName,
        "Delivery Type",
        sell.deliveryType,
      ]);
      rowIndex++;

      ws.addRow([
        "Home Delivery",
        sell.isHomeDelivery ? "Yes" : "No",
        "Customar Name",
        sell.customer ? sell.customer.patientName : "N/A",
        "Customer Mobile",
        sell.customer ? sell.customer.mobileNo : "N/A",
      ]);
      rowIndex++;

      ws.addRow([
        "Billing For",
        sell.billingFor,
        "Doctor",
        `${sell.doctor.name} ${sell.doctor.surname}`,
        "Date",
        dayjs(sell.billDate).format("YYYY-MM-DD"),
      ]);
      rowIndex++;

      ws.addRow([
        "Total",
        String(sell.totalAmount),
        "Paid",
        String(sell.paidAmount),
        "Payment Mode",
        sell.paymentMode,
      ]);
      rowIndex++;

      ws.addRow([
        "Payment Status",
        sell.paymentStatus,
        "Status",
        sell.status,
        " Amount",
        String(sell.returnedAmount),
      ]);
      rowIndex++;
      for (let row = startInd; row < rowIndex; row++) {
        [1, 3, 5].map((col) => {
          ws.getCell(row, col).font = { bold: true, color: { argb: "666161" } };
        });
      }

      if (sell.sellDetails.length === 0) {
        ws.addRow(["No item associated with this sell."]);
        rowIndex++;
        continue;
      }

      /* --- Sell Detail Table Header --- */
      const sellDetailTitles = [
        "Medicine Name",
        "Medicine No",
        "Category Name",
        "Medicine Type",
        "Medicine Composition",
        "Medicine Unit",
        "Medicine Manufacturer",
        "Medicine Pack Size",
        "Medicine Drug Type",
        "Batch No",
        "Expiry Date",
        "Mrp",
        "Qty",
        "Net Amount",
        "Discount",
        "Tax",
        "Total Amount",
      ];
      ws.addRow(sellDetailTitles).font = { bold: true };
      rowIndex++;
      let totalCost = 0;
      /* --- Sell Detail Rows --- */
      sell.sellDetails.forEach((s) => {
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
      ws.getCell(rowIndex, 17).value = totalCost.toFixed(2);
      ws.getCell(rowIndex, 17).font = { bold: true };
      ws.getCell(rowIndex, 17).border = { top: { style: "thin" } };
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

  async deleteSell(id: number): Promise<void> {
    logger.info("entering::deleteSell::service id=" + id);

    await deleteSellServiceValidation(id);
    await deleteSellFromDb(id);

    logger.info("exiting::deleteSell::service id=" + id);
  },

  async sellStockAdjust(input: SellStockAdjustmentInput) {
    logger.info("entering::sellStockAdjust::service");
    const validate = await sellStockAdjustServiceValidation(input);
    let isSuccess: boolean;
    if (validate) {
      isSuccess = await sellStockAdjustment(input);
    } else {
      isSuccess = false;
    }

    logger.info("exiting::sellStockAdjust::service");
    return isSuccess;
  },

  async getPaymentTransactions(id: number): Promise<PaymentTransaction[]> {
    logger.info("entering::getPaymentTransactions::service");

    validIdCheck(id);
    const sell = await getSellByIdFromDb(id);
    if (!sell) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Sell"));
    }

    const paymentTransactions = await getPaymentTransactionsBySell(id);

    logger.info("exiting::getPaymentTransactions::service");
    return paymentTransactions;
  },

  async printNotCompletedSellReceipt(id: number): Promise<PrinterResponse> {
    logger.info("entering::printNotCompletedSellReceipt::service");

    validIdCheck(id);

    const apt = await getAppointmentById(id);
    if (!apt) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Appointment"),
      );
    }

    const medicines = await getNotCompetedOpdBillWithMedicinesDetails(id);
    if (medicines.length === 0) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Not Completed Medicines"),
      );
    }

    const response = await printService.printNotCompletedSellReceipt(
      apt,
      medicines,
    );

    logger.info("exiting::printNotCompletedSellReceipt::service");
    return response;
  },
};
