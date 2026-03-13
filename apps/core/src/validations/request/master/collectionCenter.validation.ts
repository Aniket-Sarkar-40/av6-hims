import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { getPattern } from "av6-utils";
import { CollectionCenter } from "@repo/db/generated/prisma/client";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const collectionCenterSchema = Joi.object<CollectionCenter>({
  id: Joi.number().integer().optional().messages({
    "number.base": "ID must be a number",
    "number.integer": "ID must be an integer",
  }),

  colName: Joi.string().required().min(2).messages({
    "string.base": "Name must be a string",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string",
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required",
  }),

  phone: Joi.string()
    .required()
    .pattern(getPattern.phonePattern!)
    .strict()
    .messages({
      "number.base": "Phone must be a number",
      "number.integer": "Phone must be an integer",
      "any.required": "Phone is required",
    }),

  address: Joi.string().required().messages({
    "string.base": "Address must be a string",
    "string.empty": "Address cannot be empty",
    "any.required": "Address is required",
  }),

  dateFormat: Joi.string().required().messages({
    "string.base": "Date format must be a string",
    "string.empty": "Date format cannot be empty",
    "any.required": "Date format is required",
  }),
  langId: Joi.number().integer().required().strict().messages({
    "number.base": "Language Id must be a number",
    "number.integer": "Language Id must be an integer",
    "any.required": "Language Id is required",
  }),

  timeFormat: Joi.string().required().messages({
    "string.base": "Time format must be a string",
    "string.empty": "Time format cannot be empty",
    "any.required": "Time format is required",
  }),

  currency: Joi.string().uppercase().length(3).required().messages({
    "string.base": "Currency must be a string",
    "string.length": "Currency must be a 3-letter ISO code (e.g., USD)",
    "any.required": "Currency is required",
  }),

  currencySymbol: Joi.string().required().messages({
    "string.base": "Currency symbol must be a string",
    "string.empty": "Currency symbol cannot be empty",
    "any.required": "Currency symbol is required",
  }),

  timezone: Joi.string().required().messages({
    "string.base": "Timezone must be a string",
    "string.empty": "Timezone cannot be empty",
    "any.required": "Timezone is required",
  }),

  testPrefix: Joi.string().required().messages({
    "string.base": "Test prefix must be a string",
    "string.empty": "Test prefix cannot be empty",
    "any.required": "Test prefix is required",
  }),

  barcodePrefix: Joi.string().required().messages({
    "string.base": "Barcode prefix must be a string",
    "string.empty": "Barcode prefix cannot be empty",
    "any.required": "Barcode prefix is required",
  }),

  invoicePrefix: Joi.string().required().messages({
    "string.base": "Invoice prefix must be a string",
    "string.empty": "Invoice prefix cannot be empty",
    "any.required": "Invoice prefix is required",
  }),

  diseCode: Joi.string().required().messages({
    "string.base": "Dise code must be a string",
    "string.empty": "Dise code cannot be empty",
    "any.required": "Dise code is required",
  }),

  disabledBy: Joi.string().optional().allow(null, "").messages({
    "string.base": "Disabled By must be a string",
  }),

  collectionAbbreviationName: Joi.string().optional().allow(null, "").messages({
    "string.base": "Collection abbreviation name must be a string",
  }),

  connectionCode: Joi.string().required().messages({
    "string.base": "Connection code must be a string",
    "any.required": "Connection code is required",
  }),

  barcodePrinterName: Joi.string().optional().allow(null, "").messages({
    "string.base": "Barcode printer name must be a string",
  }),

  disabledOn: Joi.date().iso().optional().allow(null).messages({
    "date.base": "Disabled On must be a valid ISO date",
    "date.format": "Disabled On must be in ISO 8601 format",
  }),

  isSubOrganization: Joi.boolean().optional().messages({
    "boolean.base": "Is Sub Organization must be a boolean",
  }),
});

