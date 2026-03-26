import { BASE_URL } from "@repo/shared";
import { expenseHeadService } from "@/services/master/expenseHead.service.js";

import {
  ExpenseDTO,
  ExpenseInput,
  ExpenseInputRequest,
} from "@/types/consumerConnect/expense.js";
import { ExpenseHeadDTO } from "@/types/master/expenseHead.js";
import {
  Expense,
  ExpenseHead,
  MasterType,
} from "@repo/db/generated/prisma/client";

export const toExpenseEntity = (
  expenseReq: ExpenseInputRequest,
): ExpenseInput => {
  const entity: ExpenseInput = {
    id: expenseReq.id ? Number(expenseReq.id) : undefined,
    name: expenseReq.name ?? undefined,
    invoiceNo: expenseReq.invoiceNo,
    date: expenseReq.date ? new Date(expenseReq.date) : undefined,
    amount: expenseReq.amount ? parseFloat(expenseReq.amount) : undefined,
    documents: expenseReq.documents ?? undefined,
    note: expenseReq.note ?? undefined,
  };
  if (
    expenseReq.expenseHeadId != null &&
    expenseReq.expenseHeadId !== "" &&
    !isNaN(Number(expenseReq.expenseHeadId))
  ) {
    entity.expenseHeadId = Number(expenseReq.expenseHeadId);
  }
  if (
    expenseReq.ccId != null &&
    expenseReq.ccId !== undefined &&
    !isNaN(Number(expenseReq.ccId))
  ) {
    entity.ccId = Number(expenseReq.ccId);
  }

  if (expenseReq.isMaster !== undefined && expenseReq.isMaster !== null) {
    entity.isMaster = expenseReq.isMaster as MasterType;
  }
  return entity;
};
export const toExpenseHeadDTO = (head: ExpenseHead): ExpenseHeadDTO => ({
  id: head.id,
  expenseCategory: head.expenseCategory,
  description: head.description,
  createdAt: head.createdAt,
  updatedAt: head.updatedAt,
});

export const toExpenseDTO = async (expense: Expense): Promise<ExpenseDTO> => {
  const convertedDocuments =
    expense.documents !== null
      ? BASE_URL + expense.documents.replace(/\\/g, "/")
      : null;
  let expenseHead: ExpenseHeadDTO | null = null;
  if (expense.expenseHeadId !== null) {
    const rawHead = await expenseHeadService.getExpenseHeadById(
      expense.expenseHeadId,
      true,
    );
    if (rawHead) {
      expenseHead = toExpenseHeadDTO(rawHead);
    }
  }
  return {
    id: expense.id,
    expenseHeadId: expense.expenseHeadId,
    name: expense.name,
    invoiceNo: expense.invoiceNo,
    date: expense.date,
    amount: expense.amount !== null ? Number(expense.amount) : null,
    documents: convertedDocuments,
    note: expense.note,
    ccId: expense.ccId,
    isMaster: expense.isMaster,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
    expenseHead, // Add this line if you want to include expenseHead in the DTO
  };
};
export const toExpenseDTOs = async (
  expenses: Expense[],
): Promise<ExpenseDTO[]> => {
  return Promise.all(expenses.map((expense) => toExpenseDTO(expense)));
};
