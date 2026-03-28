import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const itemBatchSchema = Joi.object({
  requisitionItemDetailsId: Joi.number().integer().required().messages({
    "any.required": "Requisition item details ID is required",
    "number.base": "Requisition item details ID must be a number",
    "number.integer": "Requisition item details ID must be an integer",
  }),
  returnQty: Joi.number().positive().required().messages({
    "any.required": "Return quantity is required",
    "number.base": "Return quantity must be a number",
    "number.positive": "Return quantity must be greater than 0",
  }),
  batchNo: Joi.string().trim().required().messages({
    "any.required": "Batch number is required",
    "string.base": "Batch number must be a string",
    "string.empty": "Batch number cannot be empty",
  }),
  expiryDate: Joi.date().iso().optional().messages({
    "date.base": "Expiry date must be a valid date",
    "date.format": "Expiry date must be in ISO format (YYYY-MM-DD)",
  }),
  isFoc: Joi.boolean().required().messages({
    "any.required": "isFoc flag is required",
    "boolean.base": "isFoc must be a boolean value",
  }),
  comment: Joi.string().allow("").optional(),
});

export const returnItemSchema = Joi.object({
  storeRequisitionDetailsId: Joi.number().integer().required().messages({
    "any.required": "Store requisition details ID is required",
    "number.base": "Store requisition details ID must be a number",
    "number.integer": "Store requisition details ID must be an integer",
  }),
  itemId: Joi.number().integer().required().messages({
    "any.required": "Item ID is required",
    "number.base": "Item ID must be a number",
    "number.integer": "Item ID must be an integer",
  }),
  requestedReturnQty: Joi.number().positive().required().messages({
    "any.required": "Requested return quantity is required",
    "number.base": "Requested return quantity must be a number",
    "number.positive": "Requested return quantity must be greater than 0",
  }),

  itemBatch: Joi.array().items(itemBatchSchema).min(1).required().messages({
    "array.base": "Item batch must be an array",
    "array.min": "At least one batch entry is required",
    "any.required": "Item batch is required",
  }),
});

export const createStoreRequisitionReturnSchema = Joi.object({
  requisitionFrom: Joi.number().integer().required().messages({
    "any.required": "Requisition from (user/staff ID) is required",
    "number.base": "Requisition from must be a number",
    "number.integer": "Requisition from must be an integer",
  }),
  storeRequisitionId: Joi.number().integer().required().messages({
    "any.required": "Store requisition ID is required",
    "number.base": "Store requisition ID must be a number",
    "number.integer": "Store requisition ID must be an integer",
  }),
  ccId: Joi.number().integer().required().messages({
    "any.required": "Warehouse (ccId) is required",
    "number.base": "ccId must be a number",
    "number.integer": "ccId must be an integer",
  }),
  returnStatus: Joi.string()
    .valid("Pending", "Approved", "Rejected", "Cancelled")
    .optional()
    .messages({
      "string.base": "Return status must be a string",
      "any.only":
        "Return status must be one of: Pending, Approved, Rejected, Cancelled",
    }),
  returnReason: Joi.string().allow("", null).optional(),
  returnDetails: Joi.string().allow("", null).optional(),
  returnItems: Joi.array().items(returnItemSchema).min(1).required().messages({
    "array.base": "Return items must be an array",
    "array.min": "At least one return item is required",
    "any.required": "Return items are required",
  }),
});

export const storeRequisitionReturnSchemaUpdate =
  createStoreRequisitionReturnSchema.keys({
    id: Joi.number().integer().required().messages({
      "number.base": "Id must be a number",
      "number.integer": "Id must be an integer",
      "any.required": "Id is required",
    }),
  });

export const rejectStoreRequisitionReturnSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "Id must be a number",
    "number.integer": "Id must be an integer",
    "any.required": "Id is required",
  }),
  ccId: Joi.number().integer().required().messages({
    "number.base": "CC Id must be a number",
    "number.integer": "C Id must be an integer",
    "any.required": "CC Id is required",
  }),
});

const approveReturnItemBatchSchema = Joi.object({
  id: Joi.number().required().messages({
    "number.base": "Requisition return item id must be a number",
    "any.required": "Requisition return item id is required",
  }),
  returnQty: Joi.number().min(0.0001).required().messages({
    "number.base": "Return quantity must be a number",
    "number.min": "Return quantity must be greater than 0",
    "any.required": "Return quantity is required",
  }),
  batchNo: Joi.string().trim().required().messages({
    "string.base": "Batch number must be a string",
    "string.empty": "Batch number cannot be empty",
    "any.required": "Batch number is required",
  }),
  expiryDate: Joi.string().isoDate().optional().allow(null).messages({
    "string.isoDate": "Expiry date must be in ISO format (YYYY-MM-DD)",
  }),
  isFoc: Joi.boolean().required().messages({
    "boolean.base": "isFoc must be true or false",
    "any.required": "isFoc is required",
  }),
  comment: Joi.string().trim().max(500).optional().allow(null, "").messages({
    "string.max": "Comment cannot exceed 500 characters",
  }),
});

