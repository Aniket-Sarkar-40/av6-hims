import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { departmentService } from "@/services/staff/department.service.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";
import { logger } from "@repo/platform/logging/logger.js";

export const createDepartment = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createDepartment::controller");
    const data = req.body;
    const department = await departmentService.createDepartment(data);

    const response = BaseResponse.success(
      { type: "CREATED", data: department },
      "Department"
    );

    logger.info("exiting::createDepartment::controller");
    return res.status(201).json(response);
  }
);

export const getAllDepartments = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAllDepartments::controller");
    const departments = await departmentService.getAllDepartments();

    const response = BaseResponse.success(
      { type: "FETCHED", data: departments },
      "Department"
    );

    logger.info("exiting::getAllDepartments::controller");
    return res.status(200).json(response);
  }
);

export const getDepartmentById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getDepartmentById::controller");
    const { departmentId } = req.params;
    const department = await departmentService.getDepartmentById(
      Number(departmentId)
    );

    if (!department) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Department")
      );
    }

    const response = BaseResponse.success(
      { type: "FETCHED", data: department },
      "Department"
    );

    logger.info("exiting::getDepartmentById::controller");
    return res.status(200).json(response);
  }
);

export const updateDepartment = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateDepartment::controller");
    const { departmentId } = req.params;
    const name = req.body;
    const updatedDepartment = await departmentService.updateDepartment(
      Number(departmentId),
      name
    );

    const response = BaseResponse.success(
      { type: "UPDATED", data: updatedDepartment },
      "Department"
    );

    logger.info("exiting::updateDepartment::controller");
    return res.status(200).json(response);
  }
);

export const deleteDepartment = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::deleteDepartment::controller");
    const { departmentId } = req.params;
    await departmentService.deleteDepartment(Number(departmentId));

    const response = BaseResponse.success({ type: "DELETED" }, "Department");

    logger.info("exiting::deleteDepartment::controller");
    return res.status(200).json(response);
  }
);
