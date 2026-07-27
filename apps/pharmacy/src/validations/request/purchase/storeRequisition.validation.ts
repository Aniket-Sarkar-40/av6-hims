import {
  CreateStoreRequisitionInput,
  StoreRequisitionDetailInput,
} from "@/types/purchase/storeRequisition.js";
import {
  STORE_REQ_ACK_STATUS,
  STORE_REQ_STATUS,
} from "@repo/db/generated/prisma/enums.js";
import Joi from "joi";
import {
  arrayRequired,
  boolRequired,
  dateOptional,
  enumOptional,
  idOptional,
  idRequired,
  intRequired,
  patternOptional,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

export const storeRequisitionDetailSchema =
  Joi.object<StoreRequisitionDetailInput>({
    id: idOptional("Id"),

    itemId: idRequired("Item Id"),

    itemCategoryId: idRequired("Item Category Id"),

    itemCategoryName: strRequired("Item Medicine Category"),

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

    warehouseInHandStock: intRequired("Warehouse in hand stock"),

    branchInHandStock: intRequired("Branch in hand stock"),

    comment: strOptional("Comment"),

    reqQuantity: intRequired("Requested Quantity"),
  });

export const storeRequisitionSchema = Joi.object<CreateStoreRequisitionInput>({
  id: idOptional("Id"),
  ccId: idRequired("CC Id"),
  requisitionFrom: idRequired("Requisition From"),

  branchId: idRequired("Branch Id"),

  warehouseId: idRequired("Warehouse Id"),

  storeReqStatus: enumOptional("Store Req Status", STORE_REQ_STATUS),

  storeReqAckStatus: enumOptional("Store Req Ack Status", STORE_REQ_ACK_STATUS),

  storeReqDetails: strOptional("Store Req Details"),

  storeRequisitionDetails: arrayRequired(
    "Store requisition details",
    storeRequisitionDetailSchema,
    1,
  ),
});

export const assignItemSchema = Joi.object({
  storeRequisitionDetailsId: idRequired("Store requisition details Id"),

  itemId: idRequired("Item Id"),

  itemStockId: idRequired("Item Stock Id"),

  assignedQty: intRequired("Assigned Quantity"),

  batchNo: strRequired("Batch No"),
  isFoc: boolRequired("isFoc"),

  expiryDate: dateOptional("Expiry Date"),
});

export const sentStoreReqSchema = Joi.object({
  storeReqId: idRequired("Store Req Id"),

  storeReqNo: strRequired("Store Req No"),

  ccId: idRequired("CC Id"),

  assignItems: arrayRequired("Assign Items", assignItemSchema, 1),
});

// ItemBatch schema
const itemBatchSchema = Joi.object({
  requisitionItemId: idRequired("Requisition Item Id"),

  acknowledgeQty: intRequired("Acknowledge Quantity", 0),

  batchNo: strRequired("Batch No"),

  isFoc: boolRequired("isFoc"),

  expiryDate: patternOptional("Expiry Date", /^\d{4}-\d{2}-\d{2}$/),
});

// AcknowledgeItem schema
const acknowledgeItemSchema = Joi.object({
  storeRequisitionDetailsId: idRequired("Store requisition details Id"),

  itemId: idRequired("Item Id"),

  totalAcknowledgeQty: intRequired("Total Acknowledge Quantity", 0),

  itemBatch: arrayRequired("Item Batch", itemBatchSchema, 1),
});

export const rejectStoreRequisitionSchema = Joi.object({
  id: idRequired("Id"),
  ccId: idRequired("CC Id"),
});

// AcknowledgeRequisition schema
export const acknowledgeRequisitionSchema = Joi.object({
  storeReqId: idRequired("Store Req Id"),

  storeReqNo: strRequired("Store Req No"),

  ccId: idRequired("CC Id"),

  acknowledgeItems: arrayRequired(
    "Acknowledge Items",
    acknowledgeItemSchema,
    1,
  ),
});

export const storeReqExcelFilterSchema = Joi.object({
  id: idRequired("Id"),

  staffId: idOptional("Staff Id"),

  branchId: idOptional("Branch Id"),

  warehouseId: idOptional("Warehouse Id"),

  startDate: dateOptional("Start Date"),

  endDate: dateOptional("End Date"),

  storeReqStatus: enumOptional("Store Req Status", STORE_REQ_STATUS),

  storeReqAckStatus: enumOptional("Store Req Ack Status", STORE_REQ_ACK_STATUS),
})
  .strict() // no type coercion
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
