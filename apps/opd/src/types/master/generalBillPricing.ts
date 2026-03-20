import { Prisma } from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";

export type GeneralBillPricingInput = Omit<
  Prisma.GeneralBillPricingUncheckedCreateInput,
  | "id"
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "ccId"
>;

export interface CreateGeneralBillPricingInput extends GeneralBillPricingInput {
  ccIds: number[];
}

export interface UpdateGeneralBillPricingInput extends Omit<
  CreateGeneralBillPricingInput,
  "ccId"
> {
  id: number;
  ccId: number;
}

export interface GeneralBillPricingDTO extends Omit<
  GeneralBillPricingResponse,
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "deletedAt"
  | "ccId"
  | "generalBillItemId"
  | "collectionCenter"
> {
  cc: IdValue | null;
  generalBillItem: IdValue | null;
  createdBy: IdValue | null;
  updatedBy: IdValue | null;
}

export type GeneralBillPricingResponse = Prisma.GeneralBillPricingGetPayload<{
  include: {
    collectionCenter: true;
  };
}>;

export type GeneralBillPricingExcelRes = Prisma.GeneralBillPricingGetPayload<{
  include: {
    collectionCenter: true;
    generalBillItem: true;
  };
}>;

export interface GeneralBillPricingExcelInput {
  ccId: number;
  filePath: string;
}

export interface GeneralBillPricingExcelRow {
  "Collection Center ID"?: number | string;
  "Collection Center Name"?: string;
  "General Bill Item ID": number | string;
  "General Bill Item Name"?: string;
  Price: number | string;
  Description?: string;
}

export interface CopyGeneralBillPricing {
  fromId: number;
  toId: number;
}

export interface CopyGeneralBillPricingRepoInput {
  fromItems: GeneralBillPricingResponse[];
  toItems: GeneralBillPricingResponse[];
  toId: number;
}
export interface GeneralBillPricingSearchInput {
  ccId: number;
  searchText?: string;
}

export interface GeneralBillPricingWithItemDTO {
  id: number;
  ccId: number;
  generalBillItemId: number;
  price: number;

  itemName: string;
  itemDescription: string | null;
}
