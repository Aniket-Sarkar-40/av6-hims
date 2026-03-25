import {
  Batch_Details_Status,
  Batch_Status,
  Batch_Type,
  PmsItemStatus,
  PmsMedPackType,
  TAX_METHOD,
} from "@repo/db/generated/prisma/enums.js";

export interface BatchJobInput {
  type: Batch_Type;
  status?: Batch_Status;
  totalQty: number;
  processedQty?: number;
  successCount?: number;
  failureCount?: number;
  batchJobNo?: string;
}

export interface BatchDetailsInput {
  batchId: number;
  refId: number;
  refNo?: string;
  status: Batch_Details_Status;
}

export interface ItemExcelInput {
  medicineName: string;
  medCategory: string;
  medType: string;
  medComp: string;
  medUnit: string;
  manufacturer: string;
  minOrderDetails?: string;
  rackLocation?: string;
  defaultDiscount: number;
  defaultB2BDiscount: number;
  isLockDiscount: boolean;
  isLockB2BDiscount: boolean;
  minStock: number;
  maxStock: number;
  tax: number;
  taxMethod: TAX_METHOD;
  packSize: string;
  drugType: string;
  isAllowLooseSale: boolean;
  acceptOnlineOrder: boolean;
  isReturnable: boolean;
  isSuggestionLock: boolean;
  cess?: number;
  hsnCode?: string;
  status: PmsItemStatus;
  purchaseAmount: number;
  saleAmount: number;
  remark?: string;
  onHoldSale?: Date;
  medPackingType: PmsMedPackType;
  barcode?: string;
  itemAlias?: string;
  tags?: string;
  insurancePercentage: number;
  walkInPercentage: number;
}

export type CacheMaps = {
  medCategory: Map<string, number>;
  medType: Map<string, number>;
  medComp: Map<string, number>;
  medUnit: Map<string, number>;
  manufacturer: Map<string, number>;
  packSize: Map<string, number>;
  drugType: Map<string, number>;
  boxSize: Map<string, number>;
};

export interface DetailPayload {
  refId: number; // ItemExcel.id
  status: Batch_Details_Status;
  itemId?: number;
  errorMsg?: string;
}

export type ItemExcelRow = {
  "Item Number": string;
  "Medicine Name": string;
  "Medicine Category": string;
  "Medicine Type": string;
  "Medicine Composition": string;
  "Medicine Unit": string;
  "Box Size": string;
  Manufacturer: string;
  "Min Order Details"?: string;
  "Rack Location"?: string;
  "Default Disc": string | number;
  "Default B2B Disc": string | number;
  "Is Lock Disc"?: string | boolean; // e.g., "TRUE", "false", "1", "0"
  "Is Lock B2B Disc"?: string | boolean;
  "Min Stock": string | number;
  "Max Stock": string | number;
  Tax: string | number;
  "Tax Method": "INCLUSIVE" | "EXCLUSIVE"; // Assuming these are the exact values in Excel
  "Pack Size": string;
  "Drug Type": string;
  "Is Allow Loose Sale"?: string | boolean;
  "Accept Online Order"?: string | boolean;
  "Is Returnable"?: string | boolean;
  "Purchase Amount": string | number;
  "Sale Amount": string | number;
  "Medicine Pack Type": PmsMedPackType; // Example values
  "Insurance Percentage": string | number;
  "Walk In Percentage": string | number;
  "HSN Code"?: string;
  Barcode?: string;
  Tags?: string;
  Remark?: string;
  Batch?: string | number;
  Expiry?: number;
  Quantity: number;
};
