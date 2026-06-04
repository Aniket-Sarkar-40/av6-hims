import { commonService } from "@/services/common.service.js";
import {
  ItemSupplierCreateInput,
  ItemSupplierDTO,
  ItemSupplierExcelRow,
  ItemSupplierResponse,
} from "@/types/master/itemSupplier.js";
import { ItemSupplierExcelStagingRow } from "@/validations/request/master/itemSupplierExcel.validation.js";
import {
  InvItemSupplierExcel,
  VendorType,
} from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";
import { customOmit, toIdValue } from "av6-utils";

export const toItemSupplierDTO = async (
  data: ItemSupplierResponse[]
): Promise<ItemSupplierDTO[]> => {
  const allTaxDetails = await commonService.getAllElements<"TaxDetails">({
    cacheCode: "TAX_DETAILS",
    canNullReturnable: true,
    modelName: "TaxDetails",
    shortCode: "TAX_DETAILS",
    useActiveFlag: true,
  });

  return data.map((itemSupplier) => {
    const omittedItemSupplier = customOmit<
      ItemSupplierResponse,
      BaseModelAttrWoCancel | "taxDetailsId"
    >(itemSupplier, [
      "createdBy",
      "updatedBy",
      "deletedBy",
      "createdAt",
      "updatedAt",
      "deletedAt",
      "taxDetailsId",
    ]);

    const taxDetails =
      allTaxDetails.find((tax) => tax.id === itemSupplier.taxDetailsId) ?? null;
    return {
      ...omittedItemSupplier.rest,
      taxDetails: toIdValue(taxDetails, "name"),
    };
  });
};

const getString = (value: unknown): string | null => {
  if (value == null) return null;
  const str = String(value).trim();
  return str ? str : null;
};

const getRequiredString = (value: unknown): string => {
  return getString(value) ?? "";
};

const getOptionalInt = (value: unknown): number | null => {
  if (value == null || String(value).trim() === "") return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

const getOptionalVendorType = (value: unknown): VendorType | null => {
  const str = getString(value);
  if (!str) return null;

  const matched = Object.values(VendorType).find((item) => item === str);
  return matched ?? null;
};

export const mapRowToItemSupplierExcelCreateInput = (
  row: ItemSupplierExcelRow,
  rowNo: number
): ItemSupplierExcelStagingRow => {
  return {
    rowNo,

    supplierCode: getString(row["Vendor Code"]),
    name: getRequiredString(row["Vendor Name"]),
    phone: getString(row.Phone),
    email: getString(row.Email),
    address: getRequiredString(row.Address),
    billTo: getString(row["Bill To"]),
    shipTo: getString(row["Ship To"]),
    vendorType: getOptionalVendorType(row["Vendor Type"]),

    salesPerson: getString(row["Sales Person"]),
    salesPersonPhone: getString(row["Sales Person Phone"]),
    salesPersonEmail: getString(row["Sales Person Email"]),

    proprietaryPersonName: getString(row["Proprietary Person Name"]),
    proprietaryPersonPhone: getString(row["Proprietary Person Phone"]),
    proprietaryPersonEmail: getString(row["Proprietary Person Email"]),

    termsAndCondition: getString(row["Terms And Conditions"]),
    stockShipmentDetails: getString(row["Stock Shipment Details"]),

    contactPersonName: getString(row["Contact Person Name"]),
    contactPersonPhone: getString(row["Contact Person Phone"]),
    contactPersonEmail: getString(row["Contact Person Email"]),

    accountNo: getOptionalInt(row["Bank Account No"]),
    accountHolderName: getString(row["Bank Account Holder Name"]),
    typeOfAccount: getString(row["Type Of Account"]),
    ifscCode: getString(row["IFSC Code"]),
    bankName: getString(row["Bank Name"]),
    bankAddress: getString(row["Bank Address"]),

    taxIdentificationName: getString(row["Tax Identification Name"]),
    taxIdentificationValue: getOptionalInt(row["Tax Identification Value"]),
    taxIdentificationNumber: getString(row["Tax Identification Number"]),
  };
};

const hasBankDetails = (row: InvItemSupplierExcel) => {
  return (
    row.accountNo != null ||
    !!row.accountHolderName ||
    !!row.typeOfAccount ||
    !!row.ifscCode ||
    !!row.bankName ||
    !!row.bankAddress
  );
};

const hasTaxDetails = (row: InvItemSupplierExcel) => {
  return (
    !!row.taxIdentificationName ||
    row.taxIdentificationValue != null ||
    !!row.taxIdentificationNumber
  );
};

export const mapExcelRowToItemSupplierReq = (
  row: InvItemSupplierExcel
): ItemSupplierCreateInput => {
  return {
    supplierCode: row.supplierCode,
    name: row.name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    billTo: row.billTo,
    shipTo: row.shipTo,
    vendorType: row.vendorType,

    salesPerson: row.salesPerson,
    salesPersonPhone: row.salesPersonPhone,
    salesPersonEmail: row.salesPersonEmail,

    proprietaryPersonName: row.proprietaryPersonName,
    proprietaryPersonPhone: row.proprietaryPersonPhone,
    proprietaryPersonEmail: row.proprietaryPersonEmail,

    termsAndCondition: row.termsAndCondition,
    stockShipmentDetails: row.stockShipmentDetails,

    contactPersonName: row.contactPersonName,
    contactPersonPhone: row.contactPersonPhone,
    contactPersonEmail: row.contactPersonEmail,

    bankDetails: hasBankDetails(row)
      ? [
          {
            accountNo: row.accountNo!,
            accountHolderName: row.accountHolderName,
            typeOfAccount: row.typeOfAccount,
            ifscCode: row.ifscCode!,
            bankName: row.bankName!,
            bankAddress: row.bankAddress,
          },
        ]
      : undefined,

    taxIdentificationDetails: hasTaxDetails(row)
      ? [
          {
            taxIdentificationName: row.taxIdentificationName!,
            taxIdentificationValue: row.taxIdentificationValue!,
            taxIdentificationNumber: row.taxIdentificationNumber,
          },
        ]
      : undefined,
  };
};
