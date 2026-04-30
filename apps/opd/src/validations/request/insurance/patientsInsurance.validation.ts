import {
  toPatientInsuranceEntity,
  toPatientInsuranceUpdateEntity,
} from "@/mapper/insurance/patientsInsurance.mapper.js";
import {
  InsuranceCardImages,
  PatientInsuranceReq,
} from "@/types/insurance/patientsInsurance.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import {
  dateOptional,
  enumOptional,
  enumRequired,
  idRequired,
  strOptional,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const patientsInsuranceSchema = Joi.object<PatientInsuranceReq>({
  insurerId: idRequired("Insurer Id"),

  patientId: idRequired("Patient Id"),

  insuranceType: enumRequired("Insurance Type", {
    primary: "primary",
    secondary: "secondary",
    tertiary: "tertiary",
  }),

  insurancePlan: strOptional("Insurance Plan"),

  policyNumber: strOptional("Policy Number"),

  relationship: enumOptional("Relationship", {
    self: "self",
    spouse: "spouse",
    child: "child",
  }),

  issueDate: dateOptional("Issue Date"),

  expireDate: dateOptional("Expire Date"),

  cardFrontImage: strOptional("Card Front Image"),

  cardBackImage: strOptional("Card Back Image"),
});

export const patientsInsuranceUpdateSchema = patientsInsuranceSchema.keys({
  id: idRequired("Patient Insurance Id"),
});

export const validatePatientsInsurance = validationHandler({
  schema: patientsInsuranceSchema,
  type: "FORMDATA_WITH_MULTIPLE_DOCS",
  multipleDocsAttr: [
    { key: "cardFrontImage", path: "cardFrontImage" },
    { key: "cardBackImage", path: "cardBackImage" },
  ],
});

export const patientsInsuranceSchemaUpdate = patientsInsuranceSchema.keys({
  id: idRequired("Patient Insurance Id"),
});

export const validatePatientsInsuranceUpdate = validationHandler({
  schema: patientsInsuranceSchemaUpdate,
  type: "FORMDATA_WITH_MULTIPLE_DOCS",
  multipleDocsAttr: [
    { key: "cardFrontImage", path: "cardFrontImage" },
    { key: "cardBackImage", path: "cardBackImage" },
  ],
});
