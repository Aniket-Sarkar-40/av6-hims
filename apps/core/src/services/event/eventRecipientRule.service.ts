import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

import {
  createOrUpdateEventRecipientRuleServiceValidation,
  multiCreateUpdateEventRecipientRuleServiceValidation,
} from "@/validations/service/event/eventRecipientRule.service.validation.js";

import {
  CreateOrUpdateEventRecipients,
  MultiCreateUpdateEventRecipients,
} from "@/types/event/eventRecipientRule.js";
import {
  createEventRecipientRuleInDb,
  getEventRecipientRuleByIdFromDb,
  getEventRecipientRulesByEventConfigs,
  multiCreateUpdateEventRecipientRule,
  updateEventRecipientRuleInDb,
} from "@/repository/event/eventRecipientRule.repository.js";
import { EventRecipientRule } from "@repo/db/generated/prisma/client";

export const recipientRuleService = {
  async createRecipientRule(
    input: CreateOrUpdateEventRecipients,
  ): Promise<EventRecipientRule> {
    logger.info("entering::createRecipientRule::service");

    await createOrUpdateEventRecipientRuleServiceValidation(input);

    const data = await createEventRecipientRuleInDb(input);

    logger.info("exiting::createRecipientRule::service");
    return data;
  },

  async multiCreateUpdateRecipientRule(
    input: MultiCreateUpdateEventRecipients,
  ) {
    logger.info("entering::multiCreateUpdateRecipientRule::service");

    await multiCreateUpdateEventRecipientRuleServiceValidation(input);

    await multiCreateUpdateEventRecipientRule(input);

    logger.info("exiting::multiCreateUpdateRecipientRule::service");
  },

  async getAllRecipientRules(): Promise<EventRecipientRule[]> {
    logger.info("entering::getAllRecipientRules::service");

    const rows = await getEventRecipientRulesByEventConfigs();

    if (!rows) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Recipient Rule"),
      );
    }

    logger.info("exiting::getAllRecipientRules::service");
    return rows;
  },

  async getRecipientRuleById(id: number): Promise<EventRecipientRule | null> {
    logger.info("entering::getRecipientRuleById::service");

    validIdCheck(id);

    const row = await getEventRecipientRuleByIdFromDb(id);

    if (!row) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Recipient Rule"),
      );
    }

    logger.info("exiting::getRecipientRuleById::service");
    return row;
  },

  async updateRecipientRule(
    input: CreateOrUpdateEventRecipients,
  ): Promise<EventRecipientRule> {
    logger.info("entering::updateRecipientRule::service");

    await createOrUpdateEventRecipientRuleServiceValidation(input);

    const data = await updateEventRecipientRuleInDb(input);

    logger.info("exiting::updateRecipientRule::service");
    return data;
  },
};
