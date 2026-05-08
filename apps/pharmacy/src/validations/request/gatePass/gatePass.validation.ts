import {
  CreateOrUpdateGatePassInput,
  GatePassFilter,
} from "@/types/gatePass/gatePass.js";
import { joiDecimalFromSettings } from "@/utils/commonCalculation.utils.js";
import { GPStatus, PMS_PRIORITY } from "@repo/db/generated/prisma/enums.js";
import {
  dateOptional,
  dateRequired,
  enumOptional,
  idOptional,
  idRequired,
  intRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const gatePassSchema = Joi.object<CreateOrUpdateGatePassInput>({
  id: idOptional("Id"),

  distributorId: idRequired("Distributor Id"),

  warehouseId: idRequired("Warehouse Id"),

  totalQuantity: intRequired("Total Quantity"),

  poNumber: strRequired("PO Number"),

  poDate: dateRequired("PO Date"),

  boxCount: intRequired("Box Count"),

  billAmount: joiDecimalFromSettings({
    key: "grnPrecision",
    required: true,
  }).messages({
    "number.base": "Bill amount must be a number",
    "number.precision": "Bill amount must have {{#limit}} decimal places",
    "any.required": "Bill amount is required",
  }),

  invoiceNumber: strOptional("Invoice Number"),

  remarks: strOptional("Remarks"),

  priority: enumOptional("Priority", PMS_PRIORITY),
  status: enumOptional("Status", GPStatus),
});

export const validateGatePass = validationHandler({
  schema: gatePassSchema,
});

export const gatePassSchemaUpdate = gatePassSchema.keys({
  id: idRequired("Id"),
});

export const validateGatePassUpdate = validationHandler({
  schema: gatePassSchemaUpdate,
});

export const gatePassFilterSchema = Joi.object<GatePassFilter>({
  poNumber: strOptional("PO Number"),

  poDateStart: dateOptional("PO Date Start"),

  poDateEnd: dateOptional("PO Date End"),

  status: enumOptional("Status", GPStatus),
})
  .with("poDateEnd", "poDateStart")
  .custom((obj, helpers) => {
    if (obj.poDateStart && obj.poDateEnd && obj.poDateStart > obj.poDateEnd) {
      return helpers.error("date.range");
    }
    return obj;
  })
  .messages({
    "date.range": `"poDateStart" must be on or before "poDateEnd"`,
  });

export const validateGatePassFilter = validationHandler({
  schema: gatePassFilterSchema,
});
