import {
  AppointmentResponse,
  LastAppointmentResponse,
} from "@/types/appointment/appointment.js";
import { ClinicalHistoryResponse } from "@/types/appointment/clinicalHistory.js";
import { ConsultationResponse } from "@/types/appointment/consultation.js";
import { ConsultationComplaintResponse } from "@/types/appointment/consultationComplaint.js";
import { ConsultationICDTenListResponse } from "@/types/appointment/consultationICDTenList.js";
import { DocumentResponse } from "@/types/appointment/document.js";
import { FollowUpWithDoctor } from "@/types/appointment/followUp.js";
import { PatientTestResponse } from "@/types/appointment/investigation.js";
import { PatientAdviceDetailsRes } from "@/types/appointment/patientAdviceDetails.js";
import { PatientConsultationRes } from "@/types/appointment/patientConsultation.js";
import { PatientMedicineResponse } from "@/types/appointment/patientMedicine.js";
import { ReferToDoctorResponse } from "@/types/appointment/referToDoctor.js";
import { DoctorResponse } from "@/types/doctor/doctor.js";
import { chipsButtonMappingRes } from "@/types/master/chipsButtonMapping.js";
import { ConsultationNotesMappingRes } from "@/types/master/consultationNotesMapping.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/opd.shortCode.utils.js";
import {
  CashNBankHead,
  ConsultationNotes,
  MobileMoneyMethod,
  GeneralBillItem,
  OpdDepartment,
  OpdDepartmentPrefix,
  Patient,
  PatientInsurance,
  ProcedureMaster,
  OpdUINConfig,
} from "@repo/db/generated/prisma/client";
import { toUINConfigDTO } from "av6-core-v2";
import {
  toAppointmentDto,
  toLastAppointmentDto,
} from "./appointment/appointment.mapper.js";
import { toClinicalHistoryDTO } from "./appointment/clinicalHistory.mapper.js";
import { toConsultationComplaintDTO } from "./appointment/consultantionComplaint.mapper.js";
import { toConsultationDTO } from "./appointment/consultation.mapper.js";
import { toConsultationICDTenListDTO } from "./appointment/consultationICDTenList.mapper.js";
import { toDocumentDTO } from "./appointment/document.mapper.js";
import { toFollowUpDTO } from "./appointment/followUp.mapper.js";
import { toPatientTestDTO } from "./appointment/investigation.mapper.js";
import { toPatientAdviceDetailsDTO } from "./appointment/patientAdviceDetails.mapper.js";
import { toPatientConsultationDTO } from "./appointment/patientConsultation.mapper.js";
import { toPatientMedicineDto } from "./appointment/patientMedicine.mapper.js";
import { toReferToDoctorDTO } from "./appointment/referToDoctor.mapper.js";
import { toDoctorDTO } from "./doctor/doctor.mapper.js";
import { toPatientInsuranceDto } from "./insurance/patientsInsurance.mapper.js";
import { toChipsButtonDTO } from "./master/chipsButtonMapping.mapper.js";
import { toConsultationNotesDTO } from "./master/consultationNotes.mapper.js";
import { toConstMappingDTO } from "./master/consultationNotesMapping.mapper.js";
import { toOpdDepartmentDTO } from "./master/opdDepartment.mapper.js";
import { toOpdDepartmentPrefixDTO } from "./master/opdDepartmentPrefix.mapper.js";
import { toProcedureMasterDTO } from "./master/procedure.mapper.js";
import { toPatientDto } from "./patient/patient.mapper.js";
import { toBankHeadDTO } from "./master/bankHead.mapper.js";
import { toMobileMoneyMethodDTO } from "./master/mobileMoney.mapper.js";
import { toGeneralBillItemMasterDTO } from "./master/generalBillItem.mapper.js";
import { toGeneralBillPricingDTO } from "./master/generalBillPricing.mapper.js";
import { GeneralBillPricingResponse } from "@/types/master/generalBillPricing.js";
import { toGeneralBillingDto } from "./appointment/generalBilling.mapper.js";
import { GeneralBillingResponse } from "@/types/appointment/generalBilling.js";

