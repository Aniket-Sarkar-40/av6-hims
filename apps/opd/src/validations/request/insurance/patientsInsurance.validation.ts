import {
  toPatientInsuranceEntity,
  toPatientInsuranceUpdateEntity,
} from "@/mapper/insurance/patientsInsurance.mapper.js";
import {
  InsuranceCardImages,
  PatientInsuranceReq,
} from "@/types/insurance/patientsInsurance.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const patientsInsuranceSchema = Joi.object<PatientInsuranceReq>({
  insurerId: Joi.number().integer().required().messages({
    "number.base": "Insurer ID must be a number",
    "number.integer": "Insurer ID must be an integer",
    "any.required": "Insurer ID is required",
  }),

  patientId: Joi.number().integer().required().messages({
    "number.base": "Patient ID must be a number",
    "number.integer": "Patient ID must be an integer",
    "any.required": "Patient ID is required",
  }),

  insuranceType: Joi.string()
    .valid("primary", "secondary", "tertiary")
    .required()
    .messages({
      "string.base": "Insurance Type must be a string",
      "any.required": "Insurance Type is required",
      "any.only":
        "Patients Insurance Type must be one of 'primary', 'secondary', 'tertiary'",
    }),

  insurancePlan: Joi.string().allow(null).optional().messages({
    "string.base": "patientsInsurance Plan must be a string",
  }),

  policyNumber: Joi.string().allow(null).optional().messages({
    "string.base": "Policy Number must be a string",
  }),

  relationship: Joi.string()
    .allow(null)
    .optional()
    .valid("self", "spouse", "child")
    .messages({
      "string.base": "Relationship must be a string",
    }),

  issueDate: Joi.date().allow(null).optional().messages({
    "date.base": "Issue Date must be a valid date",
  }),

  expireDate: Joi.date().allow(null).optional().messages({
    "date.base": "Expire Date must be a valid date",
  }),

  cardFrontImage: Joi.string().allow(null).optional().messages({
    "string.base": "Card Front Image must be a string",
  }),

  cardBackImage: Joi.string().allow(null).optional().messages({
    "string.base": "Card Back Image must be a string",
  }),
});

export const patientsInsuranceUpdateSchema = patientsInsuranceSchema.keys({
  id: Joi.number().integer().required().messages({
    "number.base": "Id must be a number",
    "number.integer": "Id must be an integer",
    "any.required": "Id is required",
  }),
});

export const validatePatientsInsurance = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.body = toPatientInsuranceEntity(
    req.body,
    req.files as InsuranceCardImages,
  );
  const { error } = patientsInsuranceSchema.validate(req.body, {
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

export const patientsInsuranceSchemaUpdate = patientsInsuranceSchema.keys({
  id: Joi.number().integer().required().messages({
    "number.base": "Id must be a number",
    "number.integer": "Id must be an integer",
    "any.required": "Id is required",
  }),
});

export const validatePatientsInsuranceUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.body = toPatientInsuranceUpdateEntity(
    req.body,
    req.files as InsuranceCardImages,
  );
  const { error } = patientsInsuranceSchemaUpdate.validate(req.body, {
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