export const validateCollectionCenter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = collectionCenterSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: error.message,
        errors: error.details,
      })
    );
  }

  next();
};
export const collectionCenterSchemaUpdate = Joi.object<CollectionCenter>({
  id: Joi.number().required().messages({
    "number.base": "ID must be a number",
  }),

  colName: Joi.string().required().min(2).messages({
    "string.base": "Name must be a string",
    "any.required": "Name is required",
  }),

  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string",
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required",
  }),

  phone: Joi.string()
    .required()
    .pattern(getPattern.phonePattern!)
    .strict()
    .messages({
      "number.base": "Phone must be a number",
      "number.integer": "Phone must be an integer",
      "any.required": "Phone is required",
    }),

  address: Joi.string().required().messages({
    "string.base": "Address must be a string",
    "string.empty": "Address cannot be empty",
    "any.required": "Address is required",
  }),

  dateFormat: Joi.string().required().messages({
    "string.base": "Date format must be a string",
    "string.empty": "Date format cannot be empty",
    "any.required": "Date format is required",
  }),
  langId: Joi.number().integer().required().strict().messages({
    "number.base": "Language Id must be a number",
    "number.integer": "Language Id must be an integer",
    "any.required": "Language Id is required",
  }),

  timeFormat: Joi.string().required().messages({
    "string.base": "Time format must be a string",
    "string.empty": "Time format cannot be empty",
    "any.required": "Time format is required",
  }),

  currency: Joi.string().uppercase().length(3).required().strict().messages({
    "string.base": "Currency must be a string",
    "string.length": "Currency must be a 3-letter ISO code (e.g., USD)",
    "any.required": "Currency is required",
  }),

  currencySymbol: Joi.string().required().messages({
    "string.base": "Currency symbol must be a string",
    "string.empty": "Currency symbol cannot be empty",
    "any.required": "Currency symbol is required",
  }),

  timezone: Joi.string().required().messages({
    "string.base": "Timezone must be a string",
    "string.empty": "Timezone cannot be empty",
    "any.required": "Timezone is required",
  }),

  testPrefix: Joi.string().required().messages({
    "string.base": "Test prefix must be a string",
    "string.empty": "Test prefix cannot be empty",
    "any.required": "Test prefix is required",
  }),

  barcodePrefix: Joi.string().required().messages({
    "string.base": "Barcode prefix must be a string",
    "string.empty": "Barcode prefix cannot be empty",
    "any.required": "Barcode prefix is required",
  }),

  invoicePrefix: Joi.string().required().messages({
    "string.base": "Invoice prefix must be a string",
    "string.empty": "Invoice prefix cannot be empty",
    "any.required": "Invoice prefix is required",
  }),

  diseCode: Joi.string().required().messages({
    "string.base": "Dise code must be a string",
    "string.empty": "Dise code cannot be empty",
    "any.required": "Dise code is required",
  }),

  disabledBy: Joi.string().optional().allow(null).strict().messages({
    "string.base": "Disabled By must be a string",
  }),

  collectionAbbreviationName: Joi.string()
    .optional()
    .allow(null)
    .strict()
    .messages({
      "string.base": "Collection abbreviation name must be a string",
    }),

  connectionCode: Joi.string().optional().allow(null).strict().messages({
    "string.base": "Connection code must be a string",
  }),

  barcodePrinterName: Joi.string().optional().allow(null).strict().messages({
    "string.base": "Barcode printer name must be a string",
  }),

  disabledOn: Joi.date().iso().optional().allow(null).messages({
    "date.base": "Disabled On must be a valid ISO date",
    "date.format": "Disabled On must be in ISO 8601 format",
  }),

  isSubOrganization: Joi.boolean().optional().messages({
    "boolean.base": "Is Sub Organization must be a boolean",
  }),
});

export const validateCollectionCenterUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = collectionCenterSchemaUpdate.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: error.message,
        errors: error.details,
      })
    );
  }

  next();
};
