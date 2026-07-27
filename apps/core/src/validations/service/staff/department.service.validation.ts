import {
  getDepartmentByDepartmentNameFromDb,
  getDepartmentByIdFromDb,
} from "@/repository/staff/department.repository.js";
import { CreateDepartmentInput } from "@/types/staff/department.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { YesNoFlag } from "@repo/db/generated/prisma/client";
export const validateIdDepartment = async (departmentId: number) => {
  logger.info("entering::deleteDepartment service::validation");
  validIdCheck(departmentId);
  const department = await getDepartmentByIdFromDb(departmentId);
  if (!department || department.isActive === YesNoFlag.no) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Department"),
    );
  }
  logger.info("exiting::deleteDepartment::service::validation");

  return department;
};

export const validateNameDepartment = async (
  departmentName: string,
  id?: number,
): Promise<void> => {
  logger.info("entering::validateNameDepartment::service::validation");
  if (id) validIdCheck(id);
  const department = await getDepartmentByDepartmentNameFromDb(departmentName);
  if (id && department && department.id !== id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Department"),
    );
  }
  if (!id && department) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Department Name"),
    );
  }
  logger.info("exiting::validateNameDepartment::service::validation");
  return;
};

export const validateCreateDepartment = async (
  input: CreateDepartmentInput,
) => {
  logger.info("entering::validateCreateDepartment::service::validation");
  await validateNameDepartment(input.name);
  logger.info("exiting::validateCreateDepartment::service::validation");
  return;
};

export const validateUpdateDepartment = async (
  id: number,
  input: CreateDepartmentInput,
) => {
  logger.info("entering::validateUpdateDepartment::service::validation");
  await validateIdDepartment(id);
  await validateNameDepartment(input.name, id);
  logger.info("exiting::validateUpdateDepartment::service::validation");
  return;
};
