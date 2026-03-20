import { getConsultationFeeAndSlots } from "@/mapper/timeSlot/timeSlot.mapper.js";
import { getDoctorScheduleWeekIdFromDb } from "@/repository/doctor/doctor.repository.js";
import {
  DoctorConsultationWithTimeSlotInput,
  DoctorConsultationWithTimeSlotResponse,
  WeekIdInput,
  WeekIdsRes,
} from "@/types/timeSlot/timeSlot.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  validIdSlots,
  validWeekIds,
} from "@/validations/service/timeSlots/timeSlot.service.validation.js";

export const timeSlotService = {
  getAllTimeSlots: async (
    input: DoctorConsultationWithTimeSlotInput,
  ): Promise<DoctorConsultationWithTimeSlotResponse> => {
    logger.info("entering::getAllTimeSlots::service");
    await validIdSlots(input);
    const timeSlots = await getConsultationFeeAndSlots(input);

    logger.info("exiting::getAllTimeSlots::service");
    return timeSlots;
  },
  getAllWeekIds: async (input: WeekIdInput): Promise<WeekIdsRes> => {
    logger.info("entering::getAllWeekIds::service");
    await validWeekIds(input);
    const weekIds = await getDoctorScheduleWeekIdFromDb(
      input.docId,
      input.ccId,
    );
    logger.info("exiting::getAllWeekIds::service");
    return weekIds;
  },
};
