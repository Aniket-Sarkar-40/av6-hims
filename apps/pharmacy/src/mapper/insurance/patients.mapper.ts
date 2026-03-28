// import { countryService } from "@/services/master/country.service.js";
import { getCorporateClientById } from "@/repository/opd/corporate.repository.js";
import { countryService } from "@/services/master/country.service.js";
import {
  PatientCreateFormData,
  PatientDto,
  PatientImage,
  PatientReq,
  PatientUpdateFormData,
} from "@/types/insurance/patients.js";
import { toImageApiUrl } from "@repo/shared/utils/helper.utils.js";
import { IncomeMaster, Patient } from "@repo/db/generated/prisma/client";
import path from "path";
import { toIdValue } from "av6-utils";

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
  isMaster: (patient.isMaster as IncomeMaster) || null,
  aadhar: patient.aadhar || null,
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

  const country =
    patient.country !== null &&
    patient.country !== undefined &&
    patient.country != 0
      ? await countryService.getCountryById(Number(patient.country), true)
      : null;
  const client =
    patient.clientId !== null &&
    patient.clientId !== undefined &&
    patient.clientId != 0
      ? await getCorporateClientById(patient.clientId)
      : null;

  return {
    id: patient.id ? patient.id : null,
    patientUniqueId: patient.patientUniqueId,
    admissionDate: patient.admissionDate ?? null,
    patientName: patient.patientName ?? null,
    age: patient.age ?? null,
    month: patient.month ?? null,
    days: patient.days ?? null,
    image: image ?? null,
    mobileNo: patient.mobileNo ?? null,
    email: patient.email ?? null,
    gender: patient.gender ?? null,
    maritalStatus: patient.maritalStatus ?? null,
    bloodGroup: patient.bloodGroup ?? null,
    address: patient.address ?? null,
    guardianName: patient.guardianName ?? null,
    guardianPhone: patient.guardianPhone ?? null,
    guardianAddress: patient.guardianAddress ?? null,
    guardianEmail: patient.guardianEmail ?? null,
    isActive: patient.isActive ?? null,
    discharged: patient.discharged ?? null,
    patientType: patient.patientType ?? "",
    creditLimit: patient.creditLimit ?? null,
    organization: patient.organization ?? null,
    knownAllergies: patient.knownAllergies ?? null,
    oldPatient: patient.oldPatient ?? null,
    note: patient.note ?? "",
    isIpd: patient.isIpd ?? null,
    ccId: patient.ccId ?? null,
    isMaster: patient.isMaster ?? null,
    uniqueSequenceNumber: patient.uniqueSequenceNumber ?? 0,
    aadhar: patient.aadhar ?? null,
    passport: patient.passport ?? null,
    nationality: patient.nationality ?? null,
    area: patient.area ?? null,
    pinCode: patient.pinCode ?? null,
    height: patient.height ?? null,
    weight: patient.weight ?? null,
    patientCode: patient.patientCode ?? null,
    userLogin: patient.userLogin ?? null,
    state: patient.state ?? null,
    userRelationship: patient.userRelationship ?? null,
    pid: patient.pid ?? null,
    localId: patient.localId ?? null,
    street: patient.street ?? null,
    city: patient.city ?? null,
    pinCode2: patient.pinCode2 ?? null,
    country: country ?? null,
    remarks: patient.remarks ?? null,
    patientImage: patientImage ?? null,
    emergencyFirstName: patient.emergencyFirstName ?? null,
    emergencyLastName: patient.emergencyLastName ?? null,
    emergencyRelation: patient.emergencyRelation ?? null,
    emergencyPhoneNumber: patient.emergencyPhoneNumber ?? null,
    emergencyEmail: patient.emergencyEmail ?? null,
    emergencyMaritalStatus: patient.emergencyMaritalStatus ?? null,
    emergencyAddress: patient.emergencyAddress ?? null,
    emergencyState: patient.emergencyState ?? null,
    emergencyCountry: patient.emergencyCountry ?? null,
    patientSignature: patientSignature ?? null,
    patientOccupation: patient.patientOccupation ?? null,
    employeeId: patient.employeeId ?? null,
    clientId: patient.clientId || null,
    client: client ? toIdValue(client, "customerName") : null,
  };
};
