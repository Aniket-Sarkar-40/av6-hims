import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { getPattern } from "av6-core";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { CreateOrUpdateDoctor } from "@/types/staff/doctor.js";

export const doctorSchema = Joi.object<CreateOrUpdateDoctor>({
  id: Joi.number().positive().integer().optional().strict().messages({
    "number.positive": "ID must be a positive integer",
    "number.integer": "ID must be an integer",
  }),
  name: Joi.string().trim().min(2).max(50).required().messages({
    "string.base": "Name must be a string",
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name must be at most 50 characters long",
    "any.required": "Name is required",
  }),

  surname: Joi.string().trim().min(2).max(50).required().messages({
    "string.base": "Surname must be a string",
    "string.empty": "Surname is required",
    "string.min": "Surname must be at least 2 characters long",
    "string.max": "Surname must be at most 50 characters long",
    "any.required": "Surname is required",
  }),

  employeeId: Joi.string().trim().min(2).max(50).required().messages({
    "string.base": "Employee Id must be a string",
    "string.empty": "Employee Id is required",
    "string.min": "Employee Id must be at least 2 characters long",
    "string.max": "Employee Id must be at most 50 characters long",
    "any.required": "Employee Id is required",
  }),

  dob: Joi.date().iso().required().messages({
    "date.base": "Date of Birth must be a valid date",
    "date.isoDate":
      "Date of Birth must be in ISO 8601 format (e.g., 2025-05-31)",
    "any.required": "Date of Birth is required",
  }),

  title: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .optional()
    .allow(null, "")
    .messages({
      "string.base": "Title must be a string",
      "string.empty": "Title is required",
      "string.min": "Title must be at least 2 characters long",
      "string.max": "Title must be at most 50 characters long",
    }),

  phone: Joi.string()
    .pattern(getPattern.phonePattern)
    .optional()
    .allow(null)
    .messages({
      "string.base": "Phone must be a string",
      "string.pattern.base": "Please enter a valid phone number",
    }),

  email: Joi.string()
    .email()
    .pattern(getPattern.emailPattern)
    .required()
    .messages({
      "string.base": "Email must be a string",
      "string.email": "Please provide a valid email address",
      "string.pattern.base": "Please provide a valid email address",
      "any.required": "Email is required",
    }),

  notes: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .optional()
    .allow(null, "")
    .messages({
      "string.base": "Notes must be a string",
      "string.empty": "Notes are required",
      "string.min": "Notes must be at least 2 characters long",
      "string.max": "Notes must be at most 200 characters long",
    }),

  departmentId: Joi.number().strict().optional().allow(null).messages({
    "number.base": "Department Id must be a number",
  }),

  designationId: Joi.number().strict().optional().allow(null).messages({
    "number.base": "Designation Id must be a number",
  }),
});

export const validateDoctor = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = doctorSchema.validate(req.body, { abortEarly: false });

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
