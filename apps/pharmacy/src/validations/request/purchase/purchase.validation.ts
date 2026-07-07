import {
  CreatePurchaseOrderInput,
  PurchaseOrderDetailInput,
  PurchaseReqExcelFilter,
} from "@/types/purchase/purchase.js";
import { joiDecimalFromSettings } from "@/utils/commonCalculation.utils.js";
import { PO_STATUS } from "@repo/db/generated/prisma/enums.js";
import Joi from "joi";
import {
  arrayRequired,
  dateOptional,
  dateRequired,
  enumOptional,
  idOptional,
  idRequired,
  intOptional,
  intRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

export const purchaseOrderDetailSchema = Joi.object<PurchaseOrderDetailInput>({
  id: idOptional("Id"),

  uom: strOptional("UOM"),

  itemId: idRequired("Item Id"),

  itemCategoryId: idRequired("Item Category Id"),

  itemMedCategory: strRequired("Item Medicine Category"),

  medType: strRequired("Medicine Type"),

  medComp: strRequired("Medicine Composition"),

  medUnit: strRequired("Medicine Unit"),

  manufacturer: strRequired("Manufacturer"),

  packSize: strRequired("Pack Size"),

  drugType: strRequired("Drug Type"),

  medTypeId: idRequired("Medicine Type Id"),

  medCompId: idRequired("Medicine Composition Id"),

  medUnitId: idRequired("Medicine Unit Id"),

  manufacturerId: idRequired("Manufacturer Id"),

  packSizeId: idRequired("Pack Size Id"),

  drugTypeId: idRequired("Drug Type Id"),

  mrp: joiDecimalFromSettings({ key: "poPrecision", required: false })
    .optional()
    .allow(null)
    .messages({
      "number.base": "MRP must be a number",
      "number.precision": "MRP must have {{#limit}} decimal places",
    }),

  purchasedPrice: joiDecimalFromSettings({
    key: "poPrecision",
    required: true,
    min: 0,
  }).messages({
    "number.base": "Purchased price must be a number",
    "number.min": "Purchased price must be at least 0",
    "number.precision": "Purchased price must have {{#limit}} decimal places",
    "any.required": "Purchased price is required",
  }),

  packingQty: strOptional("Packing Qty"),

  quantity: intRequired("Quantity"),

  receivedQty: intOptional("Received Qty"),

  totalAmount: joiDecimalFromSettings({
    key: "poPrecision",
    required: true,
    min: 0,
  }).messages({
    "number.base": "Total amount must be a number",
    "number.min": "Total amount must be at least 0",
    "number.precision": "Total amount must have {{#limit}} decimal places",
    "any.required": "Total amount is required",
  }),
});

// Schema for the create-purchase-order payload
export const purchaseSchema = Joi.object<CreatePurchaseOrderInput>({
  date: dateRequired("Date"),

  distributorId: idRequired("Distributor Id"),

  warehouseId: idRequired("Warehouse Id"),
  grandTotal: joiDecimalFromSettings({
    key: "poPrecision",
    required: true,
    min: 0,
  }).messages({
    "number.base": `Grand Total must be a number`,
    "number.min": `Grand Total must be at least 0`,
    "number.precision": `Grand Total must have {{#limit}} decimal places`,
    "any.required": `Grand Total is required`,
  }),

  status: enumOptional("Status", PO_STATUS),

  notes: strOptional("Notes"),

  currency: strOptional("Currency"),

  storageId: idOptional("Storage Id"),

  paymentTerms: strOptional("Payment Terms"),

  purchaseOrderDetails: arrayRequired(
    "Purchase order details",
    purchaseOrderDetailSchema,
    1,
  ),
});

export const validatePurchase = validationHandler({
  schema: purchaseSchema,
});

export const purchaseSchemaUpdate = purchaseSchema.keys({
  id: idRequired("Id"),
});

export const validatePurchaseUpdate = validationHandler({
  schema: purchaseSchemaUpdate,
});

export const PurchaseExcelFilterSchema = Joi.object<PurchaseReqExcelFilter>({
  id: idOptional("Id"),
  poNumber: strOptional("PO Number"),
  startDate: dateOptional("Start Date"),
  endDate: dateOptional("End Date"),
  warehouseId: idOptional("Warehouse Id"),
  distributorId: idOptional("Distributor Id"),
  storageId: idOptional("Storage Id"),
  status: enumOptional("Status", PO_STATUS),
});

export const validateExcelFilterPurchase = validationHandler({
  schema: PurchaseExcelFilterSchema,
});
