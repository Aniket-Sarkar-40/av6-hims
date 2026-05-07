import {
  CreateAppointmentsTableInput,
  GetAppointmentFeesInput,
  RescheduleAppointmentInput,
  UpgradeAppointmentReq,
} from "@/types/appointment/appointment.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import {
  AppointmentType,
  AptStatus,
  FocBillReason,
  PercentageOrAmount,
  ReferredBy,
  TAX_METHOD,
} from "@repo/db/generated/prisma/client";
import Joi from "joi";
import {
  boolOptional,
  boolRequired,
  dateRequired,
  enumOptional,
  enumRequired,
  idOptional,
  idRequired,
  intOptional,
  intRequired,
  phoneRequired,
  priceOptional,
  priceRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

export const appointmentsSchema = Joi.object<CreateAppointmentsTableInput>({
  patientId: idRequired("Patient Id"),

  patientUniqueId: idRequired("Patient Unique Id"),

  ccId: idRequired("Collection Center Id"),

  contactNumber: phoneRequired("Contact Number"),

  appointmentType: enumRequired("Appointment Type", AppointmentType),

  referredBy: enumRequired("Referred By", ReferredBy),

  clientId: idOptional("Client Id"),

  reason: strOptional("Reason"),

  doctorId: idRequired("Doctor Id"),

  isFoc: boolOptional("Is FOC"),

  subtotalAmount: priceRequired("Subtotal Amount"),
  otherChargeAmount: priceOptional("Other Charge Amount"),
  netAmount: priceRequired("Net Amount"),

  grossAmount: priceRequired("Gross Amount"),

  coPaymentAmount: priceOptional("Co-payment Amount"),

  additionalDiscountMode: enumOptional(
    "Additional Discount Mode",
    PercentageOrAmount
  ),
  additionalDiscountValue: intOptional("Additional Discount Value")
    .precision(2)
    .messages({
      "number.precision": generateValidationErrorMessage(
        "PRECISION",
        "Discount value",
        "2"
      ),
    }),
  discountTotalAmount: intOptional("Discount Total amount")
    .precision(2)
    .messages({
      "number.precision": generateValidationErrorMessage(
        "PRECISION",
        "Discount Total amount",
        "2"
      ),
    }),

  taxMethod: enumOptional("Tax Method", TAX_METHOD),

  taxValue: intOptional("Tax value", 0, 100)
    .precision(2)
    .messages({
      "number.precision": generateValidationErrorMessage(
        "PRECISION",
        "Tax value",
        "2"
      ),
    }),
  taxAmount: intOptional("Tax Amount")
    .precision(2)
    .messages({
      "number.precision": generateValidationErrorMessage(
        "PRECISION",
        "Tax Amount",
        "2"
      ),
    }),

  weekId: intRequired("Week Id"),

  selectedDate: dateRequired("Selected Date"),

  selectedTime: strRequired("Selected Time", 1),

  status: enumRequired("Status", AptStatus),

  insuranceId: idOptional("Insurance Id"),

  patientInsuranceId: idOptional("Patient Insurance Id"),

  isVipBooking: boolOptional("Is VIP Booking"),

  isSpecialBooking: boolOptional("Is Special Booking"),

  focBillReason: enumOptional("FOC Bill Reason", FocBillReason),
});
export const validateAppointments = validationHandler({
  schema: appointmentsSchema,
});

export const appointmentsSchemaUpdate = appointmentsSchema.keys({
  id: idRequired("Appointment Id"),
});

export const validateAppointmentUpdate = validationHandler({
  schema: appointmentsSchemaUpdate,
});

export const rescheduleAppointmentSchema =
  Joi.object<RescheduleAppointmentInput>({
    doctorId: idRequired("Doctor Id"),

    subtotalAmount: intRequired("Subtotal Amount"),

    ccId: idRequired("Collection Center Id"),

    id: idRequired("Appointment Id"),

    selectedDate: dateRequired("Selected Date"),

    selectedTime: strRequired("Selected Time"),

    weekId: intRequired("Week Id", 1, 7),

    netAmount: intRequired("Net Amount"),

    grossAmount: intRequired("Gross Amount"),

    coPaymentAmount: intOptional("Co-payment Amount"),

    otherChargeAmount: intOptional("Other Charge Amount"),
    discountTotalAmount: intOptional("Discount Total amount")
      .precision(2)
      .messages({
        "number.precision": generateValidationErrorMessage(
          "PRECISION",
          "Discount Total amount",
          "2"
        ),
      }),
    taxAmount: intOptional("Tax Amount")
      .precision(2)
      .messages({
        "number.precision": generateValidationErrorMessage(
          "PRECISION",
          "Tax Amount",
          "2"
        ),
      }),
  });

export const validateRescheduledAppointment = validationHandler({
  schema: rescheduleAppointmentSchema,
});

export const upgradeAppointmentSchema = Joi.object<UpgradeAppointmentReq>({
  appointmentId: idRequired("Appointment Id"),
  isVipBooking: boolRequired("Is VIP Booking").default(false),
  isSpecialBooking: boolRequired("Is Special Booking").default(false),
});

export const validateUpgradeAppointment = validationHandler({
  schema: upgradeAppointmentSchema,
});

export const getAppointmentFeesSchema = Joi.object<GetAppointmentFeesInput>({
  ccId: idRequired("Collection Center Id"),

  doctorId: idRequired("Doctor Id"),

  insuranceId: idOptional("Insurance Id"),

  clientId: idOptional("Client Id"),

  weekId: intRequired("Week Id", 1, 7),

  patientType: enumRequired("Patient Type", ReferredBy),

  isFoc: boolRequired("Is FOC").default(false),
});

export const validategetAppointmentFees = validationHandler({
  schema: getAppointmentFeesSchema,
});
