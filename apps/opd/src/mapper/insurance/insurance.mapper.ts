import {
  InsuranceBusinessMapping,
  InsuranceImage,
  InsuranceReq,
  InsuranceResponse,
} from "@/types/insurance/insurance.js";
import { PatientInsuranceRes } from "@/types/insurance/patientsInsurance.js";
import { logger } from "@repo/platform/logging/logger.js";
import { InsuranceMaster } from "@repo/db/generated/prisma/client";
import {
  toPublicImageUrl,
  toRelativeImagePath,
} from "@repo/shared/utils/helper.utils.js";

export const toInsuranceEntity = (
  insurance: InsuranceReq,
  images?: InsuranceImage,
) => {
  const logoImage = images?.logoImage?.[0]?.path
    ? toRelativeImagePath(images.logoImage[0].path)
    : insurance.logoImage;

  const attachments = images?.attachments?.[0]?.path
    ? toRelativeImagePath(images.attachments[0].path)
    : (insurance.attachments ?? null);

  const businessArray: InsuranceBusinessMapping[] = Array.isArray(
    insurance.insuranceBusinessMapping,
  )
    ? insurance.insuranceBusinessMapping
    : insurance.insuranceBusinessMapping
      ? JSON.parse(insurance.insuranceBusinessMapping)
      : [];

  return {
    customerCode: insurance.customerCode,
    customerName: insurance.customerName,
    contactNo: insurance.contactNo,
    email: insurance.email,
    contactPersonName: insurance.contactPersonName,
    contactPersonPhone: insurance.contactPersonPhone,
    contactPersonEmail: insurance.contactPersonEmail,

    customerActiveFrom: insurance.customerActiveFrom,
    customerStatus: insurance.customerStatus ?? null,
    status: insurance.status,

    logoImage,

    adhaar: insurance.adhaar ?? null,
    pan: insurance.pan ?? null,
    gstNo: insurance.gstNo ?? null,
    ccId: Number(insurance.ccId),
    isMaster: insurance.isMaster,
    sapCode: insurance.sapCode,
    statusChangeRemark: insurance.statusChangeRemark ?? null,
    billAddress: insurance.billAddress ?? null,
    shiftAddress: insurance.shiftAddress ?? null,
    portalAccessConfig: insurance.portalAccessConfig ?? null,
    printConfig: insurance.printConfig ?? null,
    notificationConfig: insurance.notificationConfig ?? null,

    attachments,

    paymentMode: insurance.paymentMode,
    insuranceType: insurance.insuranceType,
    pharmacyPaymentType: insurance.pharmacyPaymentType,
    pharmacyPaymentValue: Number(insurance.pharmacyPaymentValue),
    opdPaymentType: insurance.opdPaymentType,
    opdPaymentValue: Number(insurance.opdPaymentValue),
    pathologyPaymentType: insurance.pathologyPaymentType,
    pathologyPaymentValue: Number(insurance.pathologyPaymentValue),

    insuranceBusinessMapping: businessArray,
  };
};

