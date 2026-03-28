import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { getPattern } from "av6-core";
import { CreateStaffDesignationInput } from "@/types/staff/designation.js";

export const staffDesignationSchema = Joi.object<CreateStaffDesignationInput>({
  designation: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(getPattern.nameWithNumPattern)
    .required()
    .messages({
      "string.base": "Name must be a string",
      "string.empty": "Name is required",
      "string.min": "Name must be at least 2 characters long",
      "string.max": "Name must be at most 50 characters long",
      "string.pattern.base": "Name contains invalid characters",
      "any.required": "Name is required",
    }),
});

export const validateStaffDesignation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = staffDesignationSchema.validate(req.body, {
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
