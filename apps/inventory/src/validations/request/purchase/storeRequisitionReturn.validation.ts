import {
  AcknowledgeRequisitionReturn,
  AcknowledgeReturnItem,
  AcknowledgeReturnItemBatch,
  ApproveReturnItem,
  ApproveReturnItemBatch,
  ApproveStoreReqReturnInput,
  CreateStoreRequisitionReturnInput,
  ItemBatch,
  RejectStoreRequisitionReturnInput,
  ReturnItem,
} from "@/types/purchase/storeRequisitionReturn.js";
import { STORE_REQ_STATUS } from "@repo/db/generated/prisma/enums.js";
import {
  arrayRequired,
  boolRequired,
  dateOptional,
  dateRequired,
  enumOptional,
  idOptional,
  idRequired,
  intRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

import Joi from "joi";

const itemBatchSchema = Joi.object<ItemBatch>({
  requisitionItemDetailsId: idRequired("Requisition Item Details Id"),
  returnQty: intRequired("Return Quantity"),
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
  comment: strOptional("Comment"),
});

const returnItemSchema = Joi.object<ReturnItem>({
  storeRequisitionDetailsId: idRequired("Store Requisition Details Id"),
  itemId: idRequired("Item Id"),
  requestedReturnQty: intRequired("Requested Return Quantity"),
  itemBatch: arrayRequired("Item Batch", itemBatchSchema, 1),
});

export const storeRequisitionReturnSchema =
  Joi.object<CreateStoreRequisitionReturnInput>({
    id: idOptional("Id"),

    requisitionFrom: idRequired("Requisition from"),
    storeRequisitionId: idRequired("Store Requisition Id"),
    ccId: idRequired("CC Id"),

    returnStatus: enumOptional("Return Status", STORE_REQ_STATUS),
    returnReason: strOptional("Return Reason"),
    returnDetails: strOptional("Return Details"),

    returnItems: arrayRequired("Return Items", returnItemSchema, 1),
  });

export const storeRequisitionReturnSchemaUpdate =
  storeRequisitionReturnSchema.keys({
    id: idRequired("Id"),
  });

export const rejectStoreRequisitionReturnSchema =
  Joi.object<RejectStoreRequisitionReturnInput>({
    id: idRequired("Id"),
    ccId: idRequired("CC Id"),
  });

const approveReturnItemBatchSchema = Joi.object<ApproveReturnItemBatch>({
  id: idRequired("Requisition Return Item Id"),
  returnQty: intRequired("Return Quantity"),
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
  comment: strOptional("Comment"),
});

const approveReturnItemSchema = Joi.object<ApproveReturnItem>({
  id: idRequired("Return Item Id"),
  itemId: idRequired("Item Id"),
  requestedReturnQty: intRequired("Requested Return Quantity"),
  itemBatch: arrayRequired("Item Batch", approveReturnItemBatchSchema, 1),
});

export const approveStoreReqReturnSchema =
  Joi.object<ApproveStoreReqReturnInput>({
    id: idRequired("Id"),
    ccId: idRequired("CC Id"),
    returnItems: arrayRequired("Return Items", approveReturnItemSchema, 1),
  });

const acknowledgeReturnItemBatchSchema = Joi.object<AcknowledgeReturnItemBatch>(
  {
    id: idRequired("Batch Id"),
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
    acknowledgedQty: intRequired("Acknowledged Quantity"),
  }
);

const acknowledgeReturnItemSchema = Joi.object<AcknowledgeReturnItem>({
  id: idRequired("Return Item Id"),
  itemId: idRequired("Item Id"),
  acknowledgedReturnQty: intRequired("Acknowledged Return Quantity"),
  itemBatch: arrayRequired("Item Batch", acknowledgeReturnItemBatchSchema, 1),
});

export const acknowledgeRequisitionReturnSchema =
  Joi.object<AcknowledgeRequisitionReturn>({
    id: idRequired("Requisition Return Id"),
    ccId: idRequired("CC Id"),
    acknowledgeItems: arrayRequired(
      "Acknowledge Items",
      acknowledgeReturnItemSchema,
      1
    ),
  });

export const validateStoreRequisitionReturn = validationHandler({
  schema: storeRequisitionReturnSchema,
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
