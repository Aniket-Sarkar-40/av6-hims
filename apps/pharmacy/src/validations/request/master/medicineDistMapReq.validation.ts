import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { MedicineDistributorMap } from "@repo/db/generated/prisma/client";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const medicineDistMapSchema = Joi.object<MedicineDistributorMap>({
  id: Joi.number().integer().optional().messages({
    "number.base": "ID must be a number",
    "number.integer": "ID must be an integer",
  }),

  itemId: Joi.number().integer().required().strict().messages({
    "number.base": "Item ID must be a number",
    "number.integer": "Item ID must be an integer",
    "any.required": "Item ID is required",
  }),

  distributorId: Joi.number().integer().required().strict().messages({
    "number.base": "Distributor ID must be a number",
    "number.integer": "Distributor ID must be an integer",
    "any.required": "Distributor ID is required",
  }),

  price: Joi.number().required().strict().messages({
    "string.base": "Price must be a string",
    "any.required": "Price is required",
    "number.base": "Price must be a number",
    "number.integer": "Price must be an integer",
  }),

  expiryDate: Joi.date().optional().messages({
    "date.base": "Expiry date must be a valid date",
  }),
});

export const validateMedicineDistMap = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = medicineDistMapSchema.validate(req.body, {
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

export const medicineDistMapSchemaUpdate = medicineDistMapSchema.keys({
  id: Joi.number().integer().required().messages({
    "number.base": "ID must be a number",
    "number.integer": "ID must be an integer",
    "any.required": "ID is required",
  }),
});

export const validateMedicineDistMapUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = medicineDistMapSchemaUpdate.validate(req.body, {
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
