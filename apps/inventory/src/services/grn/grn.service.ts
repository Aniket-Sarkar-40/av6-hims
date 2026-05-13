import { toGrnDTO } from "@/mapper/grn/grn.mapper.js";
import {
  createGrnInDb,
  deleteGrnFromDb,
  getAllGrnFromDb,
  getGrnByIdFromDb,
  updateGrnInDb,
} from "@/repository/grn/grn.repository.js";
import { CreateGrnInput, GrnDTO } from "@/types/grn/grn.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  createGrnServiceValidation,
  deleteGrnServiceValidation,
  updateGrnServiceValidation,
} from "@/validations/service/grn/grn.service.validation.js";
import { notifier } from "@/config/core.config.js";
import { validateIdItemSupplier } from "@/validations/service/master/itemSupplier.service.validation.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const grnService = {
  async createGrn(input: CreateGrnInput) {
    logger.info("entering::createGrn::service");
    await createGrnServiceValidation(input);
    const createGrn = await createGrnInDb(input);

    const supplier = await validateIdItemSupplier(createGrn.supplierId);

    if (supplier.isGrnEmail) {
      this.getGrnById(createGrn.id)
        .then((grn) => {
          if (grn) {
            notifier.emitEvent("GRN_CREATED", {
              service: ServiceCode.INVENTORY,
              data: grn,
            });
          }
        })
        .catch((err) => {
          logger.error(err);
        });
    }

    logger.info("exiting::createStore Requisition::service");
    return createGrn;
  },

  async updateGrn(input: CreateGrnInput) {
    logger.info("entering::updateGrn::service");

    await updateGrnServiceValidation(input);

    const updatedPO = await updateGrnInDb(input);

    logger.info("exiting::updateGrn::service");
    return updatedPO;
  },

  async getAllGrn() {
    logger.info("entering::getAllGrn::service");

    const records = await getAllGrnFromDb();
    if (records.length === 0) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "grn Order")
      );
    }

    const dto = await Promise.all(
      records.map(async (sr) => {
        return toGrnDTO([
          {
            ...sr,
            goodReceiveDetails: sr.goodReceiveDetails,
          },
        ]);
      })
    );

    logger.info("exiting::getAllGrn::service");
    return dto;
  },

  async getGrnById(
    id: number,
    canNullReturnable: boolean = false
  ): Promise<GrnDTO | null> {
    logger.info("entering::getGrnById::service id=" + id);

    validIdCheck(id);

    const grn = await getGrnByIdFromDb(id);

    if (!grn) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Good Receive Note")
        );
      } else {
        logger.warn(
          `GRN with id=${id} not found, returning null as requested.`
        );
        return null;
      }
    }

    const dto = await toGrnDTO([grn]);

    logger.info("exiting::getGrnById::service id=" + id);
    return dto[0];
  },

  async deleteGrn(id: number): Promise<void> {
    logger.info("entering::deleteGrn::service id=" + id);

    await deleteGrnServiceValidation(id);

    await deleteGrnFromDb(id);
    logger.info("exiting::deleteGrn::service id=" + id);
  },

  // async buildExcelJSWorkbookForGrnByFilter(input: GrnReqExcelFilter): Promise<ExcelJs.Workbook> {
  //   logger.info("entering::buildExcelJSWorkbookForGrnByFilter::service");
  //   const data = await getGrnForExcelInDb(input);
  //   logger.info("exiting::getGrnForExcelInDb::repository");
  //   if (!data.length) throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "GRN"));

  //   const dtoList: GrnDTO[] = await Promise.all(data.map((grn) => toGrnDTO(grn)));
  //   const wb = new ExcelJs.Workbook();
  //   const ws = wb.addWorksheet("GRN Report");
  //   ws.properties.defaultRowHeight = 18;
  //   let rowIndex = 1;

  //   for (const grn of dtoList) {
  //     ws.mergeCells(rowIndex, 1, rowIndex, 6);
  //     ws.getCell(rowIndex, 1).value = `GRN No #${grn.grnNumber}`;
  //     ws.getCell(rowIndex, 1).font = { bold: true };
  //     rowIndex++;

  //     const distributorName = grn.distributor?.proInName;
  //     const warehouseName = grn.warehouse?.name;
  //     const status = grn.status;
  //     const paymentStatus = grn.paymentStatus;
  //     const gatePassId = grn.gatePassId;
  //     const date = dayjs(grn.date).format("YYYY-MM-DD");
  //     const totalAmount = grn.totalAmount ?? 0;
  //     const discountMethod = grn.discountMethod ?? "N/A";
  //     const discountAmount = grn.discount ?? 0;
  //     const netDiscount = grn.netDiscount ?? 0;
  //     const netTotal = grn.netTotal ?? 0;
  //     const dueDate = grn.dueDate ? dayjs(grn.dueDate).format("YYYY-MM-DD") : "N/A";
  //     const netTax = grn.netTax ?? 0;
  //     const tax = grn.tax ?? 0;
  //     const paidAmount = grn.paidAmount ?? 0;
  //     const billDate = grn.billDate ? dayjs(grn.billDate).format("YYYY-MM-DD") : "N/A";
  //     const billNo = grn.billNo ?? "N/A";
  //     const shipping = grn.shipping ?? 0;
  //     const margin = grn.margin ?? 0;
  //     const returnedAmount = grn.returnedAmount ?? 0;
  //     const notes = grn.notes ?? "N/A";

  //     // Info rows
  //     const info1 = ws.addRow(["Distributor", distributorName, "Warehouse", warehouseName, "Date", date]);
  //     [1, 3, 5].forEach((i) => (info1.getCell(i).font = { bold: true, color: { argb: "666161" } }));
  //     rowIndex++;

  //     const info2 = ws.addRow([
  //       "Status",
  //       status,
  //       "Payment Status",
  //       paymentStatus,
  //       "Gate Pass ID",
  //       gatePassId,
  //       "Notes",
  //       notes,
  //     ]);
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

  //     const info5 = ws.addRow([
  //       "Bill Date",
  //       billDate,
  //       "Bill No",
  //       billNo,
  //       "Shipping",
  //       shipping,
  //       "Margin",
  //       margin,
  //       "Returned Amount",
  //       returnedAmount,
  //     ]);
  //     [1, 3, 5, 7, 9].forEach((i) => (info5.getCell(i).font = { bold: true, color: { argb: "666161" } }));
  //     rowIndex++;

  //     // Header
  //     const header = [
  //       "Item Name",
  //       "Batch No",
  //       "Expiry Date",

  //       "Med Category",
  //       "Med Type",
  //       "Med Comp",
  //       "Med Unit",
  //       "Manufacturer",
  //       "Pack Size",
  //       "Drug Type",
  //       "MRP",
  //       "Shipping",
  //       "In Hand Qty",
  //       "FOC Qty",
  //       "Order Qty",
  //       "Return Qty",
  //       "Quantity",
  //       "Purchased Price",
  //       "Net Amount",
  //       "Discount Method",
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
  //     // Detail rows
  //     for (const d of grn.goodReceiveDetails as GrnDetailDTO[]) {
  //       ws.addRow([
  //         d.item?.medicineName ?? "",
  //         d.batchNo ?? "",
  //         dayjs(d.expiryDate).format("YYYY-MM-DD"),

  //         d.itemMedCategory ?? "",
  //         d.medType ?? "",
  //         d.medComp ?? "",
  //         d.medUnit ?? "",
  //         d.manufacturer ?? "",
  //         d.packSize ?? "",
  //         d.drugType ?? "",
  //         d.mrp ?? 0,
  //         shipping,
  //         d.inHandQty,
  //         d.focQuantity ?? 0,
  //         d.orderQuantity ?? 0,
  //         d.returnQuantity ?? 0,
  //         d.quantity,
  //         d.purchasedPrice ?? 0,
  //         d.netAmount ?? 0,
  //         d.discountMethod ?? "",
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
  //     ws.getCell(rowIndex, 25).value = "Grand Total:";
  //     ws.getCell(rowIndex, 25).font = { bold: true };
  //     ws.getCell(rowIndex, 26).value = sum;
  //     ws.getCell(rowIndex, 26).font = { bold: true };
  //     ws.getCell(rowIndex, 26).border = { top: { style: "thin" } };
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
  //   logger.info("exiting::buildExcelJSWorkbookForGrnByFilter::service");

  //   return wb;
  // },
};
