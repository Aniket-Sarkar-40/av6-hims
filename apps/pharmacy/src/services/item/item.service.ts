import { mapRowToItemExcelCreateInput } from "@/mapper/batch/itemExcel.mapper.js";
import {
  toItemAppointmentDto,
  toItemDto,
  toItemSearch,
  toItemSearchDTO,
  toItemStockDTO,
  toItemWoDto,
  toSlowMovingItemDTO,
} from "@/mapper/item/item.mapper.js";
import { deleteFileIfExists } from "@repo/platform/middlewares/imageUpload.middleware.js";
import {
  createItemExcelInDb,
  processBatchJob,
} from "@/repository/batch/batch.repository.js";
import {
  activateItemInDb,
  createItem,
  deleteItemFromDB,
  getAllImagesByItem,
  getItemByCategoryIdFromDb,
  getItemByFilterFromDb,
  getItemByIdFromDb,
  getItemFromDb,
  getItemsByIdsFromDb,
  getItemStocksByItemId,
  getSlowMovingItemFromDb,
  updateItemInDb,
} from "@/repository/item/item.repository.js";
import { getItemBranchMapByItemAndBranchIdFromDb } from "@/repository/item/itemBranchMap.repository.js";
import { ItemExcelRow } from "@/types/batch/batch.js";
import {
  CreateItemInput,
  CreateItemSearch,
  GetItemReq,
  GetItemStockRequest,
  ItemAppointmentDTO,
  ItemDTO,
  ItemExcelImportReq,
  ItemFilter,
  ItemForSearch,
  ItemSearchDTO,
  ItemSellPricingReq,
  UpdateItemInput,
} from "@/types/item/item.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  deleteCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/pharmacy.shortCode.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { validateItemExcelArray } from "@/validations/request/item/item.validation.js";
import {
  createItemServiceValidation,
  // createItemServiceValidation,
  updateIdItemServiceValidation,
} from "@/validations/service/item/item.service.validation.js";
import {
  ItemImages,
  Manufacture,
  MedCategory,
  MedicineUnit,
  PmsItem,
} from "@repo/db/generated/prisma/client";
import ExcelJs from "exceljs";
import XLSX from "xlsx";
import { branchService } from "../master/branch.service.js";
import { DecimalToNumber } from "@repo/platform/types/common.js";
import { toNumberDeep } from "@/utils/commonCalculation.utils.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";

const cacheKey = getRedisKey("ITEM", "all");
// export const cacheKeyForItemSearch = getRedisKey("ITEM", "search");
export const cacheKeyForItemSearch = getRedisKey("ITEM", "all");

