import {
  CreateStoreRequisitionInput,
  StoreRequisitionDetailInput,
} from "@/types/purchase/storeRequisition.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import {
  STORE_REQ_ACK_STATUS,
  STORE_REQ_STATUS,
} from "@repo/db/generated/prisma/enums.js";
import { NextFunction, Request, Response } from "express";
import Joi, { ValidationErrorItem } from "joi";

export const storeRequisitionDetailSchema =
  Joi.object<StoreRequisitionDetailInput>({
    id: Joi.number().integer().optional().strict().messages({
      "number.base": "Id must be a number",
      "number.integer": "Id must be an integer",
    }),

    itemId: Joi.number().integer().required().strict().messages({
      "number.base": "Item Id must be a number",
      "number.integer": "Item Id must be an integer",
      "any.required": "Item Id is required",
    }),

    itemCategoryId: Joi.number().integer().required().strict().messages({
      "number.base": "Item Category Id must be a number",
      "number.integer": "Item Category Id must be an integer",
      "any.required": "Item Category Id is required",
    }),

    itemCategoryName: Joi.string().required().messages({
      "string.base": "Item Medicine Category must be a string",
      "any.required": "Item Medicine Category is required",
    }),

    medType: Joi.string().required().messages({
      "string.base": "Medicine Type must be a string",
      "any.required": "Medicine Type is required",
    }),

    medComp: Joi.string().required().messages({
      "string.base": "Medicine Composition must be a string",
      "any.required": "Medicine Composition is required",
    }),

    medUnit: Joi.string().required().messages({
      "string.base": "Medicine Unit must be a string",
      "any.required": "Medicine Unit is required",
    }),

    manufacturer: Joi.string().required().messages({
      "string.base": "Manufacturer must be a string",
      "any.required": "Manufacturer is required",
    }),

    packSize: Joi.string().required().messages({
      "string.base": "Pack Size must be a string",
      "any.required": "Pack Size is required",
    }),

    drugType: Joi.string().required().messages({
      "string.base": "Drug Type must be a string",
      "any.required": "Drug Type is required",
    }),

    medTypeId: Joi.number().integer().required().strict().messages({
      "number.base": "Medicine Type Id must be a number",
      "number.integer": "Medicine Type Id must be an integer",
      "any.required": "Medicine Type Id is required",
    }),

    medCompId: Joi.number().integer().required().strict().messages({
      "number.base": "Medicine Composition Id must be a number",
      "number.integer": "Medicine Composition Id must be an integer",
      "any.required": "Medicine Composition Id is required",
    }),

    medUnitId: Joi.number().integer().required().strict().messages({
      "number.base": "Medicine Unit Id must be a number",
      "number.integer": "Medicine Unit Id must be an integer",
      "any.required": "Medicine Unit Id is required",
    }),

    manufacturerId: Joi.number().integer().required().strict().messages({
      "number.base": "Manufacturer Id must be a number",
      "number.integer": "Manufacturer Id must be an integer",
      "any.required": "Manufacturer Id is required",
    }),

    packSizeId: Joi.number().integer().required().strict().messages({
      "number.base": "Pack Size Id must be a number",
      "number.integer": "Pack Size Id must be an integer",
      "any.required": "Pack Size Id is required",
    }),

    drugTypeId: Joi.number().integer().required().strict().messages({
      "number.base": "Drug Type Id must be a number",
      "number.integer": "Drug Type Id must be an integer",
      "any.required": "Drug Type Id is required",
    }),

    warehouseInHandStock: Joi.number().required().strict().messages({
      "number.base": "Warehouse in hand stock must be a number",
      "number.integer": "Warehouse in hand stock must be an integer",
      "any.required": "Warehouse in hand stock is required",
    }),

    branchInHandStock: Joi.number().required().strict().messages({
      "number.base": "Branch in hand stock must be a number",
      "number.integer": "Branch in hand stock must be an integer",
      "any.required": "Branch in hand stock is required",
    }),

    comment: Joi.string().optional().allow(null, "").strict().messages({
      "string.base": "Item Medicine Category must be a string",
      "any.required": "Item Medicine Category is required",
    }),

    reqQuantity: Joi.number().required().integer().strict().messages({
      "number.base": "Requested quantity must be a number",
      // "number.max": "Requested quantity cannot exceed available warehouse stock",
      "any.required": "Requested quantity is required",
    }),
  });

