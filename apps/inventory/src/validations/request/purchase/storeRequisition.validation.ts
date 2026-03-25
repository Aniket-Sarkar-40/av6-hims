import {
  AcknowledgeRequisition,
  CreateStoreRequisitionInput,
  ItemBatch,
  StoreRequisitionDetailInput,
} from "@/types/purchase/storeRequisition.js";
import {
  arrayRequired,
  boolRequired,
  dateOptional,
  dateRequired,
  enumOptional,
  idOptional,
  idRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import {
  STORE_REQ_ACK_STATUS,
  STORE_REQ_STATUS,
} from "@repo/db/generated/prisma/client";
import Joi from "joi";

export const storeRequisitionDetailSchema =
  Joi.object<StoreRequisitionDetailInput>({
    id: idOptional("Id"),

    itemId: idRequired("Item Id"),

    warehouseInHandStock: idRequired("Warehouse in hand stock"),

    branchInHandStock: idRequired("Branch in hand stock"),

    userInHandStock: idRequired("User in hand stock"),

    comment: strOptional("Comment"),

    reqQuantity: idRequired("Requested quantity"),
  });

export const storeRequisitionSchema = Joi.object<CreateStoreRequisitionInput>({
  id: idOptional("Id"),

  ccId: idRequired("CC Id"),
  requisitionFrom: idRequired("Requisition from"),

  storeReqStatus: enumOptional("Store Req Status", STORE_REQ_STATUS),

  storeReqAckStatus: enumOptional(
    "Store Req Acknowledgement Status",
    STORE_REQ_ACK_STATUS,
  ),

  storeReqDetails: strOptional("Store Req Details"),

  storeRequisitionDetails: arrayRequired(
    "Store Requisition Details",
    storeRequisitionDetailSchema,
    1,
  ),
});

export const assignItemSchema = Joi.object({
  storeRequisitionDetailsId: idRequired("Store Requisition Details Id"),

  itemId: idRequired("Item Id"),

  itemStockId: idRequired("Item Stock Id"),

  assignedQty: idRequired("Assigned Quantity"),

  batchNo: Joi.when("isBatch", {
    is: true,
    then: strRequired("Batch number"),
    otherwise: strOptional("Batch number"),
  }),
  isFoc: boolRequired("isFoc"),

  expiryDate: Joi.when("isExpiry", {
    is: true,
    then: dateRequired("Expiry date"),
    otherwise: dateOptional("Expiry date"),
  }),

  isBatch: boolRequired("Is Batch"),

  isExpiry: boolRequired("Is Expiry"),
});

export const sentStoreReqSchema = Joi.object({
  storeReqId: idRequired("Store Req Id"),

  storeReqNo: strRequired("Store Req No"),

  ccId: idRequired("CC Id"),

  assignItems: arrayRequired("Assign Items", assignItemSchema, 1),
});

// ItemBatch schema
const itemBatchSchema = Joi.object<ItemBatch>({
  requisitionItemId: idRequired("Requisition Item Id"),

  acknowledgeQty: idRequired("Acknowledge Quantity"),

  batchNo: Joi.when("isBatch", {
    is: true,
    then: strRequired("Batch number"),
    otherwise: strOptional("Batch number"),
  }),

  isFoc: boolRequired("isFoc"),

  expiryDate: Joi.when("isExpiry", {
    is: true,
    then: dateRequired("Expiry date"),
    otherwise: dateOptional("Expiry date"),
  }),

  isBatch: boolRequired("Is Batch"),

  isExpiry: boolRequired("Is Expiry"),
});

// AcknowledgeItem schema
const acknowledgeItemSchema = Joi.object({
  storeRequisitionDetailsId: idRequired("Store Requisition Details Id"),

  itemId: idRequired("Item Id"),

  totalAcknowledgeQty: idRequired("Total Acknowledge Quantity"),

  itemBatch: arrayRequired("Item Batch", itemBatchSchema, 1),
});

export const rejectStoreRequisitionSchema = Joi.object({
  id: idRequired("Id"),
  ccId: idRequired("CC Id"),
});

// AcknowledgeRequisition schema
export const acknowledgeRequisitionSchema = Joi.object<AcknowledgeRequisition>({
  storeReqId: idRequired("Store Req Id"),

  storeReqNo: strRequired("Store Req No"),

  ccId: idRequired("CC Id"),

  acknowledgeItems: arrayRequired(
    "Acknowledge Items",
    acknowledgeItemSchema,
    1,
  ),
  requisitionFrom: idRequired("Store Req Id"),
});

export const storeReqExcelFilterSchema = Joi.object({
  id: idOptional("Id"),

  staffId: idOptional("Staff id"),

  branchId: idOptional("Branch id"),

  warehouseId: idOptional("Warehouse id"),

  startDate: dateOptional("Start date"),

  endDate: dateOptional("End date"),

  storeReqStatus: enumOptional("Store requisition status", STORE_REQ_STATUS),

  storeReqAckStatus: enumOptional(
    "Store requisition acknowledge status",
    STORE_REQ_ACK_STATUS,
  ),
})
  .unknown(false) // disallow unknown keys
  .messages({
    "object.unknown": `"{{#label}}" is not allowed`,
  });

export const validateStoreRequisition = validationHandler({
  schema: storeRequisitionSchema,
});

export const validateStoreRequisitionReject = validationHandler({
  schema: rejectStoreRequisitionSchema,
});

export const storeRequisitionSchemaUpdate = storeRequisitionSchema.keys({
  id: idRequired("Id"),
});

export const validateStoreRequisitionUpdate = validationHandler({
  schema: storeRequisitionSchemaUpdate,
});

export const validateSentStoreRequisition = validationHandler({
  schema: sentStoreReqSchema,
});

export const validateAcknowledgeStoreRequisition = validationHandler({
  schema: acknowledgeRequisitionSchema,
});

export const validateExcelFilterStoreRequisition = validationHandler({
  schema: storeReqExcelFilterSchema,
});
