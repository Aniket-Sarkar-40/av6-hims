import { getDepartmentByIdFromDb } from "@/repository/staff/department.repository.js";
import {
  getDoctorByDoctorIdFromDb,
  getStaffByIdFromDb,
} from "@/repository/staff/doctor.repository.js";
import { getStaffDesignationByIdFromDb } from "@/repository/staff/designation.repository.js";
import { CreateOrUpdateDoctor } from "@/types/staff/doctor.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { Staff } from "@repo/db/generated/prisma/client";

export const validateIdDoctorBy = async (doctorId: number) => {
  logger.info("entering::validateIdDoctorBy::service::validation");
  validIdCheck(doctorId);
  const doctorById = await getStaffByIdFromDb(doctorId);
  if (!doctorById) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "doctor"));
  }

  logger.info("exiting::validateIdDoctorBy::service::validation");
  return doctorById;
};

export const createDoctorServiceValidation = async (
  body: CreateOrUpdateDoctor
): Promise<Staff | null> => {
  logger.info("entering::createDoctorServiceValidation::service::validation");

  if (body.employeeId) {
    await validateDuplicateDoctorId(body.employeeId);
  }
  await validateDoctorForeignKeys(body);

  logger.info("exiting::createDoctorServiceValidation::service::validation");
  return null;
};

const validateDuplicateDoctorId = async (employeeId: string, id?: number) => {
  logger.info("entering::validateDuplicateDoctorId::service::validation");
  const doctorByDoctorId = await getDoctorByDoctorIdFromDb(employeeId);
  if (id && doctorByDoctorId && doctorByDoctorId.id !== id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Doctor ID")
    );
  }
  if (!id && doctorByDoctorId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Doctor ID")
    );
  }
  logger.info("exiting::validateDuplicateDoctorId::service::validation");
};

export const updateDoctorServiceValidation = async (
  body: CreateOrUpdateDoctor
): Promise<Staff | null> => {
  logger.info("entering::updateDoctorServiceValidation::service::validation");
  if (!body.id) {
    throw new ErrorHandler(400, generateErrorMessage("FIELD_REQUIRED", "ID"));
  }
  await validateIdDoctorBy(body.id);

  if (body.employeeId) {
    await validateDuplicateDoctorId(body.employeeId, body.id);
  }

  await validateDoctorForeignKeys(body);

  logger.info("exiting::updateDoctorServiceValidation::service::validation");
  return null;
};

// Validate foreign keys such as locationId, siteId, and departmentId
export const validateDoctorForeignKeys = async (
  input: CreateOrUpdateDoctor
): Promise<void> => {
  logger.info("entering::validateDoctorForeignKeys::service::validation");
  // Handle departmentId validation if it's provided
  if (input.departmentId !== null && input.departmentId !== undefined) {
    const department = await getDepartmentByIdFromDb(input.departmentId);
    if (!department) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "department")
      );
    }
  }

  if (input.designationId) {
    const designation = await getStaffDesignationByIdFromDb(
      input.designationId
    );
    if (!designation) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "designation")
      );
    }
  }
  logger.info("exiting::validateDoctorForeignKeys::service::validation");
};
