import { Prisma, VendorType } from "@repo/db/generated/prisma/client";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";

export type ItemSupplierExcelStagingRow = Omit<
  Prisma.InvItemSupplierExcelUncheckedCreateInput,
  "batchJobId"
>;

const pushRowError = (errors: string[], rowNo: number, message: string) => {
  errors.push(`Row ${rowNo}: ${message}`);
};

const hasValue = (value: unknown) => {
  return value != null && String(value).trim() !== "";
};

export const validateItemSupplierExcelArray = (
  rows: ItemSupplierExcelStagingRow[]
) => {
  const errors: string[] = [];

  for (const row of rows) {
    const rowNo = row.rowNo;

    if (
      rowNo == null ||
      typeof rowNo !== "number" ||
      !Number.isInteger(rowNo) ||
      rowNo < 1
    ) {
      pushRowError(errors, rowNo ?? 0, "row number is required");
      continue;
    }

    if (!row.name?.trim()) {
      pushRowError(errors, rowNo, "Vendor Name is required");
    }

    if (!row.address?.trim()) {
      pushRowError(errors, rowNo, "Address is required");
    }

    if (row.supplierCode != null && typeof row.supplierCode !== "string") {
      pushRowError(errors, rowNo, "Vendor Code must be a string");
    }

    if (row.phone != null && typeof row.phone !== "string") {
      pushRowError(errors, rowNo, "Phone must be a string");
    }

    if (row.email != null && typeof row.email !== "string") {
      pushRowError(errors, rowNo, "Email must be a string");
    }

    if (
      row.vendorType != null &&
      !Object.values(VendorType).includes(row.vendorType as VendorType)
    ) {
      pushRowError(errors, rowNo, "Vendor Type is invalid");
    }

    const bankGiven =
      hasValue(row.accountNo) ||
      hasValue(row.accountHolderName) ||
      hasValue(row.typeOfAccount) ||
      hasValue(row.ifscCode) ||
      hasValue(row.bankName) ||
      hasValue(row.bankAddress);

    if (bankGiven) {
      if (
        row.accountNo == null ||
        !Number.isInteger(row.accountNo) ||
        row.accountNo < 1
      ) {
        pushRowError(
          errors,
          rowNo,
          "Bank Account No is required and must be a positive integer when bank details are provided"
        );
      }

      if (!row.ifscCode?.trim()) {
        pushRowError(
          errors,
          rowNo,
          "IFSC Code is required when bank details are provided"
        );
      }

      if (!row.bankName?.trim()) {
        pushRowError(
          errors,
          rowNo,
          "Bank Name is required when bank details are provided"
        );
      }
    }

    const taxGiven =
      hasValue(row.taxIdentificationName) ||
      hasValue(row.taxIdentificationValue) ||
      hasValue(row.taxIdentificationNumber);

    if (taxGiven) {
      if (!row.taxIdentificationName?.trim()) {
        pushRowError(
          errors,
          rowNo,
          "Tax Identification Name is required when tax details are provided"
        );
      }

      if (
        row.taxIdentificationValue == null ||
        !Number.isInteger(row.taxIdentificationValue) ||
        row.taxIdentificationValue < 1
      ) {
        pushRowError(
          errors,
          rowNo,
          "Tax Identification Value is required and must be a positive integer when tax details are provided"
        );
      }
    }
  }

  if (errors.length > 0) {
    throw new ErrorHandler(400, errors.join("; "));
  }

  return { value: rows };
};
