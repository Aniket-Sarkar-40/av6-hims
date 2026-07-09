import {
  GeneralBillingCreateInput,
  GeneralBillingDetailsInput,
} from "@/types/appointment/generalBilling.js";
import {
  PercentageOrAmount,
  TAX_METHOD,
} from "@repo/db/generated/prisma/client";
import {
  arrayRequired,
  boolRequired,
  enumOptional,
  idOptional,
  idRequired,
  intRequired,
  priceOptional,
  priceRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const GeneralBillingDetailsCreateSchema =
  Joi.object<GeneralBillingDetailsInput>({
    generalBillItemId: idRequired("General Bill Item Id"),

    subtotalAmount: priceRequired("Subtotal Amount"),

    otherChargeAmount: priceOptional("Other Charge Amount"),

    discountMode: enumOptional("Discount Mode", PercentageOrAmount),

    discountValue: priceOptional("Discount Value"),

    discountAmount: priceOptional("Discount Amount"),

    taxMethod: enumOptional("Tax Method", TAX_METHOD),

    taxValue: priceOptional("Tax Value"),

    taxAmount: priceOptional("Tax Amount"),

    grossAmount: priceRequired("Gross Amount"),

    netAmount: priceRequired("Net Amount"),

    isFoc: boolRequired("Is FOC"),
  });

export const GeneralBillingCreateSchema = Joi.object<GeneralBillingCreateInput>(
  {
    ccId: idRequired("Collection Center Id"),

    patientId: idRequired("Patient Id"),

    additionalDiscountMode: enumOptional(
      "Additional Discount Mode",
      PercentageOrAmount,
    ),

    additionalDiscountValue: priceOptional("Additional Discount Value"),

    subtotalAmount: priceOptional("Subtotal Amount"),

    otherChargeAmount: priceRequired("Other Charge Amount"),

    discountTotalAmount: priceOptional("Discount Total Amount"),

    taxAmount: priceOptional("Tax Amount"),

    grossAmount: priceRequired("Gross Amount"),

    netAmount: priceRequired("Net Amount"),

    generalBillingDetails: arrayRequired(
      "General Billing Details",
      GeneralBillingDetailsCreateSchema,
      1,
    ),
  },
);

const GeneralBillingDetailsUpdateSchema =
  GeneralBillingDetailsCreateSchema.keys({
    id: idOptional("General Billing Details ID"),
  });

export const GeneralBillingUpdateSchema = GeneralBillingCreateSchema.keys({
  id: idRequired("General Billing ID"),
  generalBillingDetails: arrayRequired(
    "General Billing Details",
    GeneralBillingDetailsUpdateSchema,
    1,
  ),
});

export const GeneralBillingReturnSchema = Joi.object({
  ccId: idRequired("Collection Center Id"),
  id: idRequired("General Billing ID"),
  detailId: arrayRequired(
    "General Billing Details ID",
    intRequired("General Billing Details ID"),
    1,
  ),
});
export const validateCreateGeneralBilling = validationHandler({
  schema: GeneralBillingCreateSchema,
});
export const validateUpdateGeneralBilling = validationHandler({
  schema: GeneralBillingUpdateSchema,
});
export const validateReturnGeneralBilling = validationHandler({
  schema: GeneralBillingReturnSchema,
});
