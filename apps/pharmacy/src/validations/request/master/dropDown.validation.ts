import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { DropDownName } from "@/types/master/dropDownName.js";
import { getPattern } from "av6-core";

export const dropDownNameSchema = Joi.object<DropDownName>({
  name: Joi.string().required().min(2).trim().messages({
    "string.base": "Name must be a string",
    "any.required": "Name is required",
  }),

  description: Joi.string().trim().allow(null, "").optional().messages({
    "string.base": "Description must be a string or null",
  }),
});

export const validateDropDownName = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = dropDownNameSchema.validate(req.body, {
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
export const dropDownNameSchemaUpdate = Joi.object<DropDownName>({
  id: Joi.number().required().messages({
    "number.base": "ID must be a number",
  }),

  name: Joi.string().required().messages({
    "string.base": "Name must be a string",
    "any.required": "Name is required",
  }),

  description: Joi.string().allow(null, "").optional().messages({
    "string.base": "Description must be a string or null",
  }),
});

export const validateDropDownNameUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = dropDownNameSchemaUpdate.validate(req.body, {
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

export const medPackageNameSchema = Joi.object<DropDownName>({
  name: Joi.string().pattern(getPattern.stringBaseNum).required().messages({
    "string.pattern.base": "Name must be a number that doesn’t start with 0",
    "string.base": "Name must be a string",
    "any.required": "Name is required",
    "string.empty": "Name cannot be empty",
  }),

  description: Joi.string().trim().allow(null, "").optional().messages({
    "string.base": "Description must be a string or null",
  }),
});

export const validateMedPackage = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = medPackageNameSchema.validate(req.body, {
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

export const medPackageSchemaUpdate = Joi.object<DropDownName>({
  id: Joi.number().required().messages({
    "number.base": "ID must be a number",
  }),

  name: Joi.string().pattern(getPattern.stringBaseNum).required().messages({
    "string.pattern.base": "Name must be a number that doesn’t start with 0",
    "string.base": "Name must be a string",
    "any.required": "Name is required",
    "string.empty": "Name cannot be empty",
  }),

  description: Joi.string().allow(null, "").optional().messages({
    "string.base": "Description must be a string or null",
  }),
});

export const validateMedPackageUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = medPackageSchemaUpdate.validate(req.body, {
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
