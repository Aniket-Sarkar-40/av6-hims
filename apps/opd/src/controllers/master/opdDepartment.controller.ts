import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { opdDepartmentService } from "@/services/master/opdDepartment.service.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createOpdDepartment = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createOpdDepartment::controller");
    const input = req.body;
    const created = await opdDepartmentService.createOpdDepartment(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: created },
      "Opd Department",
    );
    logger.info("exiting::createOpdDepartment::controller");
    return res.status(201).json(response);
  },
);

export const updateOpdDepartment = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateOpdDepartment::controller");
    const input = req.body;
    const updated = await opdDepartmentService.updateOpdDepartment(input);
    const response = BaseResponse.success(
      { type: "UPDATED", data: updated },
      "Opd Department",
    );
    logger.info("exiting::updateOpdDepartment::controller");
    return res.status(200).json(response);
  },
);
