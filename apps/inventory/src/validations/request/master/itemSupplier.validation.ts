import { VendorType } from "@repo/db/generated/prisma/client";
import {
  arrayOptional,
  boolOptional,
  boolRequired,
  emailOptional,
  enumOptional,
  idOptional,
  idRequired,
  phoneOptional,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

const taxIdentificationDetailSchema = Joi.object({
  id: idOptional("Tax Identification ID"),
  taxIdentificationName: strRequired("Tax Identification Name"),
  taxIdentificationValue: idRequired("Tax Identification Value"),
  taxIdentificationNumber: strRequired("Tax Identification Number"),
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
  supplierCode: strOptional("Supplier Code"),
  vendorCompanyName: strRequired("Vendor Company Name"),
  phone: phoneOptional("Phone number"),
  email: emailOptional("Email"),
  billTo: strRequired("Bill To"),
  shipTo: strRequired("Ship To"),
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
  isSmsSend: boolOptional("Is SMS Send"),
  isPoWhatsapp: boolRequired("Is PO Whatsapp"),
  isPoEmail: boolRequired("Is PO Email"),
  isPoSms: boolRequired("Is PO SMS"),
  isGrnWhatsapp: boolRequired("Is GRN Whatsapp"),
  isGrnEmail: boolRequired("Is GRN Email"),
  isGrnSms: boolRequired("Is GRN SMS"),
  isReturnWhatsapp: boolRequired("Is Return Whatsapp"),
  isReturnSms: boolRequired("Is Return SMS"),
  isReturnEmail: boolRequired("Is Return Email"),
  isLock: boolOptional("Is Lock"),
  taxIdentificationDetails: arrayOptional(
    "Tax Identification Details",
    taxIdentificationDetailSchema
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
