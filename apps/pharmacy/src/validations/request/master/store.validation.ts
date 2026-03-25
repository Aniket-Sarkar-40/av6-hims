import { StoreCreateInput, StoreUpdateInput } from "@/types/master/store.js";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const createStoreSchema = Joi.object<StoreCreateInput | StoreUpdateInput>({
  name: Joi.string().trim().required().messages({
    "string.base": `Name must be a string`,
    "string.empty": `Name cannot be empty`,
    "any.required": `Name is required`,
  }),
  stockCode: Joi.string().trim().optional().allow(null).messages({
    "string.base": `Stock Code must be a string`,
  }),
  description: Joi.string().trim().optional().allow(null).messages({
    "string.base": `Description must be a string`,
  }),
  branchId: Joi.number().integer().optional().allow(null).strict().messages({
    "number.base": `Branch Id must be a number`,
    "number.integer": `Branch Id must be an integer`,
  }),
  wareHouseId: Joi.number().integer().optional().allow(null).strict().messages({
    "number.base": `Warehouse Id must be a number`,
    "number.integer": `Warehouse Id must be an integer`,
  }),
});

export const updateStoreSchema = createStoreSchema.keys({
  id: Joi.number().integer().required().strict().messages({
    "number.base": `ID must be a number`,
    "number.integer": `ID must be an integer`,
    "any.required": `ID is required`,
  }),
});

export const validateCreateStore = (req: Request, res: Response, next: NextFunction) => {
  const { error } = createStoreSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      errorCode: "PARAMETER_INVALID",
      errorMessage: error.message,
      errors: error.details,
    });
  }

  next();
};

export const validateUpdateStore = (req: Request, res: Response, next: NextFunction) => {
  const { error } = updateStoreSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      errorCode: "PARAMETER_INVALID",
      errorMessage: error.message,
      errors: error.details,
    });
  }

  next();
};
