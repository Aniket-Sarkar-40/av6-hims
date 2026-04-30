import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import {
  createExpenseHeadInput,
  updateExpenseHeadInput,
} from "@/types/master/expenseHead.js";
import {
  idRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

export const expenseHeadCreateSchema = Joi.object<createExpenseHeadInput>({
  expenseCategory: strRequired("Expense Category", 2),
  description: strOptional("Description"),
});

export const expenseHeadUpdateSchema = Joi.object<updateExpenseHeadInput>({
  id: idRequired("ID"),
  expenseCategory: strRequired("Expense Category", 2),
  description: strOptional("Description"),
});

export const validateExpenseHeadCreate = validationHandler({
  schema: expenseHeadCreateSchema,
});

export const validateExpenseHeadUpdate = validationHandler({
  schema: expenseHeadUpdateSchema,
});
