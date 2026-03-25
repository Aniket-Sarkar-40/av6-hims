import { DistributorImageFiles } from "@/types/distributor/distributor.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { getPattern } from "av6-core";
import { NextFunction, Request, Response } from "express";
import Joi, { ValidationErrorItem } from "joi";

// === TaxIdentificationDetails schema ===
const taxIdentificationDetailSchema = Joi.object({
  taxIdentificationName: Joi.string().required().messages({
    "string.base": `Tax Identification Name  must be a string`,
    "string.empty": `Tax Identification Name  cannot be empty`,
    "any.required": `Tax Identification Name  is required`,
  }),
  taxIdentificationValue: Joi.string().required().messages({
    "string.base": `Tax Identification Value  must be a string`,
    "string.empty": `Tax Identification Value  cannot be empty`,
    "any.required": `Tax Identification Value  is required`,
  }),
});

// === CommonDistributor schema ===
export const commonDistributorSchema = Joi.object({
  proInName: Joi.string().required().messages({
    "string.base": `Proprietary Name must be a string`,
    "string.empty": `Proprietary Name cannot be empty`,
    "any.required": `Proprietary Name is required`,
  }),
  proInEmail: Joi.string().email().required().messages({
    "string.base": `Proprietary Email must be a string`,
    "string.email": `Proprietary Email must be a valid email`,
    "any.required": `Proprietary Email is required`,
  }),
  proCountryCode: Joi.string().optional().allow(null, "").messages({
    "string.base": "Proprietary Country Code must be a string.",
  }),
  proInPhone: Joi.string()
    .required()
    .pattern(getPattern.phonePattern)
    .messages({
      "string.pattern.base": `Proprietary Phone number is not a valid phone number`,
      "string.empty": `Proprietary Phone number cannot be empty`,
      "any.required": `Proprietary Phone number is required`,
    }),

  dpName: Joi.string().required().messages({
    "string.base": `Distributor Side Name must be a string`,
    "string.empty": `Distributor Side Name cannot be empty`,
    "any.required": `Distributor Side Name is required`,
  }),
  dpEmail: Joi.string().email().required().messages({
    "string.base": `Distributor Side Email must be a string`,
    "string.email": `Distributor Side Email must be a valid email`,
    "any.required": `Distributor Side Email is required`,
  }),
  dpCountryCode: Joi.string().optional().allow(null, "").messages({
    "string.base": "Distributor Side Country Code must be a string.",
  }),
  dpPhone: Joi.string().required().pattern(getPattern.phonePattern).messages({
    "string.pattern.base": `Contact person Phone number is not a valid phone number`,
    "string.empty": `Contact person Phone number cannot be empty`,
    "any.required": `Contact person Phone number is required`,
  }),

  posEmail: Joi.boolean().optional().messages({
    "boolean.base": `Pos Email must be a boolean`,
  }),
  posPhoneNotification: Joi.boolean().optional().messages({
    "boolean.base": `Pos Phone Notification must be a boolean`,
  }),
  posWhatsapp: Joi.boolean().optional().messages({
    "boolean.base": `Pos Whatsapp must be a boolean`,
  }),
  posSms: Joi.boolean().optional().messages({
    "boolean.base": `Pos Sms must be a boolean`,
  }),

  grnEmail: Joi.boolean().optional().messages({
    "boolean.base": `Grn Email must be a boolean`,
  }),
  grnPhoneNotification: Joi.boolean().optional().messages({
    "boolean.base": `Grn Phone Notification must be a boolean`,
  }),
  grnWhatsapp: Joi.boolean().optional().messages({
    "boolean.base": `Grn Whatsapp must be a boolean`,
  }),
  grnSms: Joi.boolean().optional().messages({
    "boolean.base": `Grn Sms must be a boolean`,
  }),

  returnEmail: Joi.boolean().optional().messages({
    "boolean.base": `Return Email must be a boolean`,
  }),
  returnPhoneNotification: Joi.boolean().optional().messages({
    "boolean.base": `Return Phone Notification must be a boolean`,
  }),
  returnWhatsapp: Joi.boolean().optional().messages({
    "boolean.base": `Return Whatsapp must be a boolean`,
  }),
  returnSms: Joi.boolean().optional().messages({
    "boolean.base": `Return Sms must be a boolean`,
  }),

  billTo: Joi.string().required().messages({
    "string.base": `Bill To must be a string`,
    "string.empty": `Bill To cannot be empty`,
    "any.required": `Bill To is required`,
  }),
  shipTo: Joi.string().required().messages({
    "string.base": `Ship To must be a string`,
    "string.empty": `Ship To cannot be empty`,
    "any.required": `Ship To is required`,
  }),

  bankName: Joi.string().required().messages({
    "string.base": `Bank Name must be a string`,
    "string.empty": `Bank Name cannot be empty`,
    "any.required": `Bank Name is required`,
  }),
  bankAddress: Joi.string().required().messages({
    "string.base": `Bank Address must be a string`,
    "string.empty": `Bank Address cannot be empty`,
    "any.required": `Bank Address is required`,
  }),
  bankBranchName: Joi.string().required().messages({
    "string.base": `Bank Branch Name must be a string`,
    "string.empty": `Bank Branch Name cannot be empty`,
    "any.required": `Bank Branch Name is required`,
  }),
  swiftIfscCode: Joi.string().required().messages({
    "string.base": `Swift or Ifsc Code must be a string`,
    "string.empty": `Swift or Ifsc Code cannot be empty`,
    "any.required": `Swift or Ifsc Code is required`,
  }),
  bankAccountNumber: Joi.string().required().messages({
    "string.base": `Bank Account Number must be a string`,
    "string.empty": `Bank Account Number cannot be empty`,
    "any.required": `Bank Account Number is required`,
  }),
  bankAccountType: Joi.string().required().messages({
    "string.base": `Bank Account Type must be a string`,
    "string.empty": `Bank Account Type cannot be empty`,
    "any.required": `Bank Account Type is required`,
  }),

  termAndCondition: Joi.string().allow(null, "").optional().messages({
    "string.base": `Term And Condition must be a string`,
  }),
  stockShipmentDetails: Joi.string().allow(null, "").optional().messages({
    "string.base": `Stock Shipment Details must be a string`,
  }),

  taxIdentificationDetails: Joi.array()
    .items(taxIdentificationDetailSchema)
    .optional()
    .allow(null, "")
    .messages({
      "array.base": `Tax Identification Details must be an array`,
    }),
  dueDate: Joi.number().integer().positive().messages({
    "number.base": "Due date must be a number",
    "number.integer": "Due date must be an integer",
    "number.positive": "Due date must be a positive number",
    "any.strict": "Due date cannot be in a non-strict type",
    "any.required": "Due date is required",
  }),
});

