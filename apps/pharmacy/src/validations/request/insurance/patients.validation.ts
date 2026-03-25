import {
  toPatientEntity,
  toPatientUpdateEntity,
} from "@/mapper/insurance/patients.mapper.js";
import { PatientImage, PatientReq } from "@/types/insurance/patients.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

// export const patientsSchema = Joi.object<PatientReq>({
//   admissionDate: Joi.string().optional().valid(null).messages({
//     "string.base": "Admission date must be a string",
//   }),

//   patientName: Joi.string().required().allow(null).min(3).max(100).messages({
//     "string.base": "Patient name must be a string",
//     "string.min": "Patient name must be at least 3 characters long",
//     "string.max": "Patient name must be at most 100 characters long",
//   }),

//   age: Joi.string().required().min(1).max(3).messages({
//     "string.base": "Age must be a string",
//     "any.required": "Age is required",
//     "string.min": "Age must be at least 1 character long",
//     "string.max": "Age must be at most 3 characters long",
//   }),

//   month: Joi.string().required().min(1).max(20).messages({
//     "string.base": "Month must be a string",
//     "any.required": "Month is required",
//     "string.min": "Month must be at least 1 character long",
//     "string.max": "Month must be at most 20 characters long",
//   }),

//   days: Joi.string().optional().allow(null).min(1).max(50).messages({
//     "string.base": "Days must be a string",
//     "string.min": "Days must be at least 1 character long",
//     "string.max": "Days must be at most 50 characters long",
//   }),

//   image: Joi.string().optional().valid(null).min(3).max(255).messages({
//     "string.base": "Image must be a string",
//     "string.min": "Image must be at least 3 characters long",
//     "string.max": "Image must be at most 255 characters long",
//   }),

//   mobileNo: Joi.string().required().min(10).max(15).messages({
//     "string.base": "Mobile number must be a string",
//     "string.min": "Mobile number must be at least 10 characters long",
//     "string.max": "Mobile number must be at most 15 characters long",
//   }),

//   email: Joi.string().email().required().allow(null).min(5).max(100).messages({
//     "string.base": "Email must be a string",
//     "string.email": "Email must be a valid email address",
//     "string.min": "Email must be at least 5 characters long",
//     "string.max": "Email must be at most 100 characters long",
//   }),

//   dob: Joi.date().required().messages({
//     "date.base": "Date of birth must be a valid date",
//   }),

//   gender: Joi.string().required().min(1).max(50).messages({
//     "string.base": "Gender must be a string",
//     "string.min": "Gender must be at least 1 character long",
//     "string.max": "Gender must be at most 50 characters long",
//   }),

//   maritalStatus: Joi.string().required().min(1).max(50).messages({
//     "string.base": "Marital status must be a string",
//     "string.min": "Marital status must be at least 1 character long",
//     "string.max": "Marital status must be at most 50 characters long",
//   }),

//   bloodGroup: Joi.string().optional().allow(null).min(1).max(10).messages({
//     "string.base": "Blood group must be a string",
//     "string.min": "Blood group must be at least 1 character long",
//     "string.max": "Blood group must be at most 10 characters long",
//   }),

//   address: Joi.string().required().min(5).max(255).messages({
//     "string.base": "Address must be a string",
//     "any.required": "Address is required",
//     "string.min": "Address must be at least 5 characters long",
//     "string.max": "Address must be at most 255 characters long",
//   }),

//   guardianName: Joi.string().required().min(3).max(100).messages({
//     "string.base": "Guardian name must be a string",
//     "string.min": "Guardian name must be at least 3 characters long",
//     "string.max": "Guardian name must be at most 100 characters long",
//   }),

//   guardianPhone: Joi.string().required().min(10).max(15).messages({
//     "string.base": "Guardian phone must be a string",
//     "string.min": "Guardian phone must be at least 10 characters long",
//     "string.max": "Guardian phone must be at most 15 characters long",
//   }),

