import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { ExpenseInput } from "@/types/consumerConnect/expense.js";
import { applyRound } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import {
  Expense,
  RoundFormat,
  YesNoFlag,
} from "@repo/db/generated/prisma/client";

export const createExpenseInDb = async (
  expense: ExpenseInput,
): Promise<Expense> => {
  logger.info("entering:: createExpenseInDb::repository");
  const store = requestStorage.getStore();
  const setting = store?.settings;
  const precision = setting?.defaultPrecision;
  return db.expense.create({
    data: {
      ...expense,
      amount:
        expense.amount !== undefined && expense.amount !== null
          ? applyRound(expense.amount, RoundFormat.TO_FIXED, precision)
          : null,
    },
  });
};
export const updateExpenseInDb = async (
  id: number,
  expense: ExpenseInput,
): Promise<Expense> => {
  logger.info("entering:: updateExpenseInDb::repository");
  const store = requestStorage.getStore();
  const setting = store?.settings;
  const precision = setting?.defaultPrecision;
  return db.expense.update({
    where: { id: id },
    data: {
      ...expense,
      amount:
        expense.amount !== undefined && expense.amount !== null
          ? applyRound(expense.amount, RoundFormat.TO_FIXED, precision)
          : null,
    },
  });
};
export const getExpenseByIdFromDb = async (
  id: number,
): Promise<Expense | null> => {
  logger.info("entering:: getExpenseByIdFromDb::repository");
  return db.expense.findUnique({
    where: { id, isActive: YesNoFlag.yes },
  });
};
export const getExpenseByInvoiceNoFromDb = async (
  invoiceNo: string,
): Promise<Expense | null> => {
  logger.info("entering:: getExpenseByNameFromDb::repository");
  return db.expense.findFirst({
    where: { invoiceNo, isActive: YesNoFlag.yes },
  });
};
export const getAllExpensesFromDb = async (): Promise<Expense[]> => {
  logger.info("entering:: getAllExpensesFromDb::repository");
  return db.expense.findMany({
    where: { isActive: YesNoFlag.yes },
  });
};
export const deleteExpenseInDb = async (id: number): Promise<Expense> => {
  logger.info("entering:: deleteExpenseInDb::repository");
  return db.expense.update({
    where: { id },
    data: { isActive: YesNoFlag.no, isDeleted: YesNoFlag.yes },
  });
};
