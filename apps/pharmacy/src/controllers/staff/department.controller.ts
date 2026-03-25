import { TryCatch } from "@repo/platform";
import { Request, Response } from "express";
import { logger } from "@repo/platform/logging/logger.js";
import {
  generateErrorMessage,
  generateSuccessMessage,
} from "@repo/shared/utils/responseMessage.utils.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { departmentService } from "@/services/staff/department.service.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";

export const createDepartment = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createDepartment::controller");
    const data = req.body;
    const department = await departmentService.createDepartment(data);
    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("CREATED", "Department"),
      },
      department,
    );
    logger.info("exiting::createDepartment::controller");
    return res.status(201).json(response);
  },
);

export const getAllDepartments = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAllDepartments::controller");
    const departments = await departmentService.getAllDepartments();
    logger.info("exiting::getAllDepartments::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Department"),
        },
        departments,
      ),
    );
  },
);

export const getDepartmentById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getDepartmentById::controller");
    const { departmentId } = req.params;
    const department = await departmentService.getDepartmentById(
      Number(departmentId),
    );

    if (!department) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Department"),
      );
    }
    logger.info("exiting::getDepartmentById::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Department"),
        },
        department,
      ),
    );
  },
);

export const updateDepartment = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateDepartment::controller");
    const { departmentId } = req.params;
    const name = req.body;
    const updatedDepartment = await departmentService.updateDepartment(
      Number(departmentId),
      name,
    );
    logger.info("exiting::updateDepartment::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("UPDATED", "Department"),
        },
        updatedDepartment,
      ),
    );
  },
);

export const deleteDepartment = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::deleteDepartment::controller");
    const { departmentId } = req.params;
    await departmentService.deleteDepartment(Number(departmentId));
    logger.info("exiting::deleteDepartment::controller");
    return res.status(200).json(
      new BaseResponse({
        success: true,
        message: generateSuccessMessage("DELETED", "Department"),
      }),
    );
  },
);
