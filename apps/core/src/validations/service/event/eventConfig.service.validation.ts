import {
  getAllEventConfigKeysByEventConfigIdFromDb,
  getEventConfigByEventConfigNameAndTypeFromDb,
  getEventConfigKeyByIdFromDb,
} from "@/repository/event/eventConfig.repository.js";

import type { UpsertEventConfigWithKeysInput } from "@/types/event/eventConfig.js";

import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

import type {
  EventConfig,
  EventConfigKey,
} from "@repo/db/generated/prisma/client";
import { eventConfigService } from "@/services/event/eventConfig.service.js";
import { customOmit } from "av6-utils";
import { getAll } from "@/repository/common.repository.js";

export const validIdEventConfig = async (id: number): Promise<EventConfig> => {
  logger.info("entering::validIdEventConfig::service::validation");

  validIdCheck(id);

  const row = await eventConfigService.getEventConfigById(id, true);
  if (!row)
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Event Config")
    );

  logger.info("exiting::validIdEventConfig::service::validation");
  return row;
};

export const validIdEventConfigKey = async (
  id: number
): Promise<EventConfigKey> => {
  logger.info("entering::validIdEventConfigKey::service::validation");

  validIdCheck(id);

  const row = await getEventConfigKeyByIdFromDb(id);
  if (!row)
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Event Config Key")
    );

  logger.info("exiting::validIdEventConfigKey::service::validation");
  return row;
};

export const validateAndPrepareEventConfigUpsert = async (
  input: UpsertEventConfigWithKeysInput
): Promise<void> => {
  logger.info(
    "entering::validateAndPrepareEventConfigUpsert::service::validation"
  );

  const { eventConfig } = input;

  input.masterData = {
    toCreate: null,
    toUpdate: null,
  };

  if (eventConfig.id) {
    validIdEventConfig(eventConfig.id);
  }

  const duplicate = await getEventConfigByEventConfigNameAndTypeFromDb(
    eventConfig.serviceEventId,
    eventConfig.eventName
  );
  if (duplicate && duplicate.id !== eventConfig.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "DUPLICATE_ITEM",
        `Duplicate Event Config with serviceEventId "${eventConfig.serviceEventId}" and eventName "${eventConfig.eventName}"`
      )
    );
  }
  if (eventConfig.id) {
    input.masterData.toUpdate = eventConfig;
  } else {
    const omitted = customOmit(eventConfig, ["id"]);
    input.masterData.toCreate = omitted.rest;
  }

  const existingKeys = eventConfig.id
    ? await getAllEventConfigKeysByEventConfigIdFromDb(eventConfig.id)
    : [];

  input.toCreateKeys = input.keys.filter((k) => !k.id);
  input.toUpdateKeys = input.keys
    .filter((k) => !!k.id)
    .map((x) => ({ ...x, id: x.id as number }));
  input.toDeleteKeyIds = existingKeys
    .filter((exKey) => !input.keys.some((k) => k.id === exKey.id))
    .map((x) => x.id);

  for (const key of input.toUpdateKeys) {
    const exKey = existingKeys.find((k) => k.id === key.id);

    if (!exKey) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", `Given Key: ${key.key}`)
      );
    }
  }

  logger.info(
    "exiting::validateAndPrepareEventConfigUpsert::service::validation"
  );
};

export const markReadNotificationServiceValidation = async (ids: number[]) => {
  logger.info(
    "entering::markReadNotificationServiceValidation::serviceValidation"
  );

  const notifications = await getAll({
    model: "Notification",
    where: {
      id: {
        in: ids,
      },
    },
  });

  for (const id of ids) {
    const notification = notifications.find((n) => n.id === id);

    if (!notification)
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", `Notification`)
      );
  }

  logger.info(
    "exiting::markReadNotificationServiceValidation::serviceValidation"
  );
};
