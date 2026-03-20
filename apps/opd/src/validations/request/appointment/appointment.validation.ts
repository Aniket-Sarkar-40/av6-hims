import {
  CreateAppointmentsTableInput,
  GetAppointmentFeesInput,
  RescheduleAppointmentInput,
  UpgradeAppointmentReq,
} from "@/types/appointment/appointment.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import {
  AppointmentType,
  AptStatus,
  FocBillReason,
  PercentageOrAmount,
  ReferredBy,
  TAX_METHOD,
} from "@repo/db/generated/prisma/client";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const appointmentsSchema = Joi.object<CreateAppointmentsTableInput>({
  patientId: Joi.number()
    .integer()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Patient"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Patient"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Patient"),
    }),

  patientUniqueId: Joi.number()
    .integer()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Patient Unique ID",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Patient Unique ID",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Patient Unique ID",
      ),
    }),

  ccId: Joi.number()
    .integer()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Collection Center",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Collection Center",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Collection Center",
      ),
    }),

  contactNumber: Joi.string()
    .required()
    .length(9)
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Contact Number"),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Contact Number",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Contact Number",
      ),
    }),

  appointmentType: Joi.string()
    .valid(...Object.values(AppointmentType))
    .required()
    .messages({
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Appointment Type",
        ...Object.values(AppointmentType),
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Appointment Type",
      ),
    }),

  referredBy: Joi.string()
    .valid(...Object.values(ReferredBy))
    .required()
    .messages({
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Referred By",
        ...Object.values(ReferredBy),
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Referred By"),
    }),

  clientId: Joi.number()
    .integer()
    .allow(null)
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Client"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Client"),
    }),

  reason: Joi.string()
    .min(1)
    .optional()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Reason"),
      // "any.required": generateValidationErrorMessage("REQUIRED", "Reason"),
      "string.min": generateValidationErrorMessage("MIN_VALUE", "Reason", "1"),
    }),

  doctorId: Joi.number()
    .integer()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Doctor"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Doctor"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Doctor"),
    }),

  isFoc: Joi.boolean()
    .allow(null)
    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "Is FOC"),
    }),

  subtotalAmount: Joi.number()

    .required()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Consultation Fee",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Consultation Fee",
      ),
    }),
  otherChargeAmount: Joi.number()
    .allow(null)
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "VIP/Special Fee",
      ),
    }),
  netAmount: Joi.number()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Net Amount"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Net Amount"),
    }),

  grossAmount: Joi.number()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Gross Amount"),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Gross Amount",
      ),
    }),

  coPaymentAmount: Joi.number()
    .allow(null)
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Co-payment Amount",
      ),
    }),

  additionalDiscountMode: Joi.string()
    .valid(...Object.values(PercentageOrAmount))
    .optional()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Discount type"),
      "string.enum": generateValidationErrorMessage(
        "VALID_ENUM",
        "Discount type",
        ...Object.values(PercentageOrAmount),
      ),
    }),
  additionalDiscountValue: Joi.number()
    .optional()
    .min(0)
    .max(100)
    .precision(2)
    .allow(null)
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Discount value"),
      "number.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Discount value",
        "0",
      ),
      "number.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Discount value",
        "100",
      ),
      "number.precision": generateValidationErrorMessage(
        "PRECISION",
        "Discount value",
        "2",
      ),
    }),
  discountTotalAmount: Joi.number()
    .optional()
    .min(0)
    .allow(null)
    .precision(2)
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Discount amount",
      ),
      "number.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Discount amount",
        "0",
      ),
      "number.precision": generateValidationErrorMessage(
        "PRECISION",
        "Discount amount",
        "0",
      ),
    }),

  taxMethod: Joi.string()
    .valid(...Object.values(TAX_METHOD))
    .optional()
    .allow(null)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Tax method"),
      "string.enum": generateValidationErrorMessage(
        "VALID_ENUM",
        "Tax method",
        ...Object.values(TAX_METHOD),
      ),
    }),

  taxValue: Joi.number()
    .min(0)
    .max(100)
    .optional()
    .allow(null)
    .precision(2)
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Tax"),
      "number.min": generateValidationErrorMessage("MIN_VALUE", "Tax", "0"),
      "number.max": generateValidationErrorMessage("MAX_VALUE", "Tax", "100"),
      "number.precision": generateValidationErrorMessage(
        "PRECISION",
        "Tax",
        "2",
      ),
    }),
  taxAmount: Joi.number()
    .min(0)
    .optional()
    .precision(2)
    .strict()
    .allow(null)
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Tax amount"),
      "number.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Tax amount",
        "0",
      ),
      "number.precision": generateValidationErrorMessage(
        "PRECISION",
        "Tax amount",
        "2",
      ),
    }),

  weekId: Joi.number()
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Day Name"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Day Name"),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Day Name",
        "50",
      ),
    }),

  selectedDate: Joi.date()
    .iso()
    .required()
    .messages({
      "date.base": generateValidationErrorMessage("DATE", "Selected Date"),
      "date.format": generateValidationErrorMessage("DATE", "Selected Date"),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Selected Date",
      ),
    }),

  selectedTime: Joi.string()
    .min(1)
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Selected Time"),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Selected Time",
      ),
    }),

  status: Joi.string()
    .valid(...Object.values(AptStatus))
    .required()
    .messages({
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Status",
        ...Object.values(AptStatus),
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Status"),
    }),

  insuranceId: Joi.number()
    .integer()
    .allow(null)
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Insurance"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Insurance"),
    }),

  patientInsuranceId: Joi.number()
    .integer()
    .allow(null)
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Patient insurance",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Patient insurance",
      ),
    }),

  isVipBooking: Joi.boolean()
    .allow(null)
    .messages({
      "boolean.base": generateValidationErrorMessage(
        "BOOLEAN",
        "Is VIP Booking",
      ),
    }),

  isSpecialBooking: Joi.boolean()
    .allow(null)
    .messages({
      "boolean.base": generateValidationErrorMessage(
        "BOOLEAN",
        "Is Special Booking",
      ),
    }),

  focBillReason: Joi.string()
    .valid(...Object.values(FocBillReason))
    .allow(null)
    .messages({
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Foc bill reason",
        ...Object.values(FocBillReason),
      ),
    }),
});
export const validateAppointments = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = appointmentsSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: error.message,
        errors: error.details,
      }),
    );
  }

  next();
};

