import {
  createDepartmentInDb,
  deleteDepartmentInDb,
  getAllDepartmentsFromDb,
  getDepartmentByIdFromDb,
  updateDepartmentInDb,
} from "@/repository/staff/department.repository.js";
import { CreateDepartmentInput } from "@/types/staff/department.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  deleteCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/pharmacy.shortCode.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  validateCreateDepartment,
  validateIdDepartment,
  validateUpdateDepartment,
} from "@/validations/service/staff/department.service.validation.js";

import { Department } from "@repo/db/generated/prisma/client";

const cacheKey = getRedisKey("DEPARTMENT", "all");

export const departmentService = {
  async createDepartment(input: CreateDepartmentInput): Promise<Department> {
    logger.info("entering::createDepartment::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.DEPARTMENT);
    await validateCreateDepartment(input);
    const department = await createDepartmentInDb(input);
    if (isCacheable && department) {
      await addToCache(cacheKey, department.id, department);
    }
    logger.info("exiting::createDepartment::service");
    return department;
  },

  async getAllDepartments(): Promise<Department[]> {
    logger.info("entering::getAllDepartments::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.DEPARTMENT);
    if (isCacheable) {
      const cachedDepartments = (await getAllCache(cacheKey)) as
        | Department[]
        | null;
      if (cachedDepartments && cachedDepartments.length > 0) {
        return cachedDepartments;
      } else {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Departments"),
        );
      }
    } else {
      const departments = await getAllDepartmentsFromDb();
      if (departments.length === 0) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Departments"),
        );
      }
      logger.info("exiting::getAllDepartments::service");
      return departments;
    }
  },

  async getDepartmentById(
    departmentId: number,
    canNullReturnable: boolean = false,
  ): Promise<Department | null> {
    logger.info("entering::getDepartmentById::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.DEPARTMENT);
    validIdCheck(departmentId);
    let department: Department | null;
    if (isCacheable) {
      department = (await getCacheById(
        cacheKey,
        departmentId,
      )) as Department | null;
    } else {
      department = await getDepartmentByIdFromDb(departmentId);
    }
    if (!department) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Department"),
        );
      else return null;
    }
    logger.info("exiting::getDepartmentById::service");
    return department;
  },

  async updateDepartment(
    departmentId: number,
    input: CreateDepartmentInput,
  ): Promise<Department> {
    logger.info("entering::updateDepartment::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.DEPARTMENT);
    await validateUpdateDepartment(departmentId, input);
    const updatedDepartment = await updateDepartmentInDb(departmentId, input);
    if (isCacheable) {
      await updateCache(cacheKey, departmentId, updatedDepartment);
    }
    logger.info("exiting::updateDepartment::service");
    return updatedDepartment;
  },

  async deleteDepartment(departmentId: number): Promise<{ message: string }> {
    logger.info("entering::deleteDepartment::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.DEPARTMENT);
    await validateIdDepartment(departmentId);
    await deleteDepartmentInDb(departmentId);
    if (isCacheable) {
      await deleteCache(cacheKey, departmentId);
    }
    logger.info("exiting::deleteDepartment::service");
    return { message: "Department deleted successfully" };
  },
};
