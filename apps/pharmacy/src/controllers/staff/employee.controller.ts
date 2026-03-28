import { TryCatch } from "@repo/platform";
import { employeeService } from "@/services/staff/employee.service.js";
import { CreateOrUpdateEmployee } from "@/types/staff/employee.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const createEmployee = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createEmployee::controller");
  const body = req.body as CreateOrUpdateEmployee;

  await employeeService.createEmployee(body);

  logger.info("exiting::createEmployee::controller");
  return res.status(201).json(
    new BaseResponse({
      success: true,
      message: generateSuccessMessage("CREATED", "Employee"),
    }),
  );
});

export const getAllEmployees = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllEmployees::controller");
  const employees = await employeeService.getAllEmployees();
  logger.info("exiting::getAllEmployees::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Employee"),
      },
      employees,
    ),
  );
});

export const getEmployeeById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getEmployeeById::controller");
  const { employeeId } = req.params;
  const employee = await employeeService.getEmployeeById(Number(employeeId));

  logger.info("exiting::getEmployeeById::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Employee"),
      },
      employee,
    ),
  );
});

export const updateEmployee = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateEmployee::controller");
  const { employeeId } = req.params;
  const body = req.body as CreateOrUpdateEmployee;

  await employeeService.updateEmployee(Number(employeeId), body);
  logger.info("exiting::updateEmployee::controller");
  return res.status(200).json(
    new BaseResponse({
      success: true,
      message: generateSuccessMessage("UPDATED", "Employee"),
    }),
  );
});

export const deleteEmployee = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::deleteEmployee::controller");
  const { employeeId } = req.params;
  await employeeService.deleteEmployee(Number(employeeId));
  logger.info("exiting::deleteEmployee::controller");
  return res.status(200).json(
    new BaseResponse({
      success: true,
      message: generateSuccessMessage("DELETED", "Employee"),
    }),
  );
});
