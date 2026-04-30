import { Prisma } from "@repo/db/generated/prisma/client";

export type CreateIncomeReq = Prisma.IncomeUncheckedCreateInput;

export type CreateIncomeInput = CreateIncomeReq;

export interface IncomeDTO {
  id: number;
  name: string | null;
  invoiceNo: string;
  date: Date | null;
  amount: number | null;
  note: string | null;
  documents: string | null;
  createdAt: Date;
  updatedAt: Date;
  incomeHead: IncomeHeadDTO | null;
}

export interface IncomeHeadDTO {
  id: number;
  incomeCategory: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateIncomeReq extends CreateIncomeReq {
  id: number;
}
