import {
  arrayOptional,
  boolOptional,
  emailRequired,
  idRequired,
  intRequired,
  phoneRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

// === TaxIdentificationDetails schema ===
const taxIdentificationDetailSchema = Joi.object({
  taxIdentificationName: strRequired("Tax Identification Name"),
  taxIdentificationValue: strRequired("Tax Identification Value"),
});

// === CommonDistributor schema ===
export const commonDistributorSchema = Joi.object({
  proInName: strRequired("Proprietary Name"),
  proInEmail: emailRequired("Proprietary Email"),
  proCountryCode: strOptional("Proprietary Country Code"),
  proInPhone: phoneRequired("Proprietary Phone Number  "),

  dpName: strRequired("Distributor Side Name"),
  dpEmail: emailRequired("Distributor Side Email"),
  dpCountryCode: strOptional("Distributor Side Country Code"),
  dpPhone: phoneRequired("Distributor Side Phone Number"),

  posEmail: boolOptional("Pos Email"),
  posPhoneNotification: boolOptional("Pos Phone Notification"),
  posWhatsapp: boolOptional("Pos Whatsapp"),
  posSms: boolOptional("Pos Sms"),

  grnEmail: boolOptional("Grn Email"),
  grnPhoneNotification: boolOptional("Grn Phone Notification"),
  grnWhatsapp: boolOptional("Grn Whatsapp"),
  grnSms: boolOptional("Grn Sms"),

  returnEmail: boolOptional("Return Email"),
  returnPhoneNotification: boolOptional("Return Phone Notification"),
  returnWhatsapp: boolOptional("Return Whatsapp"),
  returnSms: boolOptional("Return Sms"),

  billTo: strRequired("Bill To"),
  shipTo: strRequired("Ship To"),

  bankName: strRequired("Bank Name"),
  bankAddress: strRequired("Bank Address"),
  bankBranchName: strRequired("Bank Branch Name"),
  swiftIfscCode: strRequired("Swift IFSC Code"),
  bankAccountNumber: strRequired("Bank Account Number"),
  bankAccountType: strRequired("Bank Account Type"),

  termAndCondition: strOptional("Term and Condition"),
  stockShipmentDetails: strOptional("Stock Shipment Details"),

  taxIdentificationDetails: arrayOptional(
    "Tax Identification Details",
    taxIdentificationDetailSchema,
  ),
  dueDate: intRequired("Due Date"),
});

// === CreateDistributorInput schema ===
export const createDistributorSchema = commonDistributorSchema.keys({
  distLicNumber: strOptional("Dist License Number"),
  distLicDocument: strOptional("Dist License Document"),
  distAgreementDoc: strOptional("Dist Agreement Document"),
  distGhanaDoc: strOptional("Dist Ghana Document"),
  distDrugDoc: strOptional("Dist Drug Document"),
});

// === UpdateDistributorInput schema ===
export const updateDistributorSchema = createDistributorSchema.keys({
  id: idRequired("ID"),
});

export const validateCreateDistributor = validationHandler({
  schema: createDistributorSchema,
  type: "FORMDATA_WITH_MULTIPLE_DOCS",
  multipleDocsAttr: [
    { key: "distLicNumber", path: "distLicNumber" },
    { key: "distLicDocument", path: "distLicDocument" },
    { key: "distAgreementDoc", path: "distAgreementDoc" },
    { key: "distGhanaDoc", path: "distGhanaDoc" },
    { key: "distDrugDoc", path: "distDrugDoc" },
  ],
});

export const validateUpdateDistributor = validationHandler({
  schema: updateDistributorSchema,
  type: "FORMDATA_WITH_MULTIPLE_DOCS",
  multipleDocsAttr: [
    { key: "distLicNumber", path: "distLicNumber" },
    { key: "distLicDocument", path: "distLicDocument" },
    { key: "distAgreementDoc", path: "distAgreementDoc" },
    { key: "distGhanaDoc", path: "distGhanaDoc" },
    { key: "distDrugDoc", path: "distDrugDoc" },
  ],
});
