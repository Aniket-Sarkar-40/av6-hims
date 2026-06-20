import { Prisma } from "@repo/db/generated/prisma/client";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";

export type ItemMasterExcelStagingRow = Omit<
  Prisma.InvItemMasterExcelUncheckedCreateInput,
  "batchJobId"
>;

const pushRowError = (errors: string[], rowNo: number, message: string) => {
  errors.push(`Row ${rowNo}: ${message}`);
};

export const validateItemMasterExcelArray = (
  rows: ItemMasterExcelStagingRow[]
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

    if (!row.item?.trim()) {
      pushRowError(errors, rowNo, "Item Name is required");
    }

    if (row.itemCode != null && typeof row.itemCode !== "string") {
      pushRowError(errors, rowNo, "Item Code must be a string");
    }

    if (!row.itemCategory?.trim()) {
      pushRowError(errors, rowNo, "Item Category is required");
    }

    if (row.storage != null && typeof row.storage !== "string") {
      pushRowError(errors, rowNo, "Storage must be a string");
    }

    if (!row.unit?.trim()) {
      pushRowError(errors, rowNo, "Unit is required");
    }

    if (row.basePrice != null) {
      const price =
        typeof row.basePrice === "number"
          ? row.basePrice
          : typeof row.basePrice === "object" &&
            row.basePrice !== null &&
            "toNumber" in row.basePrice
          ? (row.basePrice as { toNumber: () => number }).toNumber()
          : Number(row.basePrice);

      if (Number.isNaN(price) || price < 0) {
        pushRowError(
          errors,
          rowNo,
          "Base Price must be a number greater than or equal to 0"
        );
      }
    }

    if (
      row.reOrderLevel != null &&
      (!Number.isInteger(row.reOrderLevel) || row.reOrderLevel < 0)
    ) {
      pushRowError(
        errors,
        rowNo,
        "Re-order Level must be an integer greater than or equal to 0"
      );
    }

    if (
      row.itemDescription != null &&
      typeof row.itemDescription !== "string"
    ) {
      pushRowError(errors, rowNo, "Item Description must be a string");
    }

    if (typeof row.isBatchNumber !== "boolean") {
      pushRowError(errors, rowNo, "Is Batch Number must be a boolean");
    }

    if (typeof row.isExpireDate !== "boolean") {
      pushRowError(errors, rowNo, "Is Expire Date must be a boolean");
    }

    if (typeof row.isUserReturnable !== "boolean") {
      pushRowError(errors, rowNo, "Is User Returnable must be a boolean");
    }

    if (typeof row.isVendorReturnable !== "boolean") {
      pushRowError(errors, rowNo, "Is Vendor Returnable must be a boolean");
    }
  }

  if (errors.length > 0) {
    throw new ErrorHandler(400, errors.join("; "));
  }

  return { value: rows };
};
