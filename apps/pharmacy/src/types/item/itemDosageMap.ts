import {
  ItemInstructionMap,
  ItemMedicineDosageMap,
  MedicineDosage,
  MedicineInstruction,
  PmsItem,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { DecimalToNumber } from "@repo/platform/types/common.js";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";

export type CreateItemDosageMap = Omit<
  Prisma.ItemMedicineDosageMapUncheckedCreateInput,
  BaseModelAttrWoCancel
>;

export interface ItemDosageMapDTO
  extends Omit<
    ItemMedicineDosageMap,
    BaseModelAttrWoCancel | "itemId" | "dosageId"
  > {
  item: DecimalToNumber<PmsItem> | null;
  dosage: MedicineDosage | null;
}

export type CreateItemInstructionMap = Omit<
  Prisma.ItemInstructionMapUncheckedCreateInput,
  BaseModelAttrWoCancel
>;

export interface ItemInstructionMapDTO
  extends Omit<
    ItemInstructionMap,
    BaseModelAttrWoCancel | "itemId" | "instructionId"
  > {
  id: number;
  item: DecimalToNumber<PmsItem> | null;
  instruction: MedicineInstruction | null;
}
