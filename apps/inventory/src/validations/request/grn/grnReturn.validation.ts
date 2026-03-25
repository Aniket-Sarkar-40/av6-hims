import {
  CreateGrnReturnInput,
  GrnReturnDetailInput,
  GrnReturnReqExcelFilter,
} from "@/types/grn/grnReturn.js";
import {
  arrayRequired,
  boolRequired,
  dateOptional,
  dateRequired,
  enumOptional,
  enumRequired,
  idOptional,
  idRequired,
  priceOptional,
  priceRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { numberWithMaxDecimalsRequired } from "@repo/shared/utils/joi.utils.js";
import {
  DiscMethod,
  PAYMENT_STATUS,
  RETURN_STS,
} from "@repo/db/generated/prisma/client";
import Joi from "joi";

export const grnReturnDetailSchema = Joi.object<GrnReturnDetailInput>({
  itemId: idRequired("Item Id"),

  batchNo: Joi.when("isBatch", {
    is: true,
    then: strRequired("Batch number"),
    otherwise: strOptional("Batch number"),
  }),

  expiryDate: Joi.when("isExpiry", {
    is: true,
    then: dateRequired("Expiry date"),
    otherwise: dateOptional("Expiry date"),
  }),

  quantity: idRequired("Quantity"),

  purchasedPrice: numberWithMaxDecimalsRequired("purchasedPrice"),

  totalAmount: numberWithMaxDecimalsRequired("totalAmount"),

  tax: idOptional("Tax"),

  netTax: idRequired("Net Tax"),

  netAmount: numberWithMaxDecimalsRequired("netAmount"),

  discountMethod: enumRequired("Discount method", DiscMethod),

  discount: idRequired("Discount", 0),
  netDiscount: priceRequired("Net Discount amount"),

  orderQty: idRequired("Order quantity"),

  inHandQty: idRequired("In-hand quantity"),

  grnQty: idRequired("GRN quantity"),

  grnDetailId: idRequired("Grn Detail Id"),

  isBatch: boolRequired("Is Batch"),
  isExpiry: boolRequired("Is Expiry"),
});

export const grnReturnSchema = Joi.object<CreateGrnReturnInput>({
  grnId: idRequired("GRN ID"),

  poNumber: strRequired("PO number"),

  grnNumber: strRequired("Grn number"),

  poId: idRequired("PO ID"),

  date: dateRequired("Date"),

  supplierId: idRequired("Supplier ID"),

  ccId: idRequired("CC ID"),

  totalAmount: numberWithMaxDecimalsRequired("totalAmount"),

  discount: priceOptional("Discount"),

  discountMethod: enumRequired("Discount method", DiscMethod),

  netDiscount: priceOptional("Discount amount"),

  netTotal: numberWithMaxDecimalsRequired("netTotal"),

  paidAmount: priceOptional("Paid amount"),

  paymentStatus: enumOptional("Payment Status", PAYMENT_STATUS),

  status: enumOptional("Status", RETURN_STS),

  tax: priceOptional("Tax"),

  netTax: idRequired("Net tax"),

  goodReceiveReturnDetails: arrayRequired(
    "Good receive return details",
    grnReturnDetailSchema,
    1,
  ),
});

export const grnReturnExcelSchema = Joi.object<GrnReturnReqExcelFilter>({
  id: idOptional("Id"),
  grnId: idOptional("GRN ID"),
  grnNumber: strOptional("GRN number"),
  poNumber: strOptional("PO number"),
  startDate: dateOptional("Start date"),
  endDate: dateOptional("End date"),
  distributorId: idOptional("Distributor id"),
  warehouseId: idOptional("Warehouse ID"),
  status: enumOptional("Status", RETURN_STS),
  paymentStatus: enumOptional("Payment status", PAYMENT_STATUS),
});

export const validateGrnReturn = validationHandler({
  schema: grnReturnSchema,
});

export const grnReturnSchemaUpdate = grnReturnSchema.keys({
  id: idRequired("Id"),
  goodReceiveReturnDetails: Joi.array().items(
    grnReturnDetailSchema.keys({
      id: idOptional("Id"),
      grnDetailId: idOptional("GRN details ID"),
    }),
  ),
});

export const validateGrnReturnUpdate = validationHandler({
  schema: grnReturnSchemaUpdate,
});

export const grnReturnSchemaApprove = grnReturnSchemaUpdate.keys({
  ccId: idRequired("CC Id"),
});

export const validateGrnReturnApprove = validationHandler({
  schema: grnReturnSchemaApprove,
});

export const validateGrnReturnExcel = validationHandler({
  schema: grnReturnExcelSchema,
});
