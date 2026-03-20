import { SearchTestInput } from "@/types/appointment/investigation.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { NextFunction, Request, Response } from "express";
import Joi, { ValidationErrorItem } from "joi";

export const SearchTestSchema = Joi.object<SearchTestInput>({
  text: Joi.string()
    .trim()
    .min(3)
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", " Search Text"),
      "string.min": generateValidationErrorMessage(
        "STRING_MIN",
        "Search Text",
        "3",
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Search Text"),
    }),
});

export const CreateTestCategoriesSchema = Joi.object({
  doctorId: Joi.number()
    .integer()
    .positive()
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Doctor ID"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Doctor ID"),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Doctor ID",
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Doctor ID"),
    }),

  catergoryName: Joi.string()
    .trim()
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Category Name"),
      "string.empty": generateValidationErrorMessage(
        "EMPTY_STRING",
        "Category Name",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Category Name",
      ),
    }),
});

export const UpdateTestCategoriesSchema = CreateTestCategoriesSchema.keys({
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
});

const TestItemSchema = Joi.object({
  testId: Joi.number()
    .integer()
    .positive()
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Test ID"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Test ID"),
      "number.positive": generateValidationErrorMessage("POSITIVE", "Test ID"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Test ID"),
    }),

  testCode: Joi.string()
    .trim()
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Test Code"),
      "string.empty": generateValidationErrorMessage(
        "EMPTY_STRING",
        "Test Code",
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Test Code"),
    }),

  testName: Joi.string()
    .trim()
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Test Name"),
      "string.empty": generateValidationErrorMessage(
        "EMPTY_STRING",
        "Test Name",
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Test Name"),
    }),
});

export const CreateTestsSchema = Joi.object({
  testCategoryId: Joi.number()
    .integer()
    .positive()
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Test Category ID",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Test Category ID",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Test Category ID",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Test Category ID",
      ),
    }),

  data: Joi.array()
    .items(TestItemSchema)
    .min(1)
    .required()
    .messages({
      "array.base": generateValidationErrorMessage("ARRAY", "Tests Data"),
      "array.min": generateValidationErrorMessage(
        "ARRAY_MIN_LENGTH",
        "Tests Data",
        "1",
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Tests Data"),
    }),
});

const UpdateTestItemSchema = TestItemSchema.keys({
  id: Joi.number()
    .integer()
    .positive()
    .optional()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Test ID"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Test ID"),
      "number.positive": generateValidationErrorMessage("POSITIVE", "Test ID"),
    }),
});

export const UpdateTestsSchema = Joi.object({
  testCategoryId: Joi.number()
    .integer()
    .positive()
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Test Category ID",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Test Category ID",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Test Category ID",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Test Category ID",
      ),
    }),

  data: Joi.array()
    .items(UpdateTestItemSchema)
    .min(1)
    .required()
    .messages({
      "array.base": generateValidationErrorMessage("ARRAY", "Tests Data"),
      "array.min": generateValidationErrorMessage(
        "ARRAY_MIN_LENGTH",
        "Tests Data",
        "1",
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Tests Data"),
    }),
});

/*-------------------------Investigation/Precedure validation----------------------*/
const PatientTestItemSchema = Joi.object({
  testId: Joi.number()
    .integer()
    .positive()
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Test ID"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Test ID"),
      "number.positive": generateValidationErrorMessage("POSITIVE", "Test ID"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Test ID"),
    }),

  comment: Joi.string()
    .trim()
    .optional()
    .allow(null, "")
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Comment"),
    }),

  processLocation: Joi.number()
    .integer()
    .positive()
    .optional()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Process Location",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Process Location",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Process Location",
      ),
    }),
});

export const CreatePatientTestSchema = Joi.object({
  appointmentId: Joi.number()
    .integer()
    .positive()
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Appointment ID"),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Appointment ID",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Appointment ID",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Appointment ID",
      ),
    }),

  data: Joi.array()
    .items(PatientTestItemSchema)
    .min(1)
    .required()
    .messages({
      "array.base": generateValidationErrorMessage(
        "ARRAY",
        "Patient Tests Data",
      ),
      "array.min": generateValidationErrorMessage(
        "ARRAY_MIN_LENGTH",
        "Patient Tests Data",
        "1",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Patient Tests Data",
      ),
    }),
});

const UpdatePatientTestItemSchema = PatientTestItemSchema.keys({
  id: Joi.number()
    .integer()
    .positive()
    .optional()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Patient Test ID",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Patient Test ID",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Patient Test ID",
      ),
    }),
});

export const UpdatePatientTestSchema = Joi.object({
  appointmentId: Joi.number()
    .integer()
    .positive()
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Appointment ID"),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Appointment ID",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Appointment ID",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Appointment ID",
      ),
    }),

  data: Joi.array()
    .items(UpdatePatientTestItemSchema)
    .min(1)
    .required()
    .messages({
      "array.base": generateValidationErrorMessage(
        "ARRAY",
        "Updated Patient Tests Data",
      ),
      "array.min": generateValidationErrorMessage(
        "ARRAY_MIN_LENGTH",
        "Updated Patient Tests Data",
        "1",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Updated Patient Tests Data",
      ),
    }),
});

/*Common validation middileware to validate request */
const validationHandler = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
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
};

export const validateSearchTest = validationHandler(SearchTestSchema);
export const validateCreateTestCategories = validationHandler(
  CreateTestCategoriesSchema,
);
export const validateUpdateTestCategories = validationHandler(
  UpdateTestCategoriesSchema,
);
export const validateCreateTests = validationHandler(CreateTestsSchema);
export const validateUpdateTests = validationHandler(UpdateTestsSchema);
export const validateCreatePatientTest = validationHandler(
  CreatePatientTestSchema,
);
export const validateUpdatePatientTest = validationHandler(
  UpdatePatientTestSchema,
);
