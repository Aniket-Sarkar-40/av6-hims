import {
  arrayOptional,
  boolOptional,
  emailOptional,
  enumOptional,
  idOptional,
  idRequired,
  phoneOptional,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { VendorType } from "@repo/db/generated/prisma/client";
import Joi from "joi";

const taxIdentificationDetailSchema = Joi.object({
  id: idOptional("Tax Identification ID"),
  taxIdentificationName: strRequired("Tax Identification Name"),
  taxIdentificationValue: idRequired("Tax Identification Value"),
});

const bankDetailsSchema = Joi.object({
  id: idOptional("Bank ID"),
  accountNo: idRequired("Account Number"),
  accountHolderName: strOptional("Account Holder Name"),
  typeOfAccount: strOptional("Type Of Account"),
  ifscCode: strRequired("IFSC Code"),
  bankName: strRequired("Bank Name"),
  bankAddress: strOptional("Bank Address"),
});

export const itemSupplierCreateSchema = Joi.object({
  supplierCode: strRequired("Supplier Code"),
  name: strRequired("Supplier Name"),
  phone: phoneOptional("Phone number"),
  email: emailOptional("Email"),
  address: strRequired("Address"),
  billTo: strOptional("Bill To"),
  shipTo: strOptional("Ship To"),
  branchDetailsId: idRequired("Branch Details ID"),
  vendorType: enumOptional("Vendor Type", VendorType),
  salesPerson: strOptional("Sales Person"),
  salesPersonPhone: phoneOptional("Sales Person Phone number"),
  salesPersonEmail: emailOptional("Sales Person Email"),
  proprietaryPersonName: strOptional("Proprietary Person Name"),
  proprietaryPersonPhone: phoneOptional("Proprietary Person Phone number"),
  proprietaryPersonEmail: emailOptional("Proprietary Person Email"),
  taxDetailsId: idOptional("Tax Details ID"),
  termsAndCondition: strOptional("Terms And Condition"),
  stockShipmentDetails: strOptional("Stock Shipment Details"),
  contactPersonName: strOptional("Contact Person Name"),
  contactPersonPhone: phoneOptional("Contact Person Phone number"),
  contactPersonEmail: emailOptional("Contact Person Email"),
  isPoWhatsapp: boolOptional("Is PO Whatsapp"),
  isPoEmail: boolOptional("Is PO Email"),
  isGrnWhatsapp: boolOptional("Is GRN Whatsapp"),
  isGrnEmail: boolOptional("Is GRN Email"),
  isReturnWhatsapp: boolOptional("Is Return Whatsapp"),
  isReturnEmail: boolOptional("Is Return Email"),
  description: strOptional("Description"),
  isLock: boolOptional("Is Lock"),
  taxIdentificationDetails: arrayOptional(
    "Tax Identification Details",
    taxIdentificationDetailSchema,
  ),

  bankDetails: arrayOptional("Bank Details", bankDetailsSchema),
});

export const validateCreateItemSupplier = validationHandler({
  schema: itemSupplierCreateSchema,
});

export const itemSupplierUpdateSchema = itemSupplierCreateSchema.keys({
  id: idRequired("Item Supplier ID"),
});

export const validateUpdateItemSupplier = validationHandler({
  schema: itemSupplierUpdateSchema,
});