export const appointmentsSchemaUpdate = appointmentsSchema.keys({
  id: Joi.number()
    .integer()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Id"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Id"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Id"),
    }),
});

export const validateAppointmentUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = appointmentsSchemaUpdate.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: error.message,
        errors: error.details,
      }),
    );
  }

  next();
};

export const rescheduleAppointmentSchema =
  Joi.object<RescheduleAppointmentInput>({
    doctorId: Joi.number()
      .integer()
      .strict()
      .required()
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Doctor"),
        "any.required": generateValidationErrorMessage("REQUIRED", "Doctor"),
        "number.integer": generateValidationErrorMessage("INTEGER", "Doctor"),
        "number.strict": generateValidationErrorMessage(
          "STRICT",
          "Doctor",
          "number",
        ),
      }),

    subtotalAmount: Joi.number()
      .integer()
      .strict()
      .required()
      .messages({
        "number.base": generateValidationErrorMessage(
          "NUMBER",
          "Consultation Fee",
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Consultation Fee",
        ),
        "number.integer": generateValidationErrorMessage(
          "INTEGER",
          "Consultation Fee",
        ),
        "number.strict": generateValidationErrorMessage(
          "STRICT",
          "Consultation Fee",
          "number",
        ),
      }),

    ccId: Joi.number()
      .integer()
      .strict()
      .required()
      .messages({
        "number.base": generateValidationErrorMessage(
          "NUMBER",
          "Collection Center",
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Collection Center",
        ),
        "number.integer": generateValidationErrorMessage(
          "INTEGER",
          "Collection Center",
        ),
        "number.strict": generateValidationErrorMessage(
          "STRICT",
          "Collection Center",
          "number",
        ),
      }),

    id: Joi.number()
      .integer()
      .strict()
      .required()
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Appointment"),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Appointment",
        ),
        "number.integer": generateValidationErrorMessage(
          "INTEGER",
          "Appointment",
        ),
        "number.strict": generateValidationErrorMessage(
          "STRICT",
          "Appointment",
          "number",
        ),
      }),

    selectedDate: Joi.date()
      .required()
      .messages({
        "date.base": generateValidationErrorMessage("DATE", "Selected Date"),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Selected Date",
        ),
      }),

    selectedTime: Joi.string()
      .required()
      .messages({
        "string.base": generateValidationErrorMessage(
          "STRING",
          "Selected Time",
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Selected Time",
        ),
      }),

    weekId: Joi.number()
      .integer()
      .min(1)
      .max(7)
      .strict()
      .required()
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Week Id"),
        "number.min": generateValidationErrorMessage(
          "MIN_VALUE",
          "Week Id",
          "1",
        ),
        "any.required": generateValidationErrorMessage("REQUIRED", "Week Id"),
        "number.integer": generateValidationErrorMessage("INTEGER", "Week Id"),
        "number.max": generateValidationErrorMessage(
          "MAX_VALUE",
          "Week Id",
          "7",
        ),
        "number.strict": generateValidationErrorMessage(
          "STRICT",
          "Week Id",
          "number",
        ),
      }),

    netAmount: Joi.number()
      .integer()
      .required()
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Net Amount"),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Net Amount",
        ),
        "number.integer": generateValidationErrorMessage(
          "INTEGER",
          "Net Amount",
        ),
      }),

    grossAmount: Joi.number()
      .integer()
      .required()
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Gross Amount"),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Gross Amount",
        ),
        "number.integer": generateValidationErrorMessage(
          "INTEGER",
          "Gross Amount",
        ),
      }),

    coPaymentAmount: Joi.number()
      .integer()
      .allow(null)
      .messages({
        "number.base": generateValidationErrorMessage(
          "NUMBER",
          "Co-payment Amount",
        ),
        "number.integer": generateValidationErrorMessage(
          "INTEGER",
          "Co-payment Amount",
        ),
      }),

    otherChargeAmount: Joi.number()
      .integer()
      .allow(null)
      .messages({
        "number.base": generateValidationErrorMessage(
          "NUMBER",
          "VIP/Special Fee",
        ),
        "number.integer": generateValidationErrorMessage(
          "INTEGER",
          "VIP/Special Fee",
        ),
      }),
    discountTotalAmount: Joi.number()
      .optional()
      .min(0)
      .allow(null)
      .precision(2)
      .strict()
      .messages({
        "number.base": generateValidationErrorMessage(
          "NUMBER",
          "Discount amount",
        ),
        "number.min": generateValidationErrorMessage(
          "MIN_VALUE",
          "Discount amount",
          "0",
        ),
        "number.precision": generateValidationErrorMessage(
          "PRECISION",
          "Discount amount",
          "0",
        ),
      }),
    taxAmount: Joi.number()
      .min(0)
      .optional()
      .precision(2)
      .strict()
      .allow(null)
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Tax amount"),
        "number.min": generateValidationErrorMessage(
          "MIN_VALUE",
          "Tax amount",
          "0",
        ),
        "number.precision": generateValidationErrorMessage(
          "PRECISION",
          "Tax amount",
          "2",
        ),
      }),
  });

