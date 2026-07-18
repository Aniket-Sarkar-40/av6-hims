import { CreateGrnInput, GrnDetailInput } from "@/types/grn/grn.js";
import { getSchemaPrecision } from "@/utils/schema.utils.js";
import {
  DiscMethod,
  GRN_STATUS,
  PAYMENT_STATUS,
} from "@repo/db/generated/prisma/client";
import {
  arrayRequired,
  boolRequired,
  dateOptional,
  dateRequired,
  enumOptional,
  enumRequired,
  idOptional,
  idRequired,
  intRequired,
  numberWithMaxDecimalsOptional,
  numberWithMaxDecimalsRequired,
  priceOptional,
  priceRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

const uniqueBatchNoValidation = (
  details: GrnDetailInput[],
  helpers: Joi.CustomHelpers,
) => {
  const batchNoMap = new Map<
    string,
    { itemId: number; row: number; originalBatchNo: string }
  >();

  for (let i = 0; i < details.length; i++) {
    const detail = details[i];

    if (!detail.batchNo) continue;

    const batchNo = detail.batchNo.trim().toLowerCase();

    if (!batchNo) continue;

    const existingBatch = batchNoMap.get(batchNo);

    if (existingBatch && existingBatch.itemId !== detail.itemId) {
      const firstRow = existingBatch.row + 1;
      const currentRow = i + 1;

      return helpers.error("any.custom", {
        message: `Batch number "${detail.batchNo}" is already assigned to item ${existingBatch.itemId} in row ${firstRow}. Same batch number cannot be used for different item ${detail.itemId} in row ${currentRow}.`,
      });
    }

    if (!existingBatch) {
      batchNoMap.set(batchNo, {
        itemId: detail.itemId,
        row: i,
        originalBatchNo: detail.batchNo,
      });
    }
  }

  return details;
};

export const grnDetailSchema = Joi.object<GrnDetailInput>({
  id: idOptional("Id"),

  itemId: idRequired("Item Id"),

  poDetailsId: idRequired("PO details Id"),

  purchasedPrice: priceRequired("purchasedPrice", () =>
    getSchemaPrecision("grn"),
  ),

  focQuantity: intRequired("FOC Quantity"),

  netTax: priceRequired("Net Tax", () => getSchemaPrecision("grn")),

  isBatch: boolRequired("Is Batch"),

  batchNo: Joi.when("isBatch", {
    is: true,
    then: strRequired("Batch number"),
    otherwise: strOptional("Batch number"),
  }),

  totalAmount: priceRequired("Total amount", () => getSchemaPrecision("grn")),

  netAmount: priceRequired("Net amount", () => getSchemaPrecision("grn")),

  tax: priceOptional("Tax", () => getSchemaPrecision("grn")),

  isExpiry: boolRequired("Is Expiry"),

  expiryDate: Joi.when("isExpiry", {
    is: true,
    then: dateRequired("Expiry date"),
    otherwise: dateOptional("Expiry date"),
  }),

  quantity: intRequired("Quantity"),

  discount: numberWithMaxDecimalsOptional("Discount", () =>
    getSchemaPrecision("grn"),
  ),
  netDiscount: numberWithMaxDecimalsOptional("Net Discount amount", () =>
    getSchemaPrecision("grn"),
  ),

  discountMethod: enumRequired("Discount method", DiscMethod),
});

export const grnSchema = Joi.object<CreateGrnInput>({
  id: idOptional("Id"),

  poNumber: strRequired("PO number"),

  poId: idRequired("PO Id"),

  currencyId: idOptional("Currency Id"),

  conversionRate: Joi.when("currencyId", {
    is: Joi.exist().not(null),
    then: numberWithMaxDecimalsRequired("Conversion Rate", () =>
      getSchemaPrecision("grn"),
    ),
    otherwise: Joi.allow(null).messages({
      "any.unknown":
        "Conversion Rate is not allowed when Currency Id is not provided",
    }),
  }),

  date: dateRequired("Date"),

  supplierId: idRequired("Supplier Id"),

  ccId: idRequired("CC Id"),

  totalAmount: priceRequired("totalAmount", () => getSchemaPrecision("grn")),

  discount: numberWithMaxDecimalsOptional("Discount", () =>
    getSchemaPrecision("grn"),
  ),

  discountMethod: enumRequired("Discount method", DiscMethod),

  netDiscount: numberWithMaxDecimalsOptional("Net Discount amount", () =>
    getSchemaPrecision("grn"),
  ),

  netTotal: priceRequired("netTotal", () => getSchemaPrecision("grn")),

  netTax: priceRequired("Net Tax", () => getSchemaPrecision("grn")),

  storeId: idOptional("Store Id"),

  paidAmount: priceOptional("Paid amount", () => getSchemaPrecision("grn")),

  notes: strOptional("Notes"),

  paymentStatus: enumOptional("Payment status", PAYMENT_STATUS),

  status: enumOptional("Status", GRN_STATUS),

  tax: idOptional("Tax"),
  returnedAmount: priceOptional("Returned amount", () =>
    getSchemaPrecision("grn"),
  ),

  goodReceiveDetails: arrayRequired("Good Receive Details", grnDetailSchema, 1)
    .custom(uniqueBatchNoValidation)
    .messages({
      "any.custom": "{{#message}}",
    }),
});

export const validateGrn = validationHandler({
  schema: grnSchema,
});

export const grnSchemaUpdate = grnSchema.keys({
  id: idRequired("Id"),
});

export const validateGrnUpdate = validationHandler({
  schema: grnSchemaUpdate,
});
