import {
  getItemStockQtyByCc,
  getItemStockQtyByUser,
} from "@/repository/stock/stock.repository.js";
import { commonService } from "@/services/common.service.js";
import { itemSupplierMapService } from "@/services/itemSupplierMap/itemSupplierMap.service.js";
import { itemCategoryService } from "@/services/master/itemCategory.service.js";
import { itemMasterService } from "@/services/master/itemMaster.service.js";
import { storageService } from "@/services/master/storage.service.js";
import { taxDetailsService } from "@/services/master/taxDetails.service.js";
import { unitMasterService } from "@/services/master/unitMaster.service.js";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";
import { ItemMasterToDto } from "@/types/grn/grn.js";
import {
  GetItemReq,
  ItemImageFiles,
  ItemMasterDto,
  ItemMasterDtoStock,
  ItemMasterEntity,
  ItemMasterReq,
  ItemMasterUpdateEntity,
  ItemMasterUpdateReq,
  ItemSearchDTO,
  ItemSearchInput,
} from "@/types/master/itemMaster.js";
import { ItemStockDTO } from "@/types/stock/stock.js";
import { getBranchAndWarehouseByCcIds } from "@/utils/getCollectionCenter.utils.js";
import { customOmit, toIdValue } from "av6-utils";
import { InvItem, InvItemStock } from "@repo/db/generated/prisma/client";
import { toPickFields } from "av6-utils";
import {
  toPublicImageUrl,
  toRelativeImagePath,
} from "@repo/shared/utils/helper.utils.js";
import { settingsService } from "@/services/master/settings.service.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";

export const toItemMasterDTO = async (
  data: InvItem[]
): Promise<ItemMasterDto[]> => {
  const itemCategories = await commonService.getAllElements<"InvItemCategory">({
    cacheCode: "ITEM_CATEGORY",
    canNullReturnable: true,
    modelName: "InvItemCategory",
    shortCode: "ITEM_CATEGORY",
    useActiveFlag: true,
  });

  const unitMasters = await commonService.getAllElements<"InvUnitMaster">({
    cacheCode: "UNIT_MASTER",
    canNullReturnable: true,
    modelName: "InvUnitMaster",
    shortCode: "UNIT_MASTER",
    useActiveFlag: true,
  });

  const taxDetails = await commonService.getAllElements<"TaxDetails">({
    cacheCode: "TAX_DETAILS",
    canNullReturnable: true,
    modelName: "TaxDetails",
    shortCode: "TAX_DETAILS",
    useActiveFlag: true,
  });

  const storages = await commonService.getAllElements<"InvStorage">({
    cacheCode: "STORAGE",
    canNullReturnable: true,
    modelName: "InvStorage",
    shortCode: "STORAGE",
    useActiveFlag: true,
  });

  return data.map((itemMaster) => {
    const omittedItem = customOmit<
      InvItem,
      | BaseModelAttrWoCancel
      | "itemCategoryId"
      | "unitId"
      | "taxDetailsId"
      | "storageId"
      | "basePrice"
      | "lastPurchasedPrice"
    >(itemMaster, [
      "createdBy",
      "updatedBy",
      "deletedBy",
      "createdAt",
      "updatedAt",
      "deletedAt",
      "itemCategoryId",
      "unitId",
      "taxDetailsId",
      "storageId",
      "basePrice",
      "lastPurchasedPrice",
    ]);

    const itemCategory =
      itemCategories.find((ic) => ic.id === itemMaster.itemCategoryId) ?? null;
    const unitMaster =
      unitMasters.find((um) => um.id === itemMaster.unitId) ?? null;
    const taxDetail =
      taxDetails.find((td) => td.id === itemMaster.taxDetailsId) ?? null;
    const storage = storages.find((s) => s.id === itemMaster.storageId) ?? null;
    return {
      ...omittedItem.rest,
      basePrice: itemMaster.basePrice ? Number(itemMaster.basePrice) : null,
      lastPurchasedPrice: itemMaster.lastPurchasedPrice
        ? Number(itemMaster.lastPurchasedPrice)
        : null,
      frontImage: itemMaster.frontImage
        ? toPublicImageUrl(itemMaster.frontImage)
        : null,
      backImage: itemMaster.backImage
        ? toPublicImageUrl(itemMaster.backImage)
        : null,
      leftSideImage: itemMaster.leftSideImage
        ? toPublicImageUrl(itemMaster.leftSideImage)
        : null,
      rightSideImage: itemMaster.rightSideImage
        ? toPublicImageUrl(itemMaster.rightSideImage)
        : null,
      itemCategory: toIdValue(itemCategory, "name"),
      unitMaster: toIdValue(unitMaster, "packagingTypeName"),
      taxDetails: toIdValue(taxDetail, "name"),
      storage: toIdValue(storage, "name"),
    };
  });
};

