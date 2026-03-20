import {
  getOpdDepartmentByIdFromDb,
  getOpdDepartmentByNameFromDb,
  getPrimaryOpdDepartmentByIdFromDb,
  getSecondaryOpdDepartmentByIdFromDb,
} from "@/repository/master/opdDepartment.repository.js";
import { CreateOrUpdateOpdDepartment } from "@/types/master/opdDepartment.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";

import { OpdDepartment } from "@repo/db/generated/prisma/client";

export const validIdOpdDepartment = async (
  id: number,
): Promise<OpdDepartment> => {
  logger.info("entering::validIdOpdDepartment::service::validation");

  validIdCheck(id);

  const row = await getOpdDepartmentByIdFromDb(id);
  if (!row) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Opd Department"),
    );
  }
  logger.info("exiting::validIdOpdDepartment::service::validation");

  return row;
};

export const validIdPrimaryOpdDepartment = async (
  id: number,
): Promise<OpdDepartment> => {
  logger.info("entering::validIdPrimaryOpdDepartment::service::validation");

  validIdCheck(id);
  const responase = await getPrimaryOpdDepartmentByIdFromDb(id);
  if (!responase) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Primary Opd Department"),
    );
  }
  logger.info("exiting::validIdPrimaryOpdDepartment::service::validation");

  return responase;
};
export const validIdSecondaryOpdDepartment = async (
  id: number,
): Promise<OpdDepartment> => {
  logger.info("entering::validIdSecondaryOpdDepartment::service::validation");

  validIdCheck(id);
  const responase = await getSecondaryOpdDepartmentByIdFromDb(id);
  if (!responase) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Secondary Opd Department"),
    );
  }
  logger.info("exiting::validIdSecondaryOpdDepartment::service::validation");

  return responase;
};
export const getIdOpdDepartmentServiceValidation = async (
  id: number,
): Promise<void> => {
  logger.info(
    "entering::getIdOpdDepartmentServiceValidation::service::validation",
  );
  await validIdOpdDepartment(id);
  logger.info(
    "exiting::getIdOpdDepartmentServiceValidation::service::validation",
  );
  return;
};

export const updateIdOpdDepartmentServiceValidation = async (
  body: CreateOrUpdateOpdDepartment,
): Promise<OpdDepartment | null> => {
  logger.info(
    "entering::updateIdOpdDepartmentServiceValidation::service::validation",
  );

  if (body.id) validIdCheck(body.id);

  if (body.id) {
    const existing = await getOpdDepartmentByIdFromDb(body.id);
    if (!existing) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Opd Department"),
      );
    }
  }

  if (body.departmentName) {
    const sameName = await getOpdDepartmentByNameFromDb(body.departmentName);
    if (sameName) {
      if (sameName.id !== body.id) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("DUPLICATE_ITEM", "Opd Department name"),
        );
      }
    }
  }
  logger.info(
    "exiting::updateIdOpdDepartmentServiceValidation::service::validation",
  );
  return null;
};

export const nameOpdDepartmentServiceValidation = async (
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

export const createOpdDepartmentServiceValidation = async (
  body: CreateOrUpdateOpdDepartment,
): Promise<OpdDepartment | null> => {
  logger.info(
    "entering::createOpdDepartmentServiceValidation::service::validation",
  );

  const byName = body.departmentName
    ? await getOpdDepartmentByNameFromDb(body.departmentName)
    : null;
  if (byName) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Opd Department name"),
    );
  }

  logger.info(
    "exiting::createOpdDepartmentServiceValidation::service::validation",
  );
  return byName;
};
