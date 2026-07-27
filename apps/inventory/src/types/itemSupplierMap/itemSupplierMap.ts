import {
  InvItemSupplierMapping,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel, IdValue } from "@repo/shared/types/global.js";

export type ItemSupplierMapCreateInput = Omit<
  Prisma.InvItemSupplierMappingUncheckedCreateInput,
  "id"
>;

export interface ItemSupplierMapUpdateInput extends ItemSupplierMapCreateInput {
  id: number;
  existing: ItemSupplierMapDTO;
}

export interface ItemSupplierMapImportExcelReq {
  ccId: string;
  supplierId: string;
}
export interface ItemSupplierMapImportExcelInput {
  ccId: number;
  supplierId: number;
}
export interface ItemSupplierMapBatchJobInput extends ItemSupplierMapImportExcelInput {
  batchJobId: number;
}
export type ItemSupplierMapExcelRow = {
  "Item Code": string;
  "Item Id": number;
  "Item Category": string;
  "Item Name": string;
  "Base Price": number;
  "Supplier Price": number;
};

export interface ItemSupplierMapDTO extends Omit<
  InvItemSupplierMapping,
  BaseModelAttrWoCancel | "ccId" | "itemId" | "supplierId"
> {
  item: IdValue | null;
  supplier: IdValue | null;
  collectionCenter: IdValue | null;
}

export interface CreateTransaction {
  field: string;
  changedFrom?: string | null;
  changedTo?: string | null;
}