export const storeRequisitionSchema = Joi.object<CreateStoreRequisitionInput>({
  id: Joi.number().integer().optional().strict().messages({
    "number.base": "Id must be a number",
    "number.integer": "Id must be an integer",
  }),
  ccId: Joi.number().integer().required().strict().messages({
    "number.base": "CC Id must be a number",
    "number.integer": "CC Id must be an integer",
    "any.required": "CC Id is required",
  }),
  requisitionFrom: Joi.number().integer().required().strict().messages({
    "number.base": "Requisition from must be a number",
    "number.integer": "Requisition from must be an integer",
    "any.required": "Requisition from is required",
  }),

  branchId: Joi.number().integer().required().strict().messages({
    "number.base": "Branch Id must be a number",
    "number.integer": "Branch Id must be an integer",
    "any.required": "Branch Id is required",
  }),

  warehouseId: Joi.number().integer().required().strict().messages({
    "number.base": "Warehouse Id must be a number",
    "number.integer": "Warehouse Id must be an integer",
    "any.required": "Warehouse Id is required",
  }),

  storeReqStatus: Joi.string()
    .valid(...Object.values(STORE_REQ_STATUS))
    .optional()
    .messages({
      "string.base": "Store Req Status must be a string",
      "any.only": `Store Req Status must be one of ${Object.values(STORE_REQ_STATUS).join(", ")}`,
    }),

  storeReqAckStatus: Joi.string()
    .valid(...Object.values(STORE_REQ_ACK_STATUS))
    .optional()
    .messages({
      "string.base": "Store Req Acknowledgement Status must be a string",
      "any.only": `Store Req Acknowledgement Status must be one of ${Object.values(STORE_REQ_ACK_STATUS).join(", ")}`,
    }),

  storeReqDetails: Joi.string().optional().allow(null).messages({
    "string.base": "Store Req Details must be a string",
  }),

  storeRequisitionDetails: Joi.array()
    .items(storeRequisitionDetailSchema)
    .min(1)
    .required()
    .messages({
      "array.base": "Store Requisition Details must be an array",
      "array.min": "At least one Store Requisition Details is required",
      "any.required": "Store Requisition Details is required",
    }),
});

export const assignItemSchema = Joi.object({
  storeRequisitionDetailsId: Joi.number().integer().required().messages({
    "number.base": "Store Requisition Details Id must be a number",
    "any.required": "Store Requisition Details Id is required",
  }),

  itemId: Joi.number().integer().required().messages({
    "number.base": "Item Id must be a number",
    "any.required": "Item Id is required",
  }),

  itemStockId: Joi.number().integer().required().messages({
    "number.base": "Item Stock Id must be a number",
    "any.required": "Item Stock Id is required",
  }),

  assignedQty: Joi.number().positive().required().messages({
    "number.base": "Assigned Quantity must be a number",
    "number.positive": "Assigned Quantity must be greater than 0",
    "any.required": "Assigned Quantity is required",
  }),

  batchNo: Joi.string().trim().required().messages({
    "string.base": "Batch No must be a string",
    "any.required": "Batch No is required",
  }),
  isFoc: Joi.boolean().required().messages({
    "boolean.base": "isFoc must be a boolean",
    "any.required": "isFoc is required",
  }),

  expiryDate: Joi.date().optional().messages({
    "date.base": "Expiry Date must be a valid date",
  }),
});

export const sentStoreReqSchema = Joi.object({
  storeReqId: Joi.number().integer().required().messages({
    "number.base": "Store Req Id must be a number",
    "any.required": "Store Req Id is required",
  }),

  storeReqNo: Joi.string().trim().required().messages({
    "string.base": "Store Req No must be a string",
    "any.required": "Store Req No is required",
  }),

  ccId: Joi.number().integer().required().messages({
    "number.base": "CC Id must be a number",
    "any.required": "CC Id is required",
  }),

  assignItems: Joi.array().items(assignItemSchema).min(1).required().messages({
    "array.base": "Assign Items must be an array",
    "array.min": "Assign Items must contain at least one item",
    "any.required": "Assign Items is required",
  }),
});

// ItemBatch schema
const itemBatchSchema = Joi.object({
  requisitionItemId: Joi.number().integer().required().messages({
    "number.base": "Requisition Item Id must be a number",
    "any.required": "Requisition Item Id is required",
  }),

  acknowledgeQty: Joi.number().min(0).required().messages({
    "number.base": "Acknowledge Quantity must be a number",
    "number.positive": "Acknowledge Quantity will be at least 0",
    "any.required": "Acknowledge Quantity is required",
  }),

  batchNo: Joi.string().trim().required().messages({
    "string.base": "Batch No must be a string",
    "any.required": "Batch No is required",
  }),

  isFoc: Joi.boolean().required().messages({
    "boolean.base": "isFoc must be a boolean",
    "any.required": "isFoc is required",
  }),

  expiryDate: Joi.string()
    .optional()
    .pattern(/^\d{4}-\d{2}-\d{2}$/) // optional date in 'YYYY-MM-DD' format
    .messages({
      "string.pattern.base":
        "Expiry Date must be a valid date in YYYY-MM-DD format",
    }),
});

