import {
  Consumption_Priority,
  Consumption_Status,
} from "@repo/db/generated/prisma/client";
import {
  arrayRequired,
  boolRequired,
  dateOptional,
  dateRequired,
  enumRequired,
  idRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const ConsumptionDetailsCreateSchema = Joi.object({
  itemId: idRequired("Item Id"),

  requestedQty: idRequired("Request Quantity"),

  batchNo: Joi.when("isBatch", {
    is: true,
    then: strRequired("Batch number"),
    otherwise: strOptional("Batch number"),
  }),

  expiryDate: Joi.when("isExpiry", {
    is: true,
    then: dateRequired("Expiry date"),
    otherwise: dateOptional("Expiry date"),
  }),

  isBatch: boolRequired("Is Batch"),

  isExpiry: boolRequired("Is Expiry"),
});

export const consumptionCreateSchema = Joi.object({
  ccId: idRequired("CC ID"),
  priority: enumRequired("Priority", Consumption_Priority),
  description: strOptional("Description"),
  status: enumRequired("Status", Consumption_Status),
  requestedBy: idRequired("Requested By"),
  consumptionDetails: arrayRequired(
    "Consumption Details",
    ConsumptionDetailsCreateSchema,
    1
  ),
});

export const validateCreateConsumption = validationHandler({
  schema: consumptionCreateSchema,
});
