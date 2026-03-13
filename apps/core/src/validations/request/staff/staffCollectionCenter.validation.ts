import { CreateOrUpdateStaffCollectionCenter } from "@/types/staff/staffCollectionCenter.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { BinaryFlag } from "@repo/db/generated/prisma/client";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const createOrUpdateStaffCollectionCenterSchema =
  Joi.object<CreateOrUpdateStaffCollectionCenter>({
    staffId: Joi.number().integer().strict().required().messages({
      "number.base": "Staff ID must be a number",
      "number.integer": "Staff ID must be an integer",
      "any.required": "Staff ID is required",
    }),

    collectionCenterId: Joi.number().integer().strict().required().messages({
      "number.base": "Collection Center ID must be a number",
      "number.integer": "Collection Center ID must be an integer",
      "any.required": "Collection Center ID is required",
    }),

    isMainLab: Joi.string().valid("Y", "N").required().messages({
      "string.base": "Is Main Lab must be a string",
      "any.only": "Is Main Lab must be 'Y' or 'N'",
      "any.required": "Is Main Lab is required",
    }),

    isActive: Joi.string()
      .valid(BinaryFlag.true, BinaryFlag.false)
      .required()
      .messages({
        "string.base": "Is Active must be a string",
        "any.only": `Is Active must be '${BinaryFlag.true}' or '${BinaryFlag.false}'`,
        "any.required": "Is Active is required",
      }),
  });
export const validateStaffCollectionCenter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = createOrUpdateStaffCollectionCenterSchema.validate(
    req.body,
    {
      abortEarly: false,
    }
  );

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
