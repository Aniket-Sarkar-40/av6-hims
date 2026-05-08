import { CreateOrUpdateOpdDepartment } from "@/types/master/opdDepartment.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { DepartmentType } from "@repo/db/generated/prisma/client";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { ValidationErrorItem } from "av6-core-v2";
import {
  enumRequired,
  idRequired,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

// Define base schema
export const opdDepartmentBaseSchema = {
  departmentType: enumRequired("Department Type", DepartmentType),

  departmentName: strRequired("Department name"),
};

// Create schema
export const opdDepartmentCreateSchema =
  Joi.object<CreateOrUpdateOpdDepartment>({
    ...opdDepartmentBaseSchema,
  });

// Update schema (with ID)
export const opdDepartmentUpdateSchema =
  Joi.object<CreateOrUpdateOpdDepartment>({
    id: idRequired("Id"),
    ...opdDepartmentBaseSchema,
  });

// Validation handler for creation
export const validateOpdDepartmentCreate = validationHandler({
  schema: opdDepartmentCreateSchema,
});

// Validation handler for update
export const validateOpdDepartmentUpdate = validationHandler({
  schema: opdDepartmentUpdateSchema,
});
