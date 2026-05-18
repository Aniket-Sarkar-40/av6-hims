import { InvItem, Prisma } from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel, IdValue } from "@repo/shared/types/global.js";
import { DecimalToNumber } from "@repo/shared/utils/helper.utils.js";
import { FormData } from "@repo/shared/utils/types.utils.js";

export type ItemMasterReq = Omit<Prisma.InvItemUncheckedCreateInput, "id">;

export type ItemMasterUpdateReq = Prisma.InvItemUncheckedCreateInput;

export type ItemMasterEntity = FormData<ItemMasterReq>;

export type ItemMasterUpdateEntity = FormData<ItemMasterUpdateReq>;

export interface ItemImageFiles {
  frontImage?: Express.Multer.File[];
  backImage?: Express.Multer.File[];
  leftSideImage?: Express.Multer.File[];
  rightSideImage?: Express.Multer.File[];
}

export interface ItemMasterDto
  extends Omit<
    DecimalToNumber<InvItem>,
    | "itemCategoryId"
    | "unitId"
    | "taxDetailsId"
    | "storageId"
    | BaseModelAttrWoCancel
  > {
  itemCategory: IdValue | null;
  unitMaster: IdValue | null;
  taxDetails: IdValue | null;
  storage: IdValue | null;
}

export interface ItemMasterDtoStock extends DecimalToNumber<ItemMasterDto> {
  branchInHandStock: number | null;
  warehouseInHandStock: number | null;
  userInHandStock: number | null;
}

export interface ItemSearchDTO {
  id: number;
  itemNumber: string | null;
  itemName: string;
  basePrice: number;
  itemCategory: IdValue | null;
  unitMaster: IdValue | null;
}

export interface CreateItemSearch {
  searchText: string;
  unitId?: number;
  itemCategoryId?: number;
}

export interface ItemForSearch {
  id: number;
  item: string | null;
  itemCode: string;

  itemCategoryId: number | null;
  unitId: number | null;
  basePrice: number;
}

export interface ItemSearchInput {
  item: ItemForSearch;
  categories: number | null;
  units: number | null;
}
export type ItemDto = Omit<
  Prisma.InvItemUncheckedCreateInput,
  | "taxDetailsId"
  | "itemStoreId"
  | "itemSupplierId"
  | "itemCategoryId"
  | "unitId"
>;

export interface ItemMasterCommonDto extends ItemDto {
  itemCategory: IdValue | null;
  unitMaster: IdValue | null;
}

export interface GetItemReq {
  itemId: number;
  supplierId?: number;
  ccId?: number;
  userId?: number;
}
export interface GetItemReqStock {
  id: number;
  ccId?: number;
  userId?: number;
  isZeroQty: boolean;
}

export interface GetItemStockReq {
  id: number;
  ccId?: number;
  userId?: number;
  isZeroQty: boolean;
  isCustomPricing: boolean;
}

export interface GetItemStockRequest {
  id: number;
  userId?: number;
  ccId?: number;
  isZeroQty: boolean;
}
export interface getItems {
  itemIds: number[];
  supplierId: number;
  ccId?: number;
}