// AcknowledgeItem schema
const acknowledgeItemSchema = Joi.object({
  storeRequisitionDetailsId: Joi.number().integer().required().messages({
    "number.base": "Store Requisition Details Id must be a number",
    "any.required": "Store Requisition Details Id is required",
  }),

  itemId: Joi.number().integer().required().messages({
    "number.base": "Item Id must be a number",
    "any.required": "Item Id is required",
  }),

  totalAcknowledgeQty: Joi.number().positive().required().messages({
    "number.base": "Total Acknowledge Quantity must be a number",
    "number.positive": "Total Acknowledge Quantity must be greater than 0",
    "any.required": "Total Acknowledge Quantity is required",
  }),

  itemBatch: Joi.array().items(itemBatchSchema).min(1).required().messages({
    "array.base": "Item Batch must be an array",
    "array.min": "Item Batch must contain at least one item",
    "any.required": "Item Batch is required",
  }),
});

export const rejectStoreRequisitionSchema = Joi.object({
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

// AcknowledgeRequisition schema
export const acknowledgeRequisitionSchema = Joi.object({
  storeReqId: Joi.number().integer().required().messages({
    "number.base": "Store Req Id must be a number",
    "any.required": "Store Req Id is required",
  }),

  storeReqNo: Joi.string().trim().required().messages({
    "string.base": "Store Req No must be a string",
    "any.required": "Store Req No is required",
  }),

  ccId: Joi.number().integer().required().messages({
    "number.base": "CC Id must be a number",
    "any.required": "CC Id is required",
  }),

  acknowledgeItems: Joi.array()
    .items(acknowledgeItemSchema)
    .min(1)
    .required()
    .messages({
      "array.base": "Acknowledge Items must be an array",
      "array.min": "Acknowledge Items must contain at least one item",
      "any.required": "Acknowledge Items is required",
    }),
});

export const storeReqExcelFilterSchema = Joi.object({
  id: Joi.number().integer().positive().optional().messages({
    "number.base": `Id must be a number`,
    "number.integer": `Id must be an integer`,
    "number.positive": `Id must be a positive number`,
  }),

  staffId: Joi.number().integer().positive().optional().messages({
    "number.base": `Staff id must be a number`,
    "number.integer": `Staff id must be an integer`,
    "number.positive": `Staff id must be a positive number`,
  }),

  branchId: Joi.number().integer().positive().optional().messages({
    "number.base": `Branch id must be a number`,
    "number.integer": `Branch id must be an integer`,
    "number.positive": `Branch id must be a positive number`,
  }),

  warehouseId: Joi.number().integer().positive().optional().messages({
    "number.base": `Warehouse id must be a number`,
    "number.integer": `Warehouse id must be an integer`,
    "number.positive": `Warehouse id must be a positive number`,
  }),

  startDate: Joi.string().isoDate().optional().messages({
    "string.base": `Start date must be a string`,
    "string.isoDate": `Start date must be in ISO 8601 date format (YYYY-MM-DD)`,
  }),

  endDate: Joi.string().isoDate().optional().messages({
    "string.base": `End date must be a string`,
    "string.isoDate": `End date must be in ISO 8601 date format (YYYY-MM-DD)`,
  }),

  storeReqStatus: Joi.string()
    .valid(...Object.values(STORE_REQ_STATUS))
    .optional()
    .messages({
      "any.only": `Store requisition status must be one of ${Object.values(STORE_REQ_STATUS).join(", ")}`,
    }),

  storeReqAckStatus: Joi.string()
    .valid(...Object.values(STORE_REQ_ACK_STATUS))
    .optional()
    .messages({
      "any.only": `Store requisition acknowledge status must be one of ${Object.values(STORE_REQ_ACK_STATUS).join(", ")}`,
    }),
})
  .strict() // no type coercion
  .unknown(false) // disallow unknown keys
  .messages({
    "object.unknown": `"{{#label}}" is not allowed`,
  });

export const validateStoreRequisition = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = storeRequisitionSchema.validate(req.body, {
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

export const validateStoreRequisitionReject = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = rejectStoreRequisitionSchema.validate(req.body, {
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

export const storeRequisitionSchemaUpdate = storeRequisitionSchema.keys({
  id: Joi.number().integer().required().messages({
    "number.base": "Id must be a number",
    "number.integer": "Id must be an integer",
    "any.required": "Id is required",
  }),
});

export const validateStoreRequisitionUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = storeRequisitionSchemaUpdate.validate(req.body, {
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

export const validateSentStoreRequisition = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = sentStoreReqSchema.validate(req.body, {
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

export const validateAcknowledgeStoreRequisition = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = acknowledgeRequisitionSchema.validate(req.body, {
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

export const validateExcelFilterStoreRequisition = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = storeReqExcelFilterSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const messages = (error.details as ValidationErrorItem[])
      .map((d) => d.message.replace(/['"]/g, ""))
      .join(", ");
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: messages,
        errors: error.details,
      }),
    );
  }

  next();
};
