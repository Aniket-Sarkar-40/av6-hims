import { DecimalToNumber } from "@repo/platform/types/common.js";
import {
  BoxSize,
  IMAGE_NAME,
  INCLUDE_EXCLUDE,
  Manufacture,
  MedCategory,
  MedDrug,
  MedicineCompo,
  MedicineUnit,
  MedPackage,
  MedType,
  PmsBranch,
  PmsItem,
  PmsItemStatus,
  PmsItemStock,
  PmsMedPackType,
  PmsWarehouse,
  TAX_METHOD,
} from "@repo/db/generated/prisma/client";

export interface CreateItemInput extends CommonItem {
  images?: Array<{ name: IMAGE_NAME; url: string; isPrimary?: boolean }>;
}
export interface UpdateItemInput extends CreateItemInput {
  id: string;
}
export interface UpdateItemReq extends CreateItemReq {
  id: string;
}

export interface ItemSearchInput {
  item: ItemForSearch;
  categories: MedCategory[] | null;
  units: MedicineUnit[] | null;
  manufacturer: Manufacture[] | null;
}

export interface CreateItemReq {
  itemNumber: string;
  frontImage?: string;
  backImage?: string;
  leftSideImage?: string;
  rightSideImage?: string;
  medicineName: string;
  medCategoryId: string;
  medTypeId: string;
  medManufacturerId: string;
  medCompId: string;
  medUnitId: string;
  packSizeId: string;
  drugTypeId: string;
  boxSizeId?: string | null;
  purchaseAmount: string;
  saleAmount: string;
  medPackingType: PmsMedPackType;
  defaultDiscount: string;
  defaultB2BDiscount: string;
  minStock: string;
  maxStock: string;
  tax: string;
  taxMethod: TAX_METHOD;
  // optional fields:
  minOrderDetails?: string;
  rackLocation?: string;
  isAllowLooseSale: string;
  status?: PmsItemStatus;
  remark?: string;
  onHoldSale?: Date;
  barcode?: string;
  isLockDiscount?: string;
  isLockB2BDiscount?: string;
  acceptOnlineOrder?: string;
  isReturnable?: string;
  isSuggestionLock?: string;
  cess?: number;
  hsnCode?: string;
  itemAlias?: string;
  tags?: string;
  insurancePercentage: string;
  walkInPercentage: string;
  storageId?: string | null;
}

export interface CommonItem {
  itemNumber: string;
  medicineName: string;
  medCategoryId: number;
  medTypeId: number;
  medCompId: number;
  medUnitId: number;
  medManufacturerId: number;
  boxSizeId: number | null;
  packSizeId: number;
  drugTypeId: number;
  purchaseAmount: number;
  saleAmount: number;
  medPackingType: PmsMedPackType;
  defaultDiscount: number;
  defaultB2BDiscount: number;
  minStock: number;
  maxStock: number;
  tax: number;
  taxMethod: TAX_METHOD;
  // optional fields:
  minOrderDetails?: string;
  rackLocation?: string;
  isAllowLooseSale?: boolean;
  status?: PmsItemStatus;
  remark?: string;
  onHoldSale?: Date;
  barcode?: string;
  isLockDiscount?: boolean;
  isLockB2BDiscount?: boolean;
  acceptOnlineOrder?: boolean;
  isReturnable?: boolean;
  isSuggestionLock?: boolean;
  cess?: number;
  hsnCode?: string;
  itemAlias?: string;
  tags?: string;
  insurancePercentage: number;
  walkInPercentage: number;
  storageId?: number | null;
}

export interface ItemDTO {
  id: number;
  itemNumber: string | null;
  medicineName: string;
  minOrderDetails: string | null;
  rackLocation: string | null;
  defaultDiscount: number;
  defaultB2BDiscount: number;
  minStock: number;
  maxStock: number;
  tax: number;
  isAllowLooseSale: boolean;
  taxMethod: string;
  status: PmsItemStatus;
  purchaseAmount: number;
  saleAmount: number;
  remark: string | null;
  onHoldSale: Date | null;
  medPackingType: PmsMedPackType;
  barcode: string | null;
  isLockDiscount: boolean;
  isLockB2BDiscount: boolean;
  acceptOnlineOrder: boolean;
  isReturnable: boolean;
  isSuggestionLock: boolean;
  cess: number | null;
  hsnCode: string | null;
  itemAlias: string | null;
  tags: string | null;
  insurancePercentage: number;
  walkInPercentage: number;

  branchInHandStock: number | null;
  warehouseInHandStock: number | null;

  insuredCoPay: number | null;
  insuredPatientPay: number | null;

  corporateClientPaymentMode: INCLUDE_EXCLUDE | null;

  // ——— Your image fields ———
  frontImage: string | null;
  backImage: string | null;
  leftImage: string | null;
  rightImage: string | null;

