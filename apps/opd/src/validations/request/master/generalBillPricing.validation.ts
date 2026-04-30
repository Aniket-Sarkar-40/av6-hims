import {
  idRequired,
  numberArrayRequired,
  priceRequired,
  strOptional,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import Joi from "joi";

export const BaseGeneralBillPricingSchemaFields = Joi.object({
  generalBillItemId: idRequired("General Bill Item ID"),

  description: strOptional("Description", 255),

  price: priceRequired("Price"),
});

export const CreateGeneralBillPricingSchema =
  BaseGeneralBillPricingSchemaFields.keys({
    ccIds: numberArrayRequired("Collection Center IDs"),
  });

export const UpdateGeneralBillPricingSchema =
  BaseGeneralBillPricingSchemaFields.keys({
    id: idRequired("Id"),

    ccId: idRequired("Collection Center ID"),
  });

export const validateCreateGeneralBillPricingSchema = validationHandler({
  schema: CreateGeneralBillPricingSchema,
});
export const validateUpdateGeneralBillPricingSchema = validationHandler({
  schema: UpdateGeneralBillPricingSchema,
});

export const GeneralBillPricingSearchSchema = Joi.object({
  ccId: idRequired("Collection Center ID"),

  searchText: strOptional("Search Text")
    .min(3)
    .messages({
      "string.min": generateValidationErrorMessage(
        "STRING_MIN",
        "Search Text",
        "3"
      ),
    }),
});

export const validateUpdateGeneralBillPricingSearchSchema = validationHandler({
  schema: GeneralBillPricingSearchSchema,
});
