import { toIncomeEntity } from "@/mapper/consumerConnect/income.mapper.js";
import { deleteFileIfExists } from "@repo/platform/middlewares/imageUpload.middleware.js";
import { CreateIncomeInput } from "@/types/consumerConnect/income.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { getPattern } from "av6-core";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import {
  dateOptional,
  idRequired,
  patternOptional,
  priceOptional,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";

/**
 * Joi schema for creating a new Income.
 */
export const incomeCreateSchema = Joi.object<CreateIncomeInput>({
  incHeadId: idRequired("Income head Id"),

  name: strRequired("Name"),

  invoiceNo: strRequired("Invoice number"),

  date: dateOptional("Date"),

  amount: priceOptional("Amount"),

  note: strOptional("Note"),

  documents: patternOptional("Documents", getPattern.imagePattern),
});

export const incomeUpdateSchema = incomeCreateSchema.keys({
  id: idRequired("Income id"),
});

export const validateIncome = validationHandler({
  schema: incomeCreateSchema,
  type: "FORMDATA",
  imgAttr: "documents",
});

export const validateUpdateIncome = validationHandler({
  schema: incomeUpdateSchema,
  type: "FORMDATA",
  imgAttr: "documents",
});