// === CreateDistributorInput schema ===
export const createDistributorSchema = commonDistributorSchema.keys({
  distLicNumber: Joi.string().allow(null, "").messages({
    "string.base": ` Dist License Number  must be a string`,
  }),
  distLicDocument: Joi.string().allow(null, "").messages({
    "string.base": ` Dist License Document  must be a string`,
  }),
  distAgreementDoc: Joi.string().allow(null, "").messages({
    "string.base": ` Dist Agreement Document  must be a string`,
  }),
  distGhanaDoc: Joi.string().allow(null, "").messages({
    "string.base": ` Dist Ghana Document  must be a string`,
  }),
  distDrugDoc: Joi.string().allow(null, "").messages({
    "string.base": ` Dist Drug Document  must be a string`,
  }),
});

// === UpdateDistributorInput schema ===
export const updateDistributorSchema = createDistributorSchema.keys({
  id: Joi.number().required().messages({
    "number.base": "ID must be a number",
  }),
});

export function validateCreateDistributor(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  req.body = toDistributorEntity(req.body, req.files as DistributorImageFiles);

  const { error } = createDistributorSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (error) {
    const messages = (error.details as ValidationErrorItem[])
      .map((d) => d.message.replace(/['"]/g, ""))
      .join(", ");
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: messages,
        errors: error.details,
      }),
    );
  }

  next();
}

export function validateUpdateDistributor(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  req.body = toDistributorEntity(req.body, req.files as DistributorImageFiles);

  const { error } = updateDistributorSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (error) {
    const messages = (error.details as ValidationErrorItem[])
      .map((d) => d.message.replace(/['"]/g, ""))
      .join(", ");
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: messages,
        errors: error.details,
      }),
    );
  }

  next();
}
