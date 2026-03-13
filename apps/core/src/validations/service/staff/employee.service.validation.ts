import { getDepartmentByIdFromDb } from "@/repository/staff/department.repository.js";
import {
  getEmployeeByEmployeeIdFromDb,
  getStaffByIdFromDb,
} from "@/repository/staff/employee.repository.js";
import { CreateOrUpdateEmployee } from "@/types/staff/employee.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Staff } from "@repo/db/generated/prisma/client";
import { getStaffDesignationByIdFromDb } from "@/repository/staff/designation.repository.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

export const validateIdEmployee = async (employeeId: number) => {
  logger.info("entering::validateIdEmployee::service::validation");
  validIdCheck(employeeId);
  const employeeById = await getStaffByIdFromDb(employeeId);
  if (!employeeById) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Employee"));
  }

  logger.info("exiting::validateIdEmployee::service::validation");
  return employeeById;
};

export const createEmployeeServiceValidation = async (
  body: CreateOrUpdateEmployee
): Promise<Staff | null> => {
  logger.info("entering::createEmployeeServiceValidation::service::validation");

  if (body.employeeId) {
    await validateDuplicateEmployeeId(body.employeeId);
  }
  await validateEmployeeForeignKeys(body);

  logger.info("exiting::createEmployeeServiceValidation::service::validation");
  return null;
};

const validateDuplicateEmployeeId = async (employeeId: string, id?: number) => {
  logger.info("entering::validateDuplicateEmployeeId::service::validation");
  const employeeByEmployeeId = await getEmployeeByEmployeeIdFromDb(employeeId);
  if (id && employeeByEmployeeId && employeeByEmployeeId.id !== id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Employee ID")
    );
  }
  if (!id && employeeByEmployeeId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Employee ID")
    );
  }
  logger.info("exiting::validateDuplicateEmployeeId::service::validation");
};

export const updateEmployeeServiceValidation = async (
  body: CreateOrUpdateEmployee,
  employeeId: number
): Promise<Staff | null> => {
  logger.info("entering::updateEmployeeServiceValidation::service::validation");

  await validateIdEmployee(employeeId);

  if (body.employeeId) {
    await validateDuplicateEmployeeId(body.employeeId, employeeId);
  }

  await validateEmployeeForeignKeys(body);

  logger.info("exiting::updateEmployeeServiceValidation::service::validation");
  return null;
};

// Validate foreign keys such as locationId, siteId, and departmentId
export const validateEmployeeForeignKeys = async (
  input: CreateOrUpdateEmployee
): Promise<void> => {
  logger.info("entering::validateEmployeeForeignKeys::service::validation");
  // Handle departmentId validation if it's provided
  if (input.departmentId !== null && input.departmentId !== undefined) {
    const department = await getDepartmentByIdFromDb(input.departmentId);
    if (!department) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Department")
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
        generateErrorMessage("NOT_FOUND", "Designation")
      );
    }
  }
  logger.info("exiting::validateEmployeeForeignKeys::service::validation");
};
