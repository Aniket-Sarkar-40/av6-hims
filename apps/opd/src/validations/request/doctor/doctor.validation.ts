import {
  CreateDoctorInput,
  CreateDoctorScheduleInput,
  UpdateDoctorInput,
  UpdateDoctorScheduleInput,
} from "@/types/doctor/doctor.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { getPattern } from "av6-core";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { NextFunction, Request, Response } from "express";
import Joi, { ValidationErrorItem } from "joi";

export const CreateDoctorScheduleSchema = Joi.object<
  CreateDoctorScheduleInput | UpdateDoctorScheduleInput
>({
  ccId: Joi.number()
    .integer()
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "CC ID"),
      "number.integer": generateValidationErrorMessage("INTEGER", "CC ID"),
      "any.required": generateValidationErrorMessage("REQUIRED", "CC ID"),
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
  startTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      "string.pattern.base": generateValidationErrorMessage(
        "INVALID_FORMAT",
        "Start Time",
        "HH:mm (24-hour)",
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Start Time"),
    }),
  endTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      "string.pattern.base": generateValidationErrorMessage(
        "INVALID_FORMAT",
        "End Time",
        "HH:mm (24-hour)",
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "End Time"),
    })
    .custom((value, helpers) => {
      const { startTime } = helpers.state.ancestors[0];
      if (startTime && value <= startTime) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "End Time Validation")
    .messages({
      "any.invalid": generateValidationErrorMessage(
        "END_BEFORE_START",
        "End Time",
      ),
    }),
  firstVisitPrice: Joi.number()
    .min(0)
    .default(0.0)
    .precision(2)
    .optional()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "First Visit Price",
      ),
      "number.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "First Visit Price",
        "0",
      ),
      "number.precision": generateValidationErrorMessage(
        "DECIMAL",
        "First Visit Price",
        "2",
      ),
    }),
  followUpPrice: Joi.number()
    .min(0)
    .default(0.0)
    .precision(2)
    .optional()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Follow Up Price",
      ),
      "number.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Follow Up Price",
        "0",
      ),
      "number.precision": generateValidationErrorMessage(
        "DECIMAL",
        "Follow Up Price",
        "2",
      ),
    }),
  vipFirstVisitPrice: Joi.number()
    .min(0)
    .default(0.0)
    .precision(2)
    .optional()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Vip First Visit Price",
      ),
      "number.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Vip First Visit Price",
        "0",
      ),
      "number.precision": generateValidationErrorMessage(
        "DECIMAL",
        "Vip First Visit Price",
        "2",
      ),
    }),
  vipFollowUpPrice: Joi.number()
    .min(0)
    .default(0.0)
    .precision(2)
    .optional()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Vip Follow Up Price",
      ),
      "number.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Vip Follow Up Price",
        "0",
      ),
      "number.precision": generateValidationErrorMessage(
        "DECIMAL",
        "Vip Follow Up Price",
        "2",
      ),
    }),
  specialFirstVisitPrice: Joi.number()
    .min(0)
    .default(0.0)
    .precision(2)
    .optional()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Special First Visit Price",
      ),
      "number.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Special First Visit Price",
        "0",
      ),
      "number.precision": generateValidationErrorMessage(
        "DECIMAL",
        "Special First Visit Price",
        "2",
      ),
    }),
  specialFollowUpPrice: Joi.number()
    .min(0)
    .default(0.0)
    .precision(2)
    .optional()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Special Follow Up Price",
      ),
      "number.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Special Follow Up Price",
        "0",
      ),
      "number.precision": generateValidationErrorMessage(
        "DECIMAL",
        "Special Follow Up Price",
        "2",
      ),
    }),
});

export const CreateDoctorSchema = Joi.object<
  CreateDoctorInput | UpdateDoctorInput