export const toInsuranceUpdateEntity = (
  insurance: InsuranceReq,
  images?: InsuranceImage,
) => {
  const logoImage = images?.logoImage?.[0]?.path
    ? toRelativeImagePath(images.logoImage[0].path)
    : insurance.logoImage;

  const attachments = images?.attachments?.[0]?.path
    ? toRelativeImagePath(images.attachments[0].path)
    : (insurance.attachments ?? null);
  const businessArray: InsuranceBusinessMapping[] = Array.isArray(
    insurance.insuranceBusinessMapping,
  )
    ? insurance.insuranceBusinessMapping
    : insurance.insuranceBusinessMapping
      ? JSON.parse(insurance.insuranceBusinessMapping)
      : [];

  return {
    id: Number(insurance.id),
    customerCode: insurance.customerCode,
    customerName: insurance.customerName,
    contactNo: insurance.contactNo,
    email: insurance.email,
    contactPersonName: insurance.contactPersonName,
    contactPersonPhone: insurance.contactPersonPhone,
    contactPersonEmail: insurance.contactPersonEmail,

    customerActiveFrom: insurance.customerActiveFrom,
    customerStatus: insurance.customerStatus ?? null,
    status: insurance.status,

    logoImage,

    adhaar: insurance.adhaar ?? null,
    pan: insurance.pan ?? null,
    gstNo: insurance.gstNo ?? null,
    ccId: Number(insurance.ccId),
    isMaster: insurance.isMaster,
    sapCode: insurance.sapCode,
    statusChangeRemark: insurance.statusChangeRemark ?? null,
    billAddress: insurance.billAddress ?? null,
    shiftAddress: insurance.shiftAddress ?? null,
    portalAccessConfig: insurance.portalAccessConfig ?? null,
    printConfig: insurance.printConfig ?? null,
    notificationConfig: insurance.notificationConfig ?? null,

    attachments,

    paymentMode: insurance.paymentMode,
    insuranceType: insurance.insuranceType,
    pharmacyPaymentType: insurance.pharmacyPaymentType,
    pharmacyPaymentValue: Number(insurance.pharmacyPaymentValue),
    opdPaymentType: insurance.opdPaymentType,
    opdPaymentValue: Number(insurance.opdPaymentValue),
    pathologyPaymentType: insurance.pathologyPaymentType,
    pathologyPaymentValue: Number(insurance.pathologyPaymentValue),

    insuranceBusinessMapping: businessArray,
  };
};

export const toInsuranceDto = (
  insurance: InsuranceMaster & {
    insuranceBusinessMapping: InsuranceBusinessMapping[];
  },
): InsuranceReq => ({
  id: insurance.id,
  customerCode: insurance.customerCode,
  customerName: insurance.customerName,
  contactNo: insurance.contactNo,
  email: insurance.email,
  contactPersonName: insurance.contactPersonName,
  contactPersonPhone: insurance.contactPersonPhone,
  contactPersonEmail: insurance.contactPersonEmail,

  customerActiveFrom: insurance.customerActiveFrom,
  customerStatus: insurance.customerStatus,
  status: insurance.status,
  logoImage: insurance.logoImage,

  adhaar: insurance.adhaar,
  pan: insurance.pan,
  gstNo: insurance.gstNo,
  ccId: insurance.ccId,
  isMaster: insurance.isMaster,
  sapCode: insurance.sapCode,
  statusChangeRemark: insurance.statusChangeRemark,
  billAddress: insurance.billAddress,
  shiftAddress: insurance.shiftAddress,
  portalAccessConfig: insurance.portalAccessConfig,
  printConfig: insurance.printConfig,
  notificationConfig: insurance.notificationConfig,
  attachments: insurance.attachments
    ? toPublicImageUrl(insurance.attachments)
    : "",

  paymentMode: insurance.paymentMode,
  insuranceType: insurance.insuranceType,
  pharmacyPaymentType: insurance.pharmacyPaymentType,
  pharmacyPaymentValue: insurance.pharmacyPaymentValue,
  opdPaymentValue: insurance.opdPaymentValue,
  opdPaymentType: insurance.opdPaymentType,
  pathologyPaymentValue: insurance.pathologyPaymentValue,
  pathologyPaymentType: insurance.pathologyPaymentType,

  insuranceBusinessMapping: insurance.insuranceBusinessMapping.map((m) => ({
    id: m.id,
    insurerId: m.insurerId,
    type: m.type,
    name: m.name,
    phone: m.phone,
    isDefault: m.isDefault,
    date: m.date,
  })),
});

export const toInsuranceInternalDto = (
  patientIns: PatientInsuranceRes,
): InsuranceResponse => {
  logger.info(
    "Mapping insurance response for patient insurance id: " + patientIns.id,
  );

  return {
    id: patientIns.insurance.id,
    policyNo: patientIns.policyNumber ?? "",
    insuranceType: patientIns.insuranceType,
    insurancePlan: patientIns.insurancePlan ?? "",
    insurerName: patientIns.insurance.customerName,
  };
};
