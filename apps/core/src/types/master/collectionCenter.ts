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

export interface CollectionCenterDTO {
  id: number;
  name: string;
  // add optional fields if they exist in your schema (safe to extend later)
  // code?: string | null;
  // type?: string | null;
}
