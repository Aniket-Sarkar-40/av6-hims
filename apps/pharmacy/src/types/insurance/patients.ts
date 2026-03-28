import { FormData } from "@repo/shared/utils/types.utils.js";
import { IncomeMaster } from "@repo/db/generated/prisma/enums.js";
import { CountryDTO } from "../master/country.js";
import { IdValue } from "@repo/shared/types/global.js";

export interface CommonPatient {
  admissionDate: string | null;
  patientName: string | null;
  age: string;
  month: string;
  days: string | null;
  image: string | null;
  mobileNo: string | null;
  email: string | null;
  dob: Date | null;
  gender: string | null;
  maritalStatus: string | null;
  bloodGroup: string | null;
  address: string;
  guardianName: string | null;
  guardianPhone: string | null;
  guardianAddress: string | null;
  guardianEmail: string | null;
  discharged: string | null;
  patientType: string | "";
  creditLimit: string | null;
  organization: string | null;
  knownAllergies: string | null;
  oldPatient: string | null;
  note: string | "";
  isIpd: string | null;
  ccId: number | null;
  isMaster: IncomeMaster | null;
  aadhar: string | null;
  passport: string | null;
  nationality: string | null;
  area: string | null;
  pinCode: string | null;
  height: string | null;
  weight: string | null;
  patientCode: string | null;
  userLogin: string | null;
  state: string | null;
  userRelationship: string | null;
  pid: string | null;
  localId: string | null;
  street: string | null;
  city: string | null;
  pinCode2: string | null;
  remarks: string | null;
  patientImage: string | null;
  emergencyFirstName: string | null;
  emergencyLastName: string | null;
  emergencyRelation: string | null;
  emergencyPhoneNumber: string | null;
  emergencyEmail: string | null;
  emergencyMaritalStatus: string | null;
  emergencyAddress: string | null;
  emergencyState: string | null;
  emergencyCountry: string | null;
  patientSignature: string | null;
  patientOccupation: string | null;
  employeeId: string | null;
  clientId: number | null;
  isActive?: string | null;
}

export interface PatientReq extends CommonPatient {
  id?: number | null;
  country: number | null;
}

export type PatientCreateFormData = FormData<PatientReq>;

export type PatientUpdateFormData = FormData<PatientReq, "id">;

export interface PatientImage {
  image?: Express.Multer.File[];
  patientImage?: Express.Multer.File[];
  patientSignature?: Express.Multer.File[];
}

export interface PatientDto extends Omit<CommonPatient, "dob"> {
  id: number | null;
  country: CountryDTO | null;
  client?: IdValue | null;
  uniqueSequenceNumber: number;
  patientUniqueId: number;
}