>({
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .strict()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Name"),
      "string.min": generateValidationErrorMessage("STRING_MIN", "Name", "3"),
      "string.max": generateValidationErrorMessage("STRING_MAX", "Name", "100"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Name"),
    }),
  gender: Joi.string()
    .valid("Male", "Female", "Others", "Unknown")
    .required()
    .messages({
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Gender",
        "Male, Female, Others",
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Gender"),
    }),
  contactNo: Joi.string()
    .pattern(getPattern.phonePattern)
    .required()
    .messages({
      "string.pattern.base": generateValidationErrorMessage(
        "PHONE",
        "Contact No",
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Contact No"),
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": generateValidationErrorMessage("EMAIL", "Email"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Email"),
    }),
  doctorRegistrationNo: Joi.string()
    .min(5)
    .max(50)
    .required()
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Doctor Registration No",
      ),
      "string.min": generateValidationErrorMessage(
        "STRING_MIN",
        "Doctor Registration No",
        "5",
      ),
      "string.max": generateValidationErrorMessage(
        "STRING_MAX",
        "Doctor Registration No",
        "50",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Doctor Registration No",
      ),
    }),
  address: Joi.string()
    .min(1)
    .max(255)
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Address"),
      "string.min": generateValidationErrorMessage(
        "STRING_MIN",
        "Address",
        "1",
      ),
      "string.max": generateValidationErrorMessage(
        "STRING_MAX",
        "Address",
        "255",
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Address"),
    }),
  collectionCenterIds: Joi.array()
    .items(
      Joi.number()
        .integer()
        .positive()
        .strict()
        .messages({
          "number.base": generateValidationErrorMessage(
            "NUMBER",
            "Collection Center ID",
          ),
          "number.integer": generateValidationErrorMessage(
            "INTEGER",
            "Collection Center ID",
          ),
          "number.positive": generateValidationErrorMessage(
            "POSITIVE",
            "Collection Center ID",
          ),
          "any.required": generateValidationErrorMessage(
            "REQUIRED",
            "Collection Center ID",
          ),
        }),
    )
    .min(1)
    .messages({
      "array.base": generateValidationErrorMessage(
        "ARRAY",
        "Collection Center IDs",
      ),
      "array.min": generateValidationErrorMessage(
        "ARRAY_MIN_LENGTH",
        "Collection Center IDs",
        "1",
      ),
    }),
  checkUpTime: Joi.number()
    .integer()
    .positive()
    .max(60)
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Check Up Time"),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Check Up Time",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Check Up Time",
      ),
      "number.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Check Up Time",
        "60",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Check Up Time",
      ),
    }),
  opdPrimaryDepartmentId: Joi.number()
    .integer()
    .positive()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "OPD Primary Department ID",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "OPD Primary Department ID",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "OPD Primary Department ID",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "OPD Primary Department ID",
      ),
    }),
  opdDepartmentId: Joi.number()
    .integer()
    .positive()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "OPD Department ID",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "OPD Department ID",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "OPD Department ID",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "OPD Department ID",
      ),
    }),
  opdDepartmentPrefixId: Joi.number()
    .integer()
    .positive()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "OPD Department Prefix ID",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "OPD Department Prefix ID",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "OPD Department Prefix ID",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "OPD Department Prefix ID",
      ),
    }),
  licenseType: Joi.string()
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "License Type"),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "License Type",
      ),
    }),
  doctorScheduleDetails: Joi.array()
    .items(CreateDoctorScheduleSchema)
    .min(1)
    .required()
    .messages({
      "array.base": generateValidationErrorMessage(
        "ARRAY",
        "Doctor Schedule Details",
      ),
      "array.min": generateValidationErrorMessage(
        "ARRAY_MIN_LENGTH",
        "Doctor Schedule Details",
        "1",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Doctor Schedule Details",
      ),
    }),
});

export const UpdateDoctorScheduleSchema = CreateDoctorScheduleSchema.keys({
  id: Joi.number()
    .integer()
    .positive()
    .optional()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "ID"),
      "number.integer": generateValidationErrorMessage("INTEGER", "ID"),
      "number.positive": generateValidationErrorMessage("POSITIVE", "ID"),
    }),
});

export const UpdateDoctorSchema = CreateDoctorSchema.keys({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "ID"),
      "number.integer": generateValidationErrorMessage("INTEGER", "ID"),
      "number.positive": generateValidationErrorMessage("POSITIVE", "ID"),
      "any.required": generateValidationErrorMessage("REQUIRED", "ID"),
    }),

  // Omit checkUpTime from the update input (reject if provided)
  checkUpTime: Joi.forbidden().messages({
    // "any.forbidden": generateValidationErrorMessage("NOT_ALLOWED", "Check Up Time"),
    "any.unknown": generateValidationErrorMessage(
      "NOT_ALLOWED",
      "Check Up Time",
    ),
  }),

  doctorScheduleDetails: Joi.array()
    .items(UpdateDoctorScheduleSchema)
    .min(1)
    .required()
    .messages({
      "array.base": generateValidationErrorMessage(
        "ARRAY",
        "Doctor Schedule Details",
      ),
      "array.min": generateValidationErrorMessage(
        "ARRAY_MIN_LENGTH",
        "Doctor Schedule Details",
        "1",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Doctor Schedule Details",
      ),
    }),
});

export const validateDoctorCreate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = CreateDoctorSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (error) {
    const messages = (error.details as ValidationErrorItem[])
      .map((d) => d.message.replace(/['"]/g, ""))
      .join(", ");
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: messages,
        errors: error.details,
      }),
    );
  }

  next();
};

export const validateDoctorUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = UpdateDoctorSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (error) {
    const messages = (error.details as ValidationErrorItem[])
      .map((d) => d.message.replace(/['"]/g, ""))
      .join(", ");
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: messages,
        errors: error.details,
      }),
    );
  }

  next();
};