export const itemService = {
  async createItem(input: CreateItemInput): Promise<ItemDTO> {
    logger.info("entering::createItem::service");
    await createItemServiceValidation(input);

    const item = await createItem(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM);
    if (isCacheable && item) {
      await addToCache(cacheKey, item.id, item);
    }

    const itemDTO = await toItemDto(item);

    const itemForSearch: ItemForSearch = toItemSearch(item);
    await addToCache(cacheKeyForItemSearch, itemForSearch.id, itemForSearch);
    logger.info("exiting::createItem::service");
    return itemDTO;
  },

  async getAllItem(): Promise<ItemDTO[]> {
    logger.info("entering::getAllItem::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM);

    if (isCacheable) {
      const cachedItems = (await getAllCache(cacheKey)) as PmsItem[] | null;
      if (cachedItems && cachedItems.length > 0) {
        return Promise.all(
          cachedItems.map((item) => toItemDto({ ...item, itemImages: [] }))
        );
      }
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item"));
    }

    const items = await getItemFromDb();
    if (!items.length) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item"));
    }
    logger.info("exiting::getAllItem::service");
    return Promise.all(
      items.map((item) => toItemDto({ ...item, itemImages: [] }))
    );
  },

  async getAllItemWoDto(
    categoryId?: number
  ): Promise<DecimalToNumber<PmsItem>[]> {
    logger.info("entering::getAllItem::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM);

    if (isCacheable) {
      const cachedItems = (await getAllCache(cacheKey)) as PmsItem[] | null;
      if (cachedItems && cachedItems.length > 0) {
        if (categoryId) {
          const filteredCachedItems = cachedItems.filter(
            (item) => item.medCategoryId == categoryId
          );
          if (filteredCachedItems.length === 0) {
            throw new ErrorHandler(
              404,
              generateErrorMessage("NOT_FOUND", "Item")
            );
          }
          return filteredCachedItems.map((item) => toNumberDeep(item));
        }
        return cachedItems.map((item) => toNumberDeep(item));
      }
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item"));
    }

    const items = await getItemByCategoryIdFromDb(categoryId);
    if (!items.length) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item"));
    }
    logger.info("exiting::getAllItem::service");
    return items.map((item) => toNumberDeep(item));
  },

  async getItemById(
    itemReq: GetItemReq,
    canNullReturnable: boolean = false
  ): Promise<ItemDTO | null> {
    logger.info("entering::getItemById::service");
    validIdCheck(itemReq.id);
    if (
      itemReq.branchId &&
      itemReq.isCustomPricing === true &&
      itemReq.isItemBranchMap === true
    ) {
      const itemBranchPricing = await getItemBranchMapByItemAndBranchIdFromDb({
        branchId: itemReq.branchId,
        itemId: itemReq.id,
      });

      if (!itemBranchPricing) {
        const item = (await getCacheById(
          cacheKey,
          itemReq.id
        )) as PmsItem | null;
        const errorMessage = `Item branch mapping not found for ${
          item?.medicineName ?? "this item"
        }`;
        throw new ErrorHandler(404, errorMessage);
      }
    }
    if (itemReq.warehouseId) validIdCheck(itemReq.warehouseId);
    if (itemReq.branchId) validIdCheck(itemReq.branchId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM);
    let item: PmsItem | null;
    if (isCacheable) {
      item = (await getCacheById(cacheKey, itemReq.id)) as PmsItem | null;
    } else {
      item = await getItemByIdFromDb(itemReq.id);
    }
    if (!item) {
      if (!canNullReturnable)
        throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item"));
      else return null;
    }
    const images = await getAllImagesByItem(item.id);
    const itemDto = await toItemDto({ ...item, itemImages: images }, itemReq);
    logger.info("exiting::getItemById::service");
    return itemDto;
  },

  async updateItemService(input: UpdateItemInput): Promise<ItemDTO> {
    logger.info("entering::updateItemService::service");
    const oldItem = await updateIdItemServiceValidation(input);
    const oldImages = await getAllImagesByItem(Number(input.id));

    if (oldItem.barcode) {
      deleteFileIfExists(process.cwd() + oldItem.barcode);
    }
    oldImages.forEach((img) => deleteFileIfExists(process.cwd() + img.url));

    const updatedItem = await updateItemInDb(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM);
    if (isCacheable && updatedItem) {
      await updateCache(cacheKey, updatedItem.id, updatedItem);
    }

    const itemDTO = await toItemDto(updatedItem);

    const itemForSearch: ItemForSearch = toItemSearch(updatedItem);
    await updateCache(cacheKeyForItemSearch, itemForSearch.id, itemForSearch);

    return itemDTO;
  },

  async itemSearch(input: CreateItemSearch): Promise<ItemSearchDTO[]> {
    logger.info("entering::itemSearch::service");

    const store = requestStorage.getStore();
    const branchId = store?.ccId;
    let categoryIds: number[] = [];
    if (branchId) {
      const branch = await branchService.getBranchById(branchId, true);
      if (branch) {
        categoryIds = branch.categoryMapping?.map((cat) => cat.id) ?? [];
      }
    }

    const cachedItems = (await getAllCache(cacheKeyForItemSearch)) as
      | ItemForSearch[]
      | null;
    if (!cachedItems || cachedItems.length === 0) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item"));
    }
    let filteredItems = cachedItems.filter(
      (item) =>
        item.medicineName
          .toLowerCase()
          .includes(input.searchText.toLowerCase().trim()) ||
        item.hsnCode
          ?.toLowerCase()
          .includes(input.searchText.toLowerCase().trim()) ||
        item.itemAlias
          ?.toLowerCase()
          .includes(input.searchText.toLowerCase().trim()) ||
        item.itemNumber
          ?.toLowerCase()
          .includes(input.searchText.toLowerCase().trim())
    );

    if (input.medCompId) {
      filteredItems = filteredItems.filter(
        (item) => item.medCompId === input.medCompId
      );
    }

    if (input.drugType) {
      filteredItems = filteredItems.filter(
        (item) => item.drugType === input.drugType
      );
    }

    if (input.medManufacturer) {
      filteredItems = filteredItems.filter(
        (item) => item.medManufacturer === input.medManufacturer
      );
    }

    if (input.medTypeId) {
      filteredItems = filteredItems.filter(
        (item) => item.medTypeId === input.medTypeId
      );
    }

    if (input.medUnitId) {
      filteredItems = filteredItems.filter(
        (item) => item.medUnitId === input.medUnitId
      );
    }

    if (input.medCategoryId) {
      filteredItems = filteredItems.filter(
        (item) => item.medCategoryId === input.medCategoryId
      );
    }
    if (categoryIds.length > 0) {
      // categoryIds.map((catId) => {
      //   filteredItems = filteredItems.filter((item) => item.medCategoryId === catId);
      // });

      filteredItems = filteredItems.filter(
        (selectedItem) =>
          !selectedItem.medCategoryId ||
          categoryIds.includes(selectedItem.medCategoryId)
      );
    }

    if (input.packSize) {
      filteredItems = filteredItems.filter(
        (item) => item.packSize === input.packSize
      );
    }

    if (input.status) {
      filteredItems = filteredItems.filter(
        (item) => item.status === input.status
      );
    }

    const categories = (await getAllCache(
      getRedisKey("MED_CATEGORY", "all")
    )) as MedCategory[] | null;
    const manufacturer = (await getAllCache(
      getRedisKey("MANUFACTURE", "all")
    )) as Manufacture[] | null;
    const units = (await getAllCache(getRedisKey("MEDICINE_UNIT", "all"))) as
      | MedicineUnit[]
      | null;

    logger.info("exiting::itemSearch::service");
    return Promise.all(
      filteredItems.map((item) =>
        toItemSearchDTO({
          item,
          categories,
          manufacturer,
          units,
        })
      )
    );
  },

  async deleteItemService(id: number): Promise<void> {
    logger.info("entering::deleteItemService::service");
    // const oldItem = await validateIdItem(id);
    // const oldImages = await getAllImagesByItem(id);

    // if (oldItem.barcode) {
    //   deleteFileIfExists(process.cwd() + oldItem.barcode);
    // }
    // oldImages.forEach((img) => deleteFileIfExists(process.cwd() + img.url));

    await deleteItemFromDB(id);

    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM);
    if (isCacheable) {
      await deleteCache(cacheKey, id);
    }
    await deleteCache(cacheKeyForItemSearch, id);

    logger.info("exiting::deleteItemService::service");
  },

  async getItemByIdWoDTO(
    itemId: number,
    canNullReturnable: boolean = false,
    branchId?: number
  ): Promise<DecimalToNumber<PmsItem> | null> {
    logger.info("entering::getItemByIdWoDTO::service");
    validIdCheck(itemId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM);
    let item: DecimalToNumber<PmsItem> | null;
    if (isCacheable) {
      item = (await getCacheById(
        cacheKey,
        itemId
      )) as DecimalToNumber<PmsItem> | null;
    } else {
      item = toNumberDeep(
        await getItemByIdFromDb(itemId)
      ) as DecimalToNumber<PmsItem>;
    }
    if (!item) {
      if (!canNullReturnable)
        throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item"));
      else return null;
    }

    const itemDto = await toItemWoDto(item, branchId);

    logger.info("exiting::getItemByIdWoDTO::service");
    return itemDto;
  },

  async getItemStocks(itemStockReq: GetItemStockRequest) {
    logger.info("entering::getItemStocks::service");
    if (itemStockReq.id) validIdCheck(itemStockReq.id);
    if (itemStockReq.warehouseId) validIdCheck(itemStockReq.warehouseId);
    if (itemStockReq.branchId) validIdCheck(itemStockReq.branchId);

    const stocks = await getItemStocksByItemId(itemStockReq);

    logger.info("exiting::getItemStocks::service");
    return await Promise.all(stocks.map((stock) => toItemStockDTO(stock)));
  },

  async getSlowMovingItem() {
    logger.info("entering::getSlowMovingItem::service");
    const items = await getSlowMovingItemFromDb();
    logger.info("exiting::getSlowMovingItem::service");
    return Promise.all(items.map((item) => toSlowMovingItemDTO(item)));
  },

  async itemExcelImport(input: ItemExcelImportReq) {
    logger.info("entering::itemExcelImport::service");

    if (!input.path) {
      throw new Error("No file path provided for Excel import");
    }

    const workbook = XLSX.readFile(input.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet) as ItemExcelRow[];

    const convertedData = data.map((elem, ind) =>
      mapRowToItemExcelCreateInput(elem, ind + 1)
    );

    // Final check which can result from bad parsing
    const { value } = validateItemExcelArray(convertedData);

    const batch = await createItemExcelInDb(value);

    processBatchJob(batch.id, input.type, input.ccId)
      .then(() => logger.info("Batch Processing Completed."))
      .catch((e) => logger.error(JSON.stringify(e)));

    logger.info("exiting::itemExcelImport::service");
    return batch;
  },

  async itemExcelSampleExport() {
    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Item");

    ws.properties.defaultRowHeight = 18;

    // 2. Define the columns with headers, keys, and widths.
    // The 'key' is crucial for mapping data from objects.
    ws.columns = [
      { header: "Item Number", key: "itemNumber", width: 30 },
      { header: "Medicine Name", key: "medicineName", width: 30 },
      { header: "Medicine Category", key: "medCategory", width: 20 },
      { header: "Medicine Type", key: "medType", width: 15 },
      { header: "Medicine Composition", key: "medComp", width: 30 },
      { header: "Box Size", key: "boxSize", width: 10 },
      { header: "Medicine Unit", key: "medUnit", width: 10 },
      { header: "Manufacturer", key: "manufacturer", width: 20 },
      { header: "Min Order Details", key: "minOrderDetails", width: 20 },
      { header: "Rack Location", key: "rackLocation", width: 15 },
      { header: "Default Disc", key: "defaultDiscount", width: 15 },
      { header: "Default B2B Disc", key: "defaultB2BDiscount", width: 20 },
      { header: "Is Lock Disc", key: "isLockDiscount", width: 15 },
      { header: "Is Lock B2B Disc", key: "isLockB2BDiscount", width: 18 },
      { header: "Min Stock", key: "minStock", width: 12 },
      { header: "Max Stock", key: "maxStock", width: 12 },
      { header: "Tax", key: "tax", width: 10 },
      { header: "Tax Method", key: "taxMethod", width: 15 },
      { header: "Pack Size", key: "packSize", width: 15 },
      { header: "Drug Type", key: "drugType", width: 15 },
      { header: "Is Allow Loose Sale", key: "isAllowLooseSale", width: 20 },
      { header: "Accept Online Order", key: "acceptOnlineOrder", width: 20 },
      { header: "Is Returnable", key: "isReturnable", width: 15 },
      { header: "Purchase Amount", key: "purchaseAmount", width: 18 },
      { header: "Sale Amount", key: "saleAmount", width: 15 },
      { header: "Medicine Pack Type", key: "medPackingType", width: 20 },
      { header: "Insurance Percentage", key: "insurancePercentage", width: 22 },
      { header: "Walk In Percentage", key: "walkInPercentage", width: 20 },
      { header: "HSN Code", key: "hsnCode", width: 15 },
      { header: "Barcode", key: "barcode", width: 20 },
      { header: "Tags", key: "tags", width: 25 },
      { header: "Remark", key: "remark", width: 30 },
      { header: "Batch", key: "batchNo", width: 30 },
      { header: "Expiry", key: "expiryDate", width: 30 },
      { header: "Quantity", key: "quantity", width: 30 },
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

    ws.addRow({
      itemNumber: "MED-0001",
      medicineName: "Paracetamol 500mg",
      medCategory: "Medicine",
      medType: "Tablet",
      medComp: "NA",
      boxSize: "10",
      medUnit: "PIECE",
      manufacturer: "Cipla Ltd",
      minOrderDetails: "1 Box",
      rackLocation: "R1-A1",
      defaultDiscount: 0,
      defaultB2BDiscount: 0,
      isLockDiscount: false,
      isLockB2BDiscount: false,
      minStock: 10,
      maxStock: 5000000,
      tax: 0,
      taxMethod: "EXCLUSIVE",
      packSize: "1",
      drugType: "Generic",
      isAllowLooseSale: true,
      acceptOnlineOrder: true,
      isReturnable: true,
      purchaseAmount: 15.0,
      saleAmount: 25.0,
      medPackingType: "Strip",
      insurancePercentage: 80,
      walkInPercentage: 90,
      hsnCode: "30045010",
      barcode: "8901234567890",
      tags: "Pain Relief, Fever",
      remark: "Keep in cool and dry place",
      batchNo: "BATCH001",
      expiryDate: "2026-12-31",
      quantity: 100,
    });

    ws.getColumn("barcode").numFmt = "@";

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

  async getItemsByIdsForAppointment(
    itemIds: number[]
  ): Promise<ItemAppointmentDTO[]> {
    logger.info("entering::getItemsByIdsForAppointment::service");

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      throw new ErrorHandler(400, "Item IDs are required");
    }

    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM);

    if (isCacheable) {
      const cachedItems = (await getAllCache(cacheKey)) as PmsItem[] | null;

      if (cachedItems && cachedItems.length > 0) {
        const filteredItems = cachedItems.filter((item) =>
          itemIds.includes(item.id)
        );

        if (filteredItems.length === 0) {
          throw new ErrorHandler(
            404,
            generateErrorMessage("NOT_FOUND", "Items")
          );
        }

        return Promise.all(
          filteredItems.map((item) => toItemAppointmentDto(item))
        );
      }

      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Items"));
    }

    logger.info("exiting::getItemsByIdsForAppointment::service");
    return [];
  },

  async activeItemService(id: number): Promise<void> {
    logger.info("entering::deleteItemService::service");

    const activeItem = await activateItemInDb(id);

    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM);
    if (isCacheable) {
      await addToCache(cacheKey, id, activeItem);
    }
    await addToCache(cacheKeyForItemSearch, id, activeItem);

    logger.info("exiting::deleteItemService::service");
  },

  async buildItemReportWorkbook(filter: ItemFilter): Promise<ExcelJs.Workbook> {
    logger.info("entering::buildItemReportWorkbook::service");

    const rawLists = await getItemByFilterFromDb(filter);
    if (!rawLists || rawLists.length === 0) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item"));
    }

    const list: ItemDTO[] = await Promise.all(
      rawLists.map(async (rawList) => toItemDto(rawList))
    );

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Item Report");
    ws.properties.defaultRowHeight = 18;

    // ────── Header ──────
    const headers = [
      "Item Number",
      "Min Order Details",
      "Rack Location",
      "Default Discount",
      "Default B2B Discount",
      "Min Stock",
      "Max Stock",
      "Tax",
      "Tax Method",
      "Remark",
      "On Hold Sale",
      "Med Packing Type",
      "Is Lock B2B Discount",
      "Is Returnable",
      "Is Suggestion Lock",
      "Accept Online Order",
      "Cess",
      "HSN Code",
      "Tags",
      "Insurance Percentage",
      "Walk In Percentage",
      "Manufacturer Name",
      "Item Alias",
      "Medicine Name",
      "Medicine Category",
      "Medicine Type",
      "Pack Size",
      "Allow Loose Sale",
      "Medicine Unit",
      "Purchase Amount",
      "Sale Amount",
      "Status",
    ];
    const headerRow = ws.addRow(headers);
    headerRow.height = 18;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    // ────── Data Rows ──────
    for (const dto of list) {
      const row = ws.addRow([
        dto.itemNumber,
        dto.minOrderDetails,
        dto.rackLocation,
        dto.defaultDiscount,
        dto.defaultB2BDiscount,
        dto.minStock,
        dto.maxStock,
        dto.tax,
        dto.taxMethod,
        dto.remark,
        dto.onHoldSale,
        dto.medPackingType,
        dto.isLockB2BDiscount,
        dto.isReturnable,
        dto.isSuggestionLock,
        dto.acceptOnlineOrder,
        dto.cess,
        dto.hsnCode,
        dto.tags,
        dto.insurancePercentage,
        dto.walkInPercentage,
        dto.medManufacturer?.name,
        dto.itemAlias,
        dto.medicineName ?? "",
        dto.medCategory?.name ?? "",
        dto.medType?.name ?? "",
        dto.packSize?.name,
        dto.isAllowLooseSale,
        dto.medUnit?.name,
        dto.purchaseAmount,
        dto.saleAmount,
        dto.status,
      ]);

      row.eachCell((cell) => {
        cell.alignment = { vertical: "middle", horizontal: "left" };
      });
    }

    // ────── Auto‐fit Columns ──────
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

    logger.info("exiting::buildItemReportWorkbook::service");
    return wb;
  },

  async getItemSellPricing(input: ItemSellPricingReq): Promise<ItemDTO[]> {
    logger.info("entering::getItemSellPricing::service");

    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM);
    let items: (PmsItem & { itemImages: ItemImages[] })[] = [];

    if (isCacheable) {
      const cachedItems = (await getAllCache(cacheKey)) as PmsItem[] | null;
      if (cachedItems && cachedItems.length > 0) {
        items = cachedItems
          .filter((item) => input.items.includes(item.id))
          .map((item) => ({ ...item, itemImages: [] }));
      }
    } else {
      items = await getItemsByIdsFromDb(input.items);
    }

    if (items.length === 0) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Items"));
    }

    const itemDto = await Promise.all(
      items.map(async (item) =>
        toItemDto(item, {
          id: item.id,
          isZeroQty: false,
          isCustomPricing: true,
          branchId: input.branchId,
          insuranceId: input.insurerId,
          corporateClientId: input.corporateClientId,
        })
      )
    );

    logger.info("exiting::getItemSellPricing::service");
    return itemDto;
  },
};
