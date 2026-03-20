import { createFollowUpInDb } from "@/repository/appointment/followUp.repository.js";
import { CreateFollowUpInput } from "@/types/appointment/followUp.js";
import { logger } from "@repo/platform/logging/logger.js";
import { createFollowUpServiceValidation } from "@/validations/service/appointment/followUp.service.validation.js";

export const followUpService = {
  async createFollowUp(input: CreateFollowUpInput) {
    logger.info("entering::createFollowUp::service");
    await createFollowUpServiceValidation(input);
    const createdResponse = await createFollowUpInDb(input);
    logger.info("exiting::createFollowUp::service");
    return createdResponse;
  },
};
