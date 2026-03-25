import { CreateMigrationReq } from "@/types/migration/migration.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import {
  Migration_Ref_Type,
  Migration_Type,
} from "@repo/db/generated/prisma/enums.js";
import { NextFunction, Request, Response } from "express";
import Joi, { ValidationErrorItem } from "joi";

export const createMigrationReqSchema = Joi.object<CreateMigrationReq>({
  refType: Joi.string()
    .valid(...Object.values(Migration_Ref_Type))
    .required()
    .messages({
      "string.base": "Ref Type must be a string.",
      "any.required": "Ref Type is required.",
      "any.only": `Ref Type must be one of ${Object.values(Migration_Ref_Type).join(", ")}`,
    }),
  refNo: Joi.string().trim().required().messages({
    "string.base": "Reference No must be a string.",
    "string.empty": "Reference No cannot be empty.",
    "any.required": "Reference No is required.",
  }),
  migrationType: Joi.string()
    .valid(...Object.values(Migration_Type))
    .required()
    .messages({
      "string.base": "Migration Type must be a string.",
      "any.required": "Migration Type is required.",
      "any.only": `Status must be one of ${Object.values(Migration_Type).join(", ")}`,
    }),
});

export function validateCreateMigration(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { error } = createMigrationReqSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (error) {
    const errors = (error.details as ValidationErrorItem[]).map((d) => ({
      message: d.message.replace(/['"]/g, ""),
      path: d.path,
      type: d.type,
      context: d.context,
    }));

    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: errors.map((e) => e.message).join(", "),
        errors,
      }),
    );
  }
  next();
}