//   guardianAddress: Joi.string()
//     .optional()
//     .allow(null)
//     .min(5)
//     .max(255)
//     .messages({
//       "string.base": "Guardian address must be a string",
//       "string.min": "Guardian address must be at least 5 characters long",
//       "string.max": "Guardian address must be at most 255 characters long",
//     }),

//   guardianEmail: Joi.string()
//     .email()
//     .optional()
//     .allow(null)
//     .min(5)
//     .max(100)
//     .messages({
//       "string.base": "Guardian email must be a string",
//       "string.email": "Guardian email must be a valid email address",
//       "string.min": "Guardian email must be at least 5 characters long",
//       "string.max": "Guardian email must be at most 100 characters long",
//     }),

//   isActive: Joi.string().optional().allow(null).min(2).max(3).messages({
//     "string.base": "Is Active must be a string",
//     "string.min": "Is Active must be at least 2 characters long",
//     "string.max": "Is Active must be at most 3 characters long",
//   }),

//   discharged: Joi.string().optional().allow(null).min(3).max(100).messages({
//     "string.base": "Discharged status must be a string",
//     "string.min": "Discharged status must be at least 3 characters long",
//     "string.max": "Discharged status must be at most 100 characters long",
//   }),

//   patientType: Joi.string().required().min(1).max(100).messages({
//     "string.base": "Patient type must be a string",
//     "any.required": "Patient type is required",
//     "string.min": "Patient type must be at least 1 character long",
//     "string.max": "Patient type must be at most 100 characters long",
//   }),

//   creditLimit: Joi.string().optional().allow(null).min(1).max(50).messages({
//     "string.base": "Credit limit must be a string",
//     "string.min": "Credit limit must be at least 1 character long",
//     "string.max": "Credit limit must be at most 50 characters long",
//   }),

//   organization: Joi.string().optional().allow(null).min(1).max(100).messages({
//     "string.base": "Organization must be a string",
//     "string.min": "Organization must be at least 1 character long",
//     "string.max": "Organization must be at most 100 characters long",
//   }),

//   knownAllergies: Joi.string().optional().allow(null).min(1).max(200).messages({
//     "string.base": "Known allergies must be a string",
//     "string.min": "Known allergies must be at least 1 character long",
//     "string.max": "Known allergies must be at most 200 characters long",
//   }),

//   oldPatient: Joi.string().optional().allow(null).min(1).max(100).messages({
//     "string.base": "Old patient must be a string",
//     "string.min": "Old patient must be at least 1 character long",
//     "string.max": "Old patient must be at most 100 characters long",
//   }),

//   note: Joi.string().required().min(5).max(200).messages({
//     "string.base": "Note must be a string",
//     "any.required": "Note is required",
//     "string.min": "Note must be at least 5 characters long",
//     "string.max": "Note must be at most 200 characters long",
//   }),

//   isIpd: Joi.string().optional().allow(null, "").min(2).max(3).messages({
//     "string.base": "Is Ipd must be a string",
//     "string.min": "Is Ipd must be at least 2 characters long",
//     "string.max": "Is Ipd must be at most 3 characters long",
//   }),

//   ccId: Joi.number().integer().optional().allow(null, "").messages({
//     "number.base": "CC Id must be a number",
//     "number.integer": "CC Id must be an integer",
//   }),

//   isMaster: Joi.string().valid("ML", "CC").optional().allow(null, "").messages({
//     "string.base": "Is Master must be a string",
//     "any.only": "Is Master must be either 'ML' or 'CC'",
//   }),

//   aadhar: Joi.string().optional().allow(null).min(12).max(12).messages({
//     "string.base": "Aadhar must be a string",
//     "string.min": "Aadhar must be exactly 12 characters long",
//     "string.max": "Aadhar must be exactly 12 characters long",
//   }),

