import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { getPatientsByIdFromDb } from "@/repository/patient/patient.repository.js";
import { insuranceService } from "@/services/insurance/insurance.service.js";
import {
  InsuranceCardImages,
  PatientInsuranceDto,
  PatientInsuranceReq,
} from "@/types/insurance/patientsInsurance.js";
import { toIdValue } from "av6-utils";
import { PatientInsurance } from "@repo/db/generated/prisma/client";
import path from "path";
import { toImageApiUrl } from "@repo/shared/utils/helper.utils.js";

export const toPatientInsuranceEntity = (
  patientsInsurance: PatientInsuranceReq,
  images?: InsuranceCardImages,
) => {
  const cardFrontImage = images?.cardFrontImage?.[0]?.path
    ? path.basename(images.cardFrontImage[0].path)
    : patientsInsurance.cardFrontImage;

  const cardBackImage = images?.cardBackImage?.[0]?.path
    ? path.basename(images.cardBackImage[0].path)
    : patientsInsurance.cardBackImage;

  return {
    insurerId: Number(patientsInsurance.insurerId),
    patientId: Number(patientsInsurance.patientId),
    insuranceType: patientsInsurance.insuranceType,
    insurancePlan: patientsInsurance.insurancePlan ?? null,
    policyNumber: patientsInsurance.policyNumber ?? null,
    relationship: patientsInsurance.relationship ?? null,
    issueDate: patientsInsurance.issueDate ?? null,
    expireDate: patientsInsurance.expireDate ?? null,
    cardFrontImage,
    cardBackImage,
  };
};

export const toPatientInsuranceUpdateEntity = (
  patientsInsurance: PatientInsuranceReq,
  images?: InsuranceCardImages,
) => {
  const cardFrontImage = images?.cardFrontImage?.[0]?.path
    ? path.basename(images.cardFrontImage[0].path)
    : patientsInsurance.cardFrontImage;

  const cardBackImage = images?.cardBackImage?.[0]?.path
    ? path.basename(images.cardBackImage[0].path)
    : patientsInsurance.cardBackImage;

  return {
    id: Number(patientsInsurance.id),
    insurerId: Number(patientsInsurance.insurerId),
    patientId: Number(patientsInsurance.patientId),
    insuranceType: patientsInsurance.insuranceType,
    insurancePlan: patientsInsurance.insurancePlan ?? null,
    policyNumber: patientsInsurance.policyNumber ?? null,
    relationship: patientsInsurance.relationship ?? null,
    issueDate: patientsInsurance.issueDate ?? null,
    expireDate: patientsInsurance.expireDate ?? null,
    cardFrontImage,
    cardBackImage,
  };
};

export const toPatientInsuranceDto = async (
  patientsInsurance: PatientInsurance,
): Promise<PatientInsuranceDto> => {
  const insurer = await insuranceService.getInsuranceById(
    patientsInsurance.insurerId,
    true,
  );

  const patient = await getPatientsByIdFromDb(patientsInsurance.patientId);

  const cardFrontImage = patientsInsurance.cardFrontImage
    ? toImageApiUrl(
        patientsInsurance.cardFrontImage,
        "patient_images/card_image",
      )
    : "";
  const cardBackImage = patientsInsurance.cardBackImage
    ? toImageApiUrl(
        patientsInsurance.cardBackImage,
        "patient_images/card_image",
      )
    : "";
  const createdBy = patientsInsurance.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        patientsInsurance.createdBy,
        true,
      )
    : null;

  return {
    id: patientsInsurance.id,
    insurer: insurer,
    patient: patient,
    insuranceType: patientsInsurance.insuranceType,
    insurancePlan: patientsInsurance.insurancePlan ?? null,
    policyNumber: patientsInsurance.policyNumber ?? null,
    relationship: patientsInsurance.relationship ?? null,
    issueDate: patientsInsurance.issueDate ?? null,
    expireDate: patientsInsurance.expireDate ?? null,
    cardFrontImage: cardFrontImage,
    cardBackImage: cardBackImage,
    createdBy: toIdValue(createdBy, "name"),
    createdAt: patientsInsurance.createdAt,
    updatedAt: patientsInsurance.updatedAt,
  };
};
