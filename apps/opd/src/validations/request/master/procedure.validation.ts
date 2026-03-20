import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { NextFunction, Request, Response } from "express";
import Joi, { ValidationErrorItem } from "joi";

export const CreateProcedureSchema = Joi.object({
  ccId: Joi.number()
    .integer()
    .positive()
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Collection Center ID",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Collection Center ID",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Collection Center ID",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Collection Center ID",
      ),
    }),

  procedureName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Procedure Name"),
      "string.empty": generateValidationErrorMessage("EMPTY", "Procedure Name"),
      "string.min": generateValidationErrorMessage("MIN", "Procedure Name"),
      "string.max": generateValidationErrorMessage("MAX", "Procedure Name"),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Procedure Name",
      ),
    }),

  procedureCharge: Joi.number()
    .positive()
    .precision(2)
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Procedure Charge",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Procedure Charge",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Procedure Charge",
      ),
    }),
});

export const UpdateProcedureSchema = CreateProcedureSchema.keys({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Procedure ID"),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Procedure ID",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Procedure ID",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Procedure ID",
      ),
    }),
});

export const FetchProcedureSchema = Joi.object({
  procedureId: Joi.number()
    .integer()
    .positive()
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Procedure ID"),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Procedure ID",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Procedure ID",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Procedure ID",
      ),
    }),

  type: Joi.string()
    .valid("INSURANCE", "CORPORATE")
    .optional()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Type"),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Type",
        "INSURANCE, CORPORATE",
      ),
    }),

  typeId: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Type ID"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Type ID"),
      "number.positive": generateValidationErrorMessage("POSITIVE", "Type ID"),
    }),
}).when(Joi.object({ type: Joi.exist() }).unknown(), {
  then: Joi.object({
    typeId: Joi.required().messages({
      "any.required": generateValidationErrorMessage("REQUIRED", "Type ID"),
    }),
  }),
  otherwise: Joi.object({
    typeId: Joi.forbidden().messages({
      "any.unknown": generateValidationErrorMessage("NOT_ALLOWED", "Type ID"),
    }),
  }),
});

/*Common validation middileware to validate request */
const validationHandler = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
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
  };
};

export const validateCreateProcedureSchema = validationHandler(
  CreateProcedureSchema,
);
export const validateUpdateProcedureSchema = validationHandler(
  UpdateProcedureSchema,
);
export const validateFetchProcedureSchema =
  validationHandler(FetchProcedureSchema);
