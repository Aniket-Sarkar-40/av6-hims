import { Printer_Type } from "@repo/db/generated/prisma/enums.js";
import Joi from "joi";
import {
  enumRequired,
  idRequired,
  intRequired,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

export const createPrinterSettingsSchema = Joi.object({
  ccId: idRequired("Collection Center Id"),
  printerName: strRequired("Printer Name"),
  printerType: enumRequired("Printer Type", Printer_Type),
  printerWidth: intRequired("Printer width"),
});

export const updatePrinterSettingsSchema = createPrinterSettingsSchema.keys({
  id: idRequired("ID"),
});

export const validatePrinterSettings = validationHandler({
  schema: createPrinterSettingsSchema,
});

export const validateUpdatePrinterSettings = validationHandler({
  schema: updatePrinterSettingsSchema,
});