const approveReturnItemSchema = Joi.object({
  id: Joi.number().required().messages({
    "number.base": "Return item ID must be a number",
    "any.required": "Return item ID is required",
  }),
  itemId: Joi.number().required().messages({
    "number.base": "Item ID must be a number",
    "any.required": "Item ID is required",
  }),
  requestedReturnQty: Joi.number().min(0.0001).required().messages({
    "number.base": "Requested return quantity must be a number",
    "number.min": "Requested return quantity must be greater than 0",
    "any.required": "Requested return quantity is required",
  }),
  itemBatch: Joi.array()
    .items(approveReturnItemBatchSchema)
    .min(1)
    .required()
    .messages({
      "array.base": "Item batch must be an array",
      "array.min": "At least one batch entry is required for each return item",
      "any.required": "Item batch is required",
    }),
});

export const approveStoreReqReturnSchema = Joi.object({
  id: Joi.number().required().messages({
    "number.base": "ID must be a number",
    "any.required": "ID is required",
  }),
  ccId: Joi.number().required().messages({
    "number.base": "Cost center ID must be a number",
    "any.required": "Cost center ID (ccId) is required",
  }),
  returnItems: Joi.array()
    .items(approveReturnItemSchema)
    .min(1)
    .required()
    .messages({
      "array.base": "Return items must be an array",
      "array.min": "At least one return item is required",
      "any.required": "Return items are required",
    }),
});

export const acknowledgeRequisitionReturnSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "any.required": "Requisition Return ID is required",
    "number.base": "Requisition Return ID must be a number",
    "number.integer": "Requisition Return ID must be an integer",
  }),

  ccId: Joi.number().integer().required().messages({
    "any.required": "Cost Center ID (ccId) is required",
    "number.base": "Cost Center ID must be a number",
    "number.integer": "Cost Center ID must be an integer",
  }),

  acknowledgeItems: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().required().messages({
          "any.required": "Return item ID is required",
          "number.base": "Return item ID must be a number",
          "number.integer": "Return item ID must be an integer",
        }),

        itemId: Joi.number().integer().required().messages({
          "any.required": "Item ID is required",
          "number.base": "Item ID must be a number",
          "number.integer": "Item ID must be an integer",
        }),

        acknowledgedQuantity: Joi.number().positive().required().messages({
          "any.required": "Acknowledged quantity is required",
          "number.base": "Acknowledged quantity must be a number",
          "number.positive": "Acknowledged quantity must be greater than 0",
        }),

        itemBatch: Joi.array()
          .items(
            Joi.object({
              id: Joi.number().integer().required().messages({
                "any.required": "Batch ID is required",
                "number.base": "Batch ID must be a number",
                "number.integer": "Batch ID must be an integer",
              }),

              batchNo: Joi.string().trim().required().messages({
                "any.required": "Batch number is required",
                "string.base": "Batch number must be a string",
                "string.empty": "Batch number cannot be empty",
              }),

              expiryDate: Joi.string().isoDate().optional().messages({
                "string.isoDate":
                  "Expiry date must be in ISO date format (YYYY-MM-DD)",
              }),

              isFoc: Joi.boolean().required().messages({
                "any.required": "isFoc flag is required",
                "boolean.base": "isFoc must be true or false",
              }),

              acknowledgeQty: Joi.number().min(0).required().messages({
                "any.required": "Acknowledge quantity is required",
                "number.base": "Acknowledge quantity must be a number",
                "number.min": "Acknowledge quantity cannot be negative",
              }),
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

export const validateStoreRequisitionReturn = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = createStoreRequisitionReturnSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: error.message,
        errors: error.details,
      }),
    );
  }

  next();
};

export const validateStoreRequisitionReturnUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = storeRequisitionReturnSchemaUpdate.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: error.message,
        errors: error.details,
      }),
    );
  }

  next();
};

export const validateStoreRequisitionReturnReject = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = rejectStoreRequisitionReturnSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: error.message,
        errors: error.details,
      }),
    );
  }

  next();
};

export const validateApproveStoreRequisitionReturn = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = approveStoreReqReturnSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: error.message,
        errors: error.details,
      }),
    );
  }

  next();
};

export const validateAcknowledgeStoreRequisitionReturn = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = acknowledgeRequisitionReturnSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: error.message,
        errors: error.details,
      }),
    );
  }

  next();
};
