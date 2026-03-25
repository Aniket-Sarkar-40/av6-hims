import { Printer_Type, Prisma } from "@repo/db/generated/prisma/client";
import { BaseModelAttr } from "@repo/shared/types/global.js";

export type CreateOrUpdateSettings = Omit<
  Prisma.PmsSettingsUncheckedCreateInput,
  BaseModelAttr
>;

export interface CreatePrinterSettings {
  ccId: number;
  printerName: string;
  printerType: Printer_Type;
  printerWidth: number;
}

export interface UpdatePrinterSettings extends CreatePrinterSettings {
  id: number;
}
