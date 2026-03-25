import {
  toInsuranceEntity,
  toInsuranceUpdateEntity,
} from "@apps/pharmacy/src/mapper/insurance/insurance.mapper.js";
import { InsuranceImage, InsuranceReq } from "@/types/insurance/insurance.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { InsuranceBusinessMapping } from "@repo/db/generated/prisma/client";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";
export const insuranceBusinessSchema = Joi.object<InsuranceBusinessMapping>({
  id: Joi.number().integer().optional().strict().messages({
    "number.base": "Id must be a number",
    "number.integer": "Id must be an integer",
  }),

  type: Joi.string().required().messages({
    "string.base": "Type must be a string",
    "any.required": "Type is required",
  }),
  name: Joi.string().required().messages({
    "string.base": "Name must be a string",
    "any.required": "Name is required",
  }),
  phone: Joi.string().required().messages({
    "string.base": "Phone must be a string",
    "any.required": "Phone is required",
  }),
  isDefault: Joi.string().valid("yes", "no").required().messages({
    "string.base": "Is Default must be a string",
    "any.only": "Is Default must be 'yes' or 'no'",
    "any.required": "Is Default is required",
  }),
  date: Joi.date().required().messages({
    "date.base": "Date must be a valid date",
    "any.required": "Date is required",
  }),
});

