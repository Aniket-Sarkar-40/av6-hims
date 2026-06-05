import {
  PurchaseOrderDetails,
  UpdatePurchaseOrder,
} from "@/types/purchase/purchase.js";
import {
  arrayRequired,
  dateRequired,
  enumOptional,
  idOptional,
  idRequired,
  numberWithMaxDecimalsOptional,
  numberWithMaxDecimalsRequired,
  priceRequired,
  strOptional,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { PO_STATUS } from "@repo/db/generated/prisma/client";
import Joi from "joi";
import { getSchemaPrecision } from "@/utils/schema.utils.js";

export const purchaseOrderDetailSchema = Joi.object<PurchaseOrderDetails>({
  id: idOptional("Id"),

  itemId: idRequired("Item Id"),

  packingQty: strOptional("Packing quantity"),

  quantity: idRequired("Quantity"),

  receivedQty: idOptional("Received quantity").min(1),

  totalAmount: priceRequired("Total amount", () => getSchemaPrecision("po")),

  purchasedPrice: priceRequired("Purchased price", () =>
    getSchemaPrecision("po")
  ),
});

export const purchaseSchema = Joi.object<UpdatePurchaseOrder>({
  date: dateRequired("Date"),

  supplierId: idRequired("Supplier Id"),

  storeId: idOptional("Store Id"),

  ccId: idRequired("Cc Id"),

  grandTotal: numberWithMaxDecimalsRequired("Grand total", () =>
    getSchemaPrecision("po")
  ),

  status: enumOptional("Status", PO_STATUS),

  notes: strOptional("Notes"),

  currencyId: idOptional("Currency Id"),

  conversionRate: Joi.when("currencyId", {
    is: Joi.exist().not(null),
    then: numberWithMaxDecimalsRequired("Conversion Rate", () =>
      getSchemaPrecision("po")
    ),
    otherwise: numberWithMaxDecimalsOptional("Conversion Rate", () =>
      getSchemaPrecision("po")
    ),
  }),

  paymentTerms: strOptional("Payment terms"),

  purchaseOrderDetails: arrayRequired(
    "Purchase order",
    purchaseOrderDetailSchema,
    1
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
