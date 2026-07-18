import {
  AcknowledgeBranchRequisition,
  BranchItemBatch,
  BranchRequisitionDetailInput,
  CreateBranchRequisitionInput,
} from "@/types/purchase/branchRequisition.js";
import {
  STORE_REQ_ACK_STATUS,
  STORE_REQ_STATUS,
} from "@repo/db/generated/prisma/enums.js";
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

export const branchRequisitionDetailSchema =
  Joi.object<BranchRequisitionDetailInput>({
    id: idOptional("Id"),

    itemId: idRequired("Item Id"),

    warehouseInHandStock: intRequired("Warehouse in hand stock"),

    branchInHandStock: intRequired("Branch in hand stock"),

    comment: strOptional("Comment"),

    reqQuantity: intRequired("Requested quantity"),
  });

export const branchRequisitionSchema = Joi.object<CreateBranchRequisitionInput>(
  {
    id: idOptional("Id"),

    ccId: idRequired("Warehouse Id"),

    locationId: idRequired("Location Id"),

    branchId: idRequired("Branch Id"),

    requisitionFrom: idRequired("Requisition From"),

    branchReqStatus: enumOptional("Branch Req Status", STORE_REQ_STATUS),

    branchReqAckStatus: enumOptional(
      "Branch Req Acknowledgement Status",
      STORE_REQ_ACK_STATUS,
    ),

    branchReqDetails: strOptional("Branch Req Details"),

    branchRequisitionDetails: arrayRequired(
      "Branch Requisition Details",
      branchRequisitionDetailSchema,
      1,
    ),
  },
);

export const branchRequisitionSchemaUpdate = branchRequisitionSchema.keys({
  id: idRequired("Id"),
});

export const rejectBranchRequisitionSchema = Joi.object({
  id: idRequired("Id"),

  ccId: idRequired("Warehouse Id"),
});

export const assignBranchItemSchema = Joi.object({
  branchRequisitionDetailsId: idRequired("Branch Requisition Details Id"),

  itemId: idRequired("Item Id"),

  itemStockId: idRequired("Item Stock Id"),

  assignedQty: intRequired("Assigned Quantity"),

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

export const approveBranchReqSchema = Joi.object({
  branchReqId: idRequired("Branch Req Id"),

  brNumber: strRequired("Branch Req No"),

  ccId: idRequired("Warehouse Id"),

  assignItems: arrayRequired("Assign Items", assignBranchItemSchema, 1),
});

const branchItemBatchSchema = Joi.object<BranchItemBatch>({
  branchItemId: idRequired("Branch Item Id"),

  acknowledgeQty: intRequired("Acknowledge Quantity"),

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

const acknowledgeBranchItemSchema = Joi.object({
  branchRequisitionDetailsId: idRequired("Branch Requisition Details Id"),

  itemId: idRequired("Item Id"),

  totalAcknowledgeQty: intRequired("Total Acknowledge Quantity"),

  itemBatch: arrayRequired("Item Batch", branchItemBatchSchema, 1),
});

export const acknowledgeBranchRequisitionSchema =
  Joi.object<AcknowledgeBranchRequisition>({
    branchReqId: idRequired("Branch Req Id"),

    brNumber: strRequired("Branch Req No"),

    branchId: idRequired("Branch Id"),

    acknowledgeItems: arrayRequired(
      "Acknowledge Items",
      acknowledgeBranchItemSchema,
      1,
    ),
  });

export const validateBranchRequisition = validationHandler({
  schema: branchRequisitionSchema,
});

export const validateBranchRequisitionReject = validationHandler({
  schema: rejectBranchRequisitionSchema,
});

export const validateBranchRequisitionUpdate = validationHandler({
  schema: branchRequisitionSchemaUpdate,
});

export const validateApproveBranchRequisition = validationHandler({
  schema: approveBranchReqSchema,
});

export const validateAcknowledgeBranchRequisition = validationHandler({
  schema: acknowledgeBranchRequisitionSchema,
});
