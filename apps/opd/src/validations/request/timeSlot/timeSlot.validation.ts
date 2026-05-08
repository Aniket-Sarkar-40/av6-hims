import {
  DoctorConsultationWithTimeSlotInput,
  WeekIdInput,
} from "@/types/timeSlot/timeSlot.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { ReferredBy, TAX_METHOD } from "@repo/db/generated/prisma/client";
import Joi from "joi";
import {
  boolRequired,
  dateRequired,
  enumOptional,
  enumRequired,
  idOptional,
  idRequired,
  intRequired,
  priceOptional,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

export const doctorConsultationWithTimeSlotSchema: Joi.ObjectSchema<DoctorConsultationWithTimeSlotInput> =
  Joi.object({
    docId: idRequired("Doctor ID"),

    ccId: idRequired("Collection Center ID"),

    date: dateRequired("Date").iso(),

    weekId: intRequired("Week Id", 1, 7),

    patientType: enumRequired("Patient Type", ReferredBy),

    isVIPBooking: boolRequired("Is VIP Booking"),

    isSpecialBooking: boolRequired("Is Special Booking"),

    isFOCConsultation: boolRequired("Is FOC Consultation"),

    insuranceId: idOptional("Insurance ID"),

    clientId: idOptional("Client ID"),

    taxMethod: enumOptional("Tax Method", TAX_METHOD),

    taxValue: priceOptional("Tax Value")
      .max(100)
      .messages({
        "number.max": generateValidationErrorMessage(
          "MAX_VALUE",
          "Tax Value",
          "100"
        ),
      }),
  })
    .custom((obj, helpers) => {
      if (obj.isVIPBooking === true && obj.isSpecialBooking === true) {
        return helpers.error("any.invalid", {
          message:
            "Invalid booking type — isVIPBooking and isSpecialBooking cannot both be true",
        });
      }
      return obj;
    })
    .messages({
      "any.invalid": generateValidationErrorMessage(
        "INVALID",
        "Booking Type (VIP and Special cannot both be true)"
      ),
    });

export const validateTimeSlot = validationHandler({
  schema: doctorConsultationWithTimeSlotSchema,
});

export const weekIdInputSchema = Joi.object<WeekIdInput>({
  docId: idRequired("Doctor ID"),

  ccId: idRequired("Collection Center ID"),
});

export const validateWeekId = validationHandler({
  schema: weekIdInputSchema,
});
