import {
  MedicineDosage,
  MedicineInstruction,
  PmsItem,
} from "@repo/db/generated/prisma/client";
import { DecimalToNumber } from "@repo/platform/types/common.js";

export interface CreateItemDosageMap {
  id?: number;
  itemId: number;
  dosageId: number;
  qty: number;
}
export interface ItemDosageMapDTO {
  id: number;
  item: DecimalToNumber<PmsItem> | null;
  dosage: MedicineDosage | null;
  qty: number;
}
export interface CreateItemInstructionMap {
  id?: number;
  itemId: number;
  instructionId: number;
}

export interface ItemInstructionMapDTO {
  id: number;
  item: DecimalToNumber<PmsItem> | null;
  instruction: MedicineInstruction | null;
}
