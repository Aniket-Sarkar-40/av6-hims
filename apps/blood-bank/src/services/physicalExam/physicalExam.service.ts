import { upsertPhysicalExamInDb } from "@/repository/physicalExam/physicalExam.repository.js";
import { CreateOrUpdateBloodDonationPhysicalExam } from "@/types/physicalExam/physicalExam.js";
import { upsertPhysicalExamServiceValidation } from "@/validations/service/physicalExam/physicalExam.service.validation.js";
import { logger } from "@repo/platform/logging/logger.js";

export const physicalExamService = {
  async upsertPhysicalExam(input: CreateOrUpdateBloodDonationPhysicalExam) {
    logger.info("entering::upsertPhysicalExam::service");
    await upsertPhysicalExamServiceValidation(input);

    await upsertPhysicalExamInDb(input);

    logger.info("exiting::upsertPhysicalExam::service");
  },
};
