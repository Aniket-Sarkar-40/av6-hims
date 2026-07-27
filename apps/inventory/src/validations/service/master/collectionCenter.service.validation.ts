import {
  getCollectionCenterByIdFromDb,
  getStaffCollectionCenterFromDb,
} from "@/repository/master/collectionCenter.repository.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { StaffCollectionCenter } from "@repo/db/generated/prisma/client";

export const validateIdCollectionCenter = async (
  collectionCenterId: number,
) => {
  logger.info("entering::validateIdCollectionCenter::service::validation");

  validIdCheck(collectionCenterId);

  const collectionCenter =
    await getCollectionCenterByIdFromDb(collectionCenterId);
  if (!collectionCenter) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Collection Center"),
    );
  }
  logger.info("exiting::validateIdCollectionCenter::service::validation");

  return collectionCenter;
};

export const validateStaffCollectionCenter = async (
  staffId: number,
  ccId: number,
): Promise<StaffCollectionCenter> => {
  logger.info("entering::validateStaffCollectionCenter::service::validation");
  const staffCollectionCenter = await getStaffCollectionCenterFromDb(
    staffId,
    ccId,
  );
  if (!staffCollectionCenter) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Staff Collection Center Mapping"),
    );
  }
  logger.info("exiting::validateStaffCollectionCenter::service::validation");
  return staffCollectionCenter;
};
