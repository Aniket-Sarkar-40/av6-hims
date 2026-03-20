import { MedicineTabDetails, Prisma } from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";
import { ItemData } from "../item.js";

export type CreateMedicineTabDetailsInput = Omit<
  Prisma.MedicineTabDetailsUncheckedCreateInput,
  | "id"
  | "medicineTabId"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "isActive"
>;

export interface CreateMedicineTabDetails {
  medicineTabId: number;
  data: CreateMedicineTabDetailsInput[];
}

export interface UpdateMedicineTabDetails extends CreateMedicineTabDetailsInput {
  id?: number;
}
export interface UpdateMedicineTabDetailsInput {
  medicineTabId: number;
  data: UpdateMedicineTabDetails[];
  existingMedicine: MedicineTabDetails[];
}

export type MedicineTabDetailsDto = Omit<
  MedicineTabDetails,
  | "medicineTabId"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "isActive"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "medId"
> & {
  medicineTab: IdValue | null;
  med: ItemData | null;
};
