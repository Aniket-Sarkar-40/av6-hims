import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

import {
  getChipsButtonMappingByDoctorAndNameFromDb,
  getChipsButtonMappingByIdFromDb,
  getChipsButtonMappingByNameFromDb,
} from "@/repository/master/chipsButtonMapping.repository.js";
import { CreateOrUpdateChipsButtonMapping } from "@/types/master/chipsButtonMapping.js";
import { ChipsButtonMapping } from "@repo/db/generated/prisma/client";
import { validateIdDoctor } from "../doctor/doctor.service.validation.js";
import { validIdCheck } from "@/validations/global.validation.js";

export const createChipsButtonMappingServiceValidation = async (
  body: CreateOrUpdateChipsButtonMapping,
): Promise<ChipsButtonMapping | null> => {
  logger.info(
    "entering::createChipsButtonMappingServiceValidation::service::validation",
  );

  await validateIdDoctor(body.doctorId);

  const byChipsName = body.chipsName
    ? await getChipsButtonMappingByDoctorAndNameFromDb(
        body.doctorId,
        body.chipsName,
      )
    : null;
  if (byChipsName) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Chips Button Mapping"),
    );
  }

  logger.info(
    "exiting::createChipsButtonMappingServiceValidation::service::validation",
  );
  return byChipsName;
};

export const updateIdChipsButtonMappingServiceValidation = async (
  body: CreateOrUpdateChipsButtonMapping,
): Promise<ChipsButtonMapping | null> => {
  logger.info(
    "entering::updateIdChipsButtonMappingServiceValidation::service::validation",
  );

  if (body.id) validIdCheck(body.id);

  if (body.id) {
    const existing = await getChipsButtonMappingByIdFromDb(body.id);
    if (!existing) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Chips Button Mapping"),
      );
    }
  }

  if (body.chipsName) {
    const sameName = await getChipsButtonMappingByNameFromDb(body.chipsName);
    if (sameName) {
      if (sameName.id !== body.id) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("DUPLICATE_ITEM", "Chips Button Mapping"),
        );
      }
    }
  }
  logger.info(
    "exiting::updateIdChipsButtonMappingServiceValidation::service::validation",
  );
  return null;
};
