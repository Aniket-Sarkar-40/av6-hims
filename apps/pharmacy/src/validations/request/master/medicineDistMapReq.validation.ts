import { MedicineDistributorMap } from "@repo/db/generated/prisma/client";
import Joi from "joi";
import {
  dateOptional,
  idOptional,
  idRequired,
  intRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

export const medicineDistMapSchema = Joi.object<MedicineDistributorMap>({
  id: idOptional("ID"),

  itemId: idRequired("Item ID"),

  distributorId: idRequired("Distributor ID"),

  price: intRequired("Price"),

  expiryDate: dateOptional("Expiry Date"),
});

export const validateMedicineDistMap = validationHandler({
  schema: medicineDistMapSchema,
});

export const medicineDistMapSchemaUpdate = medicineDistMapSchema.keys({
  id: idRequired("ID"),
});

export const validateMedicineDistMapUpdate = validationHandler({
  schema: medicineDistMapSchemaUpdate,
});
