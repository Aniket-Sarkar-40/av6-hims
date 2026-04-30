import { IncomeMaster } from "@repo/db/generated/prisma/enums.js";
import { ExpenseHeadDTO } from "../master/expenseHead.js";
import { Prisma } from "@repo/db/generated/prisma/client";
// import { ExpenseHeadDTO } from "./expenseHead.js";

export type ExpenseInput = Prisma.ExpenseUncheckedCreateInput;

export interface ExpenseInputRequest {
  id?: string | null;
  expenseHeadId?: string | null;
  name?: string | null;
  invoiceNo: string;
  date?: string | null;
  amount?: string | null;
  //   expMethod?: string|null;
  documents?: string | null;
  note?: string | null;
  ccId?: string;
  isMaster?: string | null;
}

export interface ExpenseDTO {
  id: number;
  expenseHeadId: number | null;
  name: string | null;
  invoiceNo: string;
  date: Date | null;
  amount: number | null;
  //   expMethod: ExpMethod | null;
  documents: string | null;
  note: string | null;
  ccId: number;
  isMaster?: IncomeMaster | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  expenseHead: ExpenseHeadDTO | null;
}
