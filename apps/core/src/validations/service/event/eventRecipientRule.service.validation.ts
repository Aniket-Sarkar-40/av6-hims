import {
  CreateOrUpdateEventRecipients,
  MultiCreateUpdateEventRecipients,
} from "@/types/event/eventRecipientRule.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { EventRecipientRule } from "@repo/db/generated/prisma/client";
import { validIdEventConfig } from "./eventConfig.service.validation.js";
import {
  getEventRecipientRuleByIdFromDb,
  getEventRecipientRulesByEventConfigIdOnlyFromDb,
} from "@/repository/event/eventRecipientRule.repository.js";

export const validIdEventRecipientRule = async (
  id: number
): Promise<EventRecipientRule> => {
  logger.info("entering::validIdEventRecipientRule::service::validation");

  validIdCheck(id);

  const row = await getEventRecipientRuleByIdFromDb(id);

  if (!row) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Event Recipient Rule")
    );
  }

  logger.info("exiting::validIdEventRecipientRule::service::validation");

  return row;
};

export const createOrUpdateEventRecipientRuleServiceValidation = async (
  body: CreateOrUpdateEventRecipients
) => {
  logger.info(
    "entering::createOrUpdateEventRecipientRuleServiceValidation::service::validation"
  );

  await validIdEventConfig(body.eventConfigId);

  let eventConfigId = body.eventConfigId;

  if (body.id) {
    const existing = await validIdEventRecipientRule(body.id);
    eventConfigId = existing.eventConfigId;
  }

  const rules = await getEventRecipientRulesByEventConfigIdOnlyFromDb(
    eventConfigId
  );

  if (
    rules.some(
      (r) =>
        r.id !== body.id &&
        r.templateType === body.templateType &&
        r.sourceType === body.sourceType &&
        r.isActive
    )
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "RecipientRule")
    );
  }

  // const maxSort = rules.reduce((m, r) => Math.max(m, r.sortOrder), 0);

  // body.sortOrder =
  //   typeof body.sortOrder === "number" &&
  //   !rules.some((r) => r.id !== body.id && r.sortOrder === body.sortOrder && r.isActive)
  //     ? body.sortOrder
  //     : maxSort + 1;

  logger.info(
    "exiting::createOrUpdateEventRecipientRuleServiceValidation::service::validation"
  );
};

export const multiCreateUpdateEventRecipientRuleServiceValidation = async (
  input: MultiCreateUpdateEventRecipients
) => {
  logger.info(
    "entering::multiCreateUpdateEventRecipientRuleServiceValidation::service::validation"
  );

  await validIdEventConfig(input.eventConfigId);

  const existingRules = await getEventRecipientRulesByEventConfigIdOnlyFromDb(
    input.eventConfigId,
    input.templateType
  );
  input.existingRules = existingRules;

  for (const rule of input.rules) {
    if (rule.id) {
      const findRule = existingRules.find((ex) => ex.id === rule.id);
      if (!findRule) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "RecipientRule")
        );
      }
    }
  }
};
