import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { TemplateType } from "@repo/db/generated/prisma/client";
import { ValidationErrorItem } from "av6-core";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const createTemplateSchema = Joi.object({
  templateCode: Joi.string()
    .optional()
    .allow(null)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Template Code"),
    }),

  templateName: Joi.string()
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Template Name"),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Template Name"
      ),
    }),

  templateType: Joi.string()
    .valid(...Object.values(TemplateType))
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Template Type"),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Template Type",
        Object.values(TemplateType).join(", ")
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Template Type"
      ),
    }),

  subject: Joi.string()
    .allow(null, "")
    .optional()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Subject"),
    }),

  bodyHtml: Joi.string()
    .allow(null, "")
    .when("templateType", {
      is: "EMAIL",
      then: Joi.string()
        .required()
        .messages({
          "any.required": generateValidationErrorMessage(
            "REQUIRED",
            "Body HTML for EMAIL template"
          ),
        }),
      otherwise: Joi.optional(),
    }),

  bodyText: Joi.string()
    .allow(null, "")
    .when("templateType", {
      is: Joi.valid("EMAIL").not(),
      then: Joi.optional(),
      otherwise: Joi.string()
        .required()
        .messages({
          "any.required": generateValidationErrorMessage(
            "REQUIRED",
            "Body Text for non-EMAIL templates"
          ),
        }),
    }),
});

export const templateUpdateSchema = createTemplateSchema.keys({
  id: Joi.number()
    .integer()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "ID"),
      "number.integer": generateValidationErrorMessage("INTEGER", "ID"),
      "any.required": generateValidationErrorMessage("REQUIRED", "ID"),
    }),
});

export const validateTemplateCreate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = createTemplateSchema.validate(req.body, {
    abortEarly: false,
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
      })
    );
  }

  next();
};

export const validateTemplateUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = templateUpdateSchema.validate(req.body, {
    abortEarly: false,
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
      })
    );
  }

  next();
};
