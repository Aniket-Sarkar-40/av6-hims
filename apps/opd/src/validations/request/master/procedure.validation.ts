import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import {
  enumOptional,
  forbiddenField,
  idOptional,
  idRequired,
  priceRequired,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { NextFunction, Request, Response } from "express";
import Joi, { ValidationErrorItem } from "joi";

export const CreateProcedureSchema = Joi.object({
  ccId: idRequired("Collection Center ID"),

  procedureName: strRequired("Procedure Name", 2, 100),

  procedureCharge: priceRequired("Procedure Charge"),
});

export const UpdateProcedureSchema = CreateProcedureSchema.keys({
  id: idRequired("Id"),
});

export const FetchProcedureSchema = Joi.object({
  procedureId: idRequired("Procedure ID"),

  type: enumOptional("Type", {
    INSURANCE: "INSURANCE",
    CORPORATE: "CORPORATE",
  }),

  typeId: idOptional("Type ID"),
}).when(Joi.object({ type: Joi.exist() }).unknown(), {
  then: Joi.object({
    typeId: idRequired("Type ID"),
  }),
  otherwise: Joi.object({
    typeId: forbiddenField("Type ID"),
  }),
});

export const validateCreateProcedureSchema = validationHandler({
  schema: CreateProcedureSchema,
});
export const validateUpdateProcedureSchema = validationHandler({
  schema: UpdateProcedureSchema,
});
export const validateFetchProcedureSchema = validationHandler({
  schema: FetchProcedureSchema,
});
