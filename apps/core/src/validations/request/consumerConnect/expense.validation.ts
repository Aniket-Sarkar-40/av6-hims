import Joi from "joi";
import { ExpenseInput } from "../../../types/consumerConnect/expense.js";
import { getPattern } from "av6-core";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import {
  dateOptional,
  enumOptional,
  idRequired,
  patternOptional,
  priceOptional,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";

export const expenseSchema = Joi.object<ExpenseInput>({
  expenseHeadId: idRequired("Expense Head Id"),
  name: strRequired("Name", 2),
  invoiceNo: strRequired("Invoice Number", 2, 50),
  date: dateOptional("Date"),
  amount: priceOptional("Amount"),
  //   expMethod: Joi.string()
  //     .valid("CASH", "CARD", "ONLINE")
  //     .allow(null)
  //     .optional()
  //     .messages({
  //       "any.only": 'Expense Method must be one of ["CASH", "CARD", "ONLINE"]',
  //     }),
  documents: patternOptional("Documents", getPattern.imagePattern),
  note: strOptional("Note", 500),
  ccId: idRequired("Consumer Connect Id"),
  isMaster: enumOptional("Is Master", { ML: "ML", CC: "CC" }),
});

export const expenseUpdateSchema = expenseSchema.keys({
  id: idRequired("Expense Id"),
});

export const validateExpenseSchema = validationHandler({
  schema: expenseSchema,
  type: "FORMDATA",
  imgAttr: "documents",
});

export const validateUpdateExpenseSchema = validationHandler({
  schema: expenseUpdateSchema,
  type: "FORMDATA",
  imgAttr: "documents",
});
