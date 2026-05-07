// src/validators/opdDepartmentPrefix.validator.ts

import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { ValidationErrorItem } from "av6-core-v2";
import { idRequired, strRequired } from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

// Base schema for both create and update
export const opdDepartmentPrefixBaseSchema = {
  opdDepartmentId: idRequired("OPD Department ID"),

  prefix: strRequired("Prefix"),

  licenseType: strRequired("License Type"),
};

// Schema for creating a new record (no ID)
export const opdDepartmentPrefixCreateSchema = Joi.object({
  ...opdDepartmentPrefixBaseSchema,
});

// Schema for updating an existing record (ID required)
export const opdDepartmentPrefixUpdateSchema = Joi.object({
  id: idRequired("Id"),
  ...opdDepartmentPrefixBaseSchema,
});

// Middleware to validate create request
export const validateOpdDepartmentPrefixCreate = validationHandler({
  schema: opdDepartmentPrefixCreateSchema,
});

// Middleware to validate update request
export const validateOpdDepartmentPrefixUpdate = validationHandler({
  schema: opdDepartmentPrefixUpdateSchema,
});
