import ExcelJs from "exceljs";
import {
  toItemMasterDTO,
  toItemMasterDTOForItemSupplierMap,
  toItemSearchDTO,
  toItemStockDTO,
} from "@/mapper/master/itemMaster.mapper";
import { deleteFileIfExists } from "@/middlewares/imageUpload.middleware";
import {
  createItemMasterInDb,
  getAllItemMasterFromDb,
  getCountItemsFromDb,
  getItemMasterByIdFromDb,
  getItemStocksByItemId,
  toggleItemActiveInDb,
  updateItemMasterInDb,
} from "@/repository/master/itemMaster.repository";
import {
  CreateItemSearch,
  GetItemReq,
  getItems,
  GetItemStockRequest,
  ItemForSearch,
  ItemMasterDto,
  ItemMasterDtoStock,
  ItemMasterReq,
  ItemMasterUpdateReq,
  ItemSearchDTO,
} from "@/types/master/itemMaster";
import ErrorHandler from "@/utils/errorHandler.utils";
import { logger } from "@/utils/logger.utils";
import {
  addToCache,
  checkIsCacheable,
  deleteCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@/utils/redisHelper.utils";
import { getRedisKey } from "@/utils/redisKey.utils";
import { generateErrorMessage } from "@/utils/responseMessage.utils";
import { SHORT_CODE } from "@/utils/shortCode.utils";
import { validIdCheck } from "@/validations/global.validation";
import {
  createItemMasterServiceValidation,
  updateIdItemMasterServiceValidation,
  validateBulkItemSupplierPricesService,
} from "@/validations/service/master/itemMaster.service.validation";
import { Item } from "@prisma/client";

export const cacheKey = getRedisKey("ITEM", "all");
export const cacheKeyForItemSearch = getRedisKey("ITEM", "search");

const deleteOldItemImageFiles = (item: Item) => {
  deleteFileIfExists(process.cwd() + item.frontImage);
  deleteFileIfExists(process.cwd() + item.backImage);
  deleteFileIfExists(process.cwd() + item.leftSideImage);
  deleteFileIfExists(process.cwd() + item.rightSideImage);
};

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
    const itemForSearch = toItemMasterDTO(itemMaster);
    await addToCache(cacheKeyForItemSearch, (await itemForSearch).id, itemForSearch);
    return itemForSearch;
  },

  async getItemStocks(itemStockReq: GetItemStockRequest) {
    logger.info("entering::getItemStocks::service");
    if (itemStockReq.userId) validIdCheck(itemStockReq.userId);
    if (itemStockReq.ccId) validIdCheck(itemStockReq.ccId);
    // validIdCheck(itemStockReq.itemId);

    const stocks = await getItemStocksByItemId(itemStockReq);

    logger.info("exiting::getItemStocks::service");
    return await Promise.all(stocks.map((stock) => toItemStockDTO(stock)));
  },

  async updateItemMaster(input: ItemMasterUpdateReq): Promise<ItemMasterDto> {
    logger.info("entering::updateItemMaster::service");
    if (!input.id) {
      throw new ErrorHandler(400, "Item Master ID is required");
    }
    const oldItem = await updateIdItemMasterServiceValidation(input);
    deleteOldItemImageFiles(oldItem);
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM);
    const updatedItemMaster = await updateItemMasterInDb(input);
    if (isCacheable) {
      await updateCache(cacheKey, input.id, updatedItemMaster);
    }

    logger.info("exiting::updateItemMaster::service");
    return toItemMasterDTO(updatedItemMaster);
  },

  async getAllItemMaster(canNullReturnable: boolean = false): Promise<ItemMasterDto[]> {
    logger.info("entering::getAllItemMaster::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM);
    let itemMaster: Item[];
    if (isCacheable) {
      itemMaster = (await getAllCache(cacheKey)) as Item[];
    } else {
      itemMaster = await getAllItemMasterFromDb();
    }
    if (itemMaster.length === 0) {
      if (!canNullReturnable) throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item Master"));
      else return [];
    }
    logger.info("exiting::getAllItemMaster::service");
    return Promise.all(itemMaster.map((item) => toItemMasterDTO(item)));
  },

  async getAllItemMasterWoDto(): Promise<Item[]> {
    logger.info("entering::getAllItemMasterWoDto::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM);
    let itemMaster: Item[];
    if (isCacheable) {
      itemMaster = (await getAllCache(cacheKey)) as Item[];
    } else {
      itemMaster = await getAllItemMasterFromDb();
    }
    if (itemMaster.length === 0) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item Master"));
    }
    logger.info("exiting::getAllItemMasterWoDto::service");
    return itemMaster;
  },

  async getItemMasterById(input: GetItemReq, canNullReturnable: boolean = false): Promise<ItemMasterDto | null> {
    logger.info("entering::getItemMasterById::service");
    const { itemId, ccId, supplierId } = input;
    validIdCheck(itemId);
    if (supplierId) validIdCheck(supplierId);
    if (ccId) validIdCheck(ccId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM);
    let itemMaster: Item | null;
    if (isCacheable) {
      itemMaster = (await getCacheById(cacheKey, itemId)) as Item | null;
    } else {
      itemMaster = await getItemMasterByIdFromDb(itemId);
    }
    if (!itemMaster) {
      if (!canNullReturnable) throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item Master"));
      else return null;
    }

    logger.info("exiting::getItemMasterById::service");
    return toItemMasterDTOForItemSupplierMap(itemMaster, input);
  },
  async getItemMasterByIdWoDto(itemId: number, canNullReturnable: boolean = false): Promise<Item | null> {
    logger.info("entering::getItemMasterById::service");
    validIdCheck(itemId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM);
    let itemMaster: Item | null;
    if (isCacheable) {
      itemMaster = (await getCacheById(cacheKey, itemId)) as Item | null;
    } else {
      itemMaster = await getItemMasterByIdFromDb(itemId);
    }
    if (!itemMaster) {
      if (!canNullReturnable) throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item Master"));
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
      filteredItems = filteredItems.filter((item) => item.unitId === input.unitId);
    }

    if (input.itemCategoryId) {
      filteredItems = filteredItems.filter((item) => item.itemCategoryId === input.itemCategoryId);
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

  async getItemSupplierPricesForSupplier(input: getItems): Promise<ItemMasterDtoStock[]> {
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

    ws.properties.defaultRowHeight = 18;

    // 2. Define the columns with headers, keys, and widths.
    // The 'key' is crucial for mapping data from objects.
    ws.columns = [
      { header: "Item Name", key: "item", width: 30 },
      { header: "Item Code", key: "itemCode", width: 30 },
      { header: "Item Description", key: "itemDescription", width: 40 },
      { header: "Item Category ID", key: "itemCategoryId", width: 15 },
      { header: "Storage ID", key: "storageId", width: 15 },
      { header: "Unit ID", key: "unitId", width: 15 },
      { header: "Base Price", key: "basePrice", width: 15 },
      { header: "Re-order Level", key: "reOrderLevel", width: 15 },
      { header: "Tax Details ID", key: "taxDetailsId", width: 15 },
      { header: "Is Batch Number", key: "isBatchNumber", width: 15 },
      { header: "Is Expire Date", key: "isExpireDate", width: 15 },
      { header: "Is Returnable", key: "isReturnable", width: 15 },
      { header: "Is Lock", key: "isLock", width: 10 },
      { header: "Is Active", key: "isActive", width: 10 },
      { header: "Front Image", key: "frontImage", width: 30 },
      { header: "Back Image", key: "backImage", width: 30 },
      { header: "Left Side Image", key: "leftSideImage", width: 30 },
      { header: "Right Side Image", key: "rightSideImage", width: 30 },
    ];

    // 3. Style the header row
    const headerRow = ws.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { name: "Calibri", bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4F81BD" }, // A nice shade of blue
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
    headerRow.height = 20;

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