//   passport: Joi.string().optional().allow(null).min(3).max(100).messages({
//     "string.base": "Passport must be a string",
//     "string.min": "Passport must be at least 3 characters long",
//     "string.max": "Passport must be at most 100 characters long",
//   }),

//   nationality: Joi.string().optional().allow(null).min(1).max(100).messages({
//     "string.base": "Nationality must be a string",
//     "string.min": "Nationality must be at least 1 character long",
//     "string.max": "Nationality must be at most 100 characters long",
//   }),

//   area: Joi.string().optional().allow(null).min(1).max(100).messages({
//     "string.base": "Area must be a string",
//     "string.min": "Area must be at least 1 character long",
//     "string.max": "Area must be at most 100 characters long",
//   }),

//   pinCode: Joi.string().optional().allow(null).min(1).max(100).messages({
//     "string.base": "PinCode must be a string",
//     "string.min": "PinCode must be at least 1 character long",
//     "string.max": "PinCode must be at most 100 characters long",
//   }),

//   height: Joi.string().optional().allow(null).min(1).max(100).messages({
//     "string.base": "Height must be a string",
//     "string.min": "Height must be at least 1 character long",
//     "string.max": "Height must be at most 100 characters long",
//   }),

//   weight: Joi.string().optional().allow(null).min(1).max(100).messages({
//     "string.base": "Weight must be a string",
//     "string.min": "Weight must be at least 1 character long",
//     "string.max": "Weight must be at most 100 characters long",
//   }),

//   patientCode: Joi.string().optional().allow(null).min(1).max(100).messages({
//     "string.base": "Patient Code must be a string",
//     "string.min": "Patient Code must be at least 1 character long",
//     "string.max": "Patient Code must be at most 100 characters long",
//   }),

//   userLogin: Joi.string().optional().allow(null).min(1).max(100).messages({
//     "string.base": "User login must be a string",
//     "string.min": "User login must be at least 1 character long",
//     "string.max": "User login must be at most 100 characters long",
//   }),

//   state: Joi.string().optional().allow(null).min(1).max(100).messages({
//     "string.base": "State must be a string",
//     "string.min": "State must be at least 1 character long",
//     "string.max": "State must be at most 100 characters long",
//   }),

//   userRelationship: Joi.string()
//     .optional()
//     .allow(null)
//     .min(1)
//     .max(100)
//     .messages({
//       "string.base": "User relationship must be a string",
//       "string.min": "User relationship must be at least 1 character long",
//       "string.max": "User relationship must be at most 100 characters long",
//     }),

//   pid: Joi.string().optional().allow(null).min(1).max(100).messages({
//     "string.base": "PID must be a string",
//     "string.min": "PID must be at least 1 character long",
//     "string.max": "PID must be at most 100 characters long",
//   }),

//   localId: Joi.string().optional().allow(null).min(1).max(100).messages({
//     "string.base": "Local Id must be a string",
//     "string.min": "Local Id must be at least 1 character long",
//     "string.max": "Local Id must be at most 100 characters long",
//   }),

//   street: Joi.string().optional().allow(null).min(1).max(255).messages({
//     "string.base": "Street must be a string",
//     "string.min": "Street must be at least 1 character long",
//     "string.max": "Street must be at most 255 characters long",
//   }),

//   city: Joi.string().optional().allow(null).min(1).max(100).messages({
//     "string.base": "City must be a string",
//     "string.min": "City must be at least 1 character long",
//     "string.max": "City must be at most 100 characters long",
//   }),

//   pinCode2: Joi.string().optional().allow(null).min(1).max(10).messages({
//     "string.base": "PinCode2 must be a string",
//     "string.min": "PinCode2 must be at least 1 character long",
//     "string.max": "PinCode2 must be at most 10 characters long",
//   }),

//   country: Joi.number().integer().optional().allow(null, "").messages({
//     "number.base": "Country must be a number",
//     "number.integer": "Country must be an integer",
//   }),

