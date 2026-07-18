import {
  InsuranceBusinessMapping,
  YesNoFlag,
} from "@repo/db/generated/prisma/client";
import Joi from "joi";
import {
  arrayRequired,
  dateRequired,
  emailRequired,
  enumRequired,
  idOptional,
  idRequired,
  priceRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { InsuranceReq } from "@/types/insurance/insurance.js";
export const insuranceBusinessSchema = Joi.object<InsuranceBusinessMapping>({
  id: idOptional("Id"),

  type: strRequired("Type"),
  name: strRequired("Name"),
  phone: strRequired("Phone"),
  isDefault: enumRequired("Is Default", YesNoFlag),
  date: dateRequired("Date"),
});

export const insuranceSchema = Joi.object<InsuranceReq>({
  id: idOptional("Id"),

  customerCode: strRequired("Customer Code"),

  customerName: strRequired("Customer Name"),

  contactNo: strRequired("Contact Number"),

  email: emailRequired("Email"),

  contactPersonName: strRequired("Contact Person Name"),

  contactPersonPhone: strRequired("Contact Person Phone"),

  contactPersonEmail: emailRequired("Contact Person Email"),

  customerActiveFrom: dateRequired("Customer Active From"),

  customerStatus: strOptional("Customer Status"),

  status: enumRequired("Status", { active: "active", inactive: "inactive" }),

  logoImage: strRequired("Logo Image"),

  adhaar: strOptional("Adhaar"),

  pan: strOptional("PAN"),

  gstNo: strOptional("GST No"),

  ccId: idOptional("Collection Center ID"),

  isMaster: enumRequired("Is Master", { ML: "ML", CC: "CC" }),

  sapCode: strRequired("SAP Code"),

  statusChangeRemark: strOptional("Status Change Remark"),

  billAddress: strOptional("Bill Address"),

  shiftAddress: strOptional("Shift Address"),

  portalAccessConfig: strOptional("Portal Access Config"),

  printConfig: strOptional("Print Config"),

  notificationConfig: strOptional("Notification Config"),

  attachments: strOptional("Attachments"),

  paymentMode: enumRequired("Payment Mode", {
    amount_in_cash: "amount_in_cash",
    co_payment: "co_payment",
  }),

  insuranceType: enumRequired("Insurance Type", {
    corporate: "corporate",
    national: "national",
    others: "others",
  }),

  pharmacyPaymentType: enumRequired("Pharmacy Payment Type", {
    percentage: "percentage",
    amount: "amount",
  }),

  pharmacyPaymentValue: priceRequired("Pharmacy Payment Value"),

  opdPaymentValue: priceRequired("OPD Payment Value"),

  opdPaymentType: enumRequired("OPD Payment Type", {
    percentage: "percentage",
    amount: "amount",
  }),

  pathologyPaymentValue: priceRequired("Pathology Payment Value"),

  pathologyPaymentType: enumRequired("Pathology Payment Type", {
    percentage: "percentage",
    amount: "amount",
  }),

  insuranceBusinessMapping: arrayRequired(
    "Insurance Business Mapping",
    insuranceBusinessSchema,
    1,
  ),
});

export const validateInsurance = validationHandler({
  schema: insuranceSchema,
  type: "FORMDATA_WITH_MULTIPLE_DOCS",
  multipleDocsAttr: [
    { key: "logoImage", path: "logoImage" },
    { key: "attachments", path: "attachments" },
  ],
});

export const insuranceSchemaUpdate = insuranceSchema.keys({
  id: idRequired("Id"),
});

export const validateInsuranceUpdate = validationHandler({
  schema: insuranceSchemaUpdate,
  type: "FORMDATA_WITH_MULTIPLE_DOCS",
  multipleDocsAttr: [
    { key: "logoImage", path: "logoImage" },
    { key: "attachments", path: "attachments" },
  ],
});
