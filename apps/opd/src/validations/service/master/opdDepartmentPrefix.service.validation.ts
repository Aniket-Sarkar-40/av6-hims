import { getOpdDepartmentByNameFromDb } from "@/repository/master/opdDepartment.repository.js";
import {
  getOpdDepartmentPrefixByDepartmentIdFromDb,
  getOpdDepartmentPrefixByIdFromDb,
  getOpdDepartmentPrefixByNameFromDb,
} from "@/repository/master/opdDepartment.repositoryPrefix.js";
import { CreateOrUpdateOpdDepartmentPrefix } from "@/types/master/opdDepartmentPrefix.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";

import { OpdDepartmentPrefix } from "@repo/db/generated/prisma/client";
import { getIdOpdDepartmentServiceValidation } from "./opdDepartment.service.validation.js";

export const validIdOpdDepartmentPrefix = async (
  id: number,
): Promise<OpdDepartmentPrefix> => {
  logger.info("entering::validIdOpdDepartmentPrefix::service::validation");

  validIdCheck(id);

  const row = await getOpdDepartmentPrefixByIdFromDb(id);
  if (!row) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Opd Department"),
    );
  }
  logger.info("exiting::validIdOpdDepartment::service::validation");

  return row;
};
export const validateIdOpdDepartmentPrefixByDepartmentId = async (
  id: number,
): Promise<OpdDepartmentPrefix[]> => {
  logger.info("entering::validIdOpdDepartmentPrefix::service::validation");

  validIdCheck(id);

  const response = await getOpdDepartmentPrefixByDepartmentIdFromDb(id);
  if (!response) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Opd Department Prifix"),
    );
  }
  logger.info("exiting::validIdOpdDepartment::service::validation");

  return response;
};

export const getIdOpdDepartmentPrefixServiceValidation = async (
  id: number,
): Promise<void> => {
  logger.info(
    "entering::getIdOpdDepartmentServiceValidation::service::validation",
  );
  await validIdOpdDepartmentPrefix(id);
  logger.info(
    "exiting::getIdOpdDepartmentServiceValidation::service::validation",
  );
  return;
};

export const updateIdOpdDepartmentPrefixServiceValidation = async (
  body: CreateOrUpdateOpdDepartmentPrefix,
): Promise<OpdDepartmentPrefix | null> => {
  logger.info(
    "entering::updateIdOpdDepartmentServiceValidation::service::validation",
  );

  if (body.id) validIdCheck(body.id);

  await getIdOpdDepartmentServiceValidation(body.opdDepartmentId);

  if (body.id) {
    const existing = await getOpdDepartmentPrefixByIdFromDb(body.id);
    if (!existing) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Opd Department"),
      );
    }
  }

  if (body.prefix) {
    const sameName = await getOpdDepartmentPrefixByNameFromDb(
      body.prefix,
      body.opdDepartmentId,
    );
    if (sameName) {
      if (sameName.id !== body.id) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("DUPLICATE_ITEM", "Opd Department Prefix"),
        );
      }
    }
  }
  logger.info(
    "exiting::updateIdOpdDepartmentServiceValidation::service::validation",
  );
  return null;
};

export const nameOpdDepartmentPrefixServiceValidation = async (
  name: string,
): Promise<void> => {
  logger.info(
    "entering::nameOpdDepartmentServiceValidation::service::validation",
  );
  const row = await getOpdDepartmentByNameFromDb(name);
  if (row) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Opd Department"),
    );
  }
  logger.info(
    "exiting::nameOpdDepartmentServiceValidation::service::validation",
  );
  return;
};

export const createOpdDepartmentPrefixServiceValidation = async (
  body: CreateOrUpdateOpdDepartmentPrefix,
): Promise<OpdDepartmentPrefix | null> => {
  logger.info(
    "entering::createOpdDepartmentServiceValidation::service::validation",
  );
  await getIdOpdDepartmentServiceValidation(body.opdDepartmentId);
  const byName = body.prefix
    ? await getOpdDepartmentPrefixByNameFromDb(
        body.prefix,
        body.opdDepartmentId,
      )
    : null;
  if (byName) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Opd Department Prefix"),
    );
  }

  logger.info(
    "exiting::createOpdDepartmentServiceValidation::service::validation",
  );
  return byName;
};