//   remarks: Joi.string().optional().allow(null).min(1).max(155).messages({
//     "string.base": "Remarks must be a string",
//     "string.min": "Remarks must be at least 1 character long",
//     "string.max": "Remarks must be at most 155 characters long",
//   }),

//   patientImage: Joi.string()
//     .optional()
//     .allow(null, "")
//     .min(1)
//     .max(255)
//     .messages({
//       "string.base": "Patient image must be a string",
//       "string.min": "Patient image must be at least 1 character long",
//       "string.max": "Patient image must be at most 255 characters long",
//     }),

//   emergencyFirstName: Joi.string()
//     .optional()
//     .allow(null)
//     .min(1)
//     .max(255)
//     .messages({
//       "string.base": "Emergency first name must be a string",
//       "string.min": "Emergency first name must be at least 1 character long",
//       "string.max": "Emergency first name must be at most 255 characters long",
//     }),

//   emergencyLastName: Joi.string()
//     .optional()
//     .allow(null)
//     .min(1)
//     .max(255)
//     .messages({
//       "string.base": "Emergency last name must be a string",
//       "string.min": "Emergency last name must be at least 1 character long",
//       "string.max": "Emergency last name must be at most 255 characters long",
//     }),

//   emergencyRelation: Joi.string()
//     .optional()
//     .allow(null)
//     .min(1)
//     .max(255)
//     .messages({
//       "string.base": "Emergency relation must be a string",
//       "string.min": "Emergency relation must be at least 1 character long",
//       "string.max": "Emergency relation must be at most 255 characters long",
//     }),

//   emergencyPhoneNumber: Joi.string()
//     .optional()
//     .allow(null)
//     .min(10)
//     .max(15)
//     .messages({
//       "string.base": "Emergency phone number must be a string",
//       "string.min":
//         "Emergency phone number must be at least 10 characters long",
//       "string.max": "Emergency phone number must be at most 15 characters long",
//     }),

//   emergencyEmail: Joi.string()
//     .email()
//     .optional()
//     .allow(null)
//     .min(5)
//     .max(255)
//     .messages({
//       "string.base": "Emergency email must be a string",
//       "string.email": "Emergency email must be a valid email address",
//       "string.min": "Emergency email must be at least 5 characters long",
//       "string.max": "Emergency email must be at most 255 characters long",
//     }),

//   emergencyMaritalStatus: Joi.string()
//     .optional()
//     .allow(null)
//     .min(1)
//     .max(50)
//     .messages({
//       "string.base": "Emergency marital status must be a string",
//       "string.min":
//         "Emergency marital status must be at least 1 character long",
//       "string.max":
//         "Emergency marital status must be at most 50 characters long",
//     }),

//   emergencyAddress: Joi.string()
//     .optional()
//     .allow(null)
//     .min(1)
//     .max(255)
//     .messages({
//       "string.base": "Emergency address must be a string",
//       "string.min": "Emergency address must be at least 1 character long",
//       "string.max": "Emergency address must be at most 255 characters long",
//     }),

//   emergencyState: Joi.string().optional().allow(null).min(1).max(100).messages({
//     "string.base": "Emergency state must be a string",
//     "string.min": "Emergency state must be at least 1 character long",
//     "string.max": "Emergency state must be at most 100 characters long",
//   }),

//   emergencyCountry: Joi.string()
//     .optional()
//     .allow(null)
//     .min(1)
//     .max(100)
//     .messages({
//       "string.base": "Emergency country must be a string",
//       "string.min": "Emergency country must be at least 1 character long",
//       "string.max": "Emergency country must be at most 100 characters long",
//     }),

//   patientSignature: Joi.string()
//     .optional()
//     .allow(null, "")
//     .min(1)
//     .max(255)
//     .messages({
//       "string.base": "Patient signature must be a string",
//       "string.min": "Patient signature must be at least 1 character long",
//       "string.max": "Patient signature must be at most 255 characters long",
//     }),

