import { coreRequests } from "@/client/core/request";
import { requestStorage } from "@/config/requestContext";
import { getItemStockQtyByCc, getItemStockQtyByUser } from "@/repository/stock/stock.repository";
import { itemSupplierMapService } from "@/services/itemSupplierMap/itemSupplierMap.service";
import { itemCategoryService } from "@/services/master/itemCategory.service";
import { itemMasterService } from "@/services/master/itemMaster.service";
import { storageService } from "@/services/master/storage.service";
import { taxDetailsService } from "@/services/master/taxDetails.service";
import { unitMasterService } from "@/services/master/unitMaster.service";
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
} from "@/types/master/itemMaster";
import { ItemStockDTO } from "@/types/stock/stock";
import { itemMasterToDto } from "@/utils/commonResponse.utils";
import { getBranchAndWarehouseByCcIds } from "@/utils/getCollectionCenter.utils";
import { toPublicImageUrl, toRelativeImagePath } from "@/utils/helper.utils";
import { toIdValue } from "@/utils/idValue.utils";
import { Item, ItemStock } from "@prisma/client";

export const toItemMasterDTO = async (model: Item): Promise<ItemMasterDto> => {
  const itemCategoryRow = await itemCategoryService.getItemCategoryById(model.itemCategoryId, true);
  const unitMasterRow = await unitMasterService.getUnitMasterById(model.unitId, true);
  const taxDetailsRow = model.taxDetailsId ? await taxDetailsService.getTaxDetailsById(model.taxDetailsId, true) : null;
  const storage = model.storageId ? await storageService.getStorageById(model.storageId, true) : null;

  return {
    ...model,
    frontImage: model.frontImage ? toPublicImageUrl(model.frontImage) : "",
    backImage: model.backImage ? toPublicImageUrl(model.backImage) : "",
    leftSideImage: model.leftSideImage ? toPublicImageUrl(model.leftSideImage) : "",
    rightSideImage: model.rightSideImage ? toPublicImageUrl(model.rightSideImage) : "",
    itemCategory: toIdValue(itemCategoryRow, "name"),
    unitMaster: toIdValue(unitMasterRow, "packagingTypeName"),
    taxDetails: toIdValue(taxDetailsRow, "name"),
    storage: toIdValue(storage, "name"),
  };
};

export const toItemMasterDTOForItemSupplierMap = async (
  model: Item,
  itemReq?: GetItemReq
): Promise<ItemMasterDtoStock> => {
  const itemCategoryRow = await itemCategoryService.getItemCategoryById(model.itemCategoryId, true);
  const unitMasterRow = await unitMasterService.getUnitMasterById(model.unitId, true);
  const taxDetailsRow = model.taxDetailsId ? await taxDetailsService.getTaxDetailsById(model.taxDetailsId, true) : null;
  const storage = model.storageId ? await storageService.getStorageById(model.storageId, true) : null;

  let finalBasePrice = model.basePrice;
  if (itemReq) {
    if (itemReq.ccId && itemReq.supplierId) {
      const itemSupplierMap = await itemSupplierMapService.getItemSupplierMap(itemReq);
      if (itemSupplierMap) {
        finalBasePrice = Number(itemSupplierMap.purchasePrice);
      }
    }
  }

  const store = requestStorage.getStore();
  const wareMode = store?.settings?.warehouseMode;

  let warehouseStock: number | null = null;
  let branchStock: number | null = null;
  let ccTotal: number | null = null;

  if (itemReq?.ccId) {
    const ccId = itemReq.ccId;
    const ccMap = await getBranchAndWarehouseByCcIds(ccId);
    const ccInfo = ccMap[ccId];

    const stockResult = await getItemStockQtyByCc(model.id, ccId);
    ccTotal = stockResult.totalQty;

    if (ccInfo?.branch) {
      branchStock = ccTotal;
    } else if (ccInfo?.warehouse && wareMode) {
      warehouseStock = ccTotal;
    }
  }

  let userStock: number | null = null;

  if (itemReq?.userId) {
    userStock = await getItemStockQtyByUser(model.id, itemReq?.userId);
  }

  return {
    ...model,
    frontImage: model.frontImage ? toPublicImageUrl(model.frontImage) : null,
    backImage: model.backImage ? toPublicImageUrl(model.backImage) : null,
    leftSideImage: model.leftSideImage ? toPublicImageUrl(model.leftSideImage) : null,
    rightSideImage: model.rightSideImage ? toPublicImageUrl(model.rightSideImage) : null,
    basePrice: finalBasePrice,
    itemCategory: toIdValue(itemCategoryRow, "name"),
    unitMaster: toIdValue(unitMasterRow, "packagingTypeName"),
    taxDetails: toIdValue(taxDetailsRow, "name"),
    storage: toIdValue(storage, "name"),
    branchInHandStock: branchStock,
    warehouseInHandStock: warehouseStock,
    userInHandStock: userStock,
  };
};

export const toItemSearchDTO = async (input: ItemSearchInput): Promise<ItemSearchDTO> => {
  const item = input.item;

  const unit = input.units ? await unitMasterService.getUnitMasterById(input.units, true) : null;

  const category = input.categories ? await itemCategoryService.getItemCategoryById(input.categories, true) : null;

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

export const toItemStockDTO = async (stock: ItemStock): Promise<ItemStockDTO> => {
  const item = await itemMasterService.getItemMasterById({ itemId: stock.itemId }, true);
  const user = stock.userId ? await coreRequests.getEmployeeCache(stock.userId) : null;

  return {
    ...stock,
    item: item ? await itemMasterToDto(item) : null,
    user: toIdValue(user, "name"),
  };
};

export const toItemEntity = (item: ItemMasterEntity, itemImage: ItemImageFiles): ItemMasterReq => {
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
    isBatchNumber: item.isBatchNumber !== undefined && item.isBatchNumber === "true" ? true : false,
    isExpireDate: item.isExpireDate !== undefined && item.isExpireDate === "true" ? true : false,
    isReturnable: item.isReturnable !== undefined && item.isReturnable === "true" ? true : false,
    isLock: item.isLock !== undefined && item.isLock === "true" ? true : false,
    frontImage: itemImage?.frontImage?.[0].path ? toRelativeImagePath(itemImage.frontImage[0].path) : undefined,
    backImage: itemImage?.backImage?.[0].path ? toRelativeImagePath(itemImage.backImage[0].path) : undefined,
    leftSideImage: itemImage?.leftSideImage?.[0].path
      ? toRelativeImagePath(itemImage.leftSideImage[0].path)
      : undefined,
    rightSideImage: itemImage?.rightSideImage?.[0].path
      ? toRelativeImagePath(itemImage.rightSideImage[0].path)
      : undefined,
  };
};

export const toItemUpdateEntity = (item: ItemMasterUpdateEntity, itemImage: ItemImageFiles): ItemMasterUpdateReq => {
  return {
    ...toItemEntity(item, itemImage),
  };
};
