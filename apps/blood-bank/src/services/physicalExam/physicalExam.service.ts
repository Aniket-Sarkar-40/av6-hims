import { upsertPhysicalExamInDb } from "@/repository/physicalExam/physicalExam.repository.js";
import { CreateOrUpdateBloodDonationPhysicalExam } from "@/types/bloodDonationPhysicalExam/bloodDonationPhysicalExam.js";
import { upsertPhysicalExamServiceValidation } from "@/validations/service/bloodDonationPhysicalExam/bloodDonationPhysicalExam.service.validation.js";
import { logger } from "@repo/platform/logging/logger.js";

export const physicalExamService = {
  async upsertPhysicalExam(input: CreateOrUpdateBloodDonationPhysicalExam) {
    logger.info("entering::upsertPhysicalExam::service");
    await upsertPhysicalExamServiceValidation(input);

    await upsertPhysicalExamInDb(input);

    logger.info("exiting::upsertPhysicalExam::service");
  },
};