export const insuranceSchema = Joi.object<InsuranceReq>({
  id: Joi.number().integer().optional().strict().messages({
    "number.base": "Id must be a number",
    "number.integer": "Id must be an integer",
  }),

  customerCode: Joi.string().required().messages({
    "string.base": "Customer Code must be a string",
    "any.required": "Customer Code is required",
  }),

  customerName: Joi.string().required().messages({
    "string.base": "Customer Name must be a string",
    "any.required": "Customer Name is required",
  }),

  contactNo: Joi.string().required().messages({
    "string.base": "Contact Number must be a string",
    "any.required": "Contact Number is required",
  }),

  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string",
    "string.email": "Email must be a valid email",
    "any.required": "Email is required",
  }),

  contactPersonName: Joi.string().required().messages({
    "string.base": "Contact Person Name must be a string",
    "any.required": "Contact Person Name is required",
  }),

  contactPersonPhone: Joi.string().required().messages({
    "string.base": "Contact Person Phone must be a string",
    "any.required": "Contact Person Phone is required",
  }),

  contactPersonEmail: Joi.string().email().required().messages({
    "string.base": "Contact Person Email must be a string",
    "string.email": "Contact Person Email must be a valid email",
    "any.required": "Contact Person Email is required",
  }),

  customerActiveFrom: Joi.date().required().messages({
    "date.base": "Customer Active From must be a valid date",
    "any.required": "Customer Active From is required",
  }),

  customerStatus: Joi.string().optional().allow(null).messages({
    "string.base": "Customer Status must be a string or null",
  }),

  status: Joi.string().valid("active", "inactive").required().messages({
    "string.base": "Status must be a string",
    "any.only": "Status must be 'active' or 'inactive'",
    "any.required": "Status is required",
  }),

  logoImage: Joi.string().required().messages({
    "string.base": "Logo Image must be a string",
    "any.required": "Logo Image is required",
  }),

  adhaar: Joi.string().optional().allow(null).messages({
    "string.base": "Adhaar must be a string or null",
  }),

  pan: Joi.string().optional().allow(null).messages({
    "string.base": "PAN must be a string or null",
  }),

  gstNo: Joi.string().optional().allow(null).messages({
    "string.base": "GST No must be a string or null",
  }),

  ccId: Joi.number().integer().optional().allow(null).strict().messages({
    "number.base": "CC Id must be a number",
    "number.integer": "CC Id must be an integer",
  }),

  isMaster: Joi.string().valid("ML", "CC").required().messages({
    "string.base": "Is Master must be a string",
    "any.only": "Is Master must be either 'ML' or 'CC'",
    "any.required": "Is Master is required",
  }),

  sapCode: Joi.string().required().messages({
    "string.base": "SAP Code must be a string or null",
  }),

  statusChangeRemark: Joi.string().optional().allow(null).messages({
    "string.base": "Status Change Remark must be a string or null",
  }),

  billAddress: Joi.string().optional().allow(null).messages({
    "string.base": "Bill Address must be a string or null",
  }),

  shiftAddress: Joi.string().optional().allow(null).messages({
    "string.base": "Shift Address must be a string or null",
  }),

  portalAccessConfig: Joi.string().optional().allow(null).messages({
    "string.base": "Portal Access Config must be a string or null",
  }),

  printConfig: Joi.string().optional().allow(null).messages({
    "string.base": "Print Config must be a string or null",
  }),

  notificationConfig: Joi.string().optional().allow(null).messages({
    "string.base": "Notification Config must be a string or null",
  }),

  attachments: Joi.string().optional().allow(null).messages({
    "string.base": "Attachments must be a string or null",
  }),

  paymentMode: Joi.string()
    .valid("amount_in_cash", "co_payment")
    .required()
    .messages({
      "string.base": "Payment Mode must be a string",
      "any.only": "Payment Mode must be 'amount in cash' or 'co payment'",
      "any.required": "Payment Mode is required",
    }),

  insuranceType: Joi.string()
    .valid("corporate", "national", "others")
    .required()
    .messages({
      "string.base": "Insurance Type must be a string",
      "any.only":
        "Insurance Type must be one of 'corporate', 'national', or 'others'",
      "any.required": "Insurance Type is required",
    }),

  pharmacyPaymentType: Joi.string()
    .valid("percentage", "amount")
    .required()
    .messages({
      "string.base": "Pharmacy Payment Type must be a string",
      "any.only": "Pharmacy Payment Type must be 'percentage' or 'amount'",
      "any.required": "Pharmacy Payment Type is required",
    }),

  pharmacyPaymentValue: Joi.number().required().strict().messages({
    "number.base": "Pharmacy Payment Value must be a number",
    "any.required": "Pharmacy Payment Value is required",
  }),

  opdPaymentValue: Joi.number().required().strict().messages({
    "number.base": "OPD Payment Value must be a number",
    "any.required": "OPD Payment Value is required",
  }),

  opdPaymentType: Joi.string()
    .valid("percentage", "amount")
    .required()
    .messages({
      "string.base": "OPD Payment Type must be a string",
      "any.only": "OPD Payment Type must be 'percentage' or 'amount'",
      "any.required": "OPD Payment Type is required",
    }),

  pathologyPaymentValue: Joi.number().required().strict().messages({
    "number.base": "Pathology Payment Value must be a number",
    "any.required": "Pathology Payment Value is required",
  }),

  pathologyPaymentType: Joi.string()
    .valid("percentage", "amount")
    .required()
    .messages({
      "string.base": "Pathology Payment Type must be a string",
      "any.only": "Pathology Payment Type must be 'percentage' or 'amount'",
      "any.required": "Pathology Payment Type is required",
    }),

  insuranceBusinessMapping: Joi.array()
    .items(insuranceBusinessSchema)
    .min(1)
    .required()
    .messages({
      "array.base": "Insurance Business  must be an array",
      "array.min": "At least one Insurance Business  required",
      "any.required": "Insurance Business  is required",
    }),
});

export const validateInsurance = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.body = toInsuranceEntity(req.body, req.files as InsuranceImage);
  const { error } = insuranceSchema.validate(req.body, {
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

export const insuranceSchemaUpdate = insuranceSchema.keys({
  id: Joi.number().integer().required().messages({
    "number.base": "Id must be a number",
    "number.integer": "Id must be an integer",
    "any.required": "Id is required",
  }),
});

export const validateInsuranceUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.body = toInsuranceUpdateEntity(req.body, req.files as InsuranceImage);
  const { error } = insuranceSchemaUpdate.validate(req.body, {
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
