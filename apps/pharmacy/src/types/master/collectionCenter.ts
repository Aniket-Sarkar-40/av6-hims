import { BranchDTO } from "./branch.js";
import { WarehouseDTO } from "./warehouse.js";

export interface CollectionCenterReq {
  id?: number;
  colName: string;
  email: string;
  phone: string;
  address: string;
  langId: number;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  testPrefix: string;
  barcodePrefix: string;
  invoicePrefix: string;
  disabledOn: Date | null;
  disabledBy: string | null;
  collectionAbbreviationName?: string | null;
  isSubOrganization: boolean;
  diseCode: string;
  connectionCode: string;
  barcodePrinterName: string | null;
}

export interface BranchOrWarehouseDTO {
  id: number;
  type: "Branch" | "Warehouse";
  name: string;
  branch: BranchDTO | null;
  warehouse: WarehouseDTO | null;
}
