import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { employeeService } from "@/services/staff/employee.service.js";
import { CreateOrUpdateEmployee } from "@/types/staff/employee.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createEmployee = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createEmployee::controller");
  const body = req.body as CreateOrUpdateEmployee;
  await employeeService.createEmployee(body);

  const response = BaseResponse.success({ type: "CREATED" }, "Employee");

  logger.info("exiting::createEmployee::controller");
  return res.status(201).json(response);
});

export const getAllEmployees = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllEmployees::controller");
  const employees = await employeeService.getAllEmployees();

  const response = BaseResponse.success(
    { type: "FETCHED", data: employees },
    "Employee"
  );

  logger.info("exiting::getAllEmployees::controller");
  return res.status(200).json(response);
});

export const getEmployeeById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getEmployeeById::controller");
  const { employeeId } = req.params;
  const employee = await employeeService.getEmployeeById(Number(employeeId));

  const response = BaseResponse.success(
    { type: "FETCHED", data: employee },
    "Employee"
  );

  logger.info("exiting::getEmployeeById::controller");
  return res.status(200).json(response);
});

export const updateEmployee = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateEmployee::controller");
  const { employeeId } = req.params;
  const body = req.body as CreateOrUpdateEmployee;
  await employeeService.updateEmployee(Number(employeeId), body);

  const response = BaseResponse.success({ type: "UPDATED" }, "Employee");

  logger.info("exiting::updateEmployee::controller");
  return res.status(200).json(response);
});

export const deleteEmployee = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::deleteEmployee::controller");
  const { employeeId } = req.params;
  await employeeService.deleteEmployee(Number(employeeId));

  const response = BaseResponse.success({ type: "DELETED" }, "Employee");

  logger.info("exiting::deleteEmployee::controller");
  return res.status(200).json(response);
});

export const getEmployeeByIdWithCache = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getEmployeeById::controller");
    const { employeeId } = req.params;
    const employee = await employeeService.getEmployeeByIdFrmCacheOrDb(
      Number(employeeId)
    );

    const response = BaseResponse.success(
      { type: "FETCHED", data: employee },
      "Employee"
    );

    logger.info("exiting::getEmployeeById::controller");
    return res.status(200).json(response);
  }
);
