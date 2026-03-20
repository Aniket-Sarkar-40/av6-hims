import {
  DoctorConsultationWithTimeSlotInput,
  WeekIdInput,
} from "@/types/timeSlot/timeSlot.js";
import { logger } from "@repo/platform/logging/logger.js";
import { validateIdDoctor } from "../doctor/doctor.service.validation.js";
import { validateIdCollectionCenter } from "../master/collectionCenter.service.validation.js";
import { validateIdInsurance } from "../insurance/insurance.service.validation.js";
import { validateIdCorporateClient } from "../corporate/corporate.service.validation.js";

export const validIdSlots = async (
  input: DoctorConsultationWithTimeSlotInput,
) => {
  logger.info("entering::validIdSlots::service::validation");

  await validateIdDoctor(input.docId);
  await validateIdCollectionCenter(input.ccId);
  if (input.insuranceId) {
    await validateIdInsurance(input.insuranceId);
  }

  if (input.clientId) {
    input.client = await validateIdCorporateClient(input.clientId);
  }

  logger.info("exiting::validIdSlots::service::validation");
};
export const validWeekIds = async (input: WeekIdInput) => {
  logger.info("entering::validIdSlots::service::validation");

  await validateIdDoctor(input.docId);

  await validateIdCollectionCenter(input.ccId);
};
