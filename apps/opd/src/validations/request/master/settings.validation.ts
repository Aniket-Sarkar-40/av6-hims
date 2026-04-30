import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import {
  CalculationMethod,
  RoundFormat,
} from "@repo/db/generated/prisma/client";
import { ValidationErrorItem } from "av6-core";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import {
  boolRequired,
  enumOptional,
  intOptional,
  strOptional,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

export const createOrUpdateSettingsSchema = Joi.object({
  isEmail: boolRequired("Is Email"),
  isSMS: boolRequired("Is SMS"),
  isWhatsapp: boolRequired("Is Whatsapp"),
  countryCode: strOptional("Country code"),
  defaultPrecision: intOptional("Default precision", 0),
  calculationMethod: enumOptional("Calculation method", CalculationMethod),
  roundedFormat: enumOptional("Round format", RoundFormat),
  finalRoundedFormat: enumOptional("Final round format", RoundFormat),

  batchSize: intOptional("Batch size"),
  defaultEmailPostfix: strOptional("Default email postfix"),
});

export const validateSettings = validationHandler({
  schema: createOrUpdateSettingsSchema,
});
