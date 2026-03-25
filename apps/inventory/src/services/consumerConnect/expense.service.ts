import {
  createExpenseInDb,
  updateExpenseInDb,
  getExpenseByIdFromDb,
  getAllExpensesFromDb,
  deleteExpenseInDb,
} from "@/repository/consumerConnect/expense.repository.js";

import ErrorHandler from "@/utils/errorHandler.utils.js";
import { logger } from "@/utils/logger.utils.js";
import { generateErrorMessage } from "@/utils/responseMessage.utils.js";
import {
  createExpenseServiceValidation,
  updateExpenseServiceValidation,
  deleteExpenseServiceValidation,
} from "@/validations/service/consumerConnect/expense.service.validation.js";
import { Expense } from "@prisma/client";
import { ExpenseDTO, ExpenseInput } from "@/types/consumerConnect/expense.js";
import { toExpenseDTO, toExpenseDTOs } from "@/mapper/consumerConnect/expense.mapper.js";
import { validIdCheck } from "@/validations/global.validation.js";

export const expenseService = {
  async createExpense(input: ExpenseInput): Promise<ExpenseDTO> {
    logger.info("entering::createExpense::service");
    await createExpenseServiceValidation(input);
    const expense = await createExpenseInDb(input);
    const createdExpense = toExpenseDTO(expense);
    logger.info("exiting::createExpense::service");
    return createdExpense;
  },

  async getAllExpense(): Promise<ExpenseDTO[]> {
    logger.info("entering::getAllExpense::service");
    const expense = await getAllExpensesFromDb();
    if (expense.length === 0) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Expense"));
    }
    const allExpenses = toExpenseDTOs(expense);
    logger.info("exiting::getAllExpense::service");
    return allExpenses;
  },

  async getExpenseById(id: number, canNullReturnable: boolean = false): Promise<ExpenseDTO | null> {
    logger.info("entering::getExpenseById::service");
    validIdCheck(id);
    const expense = await getExpenseByIdFromDb(id);
    if (!expense) {
      if (!canNullReturnable) throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Expense"));
      else return null;
    }
    const getExpense = toExpenseDTO(expense);
    logger.info("exiting::getExpenseById::service");
    return getExpense;
  },

  async updateExpense(input: ExpenseInput): Promise<Expense> {
    logger.info("entering::updateExpense::service");
    await updateExpenseServiceValidation(input.id!, input);
    const expense = await updateExpenseInDb(Number(input.id), input);
    logger.info("exiting::updateExpense::service");
    return expense;
  },

  async deleteExpense(id: number): Promise<{ message: string }> {
    logger.info("entering::deleteExpense::service");
    await deleteExpenseServiceValidation(id);
    await deleteExpenseInDb(id);
    logger.info("exiting::deleteExpense::service");
    return { message: "Expense  deleted successfully" };
  },
};
