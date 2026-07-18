import { toGrnReturnDTO } from "@/mapper/grn/grnReturn.mapper.js";
import {
  approvedGrnReturnInDb,
  createGrnReturnInDb,
  deleteGrnReturnFromDb,
  getAllGrnReturnFromDb,
  getGrnReturnByIdFromDb,
  rejectGrnReturnInDb,
  updateGrnReturnInDb,
} from "@/repository/grn/grnReturn.repository.js";
import {
  CreateGrnReturnInput,
  GoodReceiveReturnDTO,
} from "@/types/grn/grnReturn.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  approveGrnReturnServiceValidation,
  createGrnReturnServiceValidation,
  deleteGrnReturnServiceValidation,
  rejectGrnReturnServiceValidation,
  updateGrnReturnServiceValidation,
} from "@/validations/service/grn/grnReturn.service.validation.js";
import { validateIdItemSupplier } from "@/validations/service/master/itemSupplier.service.validation.js";
import { notifier } from "@/config/core.config.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const grnReturnService = {
  async createGrnReturn(input: CreateGrnReturnInput) {
    logger.info("entering::createGrnReturn::service");
    await createGrnReturnServiceValidation(input);
    const createGrnReturn = await createGrnReturnInDb(input);

    const supplier = await validateIdItemSupplier(createGrnReturn.supplierId);

    if (supplier.isReturnEmail) {
      this.getGrnReturnById(createGrnReturn.id)
        .then((grn) => {
          if (grn) {
            notifier.emitEvent("GRN_RETURN_CREATED", {
              service: ServiceCode.INVENTORY,
              data: grn,
            });
          }
        })
        .catch((err) => {
          logger.error(err);
        });
    }

    logger.info("exiting::createGrnReturn::service");
    return createGrnReturn;
  },

  async updateGrnReturn(input: CreateGrnReturnInput) {
    logger.info("entering::updateGrnReturn::service");

    await updateGrnReturnServiceValidation(input);

    const updatedPO = await updateGrnReturnInDb(input);

    logger.info("exiting::updateGrnReturn::service");
    return updatedPO;
  },

  async getAllGrnReturn() {
    logger.info("entering::getAllGrnReturn::service");

    const records = await getAllGrnReturnFromDb();
    if (records.length === 0) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "grnReturn Order"),
      );
    }

    const dto = await Promise.all(
      records.map(async (sr) => {
        return toGrnReturnDTO([
          {
            ...sr,
            goodReceiveReturnDetails: sr.goodReceiveReturnDetails,
          },
        ]);
      }),
    );

    logger.info("exiting::getAllGrnReturn::service");
    return dto;
  },

  async getGrnReturnById(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<GoodReceiveReturnDTO | null> {
    logger.info("entering::getGrnReturnById::service id=" + id);

    validIdCheck(id);

    const grn = await getGrnReturnByIdFromDb(id);

    if (!grn) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Good Receive Note"),
        );
      } else {
        logger.warn(
          `GRN with id=${id} not found, returning null as requested.`,
        );
        return null;
      }
    }

    const dto = await toGrnReturnDTO([grn]);

    logger.info("exiting::getGrnReturnById::service id=" + id);
    return dto[0];
  },

  async deleteGrnReturn(id: number): Promise<void> {
    logger.info("entering::deleteGrnReturn::service id=" + id);

    await deleteGrnReturnServiceValidation(id);

    await deleteGrnReturnFromDb(id);
    logger.info("exiting::deleteGrnReturn::service id=" + id);
  },

  async approveGrnReturn(input: CreateGrnReturnInput) {
    logger.info("entering::approveGrnReturn::service");

    await approveGrnReturnServiceValidation(input);

    const updatedPO = await approvedGrnReturnInDb(input);

    logger.info("exiting::approveGrnReturn::service");
    return updatedPO;
  },

  async rejectedGrnReturn(input: { id: number; grnId: number }) {
    logger.info("entering::rejectedGrnReturn::service");

    await rejectGrnReturnServiceValidation(input);

    const updatedPO = await rejectGrnReturnInDb(input);

    logger.info("exiting::rejectedGrnReturn::service");
    return updatedPO;
  },

  // async buildExcelJSWorkbookForGrnReturnByFilter(input: GrnReturnReqExcelFilter): Promise<ExcelJs.Workbook> {
  //   logger.info("entering::buildExcelJSWorkbookForGrnReturnByFilter::service");
  //   const data = await getGrnReturnForExcelInDb(input);
  //   logger.info("exiting::getGrnReturnForExcelInDb::repository");
  //   if (!data.length) throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "GRN Return"));

  //   const dtoList: GoodReceiveReturnDTO[] = await Promise.all(data.map((grnReturn) => toGrnReturnDTO(grnReturn)));
  //   const wb = new ExcelJs.Workbook();
  //   const ws = wb.addWorksheet("GRN Report");
  //   ws.properties.defaultRowHeight = 18;
  //   let rowIndex = 1;

  //   for (const grnReturn of dtoList) {
  //     ws.mergeCells(rowIndex, 1, rowIndex, 6);
  //     ws.getCell(rowIndex, 1).value = `GRN No #${grnReturn.grnNumber}`;
  //     ws.getCell(rowIndex, 1).font = { bold: true };
  //     rowIndex++;

  //     const distributorName = grnReturn.distributor?.proInName;
  //     const warehouseName = grnReturn.warehouse?.name;
  //     const status = grnReturn.status;
  //     const paymentStatus = grnReturn.paymentStatus;
  //     const date = dayjs(grnReturn.date).format("YYYY-MM-DD");
  //     const totalAmount = grnReturn.totalAmount ?? 0;
  //     const discountMethod = grnReturn.discountMethod ?? "N/A";
  //     const discountAmount = grnReturn.discount ?? 0;
  //     const netDiscount = grnReturn.netDiscount ?? 0;
  //     const netTotal = grnReturn.netTotal ?? 0;
  //     const dueDate = grnReturn.dueDate ? dayjs(grnReturn.dueDate).format("YYYY-MM-DD") : "N/A";
  //     const netTax = grnReturn.netTax ?? 0;
  //     const tax = grnReturn.tax ?? 0;
  //     const paidAmount = grnReturn.paidAmount ?? 0;
  //     const billDate = grnReturn.billDate ? dayjs(grnReturn.billDate).format("YYYY-MM-DD") : "N/A";
  //     const billNo = grnReturn.billNo ?? "N/A";
  //     const shipping = grnReturn.shipping ?? 0;
  //     const notes = grnReturn.notes ?? "N/A";

  //     const info1 = ws.addRow(["Distributor", distributorName, "Warehouse", warehouseName, "Date", date]);
  //     [1, 3, 5].forEach((i) => (info1.getCell(i).font = { bold: true, color: { argb: "666161" } }));
  //     rowIndex++;

  //     const info2 = ws.addRow(["Status", status, "Payment Status", paymentStatus, "Notes", notes]);
  //     [1, 3, 5, 7].forEach((i) => (info2.getCell(i).font = { bold: true, color: { argb: "666161" } }));
  //     rowIndex++;

  //     const info3 = ws.addRow([
  //       "Net Total",
  //       netTotal,
  //       "Discount Method",
  //       discountMethod,
  //       "Discount Amount",
  //       discountAmount,
  //       "Net Discount",
  //       netDiscount,
  //       "Total Amount",
  //       totalAmount,
  //     ]);
  //     [1, 3, 5, 7, 9].forEach((i) => (info3.getCell(i).font = { bold: true, color: { argb: "666161" } }));
  //     rowIndex++;

  //     const info4 = ws.addRow(["Due Date", dueDate, "Net Tax", netTax, "Tax", tax, "Paid Amount", paidAmount]);
  //     [1, 3, 5, 7].forEach((i) => (info4.getCell(i).font = { bold: true, color: { argb: "666161" } }));
  //     rowIndex++;

  //     const info5 = ws.addRow(["Bill Date", billDate, "Bill No", billNo, "Shipping", shipping]);
  //     [1, 3, 5, 7, 9].forEach((i) => (info5.getCell(i).font = { bold: true, color: { argb: "666161" } }));
  //     rowIndex++;

  //     const header = [
  //       "Item Name",
  //       "Batch No",
  //       "Expiry Date",
  //       "Med Category",
  //       "Discount Method",
  //       "Shipping",

  //       "GRN Qty",
  //       "In Hand Qty",
  //       "Order Qty",

  //       "Quantity",
  //       "Net Amount",
  //       "Discount",
  //       "Net Discount",
  //       "Tax",
  //       "Net Tax",
  //       "Tax Method",
  //       "Total Amount",
  //     ];
  //     ws.addRow(header).font = { bold: true };
  //     rowIndex++;
  //     let sum = 0;

  //     for (const d of grnReturn.goodReceiveReturnDetails as GoodReceiveReturnDetailDTO[]) {
  //       ws.addRow([
  //         d.item?.medicineName ?? "",
  //         d.batchNo ?? "",
  //         dayjs(d.expiryDate).format("YYYY-MM-DD"),

  //         d.itemMedCategory ?? "",
  //         d.discountMethod ?? "",
  //         shipping,

  //         d.grnQty ?? 0,
  //         d.inHandQty ?? 0,
  //         d.orderQty ?? 0,

  //         d.quantity,
  //         d.netAmount ?? 0,
  //         d.discount ?? 0,
  //         d.netDiscount ?? 0,
  //         d.tax ?? 0,
  //         d.netTax ?? 0,
  //         d.taxMethod ?? "",
  //         d.totalAmount ?? 0,
  //       ]);
  //       sum += d.totalAmount ?? 0;
  //       rowIndex++;
  //     }
  //     ws.getCell(rowIndex, 16).value = "Grand Total:";
  //     ws.getCell(rowIndex, 16).font = { bold: true };
  //     ws.getCell(rowIndex, 17).value = sum;
  //     ws.getCell(rowIndex, 17).font = { bold: true };
  //     ws.getCell(rowIndex, 17).border = { top: { style: "thin" } };
  //     rowIndex += 2;
  //   }

  //   ws.columns.forEach((col) => {
  //     let max = 10;
  //     if (typeof col.eachCell === "function") {
  //       col.eachCell({ includeEmpty: true }, (cell) => {
  //         const len = cell.value != null ? String(cell.value).length : 0;
  //         if (len > max) max = len;
  //       });
  //     }
  //     col.width = max + 2;
  //   });
  //   logger.info("exiting::buildExcelJSWorkbookForGrnReturnByFilter::service");
  //   return wb;
  // },
};
