import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import {
  mapRowToItemMasterExcelCreateInput,
  toItemMasterDTO,
  toItemMasterDTOForItemSupplierMap,
  toItemSearchDTO,
  toItemStockDTO,
} from "@/mapper/master/itemMaster.mapper.js";
import {
  createItemMasterExcelInDb,
  createItemMasterInDb,
  getAllItemMasterFromDb,
  getCountItemsFromDb,
  getItemMasterByIdFromDb,
  getItemStocksByItemId,
  ItemMasterBatchJob,
  toggleItemActiveInDb,
  updateItemMasterInDb,
} from "@/repository/master/itemMaster.repository.js";
import {
  CreateItemSearch,
  GetItemReq,
  getItems,
  GetItemStockRequest,
  ItemExcelImportReq,
  ItemForSearch,
  ItemMasterDto,
  ItemMasterDtoStock,
  ItemMasterExcelRow,
  ItemMasterReq,
  ItemMasterUpdateReq,
  ItemSearchDTO,
} from "@/types/master/itemMaster.js";
import { getBranchOrWarehouse } from "@/utils/getCollectionCenter.utils.js";
import { validateItemMasterExcelArray } from "@/validations/request/master/itemMasterExcel.validation.js";
import {
  createItemMasterServiceValidation,
  updateIdItemMasterServiceValidation,
  validateBulkItemSupplierPricesService,
  validateIdItemMaster,
} from "@/validations/service/master/itemMaster.service.validation.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { ConsumptionType, InvItem } from "@repo/db/generated/prisma/client";
import {
  addToCache,
  deleteCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/inventory.shortCode.utils.js";
import ExcelJs from "exceljs";
import XLSX from "xlsx";
export const cacheKey = getRedisKey("ITEM", "all");
export const cacheKeyForItemSearch = getRedisKey("ITEM", "search");

// const deleteOldItemImageFiles = (item: InvItem) => {
//   deleteFileIfExists(process.cwd() + item.frontImage);
//   deleteFileIfExists(process.cwd() + item.backImage);
//   deleteFileIfExists(process.cwd() + item.leftSideImage);
//   deleteFileIfExists(process.cwd() + item.rightSideImage);
// };

export const itemMasterService = {
  async createItemMaster(input: ItemMasterReq): Promise<ItemMasterDto> {
    logger.info("entering::createItemMaster::service");
    await createItemMasterServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM);
    const itemMaster = await createItemMasterInDb(input);
    if (isCacheable && itemMaster) {
      await addToCache(cacheKey, itemMaster.id, itemMaster);
    }
    logger.info("exiting::createItemMaster::service");
    const itemForSearch = await toItemMasterDTO([itemMaster]);
    if (isCacheable) {
      await addToCache(cacheKeyForItemSearch, itemMaster.id, itemForSearch[0]);
    }
    return itemForSearch[0];
  },

  async getItemStocks(itemStockReq: GetItemStockRequest) {
    logger.info("entering::getItemStocks::service");
    if (itemStockReq.userId) {
      const user = await employeeService.getEmployeeByIdFrmCacheOrDb(
        itemStockReq.userId
      );
      if (!user) {
        throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "User"));
      }
    }
    if (itemStockReq.ccId) {
      const cc = await getBranchOrWarehouse(itemStockReq.ccId);
      if (!cc) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Location")
        );
      }
    }
    await validateIdItemMaster(itemStockReq.id);

    const stocks = await getItemStocksByItemId(itemStockReq);

    logger.info("exiting::getItemStocks::service");
    return await Promise.all(stocks.map((stock) => toItemStockDTO(stock)));
  },

  async updateItemMaster(input: ItemMasterUpdateReq): Promise<ItemMasterDto> {
    logger.info("entering::updateItemMaster::service");
    if (!input.id) {
      throw new ErrorHandler(400, "Item Master ID is required");
    }
    await updateIdItemMasterServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM);
    const updatedItemMaster = await updateItemMasterInDb(input);
    if (isCacheable) {
      await updateCache(cacheKey, input.id, updatedItemMaster);
    }

    logger.info("exiting::updateItemMaster::service");
    const itemMasterDto = await toItemMasterDTO([updatedItemMaster]);
    return itemMasterDto[0];
  },

  async getAllItemMaster(
    canNullReturnable: boolean = false
  ): Promise<ItemMasterDto[]> {
    logger.info("entering::getAllItemMaster::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM);
    let itemMaster: InvItem[];
    if (isCacheable) {
      itemMaster = (await getAllCache(cacheKey)) as InvItem[];
    } else {
      itemMaster = await getAllItemMasterFromDb();
    }
    if (itemMaster.length === 0) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Item Master")
        );
      else return [];
    }
    logger.info("exiting::getAllItemMaster::service");
    const itemMasterDTO = await toItemMasterDTO(itemMaster);
    return itemMasterDTO;
  },

  async getAllItemMasterWoDto(): Promise<InvItem[]> {
    logger.info("entering::getAllItemMasterWoDto::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM);
    let itemMaster: InvItem[];
    if (isCacheable) {
      itemMaster = (await getAllCache(cacheKey)) as InvItem[];
    } else {
      itemMaster = await getAllItemMasterFromDb();
    }
    if (itemMaster.length === 0) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Item Master")
      );
    }
    logger.info("exiting::getAllItemMasterWoDto::service");
    return itemMaster;
  },

  async getItemMasterById(
    input: GetItemReq,
    canNullReturnable: boolean = false
  ): Promise<ItemMasterDtoStock | null> {
    logger.info("entering::getItemMasterById::service");
    const { itemId, ccId, supplierId } = input;
    validIdCheck(itemId);
    if (supplierId) validIdCheck(supplierId);
    if (ccId) validIdCheck(ccId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM);
    let itemMaster: InvItem | null;
    if (isCacheable) {
      itemMaster = (await getCacheById(cacheKey, itemId)) as InvItem | null;
    } else {
      itemMaster = await getItemMasterByIdFromDb(itemId);
    }
    if (!itemMaster) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Item Master")
        );
      else return null;
    }

    logger.info("exiting::getItemMasterById::service");
    return toItemMasterDTOForItemSupplierMap(itemMaster, input);
  },
  async getItemMasterByIdWoDto(
    itemId: number,
    canNullReturnable: boolean = false
  ): Promise<InvItem | null> {
    logger.info("entering::getItemMasterById::service");
    validIdCheck(itemId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM);
    let itemMaster: InvItem | null;
    if (isCacheable) {
      itemMaster = (await getCacheById(cacheKey, itemId)) as InvItem | null;
    } else {
      itemMaster = await getItemMasterByIdFromDb(itemId);
    }
    if (!itemMaster) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Item Master")
        );
      else return null;
    }

    logger.info("exiting::getItemMasterById::service");
    return itemMaster;
  },

  async itemSearch(input: CreateItemSearch): Promise<ItemSearchDTO[]> {
    logger.info("entering::itemSearch::service");
    const cachedItems = (await getAllCache(cacheKey)) as ItemForSearch[] | null;
    if (!cachedItems || cachedItems.length === 0) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item"));
    }
    const search = (input.searchText ?? "").toLowerCase().trim();

    let filteredItems = cachedItems.filter((item) => {
      const name = (item.item ?? "").toLowerCase();
      const number = (item.itemCode ?? "").toLowerCase();
      return name.includes(search) || number.includes(search);
    });

    if (input.unitId) {
      filteredItems = filteredItems.filter(
        (item) => item.unitId === input.unitId
      );
    }

    if (input.itemCategoryId) {
      filteredItems = filteredItems.filter(
        (item) => item.itemCategoryId === input.itemCategoryId
      );
    }

    // const categories = (await getAllCache(getRedisKey("ITEM_CATEGORY", "all"))) as ItemCategory[] | null;
    // const units = (await getAllCache(getRedisKey("UNIT_MASTER", "all"))) as UnitMaster[] | null;

    logger.info("exiting::itemSearch::service");
    return Promise.all(
      filteredItems.map((item) =>
        toItemSearchDTO({
          item,
          categories: item.itemCategoryId,
          units: item.unitId,
        })
      )
    );
  },

  async getItemSupplierPricesForSupplier(
    input: getItems
  ): Promise<ItemMasterDtoStock[]> {
    logger.info("entering::getItemSupplierPricesForSupplier::service");
    await validateBulkItemSupplierPricesService(input);

    const items = await getCountItemsFromDb(input.itemIds);

    const dtoList = await Promise.all(
      items.map((itm) =>
        toItemMasterDTOForItemSupplierMap(itm, {
          itemId: itm.id,
          supplierId: input.supplierId,
          ccId: input.ccId,
        })
      )
    );

    logger.info("exiting::getItemSupplierPricesForSupplier::service");
    return dtoList;
  },

  async toggleItemActiveService(id: number): Promise<void> {
    logger.info("entering::toggleItemActiveService::service");
    validIdCheck(id);
    const updated = await toggleItemActiveInDb(id);

    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM);
    if (isCacheable) {
      if (updated.isActive) {
        await addToCache(cacheKey, id, updated);
      } else {
        await deleteCache(cacheKey, id);
      }
    }

    if (updated.isActive) {
      await addToCache(cacheKeyForItemSearch, id, updated);
    } else {
      await deleteCache(cacheKeyForItemSearch, id);
    }

    logger.info("exiting::toggleItemActiveService::service");
  },

  async itemExcelSampleExport() {
    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Item");

    const consumptionTypes = Object.values(ConsumptionType);

    ws.properties.defaultRowHeight = 18;

    ws.columns = [
      { header: "Item Name", key: "item", width: 30 },
      { header: "Item Code", key: "itemCode", width: 25 },
      { header: "Item Category", key: "itemCategory", width: 25 },
      { header: "Storage", key: "storage", width: 20 },
      { header: "Unit", key: "unit", width: 15 },
      { header: "Base Price", key: "basePrice", width: 15 },
      { header: "Re-order Level", key: "reOrderLevel", width: 18 },
      { header: "Item Description", key: "itemDescription", width: 40 },
      { header: "Is Batch Number", key: "isBatchNumber", width: 18 },
      { header: "Is Expire Date", key: "isExpireDate", width: 18 },
      { header: "Is User Returnable", key: "isUserReturnable", width: 18 },
      { header: "Is Vendor Returnable", key: "isVendorReturnable", width: 18 },
      { header: "Is Price Variable", key: "isPriceVariable", width: 18 },
      { header: "Consumption Type", key: "consumptionType", width: 18 },
    ];

    const headerRow = ws.getRow(1);

    headerRow.eachCell((cell) => {
      cell.font = {
        name: "Calibri",
        bold: true,
        color: { argb: "FFFFFFFF" },
      };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4F81BD" },
      };

      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };

      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    headerRow.height = 22;

    ws.addRows([
      {
        item: "Cotton Roll",
        itemCode: "ITEM-0001",
        itemCategory: "Consumables",
        storage: "Main Store",
        unit: "PIECE",
        basePrice: 25,
        reOrderLevel: 20,
        itemDescription: "Medical cotton roll for dressing",
        isBatchNumber: true,
        isExpireDate: false,
        isUserReturnable: true,
        isVendorReturnable: true,
        isPriceVariable: false,
        consumptionType: "MANUAL",
      },
      {
        item: "Surgical Gloves",
        itemCode: "ITEM-0003",
        itemCategory: "Surgical",
        storage: "Main Store",
        unit: "PAIR",
        basePrice: 15,
        reOrderLevel: 50,
        itemDescription: "Disposable surgical gloves",
        isBatchNumber: true,
        isExpireDate: true,
        isUserReturnable: false,
        isVendorReturnable: true,
        isPriceVariable: false,
        consumptionType: "MANUAL",
      },
    ]);

    ws.getColumn("itemCode").numFmt = "@";

    ws.columns.forEach((col) => {
      let max = 10;

      col.eachCell?.({ includeEmpty: true }, (cell) => {
        const len = cell.value ? String(cell.value).length : 0;
        if (len > max) max = len;
      });

      col.width = Math.min(max + 2, 45);
    });

    for (let row = 2; row <= 50; row++) {
      ws.getCell(`N${row}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`"${consumptionTypes.join(",")}"`],
        showErrorMessage: true,
        errorTitle: "Invalid Value",
        error: `Please select one of: ${consumptionTypes.join(", ")}`,
      };
    }

    ws.views = [{ state: "frozen", ySplit: 1 }];

    return wb;
  },

  async itemExcelExport(): Promise<ExcelJs.Workbook> {
    logger.info("entering::itemExcelExport::service");
    const items = await this.getAllItemMaster(true);
    if (items.length === 0) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Item Master")
      );
    }

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Item", {
      properties: { defaultRowHeight: 18 },
    });

    const attribute = [
      "Item Name",
      "Item Code",
      "Item Description",
      "Item Category",
      "Storage Name",
      "Unit Name",
      "Base Price",
      "Re-order Level",
      "Is Batch Number",
      "Is Expire Date",
      "Is User Returnable",
      "Is Vendor Returnable",
      "Is Price Variable",
      "Consumption Type",
    ];

    const attributeRow = ws.addRow(attribute);
    attributeRow.font = { bold: true };

    items.forEach((i) => {
      ws.addRow([
        i.item,
        i.itemCode ?? "",
        i.itemDescription ?? "",
        i.itemCategory?.value,
        i.storage?.value ?? "",
        i.unitMaster?.packagingTypeName,
        i.basePrice != null ? Number(i.basePrice) : "",
        i.reOrderLevel ?? "",
        i.isBatchNumber,
        i.isExpireDate,
        i.isUserReturnable,
        i.isVendorReturnable,
        i.isPriceVariable,
        i.consumptionType,
      ]);
    });

    ws.columns.forEach((col) => {
      let max = 10;
      col.eachCell?.({ includeEmpty: true }, (cell) => {
        const len = cell.value ? String(cell.value).length : 0;
        if (len > max) max = len;
      });
      col.width = max + 2;
    });

    logger.info("exiting::itemExcelExport::service");
    return wb;
  },

  async itemExcelImport(input: ItemExcelImportReq) {
    logger.info("entering::itemExcelImport::service");

    if (!input.path) {
      throw new ErrorHandler(400, generateErrorMessage("NOT_FOUND", "File"));
    }

    const workbook = XLSX.readFile(input.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet) as ItemMasterExcelRow[];

    const convertedData = data.map((elem, ind) =>
      mapRowToItemMasterExcelCreateInput(elem, ind + 1)
    );

    const { value } = validateItemMasterExcelArray(convertedData);

    const batch = await createItemMasterExcelInDb(value);

    ItemMasterBatchJob({
      batchJobId: batch.id,
    })
      .then(() => logger.info("Item Master Batch Processing Completed."))
      .catch((e) => logger.error(JSON.stringify(e)));

    logger.info("exiting::itemExcelImport::service");
    return batch;
  },
};
