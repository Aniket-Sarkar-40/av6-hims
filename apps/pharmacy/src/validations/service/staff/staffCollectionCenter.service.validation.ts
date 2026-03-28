import { getStaffCollectionCenterByIdFromDb } from "@/repository/staff/staffCollectionCenter.repository.js";
import { CreateOrUpdateStaffCollectionCenter } from "@/types/staff/staffCollectionCenter.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { Staff } from "@repo/db/generated/prisma/client";
import { validateIdCollectionCenter } from "../master/collectionCenter.service.validation.js";
import { validateIdEmployee } from "./employee.service.validation.js";

export const validateStaffCollectionCenterById = async (
  staffCollectionCenterId: number,
) => {
  logger.info(
    "entering::validateStaffCollectionCenterById::service::validation",
  );
  validIdCheck(staffCollectionCenterId);
  const staffCollectionCenterById = await getStaffCollectionCenterByIdFromDb(
    staffCollectionCenterId,
  );
  if (!staffCollectionCenterById) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "staffCollectionCenter"),
    );
  }

  logger.info(
    "exiting::validateStaffCollectionCenterById::service::validation",
  );
  return staffCollectionCenterById;
};

export const createStaffCollectionCenterServiceValidation = async (
  body: CreateOrUpdateStaffCollectionCenter,
): Promise<Staff | null> => {
  logger.info(
    "entering::createStaffCollectionCenterServiceValidation::service::validation",
  );

  await validateIdEmployee(body.staffId);
  await validateIdCollectionCenter(body.collectionCenterId);

  logger.info(
    "exiting::createStaffCollectionCenterServiceValidation::service::validation",
  );
  return null;
};

export const updateStaffCollectionCenterServiceValidation = async (
  body: CreateOrUpdateStaffCollectionCenter,
  staffCollectionCenterId: number,
): Promise<Staff | null> => {
  logger.info(
    "entering::updateStaffCollectionCenterServiceValidation::service::validation",
  );

  await validateStaffCollectionCenterById(staffCollectionCenterId);
  await validateIdEmployee(body.staffId);
  await validateIdCollectionCenter(body.collectionCenterId);

  logger.info(
    "exiting::updateStaffCollectionCenterServiceValidation::service::validation",
  );
  return null;
};
