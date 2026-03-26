import { toItemBranchPriceDTO } from "@/mapper/item/item.mapper.js";
import {
  mapRowToBranchItemMapExcelCreateInput,
  toItemBranchMapDetailDTO,
} from "@/mapper/item/itemBranchMap.mapper.js";
import {
  branchItemMapBatchJob,
  copyBranchToBranchItemMapBatchJob,
  CreateBranchItemMapExcelInDb,
  createItemBranchMapInDb,
  deleteItemBranchMapInDB,
  getItemBranchMapByItemAndBranchIdFromDb,
  getItemBranchMapByItemIdFromDb,
  updateItemBranchMapInDb,
  UpdateItemWiseItemBranchMapInDb,
} from "@/repository/item/itemBranchMap.repository.js";
import {
  BranchItemMapExcelRow,
  BranchToBranchPriceCopy,
  createItemBranchMapInput,
  GetItemBranchPricing,
  ItemBranchMap,
  ItemBranchMapExcelInput,
  ItemWiseItemBranchMapUpdate,
} from "@/types/item/itemBranchMap.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import {
  copyBranchToBranchPriceServiceValidation,
  createItemBranchMapServiceValidation,
  getItemBranchMapServiceValidation,
  updateItemBranchMapServiceValidation,
  updateItemWiseItemBranchMapServiceValidation,
  validateIdItemBranchMap,
} from "@/validations/service/item/itemBranch.service.validation.js";
import ExcelJs from "exceljs";
import XLSX from "xlsx";
import { branchService } from "../master/branch.service.js";
import { itemService } from "./item.service.js";

export const itemBranchService = {
  async createItemBranchMap(input: createItemBranchMapInput) {
    logger.info("entering::createItemBranchMap::service");
    await createItemBranchMapServiceValidation(input);
    await createItemBranchMapInDb(input);
    logger.info("exiting::createItemBranchMap::service");
  },

  async updateItemBranchMap(input: ItemBranchMap) {
    logger.info("entering::updateItemBranchMap::service");
    await updateItemBranchMapServiceValidation(input);
    await updateItemBranchMapInDb(input);
    logger.info("exiting::updateItemBranchMap::service");
  },

  async getItemBranchPricing(input: GetItemBranchPricing) {
    logger.info("entering::updateItemBranchMap::service");
    await getItemBranchMapServiceValidation(input);
    const data = await getItemBranchMapByItemAndBranchIdFromDb(input);
    if (!data) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Item branch mapping "),
      );
    }
    const dataDTO = await toItemBranchPriceDTO(data);
    logger.info("exiting::updateItemBranchMap::service");
    return dataDTO;
  },

  async deleteItemBranchMap(id: number) {
    logger.info("entering::deleteItemBranchMap::service");
    await validateIdItemBranchMap(id);
    await deleteItemBranchMapInDB(id);
    logger.info("exiting::deleteItemBranchMap::service");
  },

  //Export excel for branch item price mapping
  async buildExcelItemBranchMap(input: ItemBranchMapExcelInput) {
    logger.info("entering::buildExcelItemBranchMap::service");

    // await exportExcelServiceValidation(input);
    const branch = await branchService.getBranchByIdWoDTO(input.branchId);
    if (!branch) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Branch"));
    }

    //Get all item
    const item = await itemService.getAllItemWoDto(input.categoryId);
    if (item.length === 0) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item"));
    }
    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Item Branch Map");

    const attribute = [
      "Branch ID",
      "Branch Name",
      "Item ID",
      "Item Number",
      "Item Name",
      "Default Discount",
      "Default B2B Discount",
      "Tax",
      "Tax Method",
      "Purchase Amount",
      "Sale Amount",
      "Insurance Percentage",
      "Walk In Percentage",
      "On Hold Sale",
    ];
    const attributeRow = ws.addRow(attribute);
    attributeRow.font = { bold: true };

    item.forEach((i) => {
      ws.addRow([
        input.branchId,
        branch.name,
        i.id,
        i.itemNumber,
        i.medicineName,
        i.defaultDiscount,
        i.defaultB2BDiscount,
        input.tax ? input.tax : i.tax,
        input.taxMethod ? input.taxMethod : i.taxMethod,
        i.purchaseAmount,
        i.saleAmount,
        input.insurancePercentage
          ? input.insurancePercentage
          : i.insurancePercentage,
        input.walkInPercentage ? input.walkInPercentage : i.walkInPercentage,
        i.onHoldSale,
      ]);
    });

    /* Auto size the columns */
    ws.columns.forEach((col) => {
      let max = 10;
      col.eachCell?.({ includeEmpty: true }, (cell) => {
        const len = cell.value ? String(cell.value).length : 0;
        if (len > max) max = len;
      });
      col.width = max + 2;
    });

    // Header row + columns A & B are locked, everything else unlocked
    const lockedCols = [1, 2, 3, 4, 5];
    ws.eachRow({ includeEmpty: true }, (row, r) => {
      row.eachCell({ includeEmpty: true }, (cell, c) => {
        if (r === 1 || lockedCols.includes(c)) {
          cell.protection = { locked: true };
        } else {
          cell.protection = { locked: false };
        }
      });
    });

    await ws.protect("", {
      selectLockedCells: false,
      selectUnlockedCells: true,
    });

    logger.info("exiting::buildExcelItemBranchMap::service");

    return wb;
  },

  async branchItemMapExcelImport(filePath: string) {
    logger.info("entering::branchItemMapExcelImport::service");

    if (!filePath) {
      throw new Error("No file path provided for Excel import");
    }

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet) as BranchItemMapExcelRow[];

    const convertedData = data.map((elem, ind) =>
      mapRowToBranchItemMapExcelCreateInput(elem, ind + 1),
    );

    const batch = await CreateBranchItemMapExcelInDb(
      await Promise.all(convertedData),
    );
    branchItemMapBatchJob(batch.id)
      .then(() => logger.info("Batch Procesing Completed."))
      .catch((e) => logger.error(JSON.stringify(e)));
    logger.info("exiting::branchItemMapExcelImport::service");
  },

  async getItemBranchMapDetails(itemId: number) {
    logger.info("entering::getItemBranchMapDetails::service");
    const mappings = await getItemBranchMapByItemIdFromDb(itemId);
    logger.info("exiting::getItemBranchMapDetails::service");
    return toItemBranchMapDetailDTO(itemId, mappings);
  },

  async updateBranchWiseItemBranchMap(input: ItemWiseItemBranchMapUpdate) {
    logger.info("entering::updateBranchWiseItemBranchMap::service");
    await updateItemWiseItemBranchMapServiceValidation(input);

    await UpdateItemWiseItemBranchMapInDb(input);

    logger.info("exiting::updateBranchWiseItemBranchMap::service");
  },

  async copyBranchToBranchPrice(input: BranchToBranchPriceCopy) {
    logger.info("entering::copyBranchToBranchPrice::service");

    await copyBranchToBranchPriceServiceValidation(input);

    copyBranchToBranchItemMapBatchJob(input)
      .then(() => logger.info("Batch Procesing Completed."))
      .catch((e) => logger.error(JSON.stringify(e)));

    logger.info("exiting::copyBranchToBranchPrice::service");
  },
};
