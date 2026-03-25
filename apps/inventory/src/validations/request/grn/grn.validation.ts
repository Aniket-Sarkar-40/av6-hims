import { CreateGrnInput, GrnDetailInput } from "@/types/grn/grn.js";
import {
  arrayRequired,
  boolRequired,
  dateOptional,
  dateRequired,
  enumOptional,
  enumRequired,
  idOptional,
  idRequired,
  numberWithMaxDecimalsRequired,
  priceOptional,
  priceRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import {
  DiscMethod,
  GRN_STATUS,
  PAYMENT_STATUS,
  PO_STATUS,
} from "@repo/db/generated/prisma/client";
import Joi from "joi";

export const grnDetailSchema = Joi.object<GrnDetailInput>({
  id: idOptional("Id"),

  itemId: idRequired("Item Id"),

  poDetailsId: idRequired("PO details Id"),

  purchasedPrice: numberWithMaxDecimalsRequired("purchasedPrice"),

  focQuantity: idRequired("FOC Quantity"),

  netTax: idRequired("Net Tax"),

  isBatch: boolRequired("Is Batch"),

  batchNo: Joi.when("isBatch", {
    is: true,
    then: strRequired("Batch number"),
    otherwise: strOptional("Batch number"),
  }),

  totalAmount: priceRequired("Total amount"),

  netAmount: priceRequired("Net amount"),

  tax: priceOptional("Tax"),

  isExpiry: boolRequired("Is Expiry"),

  expiryDate: Joi.when("isExpiry", {
    is: true,
    then: dateRequired("Expiry date"),
    otherwise: dateOptional("Expiry date"),
  }),

  quantity: idRequired("Quantity"),

  discount: idRequired("Discount", 0),
  netDiscount: priceRequired("Net Discount amount"),

  discountMethod: enumRequired("Discount method", DiscMethod),
});

export const grnSchema = Joi.object<CreateGrnInput>({
  id: idOptional("Id"),

  poNumber: strRequired("PO number"),

  poId: idRequired("PO Id"),

  date: dateRequired("Date"),

  supplierId: idRequired("Supplier Id"),

  ccId: idRequired("CC Id"),

  totalAmount: numberWithMaxDecimalsRequired("totalAmount"),

  discount: idRequired("Discount"),

  discountMethod: enumRequired("Discount method", DiscMethod),

  netDiscount: priceRequired("Net Discount amount"),

  netTotal: numberWithMaxDecimalsRequired("netTotal"),

  netTax: idRequired("Net Tax"),

  storeId: idOptional("Store Id"),

  paidAmount: priceOptional("Paid amount"),

  notes: strOptional("Notes"),

  paymentStatus: enumOptional("Payment status", PAYMENT_STATUS),

  status: enumOptional("Status", GRN_STATUS),

  tax: idOptional("Tax"),
  returnedAmount: priceOptional("Returned amount"),

  goodReceiveDetails: arrayRequired("Good Receive Details", grnDetailSchema, 1),
});

export const grnExcelFilterSchema = Joi.object({
  id: idOptional("Id"),
  poNumber: strOptional("PO Number"),
  startDate: dateOptional("Start date"),

  endDate: dateOptional("End date"),
  warehouseId: idOptional("Warehouse id"),
  distributorId: idOptional("Distributor id"),
  status: enumOptional("Status", GRN_STATUS),
  paymentStatus: enumOptional("Payment status", PAYMENT_STATUS),
  poStatus: enumOptional("PO Status", PO_STATUS),
  gatePassId: idOptional("Gate pass id"),
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

export const validateExcelFilterGrn = validationHandler({
  schema: grnExcelFilterSchema,
});
