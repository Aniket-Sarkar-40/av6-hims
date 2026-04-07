export interface CreateIncomeInput {
  id?: number;
  incHeadId: number;
  name: string;
  invoiceNo: string;
  date?: Date | null;
  amount?: number | null;
  note?: string | null;
  documents?: string | null;
}

export interface CreateIncomeReq {
  id?: string;
  incHeadId: string;
  name: string;
  invoiceNo: string;
  date?: string | null;
  amount?: string | null;
  note?: string | null;
  documents?: string | null;
}

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
  id: string;
}