//   patientOccupation: Joi.string()
//     .optional()
//     .allow(null)
//     .min(1)
//     .max(255)
//     .messages({
//       "string.base": "Patient occupation must be a string",
//       "string.min": "Patient occupation must be at least 1 character long",
//       "string.max": "Patient occupation must be at most 255 characters long",
//     }),
// });

export const patientsSchema = Joi.object<PatientReq>({
  admissionDate: Joi.date().iso().optional().allow(null).messages({
    "date.base": "Admission date must be a date",
    "date.iso": "Admission date must be in ISO format",
  }),

  patientName: Joi.string().required().allow(null).min(3).max(100).messages({
    "string.base": "Patient name must be a string",
    "any.required": "Patient name is required",
    "string.min": "Patient name must be at least 3 characters long",
    "string.max": "Patient name must be at most 100 characters long",
  }),

  age: Joi.string().required().min(1).max(3).messages({
    "string.base": "Age must be a string",
    "any.required": "Age is required",
    "string.min": "Age must be at least 1 character long",
    "string.max": "Age must be at most 3 characters long",
  }),

  month: Joi.string().required().min(1).max(20).messages({
    "string.base": "Month must be a string",
    "any.required": "Month is required",
    "string.min": "Month must be at least 1 character long",
    "string.max": "Month must be at most 20 characters long",
  }),

  days: Joi.string().optional().allow(null).min(1).max(50).messages({
    "string.base": "Days must be a string",
    "string.min": "Days must be at least 1 character long",
    "string.max": "Days must be at most 50 characters long",
  }),

  image: Joi.string().optional().allow(null).min(3).max(255).messages({
    "string.base": "Image must be a string",
    "string.min": "Image must be at least 3 characters long",
    "string.max": "Image must be at most 255 characters long",
  }),

  mobileNo: Joi.string().required().length(9).messages({
    "string.base": "Mobile number must be a string",
    "any.required": "Mobile number is required",
    "string.min": "Mobile number must be at least 10 characters long",
    "string.max": "Mobile number must be at most 15 characters long",
  }),

  email: Joi.string().email().required().allow(null).min(5).max(100).messages({
    "string.base": "Email must be a string",
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required",
    "string.min": "Email must be at least 5 characters long",
    "string.max": "Email must be at most 100 characters long",
  }),

  dob: Joi.date().required().messages({
    "date.base": "Date of birth must be a valid date",
    "any.required": "Date of birth is required",
  }),

  gender: Joi.string().required().min(1).max(50).messages({
    "string.base": "Gender must be a string",
    "any.required": "Gender is required",
    "string.min": "Gender must be at least 1 character long",
    "string.max": "Gender must be at most 50 characters long",
  }),

  maritalStatus: Joi.string().optional().allow(null).min(1).max(50).messages({
    "string.base": "Marital status must be a string",
    "any.required": "Marital status is required",
    "string.min": "Marital status must be at least 1 character long",
    "string.max": "Marital status must be at most 50 characters long",
  }),

  bloodGroup: Joi.string().optional().allow(null).min(1).max(10).messages({
    "string.base": "Blood group must be a string",
    "string.min": "Blood group must be at least 1 character long",
    "string.max": "Blood group must be at most 10 characters long",
  }),

  address: Joi.string().allow("", null).optional().min(5).max(255).messages({
    "string.base": "Address must be a string",
    "string.min": "Address must be at least 5 characters long",
    "string.max": "Address must be at most 255 characters long",
  }),

  guardianName: Joi.string()
    .optional()
    .allow("", null)
    .min(3)
    .max(100)
    .messages({
      "string.base": "Guardian name must be a string",
      // "any.required": "Guardian name is required",
      "string.min": "Guardian name must be at least 3 characters long",
      "string.max": "Guardian name must be at most 100 characters long",
    }),

  guardianPhone: Joi.string().optional().allow(null).length(9).messages({
    "string.base": "Guardian phone must be a string",
    "any.required": "Guardian phone is required",
    "string.length": "Guardian phone must be 9 characters long",
  }),

  guardianAddress: Joi.string()
    .optional()
    .allow(null)
    .min(5)
    .max(255)
    .messages({
      "string.base": "Guardian address must be a string",
      "string.min": "Guardian address must be at least 5 characters long",
      "string.max": "Guardian address must be at most 255 characters long",
    }),

  guardianEmail: Joi.string()
    .email()
    .optional()
    .allow(null)
    .min(5)
    .max(100)
    .messages({
      "string.base": "Guardian email must be a string",
      "string.email": "Guardian email must be a valid email address",
      "string.min": "Guardian email must be at least 5 characters long",
      "string.max": "Guardian email must be at most 100 characters long",
    }),

  discharged: Joi.string().optional().allow(null).max(100).messages({
    "string.base": "Discharged status must be a string",
    "string.max": "Discharged status must be at most 100 characters long",
  }),

  patientType: Joi.string().optional().allow("").min(1).max(100).messages({
    "string.base": "Patient type must be a string",
    "any.required": "Patient type is required",
    "string.min": "Patient type must be at least 1 character long",
    "string.max": "Patient type must be at most 100 characters long",
  }),

  creditLimit: Joi.string().optional().allow(null).min(1).max(50).messages({
    "string.base": "Credit limit must be a string",
    "string.min": "Credit limit must be at least 1 character long",
    "string.max": "Credit limit must be at most 50 characters long",
  }),

  organization: Joi.string().optional().allow(null).min(1).max(100).messages({
    "string.base": "Organization must be a string",
    "string.min": "Organization must be at least 1 character long",
    "string.max": "Organization must be at most 100 characters long",
  }),

  knownAllergies: Joi.string().optional().allow(null).min(1).max(200).messages({
    "string.base": "Known allergies must be a string",
    "string.min": "Known allergies must be at least 1 character long",
    "string.max": "Known allergies must be at most 200 characters long",
  }),

  oldPatient: Joi.string().optional().allow(null).min(1).max(100).messages({
    "string.base": "Old patient must be a string",
    "string.min": "Old patient must be at least 1 character long",
    "string.max": "Old patient must be at most 100 characters long",
  }),

  note: Joi.string().optional().allow("").messages({
    "string.base": "Note must be a string",
    "any.required": "Note is required",
    "string.min": "Note must be at least 5 characters long",
    "string.max": "Note must be at most 200 characters long",
  }),

  isIpd: Joi.string().optional().allow(null, "").min(2).max(3).messages({
    "string.base": "Is Ipd must be a string",
    "string.min": "Is Ipd must be at least 2 characters long",
    "string.max": "Is Ipd must be at most 3 characters long",
  }),

  ccId: Joi.number().integer().optional().allow(null, "").messages({
    "number.base": "CC Id must be a number",
    "number.integer": "CC Id must be an integer",
  }),

  isMaster: Joi.string().valid("ML", "CC").optional().allow(null, "").messages({
    "string.base": "Is Master must be a string",
    "any.only": "Is Master must be either 'ML' or 'CC'",
  }),

  aadhar: Joi.string().optional().allow(null).min(12).max(12).messages({
    "string.base": "Aadhar must be a string",
    "string.min": "Aadhar must be exactly 12 characters long",
    "string.max": "Aadhar must be exactly 12 characters long",
  }),

  passport: Joi.string().optional().allow(null).min(3).max(100).messages({
    "string.base": "Passport must be a string",
    "string.min": "Passport must be at least 3 characters long",
    "string.max": "Passport must be at most 100 characters long",
  }),

  nationality: Joi.string().optional().allow(null).min(1).max(100).messages({
    "string.base": "Nationality must be a string",
    "string.min": "Nationality must be at least 1 character long",
    "string.max": "Nationality must be at most 100 characters long",
  }),

  area: Joi.string().optional().allow(null).min(1).max(100).messages({
    "string.base": "Area must be a string",
    "string.min": "Area must be at least 1 character long",
    "string.max": "Area must be at most 100 characters long",
  }),

  pinCode: Joi.string().optional().allow(null).min(1).max(100).messages({
    "string.base": "PinCode must be a string",
    "string.min": "PinCode must be at least 1 character long",
    "string.max": "PinCode must be at most 100 characters long",
  }),

  height: Joi.string().optional().allow(null).min(1).max(100).messages({
    "string.base": "Height must be a string",
    "string.min": "Height must be at least 1 character long",
    "string.max": "Height must be at most 100 characters long",
  }),

  weight: Joi.string().optional().allow(null).min(1).max(100).messages({
    "string.base": "Weight must be a string",
    "string.min": "Weight must be at least 1 character long",
    "string.max": "Weight must be at most 100 characters long",
  }),

  patientCode: Joi.string().optional().allow(null).min(1).max(100).messages({
    "string.base": "Patient Code must be a string",
    "string.min": "Patient Code must be at least 1 character long",
    "string.max": "Patient Code must be at most 100 characters long",
  }),

  userLogin: Joi.string().optional().allow(null).min(1).max(100).messages({
    "string.base": "User login must be a string",
    "string.min": "User login must be at least 1 character long",
    "string.max": "User login must be at most 100 characters long",
  }),

  state: Joi.string().optional().allow(null).min(1).max(100).messages({
    "string.base": "State must be a string",
    "string.min": "State must be at least 1 character long",
    "string.max": "State must be at most 100 characters long",
  }),

  userRelationship: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(100)
    .messages({
      "string.base": "User relationship must be a string",
      "string.min": "User relationship must be at least 1 character long",
      "string.max": "User relationship must be at most 100 characters long",
    }),

  pid: Joi.string().optional().allow(null).min(1).max(100).messages({
    "string.base": "PID must be a string",
    "string.min": "PID must be at least 1 character long",
    "string.max": "PID must be at most 100 characters long",
  }),

  localId: Joi.string().optional().allow(null).min(1).max(100).messages({
    "string.base": "Local Id must be a string",
    "string.min": "Local Id must be at least 1 character long",
    "string.max": "Local Id must be at most 100 characters long",
  }),

  street: Joi.string().optional().allow(null).min(1).max(255).messages({
    "string.base": "Street must be a string",
    "string.min": "Street must be at least 1 character long",
    "string.max": "Street must be at most 255 characters long",
  }),

  city: Joi.string().optional().allow(null).min(1).max(100).messages({
    "string.base": "City must be a string",
    "string.min": "City must be at least 1 character long",
    "string.max": "City must be at most 100 characters long",
  }),

  pinCode2: Joi.string().optional().allow(null).min(1).max(10).messages({
    "string.base": "PinCode2 must be a string",
    "string.min": "PinCode2 must be at least 1 character long",
    "string.max": "PinCode2 must be at most 10 characters long",
  }),

  country: Joi.number().integer().optional().allow(null, "").messages({
    "number.base": "Country must be a number",
    "number.integer": "Country must be an integer",
  }),

  remarks: Joi.string().optional().allow(null).min(1).max(155).messages({
    "string.base": "Remarks must be a string",
    "string.min": "Remarks must be at least 1 character long",
    "string.max": "Remarks must be at most 155 characters long",
  }),

  patientImage: Joi.string()
    .optional()
    .allow(null, "")
    .min(1)
    .max(255)
    .messages({
      "string.base": "Patient image must be a string",
      "string.min": "Patient image must be at least 1 character long",
      "string.max": "Patient image must be at most 255 characters long",
    }),

  emergencyFirstName: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(255)
    .messages({
      "string.base": "Emergency first name must be a string",
      "string.min": "Emergency first name must be at least 1 character long",
      "string.max": "Emergency first name must be at most 255 characters long",
      "any.required": "Emergency first name is required",
    }),

  emergencyLastName: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(255)
    .messages({
      "string.base": "Emergency last name must be a string",
      "string.min": "Emergency last name must be at least 1 character long",
      "string.max": "Emergency last name must be at most 255 characters long",
      "any.required": "Emergency last name is required",
    }),

  emergencyRelation: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(255)
    .messages({
      "string.base": "Emergency relation must be a string",
      "string.min": "Emergency relation must be at least 1 character long",
      "string.max": "Emergency relation must be at most 255 characters long",
      "any.required": "Emergency relation is required",
    }),

  emergencyPhoneNumber: Joi.string()
    .optional()
    .allow("", null)
    .length(9)
    .messages({
      "string.base": "Emergency phone number must be a string",
      "string.length": "Guardian phone must be 9 characters long",
    }),

  emergencyEmail: Joi.string()
    .email()
    .optional()
    .allow(null)
    .min(5)
    .max(255)
    .messages({
      "string.base": "Emergency email must be a string",
      "string.email": "Emergency email must be a valid email address",
      "string.min": "Emergency email must be at least 5 characters long",
      "string.max": "Emergency email must be at most 255 characters long",
    }),

  emergencyMaritalStatus: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(50)
    .messages({
      "string.base": "Emergency marital status must be a string",
      "string.min":
        "Emergency marital status must be at least 1 character long",
      "string.max":
        "Emergency marital status must be at most 50 characters long",
      "any.required": "Emergency marital status is required",
    }),

  emergencyAddress: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(255)
    .messages({
      "string.base": "Emergency address must be a string",
      "string.min": "Emergency address must be at least 1 character long",
      "string.max": "Emergency address must be at most 255 characters long",
    }),

  emergencyState: Joi.string().optional().allow(null).min(1).max(100).messages({
    "string.base": "Emergency state must be a string",
    "string.min": "Emergency state must be at least 1 character long",
    "string.max": "Emergency state must be at most 100 characters long",
  }),

  emergencyCountry: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(100)
    .messages({
      "string.base": "Emergency country must be a string",
      "string.min": "Emergency country must be at least 1 character long",
      "string.max": "Emergency country must be at most 100 characters long",
    }),

  patientSignature: Joi.string()
    .optional()
    .allow(null, "")
    .min(1)
    .max(255)
    .messages({
      "string.base": "Patient signature must be a string",
      "string.min": "Patient signature must be at least 1 character long",
      "string.max": "Patient signature must be at most 255 characters long",
    }),

  patientOccupation: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(255)
    .messages({
      "string.base": "Patient occupation must be a string",
      "string.min": "Patient occupation must be at least 1 character long",
      "string.max": "Patient occupation must be at most 255 characters long",
    }),
  employeeId: Joi.string().optional().allow(null, "").messages({
    "string.base": "employeeId must be a string",
    "any.required": "employeeId is required",
  }),
  clientId: Joi.number().integer().optional().allow(null).messages({
    "number.base": "Client must be a number",
    "number.integer": "Client must be an integer",
  }),
});

export const validatePatients = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.body = toPatientEntity(req.body, req.files as PatientImage);
  console.log(req.body.emergencyPhoneNumber);

  const { error } = patientsSchema.validate(req.body, {
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

export const patientsSchemaUpdate = patientsSchema.keys({
  id: Joi.number().integer().required().messages({
    "number.base": "Id must be a number",
    "number.integer": "Id must be an integer",
    "any.required": "Id is required",
  }),
});

export const validatePatientsUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.body = toPatientUpdateEntity(req.body, req.files as PatientImage);
  const { error } = patientsSchemaUpdate.validate(req.body, {
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
