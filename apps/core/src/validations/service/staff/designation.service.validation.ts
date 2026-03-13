import {
  getStaffDesignationByIdFromDb,
  getStaffDesignationByStaffDesignationNameFromDb,
} from "@/repository/staff/designation.repository.js";
import { CreateStaffDesignationInput } from "@/types/staff/designation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

export const validateIdStaffDesignation = async (id: number) => {
  logger.info("entering::validateIdStaffDesignation service::validation");
  validIdCheck(id);
  const staffDesignation = await getStaffDesignationByIdFromDb(id);
  if (!staffDesignation || staffDesignation.isActive === "no") {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Staff Designation")
    );
  }
  logger.info("exiting::validateIdStaffDesignation::service::validation");

  return staffDesignation;
};
export const createStaffDesignationServiceValidation = async (
  body: CreateStaffDesignationInput
): Promise<void> => {
  logger.info(
    "entering::createStaffDesignationServiceValidation service::validation"
  );
  const staffDesignation =
    await getStaffDesignationByStaffDesignationNameFromDb(body.designation);
  if (staffDesignation) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("DUPLICATE_ITEM", "Staff Designation Name")
    );
  }
  logger.info(
    "exiting::createStaffDesignationServiceValidation service::validation"
  );
  return;
};

export const updateStaffDesignationServiceValidation = async (
  body: CreateStaffDesignationInput,
  staffDesignationId: number
): Promise<void> => {
  logger.info(
    "entering::updateStaffDesignationServiceValidation service::validation"
  );
  await validateIdStaffDesignation(staffDesignationId);
  const staffDesignation =
    await getStaffDesignationByStaffDesignationNameFromDb(body.designation);
  if (staffDesignation && staffDesignation.id !== staffDesignationId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Staff Designation Name")
    );
  }
  logger.info(
    "exiting::updateStaffDesignationServiceValidation service::validation"
  );
  return;
};
