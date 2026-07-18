import {
  arrayRequired,
  boolOptional,
  idOptional,
  idRequired,
  intOptional,
  intRequired,
  strOptional,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import Joi from "joi";

export const medicineTabDetailsItemSchema = Joi.object({
  medId: idRequired("Medicine Id"),

  morn: intOptional("Morning Dose"),

  aft: intOptional("Afternoon Dose"),

  night: intOptional("Night Dose"),

  sos: boolOptional("SOS").default(false),

  duration: intRequired("Duration", 1),

  notes: strOptional("Notes"),

  isActive: boolOptional("Is Active").default(true),
})
  .custom((v, h) => {
    if (!["morn", "aft", "night"].some((key) => Number(v[key]) > 0)) {
      return h.error("any.custom", {
        message: "Please enter at least one dose.",
      });
    }
    return v;
  })
  .messages({
    "any.custom": generateValidationErrorMessage(
      "EMPTY",
      "Dose",
      "Please enter at least one dose",
    ),
  });

export const createMedicineTabDetailsSchema = Joi.object({
  medicineTabId: idRequired("Medicine Tab Id"),

  data: arrayRequired("Medicine Tab Details", medicineTabDetailsItemSchema, 1),
});

export const validateMedicineTabDetailsCreate = validationHandler({
  schema: createMedicineTabDetailsSchema,
});

const medicineTabDetailsItemUpdateSchema = medicineTabDetailsItemSchema.keys({
  id: idOptional("Medicine Tab Detail Id"),
});

export const updateMedicineTabDetailsSchema =
  createMedicineTabDetailsSchema.keys({
    data: arrayRequired(
      "Medicine Tab Details",
      medicineTabDetailsItemUpdateSchema,
      1,
    ),
  });

export const validateMedicineTabDetailsUpdate = validationHandler({
  schema: updateMedicineTabDetailsSchema,
});
