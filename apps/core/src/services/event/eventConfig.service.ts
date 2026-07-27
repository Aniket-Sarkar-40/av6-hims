import {
  getAllEventConfigFromDb,
  getEventConfigByIdFromDb,
  markReadNotifications,
  upsertEventConfigWithKeysInDb,
} from "@/repository/event/eventConfig.repository.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { EventConfig } from "@repo/db/generated/prisma/client";
import { UpsertEventConfigWithKeysInput } from "@/types/event/eventConfig.js";
import {
  markReadNotificationServiceValidation,
  validateAndPrepareEventConfigUpsert,
} from "@/validations/service/event/eventConfig.service.validation.js";

export const eventConfigService = {
  async upsertEventConfigWithKeys(input: UpsertEventConfigWithKeysInput) {
    logger.info("entering::upsertEventConfigWithKeys::service");

    await validateAndPrepareEventConfigUpsert(input);
    const row = await upsertEventConfigWithKeysInDb(input);

    logger.info("exiting::upsertEventConfigWithKeys::service");
    return row;
  },

  async getAllEventConfigs(
    canNullReturnable: boolean = false,
  ): Promise<EventConfig[]> {
    logger.info("entering::getAllEventConfigs::service");

    const rows = await getAllEventConfigFromDb();

    logger.info("exiting::getAllEventConfigs::service");
    if (!rows) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Event Config"),
        );
      }
    }

    return rows;
  },

  async getEventConfigById(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<EventConfig | null> {
    logger.info("entering::getEventConfigById::service");
    validIdCheck(id);

    const row = await getEventConfigByIdFromDb(id);

    if (!row) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Event Config"),
        );
      }
    }

    logger.info("exiting::getEventConfigById::service");
    return row;
  },

  async markReadMultipleNotification(ids: number[]) {
    logger.info("entering::markReadMultipleNotification::service");

    await markReadNotificationServiceValidation(ids);
    await markReadNotifications(ids);

    logger.info("exiting::markReadMultipleNotification::service");
  },
};
