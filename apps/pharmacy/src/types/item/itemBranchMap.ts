import { DecimalToNumber } from "@repo/platform/types/common.js";
import {
  BranchItemMap,
  PmsBranch,
  PmsItem,
  Prisma,
  TAX_METHOD,
} from "@repo/db/generated/prisma/client";

export interface ItemBranchMap {
  id?: number;
  branchId: number;
  itemId: number;
  defaultDiscount?: number;
  defaultB2BDiscount?: number;
  tax?: number;
  taxMethod?: TAX_METHOD;
  purchaseAmount?: number;
  saleAmount?: number;
  insurancePercentage?: number;
  walkInPercentage?: number;
  onHoldSale?: Date;
}

export interface createItemBranchMapInput extends Omit<
  ItemBranchMap,
  "id" | "branchId"
> {
  branchId: number[];
}

export interface ItemBranchMapDTO extends Omit<
  BranchItemMap,
  "branchId" | "itemId"
> {
  item: DecimalToNumber<PmsItem> | null;
  branch: PmsBranch | null;
}

export interface GetItemBranchPricing {
  branchId: number;
  itemId: number;
}

export interface ItemBranchMapExcelInput {
  branchId: number;
  categoryId?: number;
  insurancePercentage?: number;
  walkInPercentage?: number;
  tax?: number;
  taxMethod?: TAX_METHOD;
}

export interface ItemWiseItemBranchMapUpdate {
  ccId: number;
  itemId: number;
  details: ItemWiseUpdateDetail[];
}
export interface ItemWiseUpdateDetail {
  id: number;
  branchId: number;
  insurancePercentage?: number;
  walkInPercentage?: number;
  saleAmount?: number;
}

export interface ItemWiseItemBranchMapDTO {
  item: DecimalToNumber<PmsItem> | null;
  branches: ItemWiseMappedBranch[];
}

export interface ItemWiseMappedBranch extends PmsBranch {
  branchSellAmountMap: BranchItemMap | null;
}

export type BranchWithSellAmountMap = Prisma.PmsBranchGetPayload<{
  include: {
    branchSellAmountMap: true;
  };
}>;

export interface BranchToBranchPriceCopy {
  ccId: number;
  fromBranchId: number;
  toBranchId: number;
}

export interface BranchItemMapAuditCreateInput {
  ccId: number;
  fromBranch?: number;
  toBranch: number;
  itemId: number;
  actionBy?: number;
}

export interface BranchItemMapAuditDetailsCreateInput {
  auditId: number;
  field: string;
  changeFrom: string;
  changeTo: string;
}

export interface CreateTransaction {
  field: string;
  changedFrom?: string | null;
  changedTo?: string | null;
}

export type BranchItemMapExcelRow = {
  "Branch ID": number;
  "Branch Name": string;
  "Item ID": number;
  "Item Number": string;
  "Item Name": string;
  "Item Category": string;
  "Default Discount": number;
  "Default B2B Discount": number;
  Tax: number;
  "Tax Method": "INCLUSIVE" | "EXCLUSIVE";
  "Purchase Amount": number;
  "Sale Amount": number;
  "Insurance Percentage": number;
  "Walk In Percentage": number;
  "On Hold Sale": Date;
};