  // ——— Relation objects ———
  medCategory: MedCategory | null;
  medType: MedType | null;
  medComp: MedicineCompo | null;
  medUnit: MedicineUnit | null;
  packSize: MedPackage | null;
  drugType: MedDrug | null;
  medManufacturer: Manufacture | null;
  storage: StorageDTO | null;
  boxSize: BoxSize | null;
  isActive: boolean;
}

export interface ItemImageFiles {
  frontImage?: Express.Multer.File[];
  backImage?: Express.Multer.File[];
  leftSideImage?: Express.Multer.File[];
  rightSideImage?: Express.Multer.File[];
  barcode?: Express.Multer.File[];
}

export interface ItemForSearch {
  id: number;
  itemNumber: string | null;
  medicineName: string;
  status: PmsItemStatus;
  hsnCode: string | null;
  itemAlias: string | null;

  medCategoryId: number | null;
  medTypeId: number | null;
  medCompId: number | null;
  medUnitId: number | null;
  packSize: number | null;
  drugType: number | null;
  medManufacturer: number | null;
  purchaseAmount: number;
  saleAmount: number;
}

export interface CreateItemSearch {
  searchText: string;
  medTypeId?: number;
  medCompId?: number;
  medUnitId?: number;
  packSize?: number;
  drugType?: number;
  medManufacturer?: number;
  medCategoryId?: number;
  status?: PmsItemStatus;
}

interface Dropdown {
  id: number;
  name: string;
}

export interface ItemSearchDTO {
  id: number;
  itemNumber: string | null;
  medicineName: string;
  purchaseAmount: number;
  saleAmount: number;
  status: PmsItemStatus;

  medCategory: Dropdown | null;
  medUnit: Dropdown | null;
  medManufacturer: Dropdown | null;
  // drugType: MedType | null;
  // medComp: MedicineCompo | null;
  // medType: MedType | null;
  // packSize: MedPackage | null;
}

export interface GetItemReq {
  id: number;
  warehouseId?: number;
  branchId?: number;
  insuranceId?: number;
  corporateClientId?: number;
  isZeroQty: boolean;
  isCustomPricing: boolean;
  isItemBranchMap?: boolean;
}
export interface GetItemStockRequest {
  id?: number;
  warehouseId?: number;
  branchId?: number;
  isZeroQty: boolean;
}

export interface ItemStockDTO extends PmsItemStock {
  item: DecimalToNumber<PmsItem> | null;
  warehouse: PmsWarehouse | null;
  branch: PmsBranch | null;
}

export interface RawItem {
  id: number;
  item_number: string | null;
  medicine_name: string;
  medicine_category_id: number;
  medicine_type_id: number;
  box_size_id: number;
  medicine_composition_id: number;
  medicine_unit_id: number;
  manufacturer_id: number;
  min_order_details: string | null;
  rack_location: string | null;
  default_disc: number;
  default_b2b_disc: number;
  is_lock_disc: boolean;
  is_lock_b2b_disc: boolean;
  min_stock: number;
  max_stock: number;
  tax: number;
  tax_method: TAX_METHOD; // assuming enum
  pack_size_id: number;
  drug_type_id: number;
  is_allow_loose_sale: boolean;
  accept_online_order: boolean;
  is_returnable: boolean;
  is_suggestion_lock: boolean;
  cess: number | null;
  hsn_code: string | null;
  status: PmsItemStatus;
  purchase_amount: number;
  sale_amount: number;
  remark: string | null;
  onHoldSale: Date | null;
  medicine_pack_type: PmsMedPackType;
  barcode: string | null;
  item_alias: string | null;
  tags: string | null;
  insurance_percentage: number;
  walk_in_percentage: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  created_by: number | null;
  deleted_by: number | null;
  updated_by: number | null;
  is_active: boolean;
}

export interface SlowMovingItem extends RawItem {
  last_sold_date: Date;
}

export interface SlowMovingItemDTO extends Omit<
  ItemDTO,
  | "branchInHandStock"
  | "warehouseInHandStock"
  | "frontImage"
  | "backImage"
  | "leftImage"
  | "rightImage"
  | "insuredPatientPay"
  | "insuredCoPay"
  | "storage"
  | "isActive"
  | "corporateClientPaymentMode"
> {
  lastSoldDate: Date;
}

export interface ItemAppointmentDTO {
  id: number;
  itemNumber: string | null;
  medicineName: string;
  medPackingType: PmsMedPackType;
  medType: MedType | null;
}
export interface StorageDTO {
  id: number;
  name: string;
}

export interface ItemFilter {
  id?: number;
  medCategoryId?: number;
  medTypeId?: number;
  medUnitId?: number;
  status?: PmsItemStatus;
}
export interface ItemSellPricingReq {
  items: number[];
  insurerId?: number;
  corporateClientId?: number;
  branchId: number;
}

export interface ItemSellPricingRes {
  item: ItemDTO;
  stocks: PmsItemStock[];
}

export interface ItemExcelImportReq {
  ccId?: number;
  type?: "Warehouse" | "Branch";
  path: string;
}
