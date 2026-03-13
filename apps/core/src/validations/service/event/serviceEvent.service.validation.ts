import { getServiceEventByServiceEventNameFromDb } from "@/repository/event/serviceEvent.repository.js";
import { getCountryCodeByNameFromDb } from "@/repository/master/countryCode.repository.js";
import { serviceEventService } from "@/services/event/serviceEvent.service.js";
import { CreateServiceEvent } from "@/types/event/serviceEvent.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { ServiceEvent } from "@repo/db/generated/prisma/client";

export const validIdServiceEvent = async (
  id: number
): Promise<ServiceEvent> => {
  logger.info("entering::validIdServiceEvent::service::validation");

  validIdCheck(id);

  const row = await serviceEventService.getServiceEventById(id, true);
  if (!row) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Service Event")
    );
  }
  logger.info("exiting::validIdServiceEvent::service::validation");

  return row;
};

export const updateIdServiceEventServiceValidation = async (
  body: CreateServiceEvent[]
) => {
  logger.info(
    "entering::updateIdServiceEventServiceValidation::service::validation"
  );

  for (const item of body) {
    if (item.id) {
      await validIdServiceEvent(item.id);
    }

    if (item.service) {
      const byName = await getServiceEventByServiceEventNameFromDb(
        item.service
      );
      if (byName && byName.id !== item.id) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "DUPLICATE_ITEM",
            `Duplicate Service Event name "${item.service}"`
          )
        );
      }
    }

    if (item.countryCode) {
      const countryCodeObj = await getCountryCodeByNameFromDb(item.countryCode);
      if (!countryCodeObj) {
        throw new ErrorHandler(
          404,
          generateErrorMessage(
            "NOT_FOUND",
            ` Country code : (${item.countryCode})`
          )
        );
      }
    }
  }

  logger.info(
    "exiting::updateIdServiceEventServiceValidation::service::validation"
  );
};

export const createServiceEventServiceValidation = async (
  body: CreateServiceEvent
) => {
  logger.info(
    "entering::createServiceEventServiceValidation::service::validation"
  );

  if (body.service) {
    const byName = await getServiceEventByServiceEventNameFromDb(body.service);
    if (byName) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "DUPLICATE_ITEM",
          `Duplicate Service Event name "${body.service}"`
        )
      );
    }
  }

  logger.info(
    "exiting::createServiceEventServiceValidation::service::validation"
  );
};
