import { PatientProcedureDetailsInput } from "@/types/appointment/patientProcedure.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import {
  PercentageOrAmount,
  TAX_METHOD,
} from "@repo/db/generated/prisma/client";
import Joi from "joi";
import {
  arrayRequired,
  enumOptional,
  idOptional,
  idRequired,
  priceOptional,
  priceRequired,
} from "@repo/shared/utils/joi.utils.js";

export const PatientProcedureDetailsCreateSchema =
  Joi.object<PatientProcedureDetailsInput>({
    procedureId: idRequired("Procedure Id"),

    subtotalAmount: priceRequired("Subtotal Amount"),

    otherChargeAmount: priceOptional("Other Charge Amount"),

    coPaymentAmount: priceOptional("Co Payment Amount"),

    discountMode: enumOptional("Discount Mode", PercentageOrAmount),

    discountValue: priceOptional("Discount Value"),

    discountAmount: priceOptional("Discount Amount"),
    taxMethod: enumOptional("Tax Method", TAX_METHOD),

    taxValue: priceOptional("Tax Value"),

    taxAmount: priceOptional("Tax Amount"),

    grossAmount: priceRequired("Gross Amount"),

    netAmount: priceRequired("Net Amount"),
  });

export const PatientProcedureCreateSchema = Joi.object({
  ccId: idRequired("Collection Center Id"),
  appointmentId: idRequired("Appointment Id"),

  additionalDiscountMode: enumOptional(
    "Additional Discount Mode",
    PercentageOrAmount,
  ),

  additionalDiscountValue: priceRequired("Additional Discount Value"),

  subtotalAmount: priceOptional("Subtotal Amount"),

  otherChargeAmount: priceRequired("Other Charge Amount"),

  discountTotalAmount: priceRequired("Discount Total Amount"),

  taxAmount: priceOptional("Tax Amount"),

  grossAmount: priceRequired("Gross Amount"),

  netAmount: priceRequired("Net Amount"),

  coPaymentAmount: priceOptional("Co-payment Amount"),

  patientProcedureDetails: Joi.array()
    .items(PatientProcedureDetailsCreateSchema)
    .min(1)
    .required()
    .unique("procedureId")
    .messages({
      "array.base": generateValidationErrorMessage(
        "ARRAY",
        "Patient Procedure Details",
      ),
      "array.min": generateValidationErrorMessage(
        "ARRAY_MIN_LENGTH",
        "Patient Procedure Details",
        "1",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Patient Procedure Details",
      ),
      "array.unique": generateValidationErrorMessage("DUPLICATE", "Procedure"),
    }),
});

const PatientProcedureDetailsUpdateSchema =
  PatientProcedureDetailsCreateSchema.keys({
    id: idOptional("Patient Procedure Detail Id"),
  });

export const PatientProcedureUpdateSchema = PatientProcedureCreateSchema.keys({
  id: idRequired("Patient Procedure Id"),
  patientProcedureDetails: arrayRequired(
    "Patient Procedure Details",
    PatientProcedureDetailsUpdateSchema,
    1,
  ),
});

export const PatientProcedureReturnSchema = Joi.object({
  ccId: idRequired("Collection Center Id"),
  id: idRequired("Patient Procedure Id"),
  detailId: arrayRequired(
    "Patient Procedure Details ID",
    idRequired("Patient Procedure Details ID"),
    1,
  ),
});
export const validateCreatePatientProcedure = validationHandler({
  schema: PatientProcedureCreateSchema,
});
export const validateUpdatePatientProcedure = validationHandler({
  schema: PatientProcedureUpdateSchema,
});
export const validateReturnPatientProcedure = validationHandler({
  schema: PatientProcedureReturnSchema,
});
