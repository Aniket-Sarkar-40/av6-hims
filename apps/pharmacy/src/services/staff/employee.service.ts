import {
  toEmployeeCache,
  toEmployeeDTO,
  toStaffEntity,
} from "@/mapper/staff/employee.mapper.js";
import {
  createEmployeeInDb,
  deleteEmployeeInDb,
  getAllEmployeesFromDb,
  getEmployeeByIdFromDb,
  updateEmployeeInDb,
} from "@/repository/staff/employee.repository.js";
import {
  CreateOrUpdateEmployee,
  EmployeeCache,
  EmployeeDTO,
} from "@/types/staff/employee.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { checkIsCacheable } from "@/config/cache.config.js";
import {
  addToCache,
  deleteCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { getRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/pharmacy.shortCode.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  createEmployeeServiceValidation,
  updateEmployeeServiceValidation,
  validateIdEmployee,
} from "@/validations/service/staff/employee.service.validation.js";
import { Staff } from "@repo/db/generated/prisma/client";

const cacheKey = getRedisKey("EMPLOYEE", "all");

export const employeeService = {
  async createEmployee(input: CreateOrUpdateEmployee) {
    logger.info("entering::createEmployee::service");

    await createEmployeeServiceValidation(input);

    const staffInput = toStaffEntity(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.STAFF);
    const employee = await createEmployeeInDb(staffInput, input);
    if (isCacheable && employee) {
      const cacheData = toEmployeeCache(employee);

      await addToCache(cacheKey, employee.id, cacheData);
    }

    logger.info("exiting::createEmployee::service");
  },

  async getAllEmployees(): Promise<EmployeeDTO[]> {
    logger.info("entering::getAllEmployees::service");

    const employees = await getAllEmployeesFromDb();

    if (employees.length === 0) {
      throw new ErrorHandler(404, "Employees not found");
    }

    const dtoList = await Promise.all(employees.map((e) => toEmployeeDTO(e)));
    logger.info("exiting::getAllEmployees::service");
    return dtoList;
  },

  async getAllEmployeesWoDto(): Promise<EmployeeCache[]> {
    logger.info("entering::getAllEmployees::service");

    let employee: Staff[];
    const isCacheable = await checkIsCacheable(cacheKey);
    if (isCacheable) {
      employee = (await getAllCache(cacheKey)) as Staff[] | [];
    } else {
      employee = await getAllEmployeesFromDb();
    }

    logger.info("exiting::getDistributorByIdWoDto::service");
    return employee.map(toEmployeeCache);
  },

  async getEmployeeById(
    employeeId: number,
    canNullReturnable: boolean = false,
  ): Promise<EmployeeDTO | null> {
    logger.info("entering::getEmployeeById::service");

    const employee = await getEmployeeByIdFromDb(employeeId);

    if (!employee) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Employee"),
        );
      }
      return null;
    }

    const staffDTO = await toEmployeeDTO(employee);
    logger.info("exiting::getEmployeeById::service");
    return staffDTO;
  },

  async updateEmployee(
    employeeId: number,
    input: CreateOrUpdateEmployee,
  ): Promise<void> {
    logger.info("entering::updateEmployee::service");
    await updateEmployeeServiceValidation(input, employeeId);
    const staffInput = toStaffEntity(input);
    const updatedEmployee = await updateEmployeeInDb(
      employeeId,
      staffInput,
      input,
    );
    const isCacheable = await checkIsCacheable(SHORT_CODE.STAFF);

    if (isCacheable && updatedEmployee) {
      const cacheData = toEmployeeCache(updatedEmployee);
      await updateCache(cacheKey, employeeId, cacheData);
    }

    logger.info("exiting::updateEmployee::service");
  },

  async deleteEmployee(employeeId: number): Promise<void> {
    logger.info("entering::deleteEmployee::service");
    await validateIdEmployee(employeeId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.STAFF);
    await deleteEmployeeInDb(employeeId);
    if (isCacheable) {
      await deleteCache(cacheKey, employeeId);
    }

    logger.info("exiting::deleteEmployee::service");
  },

  async getEmployeeByIdFrmCacheOrDb(
    employeeId: number,
    canNullReturnable = false,
  ): Promise<EmployeeCache | null> {
    logger.info("entering::getEmployeeById::service");

    validIdCheck(employeeId);

    const isCacheable = await checkIsCacheable(cacheKey);

    if (isCacheable) {
      const cached = (await getCacheById(
        cacheKey,
        employeeId,
      )) as EmployeeCache | null;
      if (cached) {
        logger.info("exiting::getEmployeeById::service (cache)");
        return cached;
      }
    }

    const employee = await getEmployeeByIdFromDb(employeeId);
    if (!employee) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Employee"),
        );
      }
      return null;
    }

    const cacheData = toEmployeeCache(employee);

    if (isCacheable) {
      await addToCache(cacheKey, employeeId, cacheData);
    }

    logger.info("exiting::getEmployeeById::service (db)");
    return cacheData;
  },
};
