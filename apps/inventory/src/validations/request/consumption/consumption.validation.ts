import { CommonConsumptionInput } from "@/types/consumption/consumption.js";
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
  intRequired,
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

export const ConsumptionDetailsUpdateSchema =
  ConsumptionDetailsCreateSchema.keys({
    id: intRequired("Id"),
  });

export const consumptionUpdateSchema = consumptionCreateSchema.keys({
  id: intRequired("Id"),
  consumptionDetails: arrayRequired(
    "Consumption Details",
    ConsumptionDetailsUpdateSchema,
    1
  ),
});

export const validateUpdateConsumption = validationHandler({
  schema: consumptionUpdateSchema,
});

export const commonConsumptionInputSchema = Joi.object<CommonConsumptionInput>({
  id: intRequired("Id"),
  ccId: intRequired("CC Id"),
  userId: intRequired("User Id"),
  description: strOptional("Description"),
});

export const validateCommonConsumptionInput = validationHandler({
  schema: commonConsumptionInputSchema,
});

export const ConsumptionDetailsApproveSchema =
  ConsumptionDetailsCreateSchema.keys({
    id: idRequired("Id"),
    consumedQty: intRequired("Consumed Quantity", 0, Joi.ref("requestedQty")),

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

export const consumptionApproveSchema = consumptionCreateSchema.keys({
  id: idRequired("Id"),
  consumptionDetails: arrayRequired(
    "Consumption Details",
    ConsumptionDetailsApproveSchema,
    1
  ),
});

export const validateApproveConsumption = validationHandler({
  schema: consumptionApproveSchema,
});
