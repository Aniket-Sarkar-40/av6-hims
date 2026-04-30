import {
  idRequired,
  priceRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const CreateGeneralBillItemSchema = Joi.object({
  name: strRequired("Name", 2, 100),

  description: strOptional("Description", 255),

  defaultPrice: priceRequired("Default Price"),
});

export const UpdateGeneralBillItemSchema = CreateGeneralBillItemSchema.keys({
  id: idRequired("Id"),
});

export const validateCreateGeneralBillItemSchema = validationHandler({
  schema: CreateGeneralBillItemSchema,
});
export const validateUpdateGeneralBillItemSchema = validationHandler({
  schema: UpdateGeneralBillItemSchema,
});
