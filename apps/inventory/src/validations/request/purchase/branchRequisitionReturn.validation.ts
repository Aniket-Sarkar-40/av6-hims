import {
  AcknowledgeBranchRequisitionReturn,
  AcknowledgeBranchReturnItem,
  AcknowledgeBranchReturnItemBatch,
  ApproveBranchReqReturnInput,
  ApproveBranchReturnItem,
  ApproveBranchReturnItemBatch,
  BranchReturnItem,
  BranchReturnItemBatch,
  CreateBranchRequisitionReturnInput,
  RejectBranchRequisitionReturnInput,
} from "@/types/purchase/branchRequisitionReturn.js";
import { STORE_REQ_STATUS } from "@repo/db/generated/prisma/enums.js";
import {
  arrayRequired,
  boolRequired,
  dateOptional,
  dateRequired,
  enumOptional,
  idRequired,
  intRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

const branchReturnItemBatchSchema = Joi.object<BranchReturnItemBatch>({
  branchItemDetailsId: idRequired("Branch Item Details Id"),

  returnQty: intRequired("Return Quantity"),

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

  isFoc: boolRequired("isFoc"),

  isBatch: boolRequired("Is Batch"),

  isExpiry: boolRequired("Is Expiry"),

  comment: strOptional("Comment"),
});

const branchReturnItemSchema = Joi.object<BranchReturnItem>({
  branchRequisitionDetailsId: idRequired("Branch Requisition Details Id"),

  itemId: idRequired("Item Id"),

  requestedReturnQty: intRequired("Requested Return Quantity"),

  itemBatch: arrayRequired("Item Batch", branchReturnItemBatchSchema, 1),
});

export const branchRequisitionReturnSchema =
  Joi.object<CreateBranchRequisitionReturnInput>({
    requisitionFrom: idRequired("Requisition From"),

    branchRequisitionId: idRequired("Branch Requisition Id"),

    branchId: idRequired("Branch Id"),

    returnStatus: enumOptional("Return Status", STORE_REQ_STATUS),

    returnReason: strOptional("Return Reason"),

    returnDetails: strOptional("Return Details"),

    returnItems: arrayRequired("Return Items", branchReturnItemSchema, 1),
  });

export const branchRequisitionReturnSchemaUpdate =
  branchRequisitionReturnSchema.keys({
    id: idRequired("Id"),
  });

export const rejectBranchRequisitionReturnSchema =
  Joi.object<RejectBranchRequisitionReturnInput>({
    id: idRequired("Id"),
    branchId: idRequired("Branch Id"),
  });

const approveBranchReturnItemBatchSchema =
  Joi.object<ApproveBranchReturnItemBatch>({
    id: idRequired("Branch Return Item Batch Id"),

    returnQty: intRequired("Return Quantity"),

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

    isFoc: boolRequired("isFoc"),

    isBatch: boolRequired("Is Batch"),

    isExpiry: boolRequired("Is Expiry"),

    comment: strOptional("Comment"),
  });

const approveBranchReturnItemSchema = Joi.object<ApproveBranchReturnItem>({
  id: idRequired("Branch Requisition Return Details Id"),

  itemId: idRequired("Item Id"),

  requestedReturnQty: intRequired("Requested Return Quantity"),

  itemBatch: arrayRequired("Item Batch", approveBranchReturnItemBatchSchema, 1),
});

export const approveBranchReqReturnSchema =
  Joi.object<ApproveBranchReqReturnInput>({
    id: idRequired("Id"),

    branchId: idRequired("Branch Id"),

    returnItems: arrayRequired(
      "Return Items",
      approveBranchReturnItemSchema,
      1
    ),
  });

const acknowledgeBranchReturnItemBatchSchema =
  Joi.object<AcknowledgeBranchReturnItemBatch>({
    id: idRequired("Branch Return Item Batch Id"),

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

    isFoc: boolRequired("isFoc"),

    isBatch: boolRequired("Is Batch"),

    isExpiry: boolRequired("Is Expiry"),

    acknowledgedQty: intRequired("Acknowledged Quantity"),
  });

const acknowledgeBranchReturnItemSchema =
  Joi.object<AcknowledgeBranchReturnItem>({
    id: idRequired("Branch Requisition Return Details Id"),

    itemId: idRequired("Item Id"),

    acknowledgedReturnQty: intRequired("Acknowledged Return Quantity"),

    itemBatch: arrayRequired(
      "Item Batch",
      acknowledgeBranchReturnItemBatchSchema,
      1
    ),
  });

export const acknowledgeBranchRequisitionReturnSchema =
  Joi.object<AcknowledgeBranchRequisitionReturn>({
    id: idRequired("Branch Requisition Return Id"),

    ccId: idRequired("Warehouse Id"),

    acknowledgeItems: arrayRequired(
      "Acknowledge Items",
      acknowledgeBranchReturnItemSchema,
      1
    ),
  });

export const validateBranchRequisitionReturn = validationHandler({
  schema: branchRequisitionReturnSchema,
});

export const validateBranchRequisitionReturnUpdate = validationHandler({
  schema: branchRequisitionReturnSchemaUpdate,
});

export const validateBranchRequisitionReturnReject = validationHandler({
  schema: rejectBranchRequisitionReturnSchema,
});

export const validateApproveBranchRequisitionReturn = validationHandler({
  schema: approveBranchReqReturnSchema,
});

export const validateAcknowledgeBranchRequisitionReturn = validationHandler({
  schema: acknowledgeBranchRequisitionReturnSchema,
});
