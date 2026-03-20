import {
  toPatientEntity,
  toPatientUpdateEntity,
} from "@/mapper/patient/patient.mapper.js";
import { PatientImage, PatientReq } from "@/types/patient/patient.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const patientsSchema = Joi.object<PatientReq>({
  admissionDate: Joi.date()
    .iso()
    .optional()
    .allow(null)
    .messages({
      "date.base": generateValidationErrorMessage("DATE", "Admission Date"),
      "date.iso": generateValidationErrorMessage("DATE", "Admission Date"),
    }),

  patientName: Joi.string()
    .required()
    .allow(null)
    .min(3)
    .max(100)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Patient Name"),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Patient Name",
      ),
      "string.min": generateValidationErrorMessage("MIN", "Patient Name"),
      "string.max": generateValidationErrorMessage("MAX", "Patient Name"),
    }),

  age: Joi.string()
    .required()
    .min(1)
    .max(3)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Age"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Age"),
      "string.min": generateValidationErrorMessage("MIN_VALUE", "Age", "1"),
      "string.max": generateValidationErrorMessage("MAX_VALUE", "Age", "3"),
    }),

  month: Joi.string()
    .required()
    .min(1)
    .max(20)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Month"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Month"),
      "string.min": generateValidationErrorMessage("MIN_VALUE", "Month", "1"),
      "string.max": generateValidationErrorMessage("MAX_VALUE", "Month", "20"),
    }),

  days: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(50)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Days"),
      "string.min": generateValidationErrorMessage("MIN_VALUE", "Days", "1"),
      "string.max": generateValidationErrorMessage("MAX_VALUE", "Days", "50"),
    }),

  image: Joi.string()
    .optional()
    .allow(null)
    .min(3)
    .max(255)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Image"),
      "string.min": generateValidationErrorMessage("MIN_VALUE", "Image", "3"),
      "string.max": generateValidationErrorMessage("MAX_VALUE", "Image", "255"),
    }),

  mobileNo: Joi.string()
    .required()
    .length(9)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Mobile Number"),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Mobile Number",
      ),
      "string.length": generateValidationErrorMessage("PHONE", "Mobile Number"),
    }),

  email: Joi.string()
    .email()
    .required()
    .allow(null)
    .min(5)
    .max(100)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Email"),
      "string.email": generateValidationErrorMessage("EMAIL", "Email"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Email"),
      "string.min": generateValidationErrorMessage("MIN_VALUE", "Email", "5"),
      "string.max": generateValidationErrorMessage("MAX_VALUE", "Email", "100"),
    }),

  dob: Joi.date()
    .required()
    .messages({
      "date.base": generateValidationErrorMessage("DATE", "Date of Birth"),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Date of Birth",
      ),
    }),

  gender: Joi.string()
    .required()
    .min(1)
    .max(50)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Gender"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Gender"),
      "string.min": generateValidationErrorMessage("MIN_VALUE", "Gender", "1"),
      "string.max": generateValidationErrorMessage("MAX_VALUE", "Gender", "50"),
    }),

  maritalStatus: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(50)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Marital Status"),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Marital Status",
        "1",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Marital Status",
        "50",
      ),
    }),

  bloodGroup: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(10)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Blood Group"),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Blood Group",
        "1",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Blood Group",
        "10",
      ),
    }),

  address: Joi.string()
    .allow("", null)
    .optional()
    .min(5)
    .max(255)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Address"),
      "string.min": generateValidationErrorMessage("MIN_VALUE", "Address", "5"),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Address",
        "255",
      ),
    }),

  guardianName: Joi.string()
    .optional()
    .allow("", null)
    .min(3)
    .max(100)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Guardian Name"),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Guardian Name",
        "3",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Guardian Name",
        "100",
      ),
    }),

  guardianPhone: Joi.string()
    .optional()
    .allow(null)
    .length(9)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Guardian Phone"),
      "string.length": generateValidationErrorMessage(
        "PHONE",
        "Guardian Phone",
      ),
    }),

  guardianAddress: Joi.string()
    .optional()
    .allow(null)
    .min(5)
    .max(255)
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Guardian Address",
      ),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Guardian Address",
        "5",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Guardian Address",
        "255",
      ),
    }),

  guardianEmail: Joi.string()
    .email()
    .optional()
    .allow(null)
    .min(5)
    .max(100)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Guardian Email"),
      "string.email": generateValidationErrorMessage("EMAIL", "Guardian Email"),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Guardian Email",
        "5",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Guardian Email",
        "100",
      ),
    }),

  discharged: Joi.string()
    .optional()
    .allow(null)
    .max(100)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Discharged"),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Discharged",
        "100",
      ),
    }),

  patientType: Joi.string()
    .optional()
    .allow("")
    .min(1)
    .max(100)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Patient Type"),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Patient Type",
        "1",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Patient Type",
        "100",
      ),
    }),

  creditLimit: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(50)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Credit Limit"),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Credit Limit",
        "1",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Credit Limit",
        "50",
      ),
    }),

  organization: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(100)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Organization"),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Organization",
        "1",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Organization",
        "100",
      ),
    }),

  knownAllergies: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(200)
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Known Allergies",
      ),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Known Allergies",
        "1",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Known Allergies",
        "200",
      ),
    }),

  oldPatient: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(100)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Old Patient"),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Old Patient",
        "1",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Old Patient",
        "100",
      ),
    }),

  note: Joi.string()
    .optional()
    .allow("")
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Note"),
    }),

  isIpd: Joi.string()
    .optional()
    .allow(null, "")
    .min(2)
    .max(3)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Is IPD"),
      "string.min": generateValidationErrorMessage("MIN_VALUE", "Is IPD", "2"),
      "string.max": generateValidationErrorMessage("MAX_VALUE", "Is IPD", "3"),
    }),

  ccId: Joi.number()
    .integer()
    .optional()
    .allow(null, "")
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "CC Id"),
      "number.integer": generateValidationErrorMessage("INTEGER", "CC Id"),
    }),

  isMaster: Joi.string()
    .valid("ML", "CC")
    .optional()
    .allow(null, "")
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Is Master"),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Is Master",
        "ML, CC",
      ),
    }),

  aadhar: Joi.string()
    .optional()
    .allow(null)
    .min(12)
    .max(12)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Aadhar"),
      "string.min": generateValidationErrorMessage("MIN_VALUE", "Aadhar", "12"),
      "string.max": generateValidationErrorMessage("MAX_VALUE", "Aadhar", "12"),
    }),

  passport: Joi.string()
    .optional()
    .allow(null)
    .min(3)
    .max(100)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Passport"),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Passport",
        "3",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Passport",
        "100",
      ),
    }),

  nationality: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(100)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Nationality"),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Nationality",
        "1",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Nationality",
        "100",
      ),
    }),

  area: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(100)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Area"),
      "string.min": generateValidationErrorMessage("MIN_VALUE", "Area", "1"),
      "string.max": generateValidationErrorMessage("MAX_VALUE", "Area", "100"),
    }),

  pinCode: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(100)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "PinCode"),
      "string.min": generateValidationErrorMessage("MIN_VALUE", "PinCode", "1"),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "PinCode",
        "100",
      ),
    }),

  height: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(100)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Height"),
      "string.min": generateValidationErrorMessage("MIN_VALUE", "Height", "1"),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Height",
        "100",
      ),
    }),

  weight: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(100)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Weight"),
      "string.min": generateValidationErrorMessage("MIN_VALUE", "Weight", "1"),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Weight",
        "100",
      ),
    }),

  patientCode: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(100)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Patient Code"),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Patient Code",
        "1",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Patient Code",
        "100",
      ),
    }),

  userLogin: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(100)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "User Login"),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "User Login",
        "1",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "User Login",
        "100",
      ),
    }),

  state: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(100)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "State"),
      "string.min": generateValidationErrorMessage("MIN_VALUE", "State", "1"),
      "string.max": generateValidationErrorMessage("MAX_VALUE", "State", "100"),
    }),

  userRelationship: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(100)
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "User Relationship",
      ),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "User Relationship",
        "1",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "User Relationship",
        "100",
      ),
    }),

  pid: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(100)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "PID"),
      "string.min": generateValidationErrorMessage("MIN_VALUE", "PID", "1"),
      "string.max": generateValidationErrorMessage("MAX_VALUE", "PID", "100"),
    }),

  localId: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(100)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Local ID"),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Local ID",
        "1",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Local ID",
        "100",
      ),
    }),

  street: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(255)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Street"),
      "string.min": generateValidationErrorMessage("MIN_VALUE", "Street", "1"),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Street",
        "255",
      ),
    }),

  city: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(100)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "City"),
      "string.min": generateValidationErrorMessage("MIN_VALUE", "City", "1"),
      "string.max": generateValidationErrorMessage("MAX_VALUE", "City", "100"),
    }),

  pinCode2: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(10)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "PinCode2"),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "PinCode2",
        "1",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "PinCode2",
        "10",
      ),
    }),

  country: Joi.number()
    .integer()
    .optional()
    .allow(null, "")
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Country"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Country"),
    }),

  remarks: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(155)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Remarks"),
      "string.min": generateValidationErrorMessage("MIN_VALUE", "Remarks", "1"),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Remarks",
        "155",
      ),
    }),

  patientImage: Joi.string()
    .optional()
    .allow(null, "")
    .min(1)
    .max(255)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Patient Image"),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Patient Image",
        "1",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Patient Image",
        "255",
      ),
    }),

  emergencyFirstName: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(255)
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Emergency First Name",
      ),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Emergency First Name",
        "1",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Emergency First Name",
        "255",
      ),
    }),

  emergencyLastName: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(255)
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Emergency Last Name",
      ),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Emergency Last Name",
        "1",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Emergency Last Name",
        "255",
      ),
    }),

  emergencyRelation: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(255)
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Emergency Relation",
      ),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Emergency Relation",
        "1",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Emergency Relation",
        "255",
      ),
    }),

  emergencyPhoneNumber: Joi.string()
    .optional()
    .allow("", null)
    .length(9)
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Emergency Phone Number",
      ),
      "string.length": generateValidationErrorMessage(
        "PHONE",
        "Emergency Phone Number",
      ),
    }),

  emergencyEmail: Joi.string()
    .email()
    .optional()
    .allow(null)
    .min(5)
    .max(255)
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Emergency Email",
      ),
      "string.email": generateValidationErrorMessage(
        "EMAIL",
        "Emergency Email",
      ),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Emergency Email",
        "5",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Emergency Email",
        "255",
      ),
    }),

  emergencyMaritalStatus: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(50)
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Emergency Marital Status",
      ),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Emergency Marital Status",
        "1",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Emergency Marital Status",
        "50",
      ),
    }),

  emergencyAddress: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(255)
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Emergency Address",
      ),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Emergency Address",
        "1",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Emergency Address",
        "255",
      ),
    }),

  emergencyState: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(100)
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Emergency State",
      ),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Emergency State",
        "1",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Emergency State",
        "100",
      ),
    }),

  emergencyCountry: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(100)
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Emergency Country",
      ),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Emergency Country",
        "1",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Emergency Country",
        "100",
      ),
    }),

  patientSignature: Joi.string()
    .optional()
    .allow(null, "")
    .min(1)
    .max(255)
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Patient Signature",
      ),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Patient Signature",
        "1",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Patient Signature",
        "255",
      ),
    }),

  patientOccupation: Joi.string()
    .optional()
    .allow(null)
    .min(1)
    .max(255)
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Patient Occupation",
      ),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Patient Occupation",
        "1",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Patient Occupation",
        "255",
      ),
    }),
  employeeId: Joi.string()
    .optional()
    .allow(null, "")
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Employee ID"),
    }),
  clientId: Joi.number()
    .integer()
    .optional()
    .allow(null)
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Client"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Client"),
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
  id: Joi.number()
    .integer()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Id"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Id"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Id"),
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
