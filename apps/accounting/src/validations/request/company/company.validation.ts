import {
  AddressType,
  GstRegistrationType,
} from "@repo/db/generated/prisma/enums.js";
import {
  boolOptional,
  boolRequired,
  boolWithDefault,
  dateRequired,
  emailOptional,
  enumRequired,
  idOptional,
  idRequired,
  phoneOptional,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import Joi from "joi";

const CompanyAddressesCreateSchema = Joi.object({
  addressType: enumRequired("Address Type", AddressType),
  addressLine1: strRequired("Address Line 1"),
  addressLine2: strOptional("Address Line 2"),
  cityId: idRequired("City Id"),
  stateId: idRequired("State Id"),
  countryId: idRequired("Country Id"),
  pinCode: strRequired("Pin Code"),
  phoneNumber: phoneOptional("Phone Number").allow(null, ""),
  email: emailOptional("Email").allow(null, ""),
  isDefault: boolOptional("Default"),
});

const CompanyAddressesUpdateSchema = CompanyAddressesCreateSchema.keys({
  id: idOptional("Address Id"),
});

const CompanyStatutoryCreateSchema = Joi.object({
  pan: strRequired("PAN"),
  cin: strOptional("CIN"),
  tan: strOptional("TAN"),
  msmeNo: strOptional("MSME No"),
  isGstEnabled: boolRequired("GST Enabled"),
  gstRegistrationType: Joi.string().when("isGstEnabled", {
    is: true,
    then: Joi.required()
      .valid(...Object.values(GstRegistrationType))
      .messages({
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "GST Registration Type",
        ),
      }),
    otherwise: Joi.string().default(GstRegistrationType.UNREGISTERED),
  }),
  gstin: Joi.string().when("gstRegistrationType", {
    is: [
      GstRegistrationType.REGULAR,
      GstRegistrationType.COMPOSITION,
      GstRegistrationType.SEZ,
    ],
    then: Joi.required().messages({
      "any.required": generateValidationErrorMessage("REQUIRED", "GSTIN"),
    }),
    otherwise: Joi.valid(null, "").messages({
      "any.only": generateValidationErrorMessage("ONLY_NULL", "GSTIN"),
    }),
  }),
  gstStateCode: Joi.string().when("gstRegistrationType", {
    is: [
      GstRegistrationType.REGULAR,
      GstRegistrationType.COMPOSITION,
      GstRegistrationType.SEZ,
    ],
    then: Joi.required().messages({
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "GST State Code",
      ),
    }),
    otherwise: Joi.valid(null, "").messages({
      "any.only": generateValidationErrorMessage("ONLY_NULL", "GST State Code"),
    }),
  }),
  gstEffectiveFrom: Joi.string().when("gstRegistrationType", {
    is: [
      GstRegistrationType.REGULAR,
      GstRegistrationType.COMPOSITION,
      GstRegistrationType.SEZ,
    ],
    then: Joi.required().messages({
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "GST Effective From",
      ),
    }),
    otherwise: Joi.valid(null, "").messages({
      "any.only": generateValidationErrorMessage(
        "ONLY_NULL",
        "GST Effective From",
      ),
    }),
  }),
});

const CompanyStatutoryUpdateSchema = CompanyStatutoryCreateSchema.keys({
  id: idRequired("Statutory Id"),
});

const CompanyFinancialYearCreateSchema = Joi.object({
  fyName: strRequired("Financial Year Name"),
  startDate: dateRequired("Start Date"),
  endDate: dateRequired("End Date"),
  booksBeginFrom: dateRequired("Books Begin From"),
  isCurrent: boolWithDefault("Is Default", true),
});

const CompanyFinancialYearUpdateSchema = CompanyFinancialYearCreateSchema.keys({
  id: idRequired("Financial Year Id"),
});

const CompanyFeatures = Joi.object({
  enableCostCenter: boolRequired("Enable Cost Center"),
  enableBillWiseTracking: boolRequired("Enable Bill Wise Tracking"),
  enableBankReconciliation: boolRequired("Enable Bank Reconciliation"),
  enableGst: boolRequired("Enable GST"),
});

const CompanyFeaturesUpdateSchema = CompanyFeatures.keys({
  id: idRequired("Features Id"),
});

export const CompanyCreateSchema = Joi.object({
  code: strRequired("Code"),
  name: strRequired("Name"),
  legalName: strOptional("Legal Name"),
  booksBeginFrom: dateRequired("Books Begin From"),
  currencyId: idRequired("Currency Id"),
  addresses: Joi.array()
    .items(CompanyAddressesCreateSchema)
    .required()
    .min(1)
    .custom((value, helpers) => {
      const seen = new Set<string>();

      for (const item of value) {
        if (seen.has(item.addressType)) {
          return helpers.error("array.duplicateAddressType", {
            addressType: item.addressType,
          });
        }
        seen.add(item.addressType);
      }

      return value;
    })
    .messages({
      "array.base": generateValidationErrorMessage("ARRAY", "Addresses"),
      "array.min": generateValidationErrorMessage(
        "ARRAY_MIN_LENGTH",
        "Addresses",
        "1",
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Addresses"),
      "array.duplicateAddressType":
        "Duplicate address type '{{#addressType}}' is not allowed.",
    }),
  statutory: CompanyStatutoryCreateSchema,
  financialYears: CompanyFinancialYearCreateSchema,
  features: CompanyFeatures,
});

export const CompanyUpdateSchema = CompanyCreateSchema.keys({
  id: idRequired("Company Id"),
  addresses: Joi.array()
    .items(CompanyAddressesUpdateSchema)
    .required()
    .min(1)
    .custom((value, helpers) => {
      const seen = new Set<string>();

      for (const item of value) {
        if (seen.has(item.addressType)) {
          return helpers.error("array.duplicateAddressType", {
            addressType: item.addressType,
          });
        }
        seen.add(item.addressType);
      }

      return value;
    })
    .messages({
      "array.base": generateValidationErrorMessage("ARRAY", "Addresses"),
      "array.min": generateValidationErrorMessage(
        "ARRAY_MIN_LENGTH",
        "Addresses",
        "1",
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Addresses"),
      "array.duplicateAddressType":
        "Duplicate address type '{{#addressType}}' is not allowed.",
    }),
  statutory: CompanyStatutoryUpdateSchema,
  financialYears: CompanyFinancialYearUpdateSchema,
  features: CompanyFeaturesUpdateSchema,
});
export const validateCreateCompany = validationHandler({
  schema: CompanyCreateSchema,
});

export const validateUpdateCompany = validationHandler({
  schema: CompanyUpdateSchema,
});
