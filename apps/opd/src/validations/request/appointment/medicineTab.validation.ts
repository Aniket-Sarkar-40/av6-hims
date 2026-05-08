import { CreateOrUpdateMedicineTab } from "@/types/appointment/medicineTab.js";
import Joi from "joi";
import { idRequired, strRequired } from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

export const medicineTabCreateSchema = Joi.object<CreateOrUpdateMedicineTab>({
  doctorId: idRequired("Doctor Id"),

  medTabName: strRequired("Medicine Tab Name", 0, 100),
});

export const medicineTabUpdateSchema = medicineTabCreateSchema.keys({
  id: idRequired("Medicine Tab Id"),
});

export const validateMedicineTabCreate = validationHandler({
  schema: medicineTabCreateSchema,
});

export const validateMedicineTabUpdate = validationHandler({
  schema: medicineTabUpdateSchema,
});
