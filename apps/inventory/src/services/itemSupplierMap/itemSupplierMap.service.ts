import {
  mapRowToItemSupplierMapImportExcelInput,
  toAllItemSupplierMapDTO,
  toItemSupplierMapDTO,
} from "@/mapper/itemSupplierMap/itemSupplierMap.mapper";
import {
  CreateItemSupplierMapExcelInDb,
  createItemSupplierMapInDb,
  deleteItemSupplierMapByIdFromDb,
  getAllItemSupplierMapFromDb,
  getItemSupplierMapByIdFromDb,
  getItemSupplierMapFromDb,
  ItemSupplierMapBatchJob,
  updateItemSupplierMapInDb,
} from "@/repository/itemSupplierMap/itemSupplierMap.repository";
import {
  ItemSuppierMapDTO,
  ItemSupplierMapCreateInput,
  ItemSupplierMapExcelRow,
  ItemSupplierMapImportExcelInput,
  ItemSupplierMaplBatchJobInput,
  ItemSupplierMapUpdateInput,
} from "@/types/itemSupplierMap/itemSupplierMap";
import { GetItemReq } from "@/types/master/itemMaster";
import ErrorHandler from "@/utils/errorHandler.utils";
import { logger } from "@/utils/logger.utils";
import { generateErrorMessage } from "@/utils/responseMessage.utils";
import {
  createItemSupplierMapServiceValidation,
  deleteItemSupplierMapServiceValidation,
  getItemSupplierMapServiceValidation,
  updateItemSupplierMapServiceValidation,
} from "@/validations/service/itemSupplierMap/itemSupplierMapService.validation";
import ExcelJs from "exceljs";
import XLSX from "xlsx";
import { itemMasterService } from "../master/itemMaster.service";
export const itemSupplierMapService = {
  async createItemSupplierMap(input: ItemSupplierMapCreateInput): Promise<ItemSuppierMapDTO> {
    logger.info("entering::createItemSupplierMap::service");
    await createItemSupplierMapServiceValidation(input);
    const ItemSupplierMap = await createItemSupplierMapInDb(input);
    logger.info("exiting::createItemSupplierMap::service");
    return toItemSupplierMapDTO(ItemSupplierMap);
  },
  async updateItemSupplierMap(input: ItemSupplierMapUpdateInput): Promise<ItemSuppierMapDTO> {
    logger.info("entering::updateItemSupplierMap::service");
    await updateItemSupplierMapServiceValidation(input);
    const updatedItemSupplierMap = await updateItemSupplierMapInDb(input);
    logger.info("exiting::updateItemSupplierMap::service");
    return toItemSupplierMapDTO(updatedItemSupplierMap);
  },
  async getAllItemSupplierMap(canNullReturnable: boolean = false): Promise<ItemSuppierMapDTO[]> {
    logger.info("entering::getAllItemSupplierMap::service");
    const itemSupplierMap = await getAllItemSupplierMapFromDb();
    logger.info("exiting::getAllItemSupplierMap::service");
    if (itemSupplierMap.length === 0) {
      if (!canNullReturnable) throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item Supplier Mapping"));
      else return [];
    }
    return toAllItemSupplierMapDTO(itemSupplierMap);
  },
  async getItemSupplierMapById(id: number, canNullReturnable: boolean = false): Promise<ItemSuppierMapDTO | null> {
    logger.info("entering::getItemSupplierMapById::service");

    const itemSupplierMap = await getItemSupplierMapByIdFromDb(id);

    if (!itemSupplierMap) {
      if (!canNullReturnable) {
        throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item Supplier Mapping"));
      } else return null;
    }

    logger.info("exiting::getItemSupplierMapById::service");
    return toItemSupplierMapDTO(itemSupplierMap);
  },
  async deleteItemSupplierMapById(id: number): Promise<void> {
    logger.info("entering::deleteItemSupplierMapById::service");
    await deleteItemSupplierMapServiceValidation(id);
    await deleteItemSupplierMapByIdFromDb(id);
    logger.info("exiting::deleteItemSupplierMapById::service");
  },

  async itemSupplierMapExportExcel(): Promise<ExcelJs.Workbook> {
    logger.info("entering::exportItemSupplierMapExcel::service");
    const item = await itemMasterService.getAllItemMaster();
    if (item.length === 0) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item Master"));
    }
    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Item Supplier Map", { properties: { defaultRowHeight: 18 } });
    const attribute = ["Item Code", "Item Id", "Item Category", "Item Name", "Base Price", "Supplier Price"];
    const attributeRow = ws.addRow(attribute);
    attributeRow.font = { bold: true };

    item.forEach((i) => {
      ws.addRow([i.itemCode, i.id, i.itemCategory?.value, i.item, i.basePrice, 0.0]);
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
    const lockedCols = [1, 2, 3, 4];
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

    logger.info("exiting::exportItemSupplierMapExcel::service");
    return wb;
  },

  async itemSupplierMapImportExcel(filePath: string, input: ItemSupplierMapImportExcelInput) {
    logger.info("entering::itemSupplierMapImportExcel::service");
    const { supplierId, ccId } = input;
    if (!filePath) {
      throw new Error("No file path provided for Excel import");
    }

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet) as ItemSupplierMapExcelRow[];

    const convertedData = data.map((elem, ind) => mapRowToItemSupplierMapImportExcelInput(elem, ind + 1));
    const batch = await CreateItemSupplierMapExcelInDb(convertedData);
    const batchJobInput: ItemSupplierMaplBatchJobInput = {
      batchJobId: batch.id,
      supplierId,
      ccId,
    };
    ItemSupplierMapBatchJob(batchJobInput)
      .then(() => logger.info("Batch Procesing Completed."))
      .catch((e) => logger.error(JSON.stringify(e)));
    logger.info("exiting::itemSupplierMapImportExcel::service");
  },

  async getItemSupplierMap(body: GetItemReq) {
    logger.info("entering::getItemSupplierMap::service");
    await getItemSupplierMapServiceValidation(body);
    const itemSupplierMap = await getItemSupplierMapFromDb(body);
    logger.info("exiting::getItemSupplierMap::service");
    return itemSupplierMap;
  },
};
