import Joi from "joi";
import { idRequired, strRequired } from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

export const stateSchema = Joi.object({
  name: strRequired("State Name", 2),

  countryId: idRequired("Country ID"),
});
export const UpdateStateSchema = stateSchema.keys({
  id: idRequired("State ID"),
});
export const validateState = validationHandler({
  schema: stateSchema,
});

export const validateStateUpdate = validationHandler({
  schema: UpdateStateSchema,
});