// Define a type for DTO mapping functions.
type DtoMappingFunction = (data: unknown) => unknown;
export const dtoMapping: Record<string, DtoMappingFunction> = {
  [SHORT_CODE.UIN_CONFIG]: (data: unknown) =>
    toUINConfigDTO(data as OpdUINConfig),
  [SHORT_CODE.PATIENTS]: (data: unknown) => toPatientDto(data as Patient),
  [SHORT_CODE.OPD_DEPARTMENT_PREFIX]: (data: unknown) =>
    toOpdDepartmentPrefixDTO(data as OpdDepartmentPrefix),
  [SHORT_CODE.DOCTOR]: (data: unknown) => toDoctorDTO(data as DoctorResponse),
  [SHORT_CODE.OPD_DEPARTMENT]: (data: unknown) =>
    toOpdDepartmentDTO(data as OpdDepartment),
  [SHORT_CODE.DOCUMENT]: (data: unknown) =>
    toDocumentDTO(data as DocumentResponse),
  [SHORT_CODE.APPOINTMENT]: (data: unknown) =>
    toAppointmentDto(data as AppointmentResponse),
  [SHORT_CODE.PATIENT_CONSULTATION]: (data: unknown) =>
    toPatientConsultationDTO(data as PatientConsultationRes),
  [SHORT_CODE.REFER_TO_DOCTOR]: (data: unknown) =>
    toReferToDoctorDTO(data as ReferToDoctorResponse),
  [SHORT_CODE.PATIENT_MEDICINE]: (data: unknown) =>
    toPatientMedicineDto(data as PatientMedicineResponse),
  [SHORT_CODE.CONSULTATION_ICD_TEN_LIST]: (data: unknown) =>
    toConsultationICDTenListDTO(data as ConsultationICDTenListResponse),
  [SHORT_CODE.FOLLOW_UP]: (data: unknown) =>
    toFollowUpDTO(data as FollowUpWithDoctor),
  [SHORT_CODE.CONSULTATION_NOTES]: (data: unknown) =>
    toConsultationNotesDTO(data as ConsultationNotes),
  [SHORT_CODE.CONSULTATION_NOTES_MAPPINGS]: (data: unknown) =>
    toConstMappingDTO(data as ConsultationNotesMappingRes),
  [SHORT_CODE.PATIENT_TEST]: (data: unknown) =>
    toPatientTestDTO(data as PatientTestResponse),
  [SHORT_CODE.CLINICAL_HISTORY]: (data: unknown) =>
    toClinicalHistoryDTO(data as ClinicalHistoryResponse),
  [SHORT_CODE.PATIENT_ADVICE_DETAILS]: (data: unknown) =>
    toPatientAdviceDetailsDTO(data as PatientAdviceDetailsRes),
  [SHORT_CODE.CHIPS_BUTTON_MAPPING]: (data: unknown) =>
    toChipsButtonDTO(data as chipsButtonMappingRes),
  [SHORT_CODE.CONSULTATION_COMPLAINT]: (data: unknown) =>
    toConsultationComplaintDTO(data as ConsultationComplaintResponse),
  [SHORT_CODE.CONSULTATION]: (data: unknown) =>
    toConsultationDTO(data as ConsultationResponse),
  [SHORT_CODE.PATIENT_INSURANCE]: (data: unknown) =>
    toPatientInsuranceDto(data as PatientInsurance),
  [SHORT_CODE.PROCEDURE]: (data: unknown) =>
    toProcedureMasterDTO(data as ProcedureMaster),
  [SHORT_CODE.LAST_VISIT]: (data: unknown) =>
    toLastAppointmentDto(data as LastAppointmentResponse),
  [SHORT_CODE.BANK_HEAD]: (data: unknown) =>
    toBankHeadDTO(data as CashNBankHead),
  [SHORT_CODE.MOBILE_MONEY]: (data: unknown) =>
    toMobileMoneyMethodDTO(data as MobileMoneyMethod),
  [SHORT_CODE.GENERAL_BILL_ITEM]: (data: unknown) =>
    toGeneralBillItemMasterDTO(data as GeneralBillItem),
  [SHORT_CODE.GENERAL_BILL_PRICING]: (data: unknown) =>
    toGeneralBillPricingDTO(data as GeneralBillPricingResponse),
  [SHORT_CODE.GENERAL_BILL]: (data: unknown) =>
    toGeneralBillingDto(data as GeneralBillingResponse),
};