export const validateRescheduledAppointment = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = rescheduleAppointmentSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: error.message,
        errors: error.details,
      }),
    );
  }

  next();
};

export const upgradeAppointmentSchema = Joi.object<UpgradeAppointmentReq>({
  appointmentId: Joi.number()
    .integer()
    .positive()
    .strict()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Appointment Id"),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Appointment Id",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Appointment Id",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Appointment Id",
      ),
      "number.strict": generateValidationErrorMessage(
        "STRICT",
        "Appointment Id",
        "number",
      ),
    }),
  isVipBooking: Joi.boolean()
    .default(false)
    .required()
    .messages({
      "boolean.base": generateValidationErrorMessage(
        "BOOLEAN",
        "Is VIP Booking",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Is VIP Booking",
      ),
    }),
  isSpecialBooking: Joi.boolean()
    .default(false)
    .required()
    .messages({
      "boolean.base": generateValidationErrorMessage(
        "BOOLEAN",
        "Is Special Booking",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Is Special Booking",
      ),
    }),
});

export const validateUpgradeAppointment = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = upgradeAppointmentSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: error.message,
        errors: error.details,
      }),
    );
  }

  next();
};

export const getAppointmentFeesSchema = Joi.object<GetAppointmentFeesInput>({
  ccId: Joi.number()
    .integer()
    .positive()
    .strict()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Collection Center Id",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Collection Center Id",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Collection Center Id",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Collection Center Id",
      ),
      "number.strict": generateValidationErrorMessage(
        "STRICT",
        "Collection Center Id",
        "number",
      ),
    }),

  doctorId: Joi.number()
    .integer()
    .positive()
    .strict()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Doctor Id"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Doctor Id"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Doctor Id"),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Doctor Id",
      ),
      "number.strict": generateValidationErrorMessage(
        "STRICT",
        "Doctor Id",
        "number",
      ),
    }),

  insuranceId: Joi.number()
    .integer()
    .positive()
    .strict()
    .optional()
    .allow(null)
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Insurance Id"),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Insurance Id",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Insurance Id",
      ),
      "number.strict": generateValidationErrorMessage(
        "STRICT",
        "Insurance Id",
        "number",
      ),
    }),

  clientId: Joi.number()
    .integer()
    .positive()
    .strict()
    .optional()
    .allow(null)
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Client Id"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Client Id"),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Client Id",
      ),
      "number.strict": generateValidationErrorMessage(
        "STRICT",
        "Client Id",
        "number",
      ),
    }),

  weekId: Joi.number()
    .integer()
    .required()
    .min(1)
    .max(7)
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Week ID"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Week ID"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Week ID"),
      "number.min": generateValidationErrorMessage("MIN_VALUE", "Week ID", "1"),
      "number.max": generateValidationErrorMessage("MAX_VALUE", "Week ID", "7"),
    }),

  patientType: Joi.string()
    .valid(...Object.values(ReferredBy))
    .required()
    .strict()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Patient Type"),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Patient Type",
        ...Object.values(ReferredBy),
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Patient Type",
      ),
    }),

  isFoc: Joi.boolean()
    .default(false)
    .required()
    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "Is Foc"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Is Foc"),
    }),
});

export const validategetAppointmentFees = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = getAppointmentFeesSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: error.message,
        errors: error.details,
      }),
    );
  }

  next();
};
