import { InstructionName } from "@/types/master/dropDownName.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const InstructionNameSchema = Joi.object<InstructionName>({
  instructionName: Joi.string().required().min(2).messages({
    "string.base": "Name must be a string",
    "any.required": "Name is required",
  }),
});

export const validateInstructionName = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = InstructionNameSchema.validate(req.body, {
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
export const InstructionNameSchemaUpdate = Joi.object<InstructionName>({
  id: Joi.number().required().messages({
    "number.base": "ID must be a number",
  }),

  instructionName: Joi.string().required().messages({
    "string.base": "Name must be a string",
    "any.required": "Name is required",
  }),
});

export const validateInstructionNameUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = InstructionNameSchemaUpdate.validate(req.body, {
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
