import { BASE_URL } from "@repo/shared";
import { incomeHeadService } from "@/services/master/incomeHead.service.js";
import {
  CreateIncomeInput,
  CreateIncomeReq,
  IncomeDTO,
  IncomeHeadDTO,
} from "@/types/consumerConnect/income.js";
import { Income, IncomeHead } from "@repo/db/generated/prisma/client";

export const toIncomeEntity = (
  incomeReq: CreateIncomeReq,
): CreateIncomeInput => {
  const parsedAmount = incomeReq.amount ? parseFloat(incomeReq.amount) : null;
  const parsedDate = incomeReq.date ? new Date(incomeReq.date) : null;

  return {
    id: Number(incomeReq.id),
    incHeadId: Number(incomeReq.incHeadId) ? Number(incomeReq.incHeadId) : 0,
    name: incomeReq.name ? incomeReq.name : "",
    invoiceNo: incomeReq.invoiceNo,
    date: parsedDate,
    amount: parsedAmount,
    note: incomeReq.note ? incomeReq.note : null,
    documents: incomeReq.documents ? incomeReq.documents : null,
  };
};

export const toIncomeHeadDTO = (head: IncomeHead): IncomeHeadDTO => ({
  id: head.id,
  incomeCategory: head.incomeCategory,
  description: head.description,
  createdAt: head.createdAt,
  updatedAt: head.updatedAt,
});

export const toIncomeDTO = async (income: Income): Promise<IncomeDTO> => {
  const convertedDocuments =
    income.documents !== null
      ? BASE_URL + income.documents.replace(/\\/g, "/")
      : null;

  let incomeHead: IncomeHeadDTO | null = null;
  if (income.incHeadId !== null) {
    const rawHead = await incomeHeadService.getIncomeHeadById(
      Number(income.incHeadId),
      true,
    );
    if (rawHead) {
      incomeHead = toIncomeHeadDTO(rawHead);
    }
  }

  return {
    id: income.id,
    name: income.name,
    invoiceNo: income.invoiceNo,
    date: income.date,
    amount: income.amount !== null ? Number(income.amount) : null,
    note: income.note,
    documents: convertedDocuments,
    createdAt: income.createdAt,
    updatedAt: income.updatedAt,
    incomeHead,
  };
};
