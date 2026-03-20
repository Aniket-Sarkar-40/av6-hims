import { createConsultationComplaintInDb } from "@/repository/appointment/consultationComplaint.repository.js";
import { CreateConsultationComplaintsInput } from "@/types/appointment/consultationComplaint.js";
import { logger } from "@repo/platform/logging/logger.js";
import { createConsultationComplaintServiceValidation } from "@/validations/service/appointment/consultationComplaint.service.validation.js";

export const consultationComplaintService = {
  async createConsultationComplaints(input: CreateConsultationComplaintsInput) {
    logger.info("entering::consultationComplaint::service");
    await createConsultationComplaintServiceValidation(input);

    const createConsultationComplaints =
      await createConsultationComplaintInDb(input);
    logger.info("exiting::consultationComplaint::service");
    return createConsultationComplaints;
  },
};
