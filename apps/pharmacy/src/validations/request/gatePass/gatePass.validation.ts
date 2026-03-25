import {
  CreateOrUpdateGatePassInput,
  GatePassFilter,
} from "@/types/gatePass/gatePass.js";
import { joiDecimalFromSettings } from "@/utils/commonCalculation.utils.js";
import { GPStatus, PMS_PRIORITY } from "@repo/db/generated/prisma/enums.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const gatePassSchema = Joi.object<CreateOrUpdateGatePassInput>({
  id: Joi.number().integer().optional().strict().messages({
    "number.base": "ID must be a number",
    "number.integer": "ID must be an integer",
  }),

  distributorId: Joi.number().integer().required().strict().messages({
    "number.base": "Distributor ID must be a number",
    "number.integer": "Distributor ID must be an integer",
    "any.required": "Distributor ID is required",
  }),

  warehouseId: Joi.number().integer().required().strict().messages({
    "number.base": "Warehouse ID must be a number",
    "number.integer": "Warehouse ID must be an integer",
    "any.required": "Warehouse ID is required",
  }),

  totalQuantity: Joi.number().required().integer().strict().messages({
    "number.base": "Total quantity must be a number",
    "any.required": "Total quantity is required",
  }),

  poNumber: Joi.string().required().messages({
    "string.base": "PO number must be a string",
    "any.required": "PO number is required",
  }),

  poDate: Joi.date().required().messages({
    "date.base": "PO date must be a valid date",
    "any.required": "PO date is required",
  }),

  boxCount: Joi.number().integer().required().strict().messages({
    "number.base": "Box count must be a number",
    "number.integer": "Box count must be an integer",
    "any.required": "Box count is required",
  }),

  billAmount: joiDecimalFromSettings({
    key: "grnPrecision",
    required: true,
  }).messages({
    "number.base": "Bill amount must be a number",
    "number.precision": "Bill amount must have {{#limit}} decimal places",
    "any.required": "Bill amount is required",
  }),

  invoiceNumber: Joi.string().optional().allow(null).messages({
    "string.base": "Invoice number must be a string",
  }),

  remarks: Joi.string().optional().allow(null).messages({
    "string.base": "Remarks must be a string",
  }),

  priority: Joi.string()
    .valid(...Object.values(PMS_PRIORITY))
    .optional()
    .allow(null)
    .messages({
      "any.only": `Priority must be one of ${Object.values(PMS_PRIORITY).join(", ")}`,
    }),
  status: Joi.string()
    .valid(...Object.values(GPStatus))
    .optional()
    .allow(null)
    .messages({
      "any.only": `Status must be one of ${Object.values(GPStatus).join(", ")}`,
    }),
});

export const validateGatePass = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = gatePassSchema.validate(req.body, {
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

export const gatePassSchemaUpdate = gatePassSchema.keys({
  id: Joi.number().integer().required().messages({
    "number.base": "ID must be a number",
    "number.integer": "ID must be an integer",
    "any.required": "ID is required",
  }),
});

export const validateGatePassUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = gatePassSchemaUpdate.validate(req.body, {
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

export const gatePassFilterSchema = Joi.object<GatePassFilter>({
  poNumber: Joi.string().trim().optional().messages({
    "string.base": `"poNumber" must be a string`,
  }),

  poDateStart: Joi.date().iso().optional().messages({
    "date.base": `"poDateStart" must be a valid ISO date`,
    "date.format": `"poDateStart" must be in YYYY-MM-DD format`,
  }),

  poDateEnd: Joi.date().iso().optional().messages({
    "date.base": `"poDateEnd" must be a valid ISO date`,
    "date.format": `"poDateEnd" must be in YYYY-MM-DD format`,
  }),

  status: Joi.string()
    .trim()
    .valid(...Object.values(GPStatus))
    .optional()
    .messages({
      "string.base": `"gender" must be a string`,
      "any.only": `"gender" must be one of [${Object.values(GPStatus).join(", ")}]`,
    }),
})
  .with("poDateEnd", "poDateStart")
  .custom((obj, helpers) => {
    if (obj.poDateStart && obj.poDateEnd && obj.poDateStart > obj.poDateEnd) {
      return helpers.error("date.range");
    }
    return obj;
  })
  .messages({
    "date.range": `"poDateStart" must be on or before "poDateEnd"`,
  });

export const validateGatePassFilter = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = gatePassFilterSchema.validate(req.body, {
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
