import { db } from "@repo/db";
import {
  createExpenseHeadInput,
  updateExpenseHeadInput,
} from "@/types/master/expenseHead.js";
import { logger } from "@repo/platform/logging/logger.js";
import { ExpenseHead, YesNoFlag } from "@repo/db/generated/prisma/client";

export const createExpenseHeadInDb = async (
  expenseHead: createExpenseHeadInput,
): Promise<ExpenseHead> => {
  logger.info("entering:: createExpenseHeadInDb::repository");
  return db.expenseHead.create({
    data: expenseHead,
  });
};

export const updateExpenseHeadInDb = async (
  expenseHead: updateExpenseHeadInput,
): Promise<ExpenseHead> => {
  logger.info("entering:: updateexpenseHeadInDb::repository");
  return db.expenseHead.update({
    where: { id: expenseHead.id, isActive: YesNoFlag.yes },
    data: expenseHead,
  });
};

export const getExpenseHeadByIdFromDb = async (
  id: number,
): Promise<ExpenseHead | null> => {
  logger.info("entering:: getExpenseHeadByIdFromDb::repository");
  return db.expenseHead.findUnique({
    where: { id, isActive: YesNoFlag.yes },
  });
};

export const getExpenseHeadByIncomeHeadNameFromDb = async (
  expenseCategory: string,
): Promise<ExpenseHead | null> => {
  logger.info("entering:: getExpenseHeadByIncomeHeadNameFromDb::repository");
  return db.expenseHead.findFirst({
    where: {
      expenseCategory,
      isActive: YesNoFlag.yes,
    },
  });
};

export const getAllExpenseHeadsFromDb = async (): Promise<ExpenseHead[]> => {
  logger.info("entering:: getAllExpenseHeadsFromDb::repository");
  return db.expenseHead.findMany({
    where: { isActive: YesNoFlag.yes },
  });
};

export const deleteExpenseHeadInDb = async (
  id: number,
): Promise<ExpenseHead> => {
  logger.info("entering:: deleteExpenseHeadInDb::repository");
  return db.expenseHead.update({
    where: { id: id },
    data: { isActive: YesNoFlag.no, isDeleted: YesNoFlag.yes },
  });
};
