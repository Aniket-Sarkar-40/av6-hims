import {
  arrayRequired,
  boolRequired,
  dateOptional,
  enumOptional,
  idRequired,
  intRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const itemBatchSchema = Joi.object({
  requisitionItemDetailsId: idRequired("Requisition Item Details Id"),
  returnQty: intRequired("Return Quantity", 0),
  batchNo: strRequired("Batch No"),
  expiryDate: dateOptional("Expiry Date").iso(),
  isFoc: boolRequired("isFoc"),
  comment: strOptional("Comment"),
});

export const returnItemSchema = Joi.object({
  storeRequisitionDetailsId: idRequired("Store requisition details Id"),
  itemId: idRequired("Item Id"),
  requestedReturnQty: intRequired("Requested Return Quantity", 0),

  itemBatch: arrayRequired("Item Batch", itemBatchSchema, 1),
});

export const createStoreRequisitionReturnSchema = Joi.object({
  requisitionFrom: idRequired("Requisition From (User/Staff) Id"),
  storeRequisitionId: idRequired("Store requisition Id"),
  ccId: idRequired("CC Id"),
  returnStatus: enumOptional("Return Status", {
    Pending: "Pending",
    Approved: "Approved",
    Rejected: "Rejected",
    Cancelled: "Cancelled",
  }),
  returnReason: strOptional("Return Reason"),
  returnDetails: strOptional("Return Details"),
  returnItems: arrayRequired("Return Items", returnItemSchema, 1),
});

export const storeRequisitionReturnSchemaUpdate =
  createStoreRequisitionReturnSchema.keys({
    id: idRequired("Id"),
  });

export const rejectStoreRequisitionReturnSchema = Joi.object({
  id: idRequired("Id"),
  ccId: idRequired("CC Id"),
});

const approveReturnItemBatchSchema = Joi.object({
  id: idRequired("Id"),
  returnQty: intRequired("Return Quantity", 0.0001),
  batchNo: strRequired("Batch No"),
  expiryDate: dateOptional("Expiry Date").iso(),
  isFoc: boolRequired("isFoc"),
  comment: strOptional("Comment", 500),
});

const approveReturnItemSchema = Joi.object({
  id: idRequired("Id"),
  itemId: idRequired("Item Id"),
  requestedReturnQty: intRequired("Requested Return Quantity", 0.0001),
  itemBatch: arrayRequired("Item Batch", approveReturnItemBatchSchema, 1),
});

export const approveStoreReqReturnSchema = Joi.object({
  id: idRequired("Id"),
  ccId: idRequired("CC Id"),
  returnItems: arrayRequired("Return Items", approveReturnItemSchema, 1),
});

export const acknowledgeRequisitionReturnSchema = Joi.object({
  id: idRequired("Id"),

  ccId: idRequired("CC Id"),

  acknowledgeItems: Joi.array()
    .items(
      Joi.object({
        id: idRequired("Id"),

        itemId: idRequired("Item Id"),

        acknowledgedQuantity: intRequired("Acknowledged Quantity", 0),

        itemBatch: Joi.array()
          .items(
            Joi.object({
              id: idRequired("Id"),

              batchNo: strRequired("Batch No"),

              expiryDate: dateOptional("Expiry Date"),

              isFoc: boolRequired("isFoc"),

              acknowledgeQty: intRequired("Acknowledge Quantity", 0),
            }),
          )
          .min(1)
          .required()
          .messages({
            "any.required":
              "At least one batch entry is required for each item",
            "array.base": "Item batch must be an array",
            "array.min": "Item batch must contain at least one batch entry",
          }),
      }),
    )
    .min(1)
    .required()
    .messages({
      "any.required": "At least one acknowledge item is required",
      "array.base": "Acknowledge items must be an array",
      "array.min": "There must be at least one acknowledge item",
    }),
});

export const validateStoreRequisitionReturn = validationHandler({
  schema: createStoreRequisitionReturnSchema,
});

export const validateStoreRequisitionReturnUpdate = validationHandler({
  schema: storeRequisitionReturnSchemaUpdate,
});

export const validateStoreRequisitionReturnReject = validationHandler({
  schema: rejectStoreRequisitionReturnSchema,
});

export const validateApproveStoreRequisitionReturn = validationHandler({
  schema: approveStoreReqReturnSchema,
});

export const validateAcknowledgeStoreRequisitionReturn = validationHandler({
  schema: acknowledgeRequisitionReturnSchema,
});
