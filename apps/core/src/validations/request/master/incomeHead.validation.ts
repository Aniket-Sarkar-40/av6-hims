// src/validations/service/master/incomeHead.validation.ts

import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import {
  CreateIncomeHeadInput,
  UpdateIncomeHeadInput,
} from "@/types/master/incomeHead.js";
import {
  idRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

/**
 * Joi schema for creating a new IncomeHead.
 * - incomeCategory: required, string, min length 2, max length 255
 * - description: optional, string or null, max length 255
 */
export const incomeHeadCreateSchema = Joi.object<CreateIncomeHeadInput>({
  incomeCategory: strRequired("Income Category", 2),

  description: strOptional("Description"),
});

/**
 * Middleware to validate request body against incomeHeadCreateSchema.
 */
export const validateIncomeHeadCreate = validationHandler({
  schema: incomeHeadCreateSchema,
});

/**
 * Joi schema for updating an existing IncomeHead.
 * - id: required, integer
 * - incomeCategory: required, string, min length 2, max length 255
 * - description: optional, string or null, max length 255
 */
export const incomeHeadUpdateSchema = Joi.object<UpdateIncomeHeadInput>({
  id: idRequired("Income head id"),

  incomeCategory: strRequired("Income Category", 2),

  description: strOptional("Description"),
});

/**
 * Middleware to validate request body against incomeHeadUpdateSchema.
 */
export const validateIncomeHeadUpdate = validationHandler({
  schema: incomeHeadUpdateSchema,
});
