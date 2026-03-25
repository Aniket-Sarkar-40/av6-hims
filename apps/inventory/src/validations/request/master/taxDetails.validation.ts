import {
  idRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { TaxDetails } from "@repo/db/generated/prisma/client";
import Joi from "joi";

export const taxDetailsCreateSchema = Joi.object<TaxDetails>({
  name: strRequired("Tax Name"),
  description: strOptional("Tax Description"),
});

export const taxDetailsUpdateSchema = taxDetailsCreateSchema.keys({
  id: idRequired("Tax Details Id"),
});

export const validateTaxDetailsCreate = validationHandler({
  schema: taxDetailsCreateSchema,
});

export const validateTaxDetailsUpdate = validationHandler({
  schema: taxDetailsUpdateSchema,
});
