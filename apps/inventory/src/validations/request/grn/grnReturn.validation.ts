import {
  CreateGrnReturnInput,
  GrnReturnDetailInput,
  GrnReturnReqExcelFilter,
} from "@/types/grn/grnReturn.js";
import {
  DiscMethod,
  PAYMENT_STATUS,
  RETURN_STS,
} from "@repo/db/generated/prisma/enums.js";
import {
  arrayRequired,
  boolRequired,
  dateOptional,
  dateRequired,
  enumOptional,
  enumRequired,
  idOptional,
  idRequired,
  intOptional,
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

  quantity: intOptional("Quantity").default(0),

  focQuantity: intOptional("FOC Quantity").default(0),

  purchasedPrice: numberWithMaxDecimalsRequired("purchasedPrice"),

  totalAmount: numberWithMaxDecimalsOptional("totalAmount"),

  tax: intOptional("Tax"),

  netTax: intRequired("Net Tax"),

  netAmount: numberWithMaxDecimalsOptional("netAmount"),

  discountMethod: enumRequired("Discount method", DiscMethod),

  discount: numberWithMaxDecimalsOptional("Discount"),
  netDiscount: priceRequired("Net Discount amount"),

  orderQty: intRequired("Order quantity"),

  inHandQty: intRequired("In-hand quantity"),

  grnQty: intRequired("GRN quantity"),

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

  currencyId: idOptional("Currency Id"),

  conversionRate: Joi.when("currencyId", {
    is: Joi.exist().not(null),
    then: numberWithMaxDecimalsRequired("Conversion Rate"),
    otherwise: numberWithMaxDecimalsOptional("Conversion Rate"),
  }),

  supplierId: idRequired("Supplier ID"),

  ccId: idRequired("CC ID"),

  totalAmount: numberWithMaxDecimalsOptional("totalAmount"),

  discount: numberWithMaxDecimalsOptional("Discount"),

  discountMethod: enumRequired("Discount method", DiscMethod),

  netDiscount: intOptional("Discount amount"),

  netTotal: numberWithMaxDecimalsOptional("netTotal"),

  paidAmount: priceOptional("Paid amount"),

  paymentStatus: enumOptional("Payment Status", PAYMENT_STATUS),

  status: enumOptional("Status", RETURN_STS),

  tax: intOptional("Tax"),

  netTax: intRequired("Net tax"),

  goodReceiveReturnDetails: arrayRequired(
    "Good receive return details",
    grnReturnDetailSchema,
    1
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
    })
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
