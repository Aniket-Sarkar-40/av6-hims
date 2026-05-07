import { CreateOrUpdateChipsButtonMapping } from "@/types/master/chipsButtonMapping.js";
import { idRequired, strRequired } from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

// Define base schema
export const chipsButtonMappingBaseSchema = {
  doctorId: idRequired("Doctor ID"),

  chipsName: strRequired("Chips Name", 1, 255),
};

// Create schema
export const chipsButtonMappingCreateSchema =
  Joi.object<CreateOrUpdateChipsButtonMapping>({
    ...chipsButtonMappingBaseSchema,
  });

// Update schema (with ID)
export const chipsButtonMappingUpdateSchema =
  Joi.object<CreateOrUpdateChipsButtonMapping>({
    id: idRequired("ID"),
    ...chipsButtonMappingBaseSchema,
  });

// Validation handler for creation
export const validateChipsButtonMappingCreate = validationHandler({
  schema: chipsButtonMappingCreateSchema,
});

// Validation handler for update
export const validateChipsButtonMappingUpdate = validationHandler({
  schema: chipsButtonMappingUpdateSchema,
});
