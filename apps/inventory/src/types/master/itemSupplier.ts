import { ItemSupplierSearchType } from "@/enums/itemSupplier.enums.js";
import { Prisma } from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel, IdValue } from "@repo/shared/types/global.js";

export type ItemSupplierCreateInput = Omit<
  Prisma.InvItemSupplierUncheckedCreateInput,
  "id"
> & {
  taxIdentificationDetails?: Prisma.TaxIdentificationDetailsUncheckedCreateInput[];
  bankDetails?: Prisma.BankDetailsUncheckedCreateInput[];
  ledgerId?: number;
};

export interface ItemSupplierUpdateInput extends ItemSupplierCreateInput {
  id: number;
  existingItemSupplier: ItemSupplierDTO;
  ledgerId?: number;
  isLedgerMappingExists?: boolean;
}

export type ItemSupplierResponse = Prisma.InvItemSupplierGetPayload<{
  include: {
    taxIdentificationDetails: true;
    bankDetails: true;
  };
}>;

export interface ItemSupplierDTO
  extends Omit<ItemSupplierResponse, BaseModelAttrWoCancel | "taxDetailsId"> {
  taxDetails: IdValue | null;
}

export interface ItemSupplierExcelImportReq {
  path: string;
}

export interface ItemSupplierBatchJobInput {
  batchJobId: number;
}

export interface ItemSupplierExcelRow {
  "Vendor Code"?: unknown;
  "Vendor Company Name"?: unknown;
  Phone?: unknown;
  Email?: unknown;
  "Bill To"?: unknown;
  "Ship To"?: unknown;
  "Vendor Type"?: unknown;

  "Sales Person"?: unknown;
  "Sales Person Phone"?: unknown;
  "Sales Person Email"?: unknown;

  "Proprietary Person Name"?: unknown;
  "Proprietary Person Phone"?: unknown;
  "Proprietary Person Email"?: unknown;

  "Terms And Conditions"?: unknown;
  "Stock Shipment Details"?: unknown;

  "Bank Account No"?: unknown;
  "Bank Account Holder Name"?: unknown;
  "Type Of Account"?: unknown;
  "IFSC Code"?: unknown;
  "Bank Name"?: unknown;
  "Bank Address"?: unknown;

  "Tax Identification Name"?: unknown;
  "Tax Identification Value"?: unknown;
  "Tax Identification Number"?: unknown;

  "Is PO Whatsapp"?: unknown;
  "Is PO Email"?: unknown;
  "Is PO SMS"?: unknown;
  "Is GRN Whatsapp"?: unknown;
  "Is GRN Email"?: unknown;
  "Is GRN SMS"?: unknown;
  "Is Return Whatsapp"?: unknown;
  "Is Return Email"?: unknown;
  "Is Return SMS"?: unknown;
}

export interface ItemSupplierLookupInput {
  type: ItemSupplierSearchType;
  searchText: string;
}

export interface ItemSupplierLookupRow {
  id: number;
  supplierCode?: string | null;
  vendorCompanyName: string;
  email?: string | null;
  phone?: string | null;
}

export interface ItemSupplierLookupDTO {
  id: number;
  vendorName: string;
  type: ItemSupplierSearchType;
  result: string;
}
