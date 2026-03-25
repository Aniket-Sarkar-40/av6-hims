import { fetchConsultationIcdTenListByAppointment } from "@/repository/opd/consultationIcdList.repository.js";
import { logger } from "@repo/platform/logging/logger.js";

export const consultationIcdListService = {
  async consultationIcdList(id: number) {
    logger.info("entering::consultationIcdListService::service");

    const result = await fetchConsultationIcdTenListByAppointment(id);

    logger.info("exiting::consultationIcdListService::service");
    return result;
  },
};
