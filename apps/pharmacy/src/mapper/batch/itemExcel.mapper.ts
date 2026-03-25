// src/mappers/itemExcel.mapper.ts

import { ItemExcelRow } from "@/types/batch/batch.js";
import { excelDateToJSDate } from "@/utils/date.utils.js";
import { Prisma } from "@repo/db/generated/prisma/client";

/**
 * A robust function to parse boolean values from various string formats.
 * @param value - The value from the Excel cell (e.g., "TRUE", "1", "yes", "false", "0").
 * @param defaultValue - The default boolean value if the cell is empty or invalid.
 * @returns A boolean.
 */
const toBoolean = (
  value: string | boolean | undefined,
  defaultValue: boolean,
): boolean => {
  if (typeof value === "boolean") return value;
  if (!value) return defaultValue;
  const strValue = String(value).toLowerCase().trim();
  return ["true", "1", "yes"].includes(strValue);
};

/**
 * Maps a raw Excel row object to a Prisma-compatible `ItemExcelCreateInput` object.
 * Throws an error if required data is missing or invalid.
 *
 * @param row - The raw data object from an Excel row.
 * @returns A validated and typed object ready for Prisma `create` or `createMany`.
 */
export function mapRowToItemExcelCreateInput(
  row: ItemExcelRow,
  rowNo: number,
): Omit<Prisma.ItemExcelCreateInput, "batchJob"> {
  // Basic validation
  if (
    !row["Medicine Name"] ||
    !row["Medicine Category"] ||
    !row["Tax Method"]
  ) {
    throw new Error(
      `Row with Medicine Name "${row["Medicine Name"]}" is missing required fields (e.g., Name, Category, Tax Method).`,
    );
  }

  const mappedData: Omit<Prisma.ItemExcelCreateInput, "batchJob"> = {
    // String fields (direct mapping or with default)
    rowNo,
    itemNumber: row["Item Number"],
    medicineName: row["Medicine Name"],
    medCategory: row["Medicine Category"],
    medType: row["Medicine Type"],
    medComp:
      typeof row["Medicine Composition"] === "string"
        ? row["Medicine Composition"]
        : JSON.stringify(row["Medicine Composition"]),
    boxSize:
      typeof row["Box Size"] === "string"
        ? row["Box Size"]
        : JSON.stringify(row["Box Size"]),
    medUnit:
      typeof row["Medicine Unit"] === "string"
        ? row["Medicine Unit"]
        : JSON.stringify(row["Medicine Unit"]),
    manufacturer: row["Manufacturer"],
    packSize:
      typeof row["Pack Size"] !== "string"
        ? JSON.stringify(row["Pack Size"])
        : row["Pack Size"],
    drugType:
      typeof row["Drug Type"] !== "string"
        ? JSON.stringify(row["Drug Type"])
        : row["Drug Type"],
    hsnCode: row["HSN Code"] || null,
    barcode: row["Barcode"] || null,
    tags: row["Tags"] || null,
    remark: row["Remark"] || null,
    minOrderDetails: row["Min Order Details"] || null,
    rackLocation: row["Rack Location"] || null,
    batchNo: row["Batch"] ? String(row["Batch"]) : null,
    // Expiry Date (optional)
    expiryDate: row["Expiry"] ? excelDateToJSDate(row["Expiry"]) : null,

    // Float/Decimal fields (with safe parsing and default to 0)
    defaultDiscount: parseFloat(String(row["Default Disc"] || 0)),
    defaultB2BDiscount: parseFloat(String(row["Default B2B Disc"] || 0)),
    tax: parseFloat(String(row["Tax"] || 0)),
    purchaseAmount: parseFloat(String(row["Purchase Amount"] || 0)),
    saleAmount: parseFloat(String(row["Sale Amount"] || 0)),
    insurancePercentage: parseFloat(String(row["Insurance Percentage"] || 0)),
    walkInPercentage: parseFloat(String(row["Walk In Percentage"] || 0)),

    // Integer fields (with safe parsing and default to 0)
    minStock: parseInt(String(row["Min Stock"] || 0), 10),
    maxStock: parseInt(String(row["Max Stock"] || 0), 10),
    quantity: parseInt(String(row["Quantity"] || 0), 10),

    // Enum fields
    taxMethod: row["Tax Method"], // Assumes values match enum exactly (e.g., 'INCLUSIVE')
    medPackingType: row["Medicine Pack Type"], // Same assumption

    // Boolean fields (using our robust helper)
    isLockDiscount: toBoolean(row["Is Lock Disc"], false),
    isLockB2BDiscount: toBoolean(row["Is Lock B2B Disc"], false),
    isAllowLooseSale: toBoolean(row["Is Allow Loose Sale"], false),
    acceptOnlineOrder: toBoolean(row["Accept Online Order"], true), // Default to true
    isReturnable: toBoolean(row["Is Returnable"], true), // Default to true
  };

  return mappedData;
}
