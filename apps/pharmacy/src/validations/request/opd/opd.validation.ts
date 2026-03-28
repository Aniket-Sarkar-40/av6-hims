import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

const opdBillReqSchema = Joi.object({
  aptId: Joi.number().integer().required().messages({
    "number.base": "Appointment ID must be a number.",
    "number.integer": "Appointment ID must be an integer.",
    "any.required": "Appointment ID is required.",
  }),

  branchId: Joi.number().integer().optional().messages({
    "number.base": "Branch ID must be a number.",
    "number.integer": "Branch ID must be an integer.",
  }),
});

export const validateOPD = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = opdBillReqSchema.validate(req.body, {
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