export const toItemMasterDTOForItemSupplierMap = async (
  model: InvItem,
  itemReq?: GetItemReq
): Promise<ItemMasterDtoStock> => {
  const itemCategoryRow = await itemCategoryService.getItemCategoryById(
    model.itemCategoryId,
    true
  );
  const unitMasterRow = await unitMasterService.getUnitMasterById(
    model.unitId,
    true
  );
  const taxDetailsRow = model.taxDetailsId
    ? await taxDetailsService.getTaxDetailsById(model.taxDetailsId, true)
    : null;
  const storage = model.storageId
    ? await storageService.getStorageById(model.storageId, true)
    : null;

  const settings = await settingsService.getSettings(true);
  const wareMode = settings?.warehouseMode;
  const supplierMode = settings?.supplierMode;

  let finalBasePrice: number | null = model.basePrice
    ? Number(model.basePrice)
    : null;

  if (itemReq?.ccId && itemReq.supplierId && supplierMode) {
    const itemSupplierMap = await itemSupplierMapService.getItemSupplierMap(
      itemReq
    );

    if (
      itemSupplierMap?.purchasePrice !== null &&
      itemSupplierMap?.purchasePrice !== undefined
    ) {
      finalBasePrice = Number(itemSupplierMap.purchasePrice);
    }
  }

  let warehouseStock: number | null = null;
  let branchStock: number | null = null;

  if (itemReq?.ccId) {
    const ccId = itemReq.ccId;
    const ccMap = await getBranchAndWarehouseByCcIds(ccId);
    const ccInfo = ccMap[ccId];

    const stockResult = await getItemStockQtyByCc(model.id, ccId);
    const ccTotal = stockResult.totalQty;

    if (ccInfo?.branch) {
      branchStock = ccTotal;
    } else if (ccInfo?.warehouse && wareMode) {
      warehouseStock = ccTotal;
    }
  }

  let userStock: number | null = null;

  if (itemReq?.userId) {
    userStock = await getItemStockQtyByUser(model.id, itemReq.userId);
  }

  return {
    ...model,
    basePrice: finalBasePrice,
    lastPurchasedPrice: model.lastPurchasedPrice
      ? Number(model.lastPurchasedPrice)
      : null,
    frontImage: model.frontImage ? toPublicImageUrl(model.frontImage) : null,
    backImage: model.backImage ? toPublicImageUrl(model.backImage) : null,
    leftSideImage: model.leftSideImage
      ? toPublicImageUrl(model.leftSideImage)
      : null,
    rightSideImage: model.rightSideImage
      ? toPublicImageUrl(model.rightSideImage)
      : null,
    itemCategory: toIdValue(itemCategoryRow, "name"),
    unitMaster: toIdValue(unitMasterRow, "packagingTypeName"),
    taxDetails: toIdValue(taxDetailsRow, "name"),
    storage: toIdValue(storage, "name"),
    branchInHandStock: branchStock,
    warehouseInHandStock: warehouseStock,
    userInHandStock: userStock,
  };
};

