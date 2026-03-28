import { toPurchaseOrderDTO } from "@/mapper/purchase/purchase.mapper.js";
import {
  createPurchaseOrder,
  deletePurchaseOrderFromDb,
  getAllPurchaseFromDb,
  getPurchaseByIdFromDb,
  getPurchasesFromDb,
  updatePurchaseOrderInDb,
} from "@/repository/purchase/purchase.repository.js";
import {
  CreatePurchaseOrderInput,
  PurchaseOrderDetailDTO,
  PurchaseOrderDTO,
  PurchaseReqExcelFilter,
} from "@/types/purchase/purchase.js";
import {
  createPOServiceValidation,
  deletePOServiceValidation,
  updatePOServiceValidation,
  validateIdPO,
} from "@/validations/service/purchase/purchase.service.validation.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import dayjs from "dayjs";
import ExcelJs from "exceljs";

export const purchaseService = {
  async createPurchaseOrder(input: CreatePurchaseOrderInput) {
    logger.info("entering::createPurchaseOrder::service");
    await createPOServiceValidation(input);
    const createPurchase = await createPurchaseOrder(input);

    logger.info("exiting::createPurchaseOrder::service");
    return createPurchase;
  },

  async updatePurchase(input: CreatePurchaseOrderInput) {
    logger.info("entering::updatePurchase::service");

    await updatePOServiceValidation(input);

    const updatedPO = await updatePurchaseOrderInDb(input);

    logger.info("exiting::updatePurchase::service");
    return updatedPO;
  },

  async getAllPurchase() {
    logger.info("entering::getAllPurchase::service");

    const pos = await getAllPurchaseFromDb();
    if (pos.length === 0) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Purchase Order"),
      );
    }

    const dto = await Promise.all(pos.map(toPurchaseOrderDTO));

    logger.info("exiting::getAllPurchase::service");
    return dto;
  },

  async getPurchaseById(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<PurchaseOrderDTO | null> {
    logger.info("entering::getPurchaseById::service id=" + id);

    validIdCheck(id);

    const po = await getPurchaseByIdFromDb(id);
    if (!po) {
      if (canNullReturnable) {
        return null;
      }
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "PurchaseOrder"),
      );
    }

    const dto = await toPurchaseOrderDTO(po);

    logger.info("exiting::getPurchaseById::service id=" + id);
    return dto;
  },

  async deletePurchase(id: number): Promise<void> {
    logger.info("entering::deletePurchase::service id=" + id);

    await deletePOServiceValidation(id);

    await deletePurchaseOrderFromDb(id);
    logger.info("exiting::deletePurchase::service id=" + id);
  },

  async purchaseApproval(purchaseId: number) {
    logger.info("entering::purchaseApproval::service");

    const po = await validateIdPO(purchaseId);

    // const instance = await getInstance(po.id, "PURCHASE_ORDER", "PHARMACY"); // TODO: Implement approval logic
    const store = requestStorage.getStore();
    const userId = store?.user?.id;

    // if (userId) {
    //   await approvalService.act({
    //     instanceId: instance.id,
    //     approverId: userId,
    //     action: "APPROVE",
    //     comment: "Purchase Order approved by user",
    //     ccId: po.warehouseId,
    //   });
    // }

    // TODO: Implement approval logic

    logger.info("exiting::purchaseApproval::service");
  },

  async buildExcelJSWorkbookForPurchaseOrderByFilter(
    input: PurchaseReqExcelFilter,
  ): Promise<ExcelJs.Workbook> {
    logger.info(
      "entering::buildExcelJSWorkbookForPurchaseOrderByFilter::service",
    );
    const data = await getPurchasesFromDb(input);
    logger.info("exiting::getPurchasesFromDb::repository");
    if (!data.length)
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Purchase Order"),
      );

    const dtoList: PurchaseOrderDTO[] = await Promise.all(
      data.map((po) => toPurchaseOrderDTO(po)),
    );
    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Purchase Order Report");
    ws.properties.defaultRowHeight = 18;
    let rowIndex = 1;

    for (const po of dtoList) {
      ws.mergeCells(rowIndex, 1, rowIndex, 6);
      ws.getCell(rowIndex, 1).value = `Purchase Order No #${po.poNumber}`;
      ws.getCell(rowIndex, 1).font = { bold: true };
      rowIndex++;

      const distributorName = po.distributor?.proInName ?? "";
      const warehouseName = po.warehouse?.name ?? "";
      const storageName = po.storage?.name ?? "";
      const grandTotal = po.grandTotal ?? 0;
      const notes = po.notes ?? "";
      const currency = po.currency ?? "";

      // first info row
      const infoRow1 = ws.addRow([
        "Distributor",
        distributorName,
        "Warehouse",
        warehouseName,
        "Storage",
        storageName,
        "Grand Total",
        grandTotal,
        "Notes",
        notes,
      ]);
      [1, 3, 5, 7, 9].forEach(
        (i) =>
          (infoRow1.getCell(i).font = {
            bold: true,
            color: { argb: "666161" },
          }),
      );
      rowIndex++;

      // second info row
      const infoRow2 = ws.addRow([
        "Status",
        po.status,
        "Payment Terms",
        po.paymentTerms,
        "Date",
        dayjs(po.date).format("YYYY-MM-DD"),
        "Currency",
        currency,
      ]);
      [1, 3, 5, 7].forEach(
        (i) =>
          (infoRow2.getCell(i).font = {
            bold: true,
            color: { argb: "666161" },
          }),
      );
      rowIndex++;

      if (!po.purchaseOrderDetailDTO.length) {
        ws.addRow(["No items in this purchase order."]);
        rowIndex++;
        continue;
      }

      ws.addRow([
        "Item Name",
        "Category",
        "Medicine Type",
        "Manufacturer",
        "Pack Size",
        "Drug Type",
        "Medicine Composition",
        "Medicine Unit",
        "MRP",
        "UOM",
        "Packing Quantity",
        "Purchased Price",
        "Quantity",
        "Total Amount",
      ]).font = { bold: true };
      rowIndex++;

      let sum = 0;
      for (const d of po.purchaseOrderDetailDTO as PurchaseOrderDetailDTO[]) {
        const itemName = d.item?.medicineName ?? "";
        const catName = d.itemCategory?.name ?? "";
        const uom = d.uom ?? "";
        const medType = d.medType ?? "";
        const medComp = d.medComp ?? "";
        const medUnit = d.medUnit ?? "";
        const manufacturer = d.manufacturer ?? "";
        const packSize = d.packSize ?? "";
        const drugType = d.drugType ?? "";
        const packingQty = d.packingQty ?? "";

        ws.addRow([
          itemName,
          catName,
          medType,
          manufacturer,
          packSize,
          drugType,
          medComp,
          medUnit,
          d.mrp ?? 0,
          uom,
          packingQty,
          d.purchasedPrice,
          d.quantity,
          d.totalAmount,
        ]);
        sum += d.totalAmount;
        rowIndex++;
      }

      ws.getCell(rowIndex, 13).value = "Grand Total:";
      ws.getCell(rowIndex, 13).font = { bold: true };
      ws.getCell(rowIndex, 14).value = sum;
      ws.getCell(rowIndex, 14).font = { bold: true };
      ws.getCell(rowIndex, 14).border = { top: { style: "thin" } };
      rowIndex += 2;
    }

    ws.columns.forEach((col) => {
      let max = 10;
      col.eachCell?.({ includeEmpty: true }, (cell) => {
        const len = cell.value != null ? String(cell.value).length : 0;
        if (len > max) max = len;
      });
      col.width = max + 2;
    });
    logger.info(
      "exiting::buildExcelJSWorkbookForPurchaseOrderByFilter::service",
    );
    return wb;
  },
};
