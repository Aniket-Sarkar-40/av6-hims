import {
  ServiceCode,
  PdfTemplateType,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";

export type CreatePdfTemplateInput = Omit<
  Prisma.PdfTemplateCreateInput,
  "isActive" | "createdBy" | "updatedBy" | "createdAt" | "updatedAt"
>;

export interface UpdatePdfTemplateInput extends CreatePdfTemplateInput {
  id: number;
}

export interface PdfTemplateDTO
  extends Omit<PdfTemplateType, "isActive" | "createdBy" | "updatedBy"> {
  createdBy: IdValue | null;
  updatedBy: IdValue | null;
}

export interface MakeDefaultPdfTemplateInput {
  id: number;
  module: ServiceCode;
  templateType: PdfTemplateType;
}

export interface GetPdfTemplateByModuleAndTypeInput {
  module: ServiceCode;
  type: PdfTemplateType;
}