export const toItemSearchDTO = async (
  input: ItemSearchInput
): Promise<ItemSearchDTO> => {
  const item = input.item;

  const unit = input.units
    ? await unitMasterService.getUnitMasterById(input.units, true)
    : null;

  const category = input.categories
    ? await itemCategoryService.getItemCategoryById(input.categories, true)
    : null;

  return {
    id: item.id,
    itemNumber: item.itemCode,
    itemName: item.item ?? "",
    basePrice: item.basePrice,

    itemCategory: category
      ? {
          id: category.id,
          value: category.name,
        }
      : null,

    unitMaster: unit
      ? {
          id: unit.id,
          value: unit.packagingSize,
        }
      : null,
  };
};

export const toItemStockDTO = async (
  stock: InvItemStock
): Promise<ItemStockDTO> => {
  const item = await itemMasterService.getItemMasterById(
    { itemId: stock.itemId },
    true
  );
  const user = stock.userId
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(stock.userId, true)
    : null;

  return {
    ...stock,
    item: item ? await itemMasterToDto(item) : null,
    user: toIdValue(user, "name"),
  };
};

export const toItemEntity = (
  item: ItemMasterEntity,
  itemImage: ItemImageFiles
): ItemMasterReq => {
  return {
    item: item.item,
    itemCode: item.itemCode ?? undefined,
    itemCategoryId: Number(item.itemCategoryId),
    storageId: item.storageId ? Number(item.storageId) : undefined,
    unitId: Number(item.unitId),
    basePrice: item.basePrice ? Number(item.basePrice) : undefined,
    reOrderLevel: item.reOrderLevel ? Number(item.reOrderLevel) : undefined,
    taxDetailsId: item.taxDetailsId ? Number(item.taxDetailsId) : undefined,
    itemDescription: item.itemDescription,
    isBatchNumber:
      item.isBatchNumber !== undefined && item.isBatchNumber === "true"
        ? true
        : false,
    isExpireDate:
      item.isExpireDate !== undefined && item.isExpireDate === "true"
        ? true
        : false,
    isReturnable:
      item.isReturnable !== undefined && item.isReturnable === "true"
        ? true
        : false,
    isLock: item.isLock !== undefined && item.isLock === "true" ? true : false,
    frontImage: itemImage?.frontImage?.[0].path
      ? toRelativeImagePath(itemImage.frontImage[0].path)
      : undefined,
    backImage: itemImage?.backImage?.[0].path
      ? toRelativeImagePath(itemImage.backImage[0].path)
      : undefined,
    leftSideImage: itemImage?.leftSideImage?.[0].path
      ? toRelativeImagePath(itemImage.leftSideImage[0].path)
      : undefined,
    rightSideImage: itemImage?.rightSideImage?.[0].path
      ? toRelativeImagePath(itemImage.rightSideImage[0].path)
      : undefined,
  };
};

export const toItemUpdateEntity = (
  item: ItemMasterUpdateEntity,
  itemImage: ItemImageFiles
): ItemMasterUpdateReq => {
  return {
    ...toItemEntity(item, itemImage),
  };
};

// export function toPickFields<T, const K extends readonly (keyof T)[]>(
//   row: T | null | undefined,
//   keys: K,
// ): { [P in K[number]]: T[P] } | null {
//   if (!row) return null;

//   const out = {} as { [P in K[number]]: T[P] };

//   for (const key of keys) {
//     out[key] = row[key];
//   }

//   return out;
// }

export async function itemMasterToDto(item: ItemMasterDto) {
  return toPickFields(
    item,
    "id",
    "item",
    "itemCode",
    "itemDescription",
    "reOrderLevel",
    "unitMaster",
    "itemCategory",
    "isBatchNumber",
    "isExpireDate",
    "isReturnable",
    "isLock"
  ) as ItemMasterToDto | null;
}
