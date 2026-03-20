import { countryService } from "@apps/core/services/master/country.service.js";
import { corporateService } from "@/services/corporate/corporate.service.js";
import {
  PatientCreateFormData,
  PatientDto,
  PatientImage,
  PatientInternalRes,
  PatientReq,
  PatientUpdateFormData,
} from "@/types/patient/patient.js";
import { customOmit, toIdValue } from "av6-utils";
import { MasterType, Patient } from "@repo/db/generated/prisma/client";
import path from "path";
import {
  calculateAge,
  toImageApiUrl,
} from "@repo/shared/utils/helper.utils.js";

const patientUrlPhp = "patient_images/patient_captured_images";

export const toPatientEntity = (
  patient: PatientCreateFormData,
  patientImage?: PatientImage,
): PatientReq => ({
  admissionDate: patient.admissionDate
    ? new Date(patient.admissionDate).toISOString()
    : (patient.admissionDate ?? null),
  patientName: patient.patientName || null,
  age: patient.age,
  month: patient.month,
  days: patient.days || null,
  image: patientImage?.image?.[0]?.path
    ? path.basename(patientImage.image[0]?.path)
    : null,
  mobileNo: patient.mobileNo ?? null,
  email: patient.email || null,
  dob: patient.dob ? new Date(patient.dob) : new Date(),
  gender: patient.gender || null,
  maritalStatus: patient.maritalStatus || null,
  bloodGroup: patient.bloodGroup || null,
  address: patient.address || "",
  guardianName: patient.guardianName || null,
  guardianPhone: patient.guardianPhone || null,
  guardianAddress: patient.guardianAddress || null,
  guardianEmail: patient.guardianEmail || null,
  discharged: patient.discharged || null,
  patientType: patient.patientType,
  creditLimit: patient.creditLimit || null,
  organization: patient.organization || null,
  knownAllergies: patient.knownAllergies || null,
  oldPatient: patient.oldPatient || null,
  note: patient.note,
  isIpd: patient.isIpd || null,
  ccId: patient.ccId ? Number(patient.ccId) : null,
  isMaster: (patient.isMaster as MasterType) || null,
  aadhar: patient.aadhar || null, // TODO: add validation for aadhar number
  passport: patient.passport || null,
  nationality: patient.nationality || null,
  area: patient.area || null,
  pinCode: patient.pinCode || null,
  height: patient.height || null,
  weight: patient.weight || null,
  patientCode: patient.patientCode || null,
  userLogin: patient.userLogin || null,
  state: patient.state || null,
  userRelationship: patient.userRelationship || null,
  pid: patient.pid || null,
  localId: patient.localId || null,
  street: patient.street || null,
  city: patient.city || null,
  pinCode2: patient.pinCode2 || null,
  country: patient.country ? Number(patient.country) : null,
  remarks: patient.remarks || null,
  patientImage: patientImage?.patientImage?.[0]?.path
    ? path.basename(patientImage.patientImage[0]?.path)
    : null,
  emergencyFirstName: patient.emergencyFirstName || null,
  emergencyLastName: patient.emergencyLastName || null,
  emergencyRelation: patient.emergencyRelation || null,
  emergencyPhoneNumber: patient.emergencyPhoneNumber || null,
  emergencyEmail: patient.emergencyEmail || null,
  emergencyMaritalStatus: patient.emergencyMaritalStatus || null,
  emergencyAddress: patient.emergencyAddress || null,
  emergencyState: patient.emergencyState || null,
  emergencyCountry: patient.emergencyCountry || null,
  patientSignature: patientImage?.patientSignature?.[0]?.path
    ? path.basename(patientImage.patientSignature[0]?.path)
    : null,
  patientOccupation: patient.patientOccupation || null,
  employeeId: patient.employeeId || null,
  clientId: Number(patient.clientId) || null,
});

export const toPatientUpdateEntity = (
  patient: PatientUpdateFormData,
  patientImage?: PatientImage,
): PatientReq => ({
  id: Number(patient.id),
  ...toPatientEntity(patient, patientImage),
});

export const toPatientDto = async (patient: Patient): Promise<PatientDto> => {
  // Safely map values to null if undefined or null
  const patientImage = patient.patientImage
    ? toImageApiUrl(patient.patientImage, patientUrlPhp)
    : null;
  const image = patient.image
    ? toImageApiUrl(patient.image, patientUrlPhp)
    : null;
  const patientSignature = patient.patientSignature
    ? toImageApiUrl(patient.patientSignature, patientUrlPhp)
    : null;

  const omittedPatient = customOmit(patient, [
    "country",
    "dob",
    "isActive",
    "clientId",
  ]);
  const country =
    patient.country !== null &&
    patient.country !== undefined &&
    patient.country > 0
      ? await countryService.getCountryById(patient.country, true)
      : null;
  const client =
    patient.clientId !== null &&
    patient.clientId !== undefined &&
    patient.clientId > 0
      ? await corporateService.corporateClientById(patient.clientId, true)
      : null;

  return {
    ...omittedPatient.rest,
    image: image ?? null,
    patientImage: patientImage ?? null,
    patientSignature: patientSignature ?? null,
    client: client ? toIdValue(client, "customerName") : null,
    country: country ? toIdValue(country, "name") : null,
  };
};

export const toPatientInternalRes = (patient: Patient): PatientInternalRes => {
  return {
    id: patient.id,
    patientName: patient.patientName,
    patientUniqueId: patient.patientUniqueId,
    email: patient.email,
    dob: patient.dob,
    employeeId: patient.employeeId,
    gender: patient.gender,
    image: patient.image ? toImageApiUrl(patient.image, "staff_images") : null,
    mobileNo: patient.mobileNo,
    address: patient.address,
    age: patient.dob ? String(calculateAge(patient.dob)) : patient.age,
  };
};
