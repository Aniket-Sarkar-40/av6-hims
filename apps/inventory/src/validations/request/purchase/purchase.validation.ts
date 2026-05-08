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
  priceRequired,
  strOptional,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { PO_STATUS } from "@repo/db/generated/prisma/client";
import Joi from "joi";

export const purchaseOrderDetailSchema = Joi.object<PurchaseOrderDetails>({
  id: idOptional("Id"),

  itemId: idRequired("Item Id"),

  packingQty: strOptional("Packing quantity"),

  quantity: idRequired("Quantity"),

  receivedQty: idOptional("Received quantity").min(1),

  totalAmount: priceRequired("Total amount"),

  purchasedPrice: priceRequired("Purchased price"),
});

export const purchaseSchema = Joi.object<UpdatePurchaseOrder>({
  date: dateRequired("Date"),

  supplierId: idRequired("Supplier Id"),

  storeId: idOptional("Store Id"),

  ccId: idRequired("Cc Id"),

  grandTotal: priceRequired("Grand total"),

  status: enumOptional("Status", PO_STATUS),

  notes: strOptional("Notes"),

  currency: strOptional("Currency"),

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
