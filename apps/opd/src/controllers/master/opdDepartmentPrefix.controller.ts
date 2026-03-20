import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { opdDepartmentPrefixService } from "@/services/master/opdDepartmentPrefix.service.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createOpdDepartmentPrefix = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createOpdDepartmentPrefix::controller");
    const input = req.body;
    const created =
      await opdDepartmentPrefixService.createOpdDepartmentPrefix(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: created },
      "Opd Department Prefix",
    );
    logger.info("exiting::createOpdDepartmentPrefix::controller");
    return res.status(201).json(response);
  },
);

export const updateOpdDepartmentPreFix = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateOpdDepartmentPreFix::controller");
    const input = req.body;
    const updated =
      await opdDepartmentPrefixService.updateOpdDepartmentPrefix(input);
    const response = BaseResponse.success(
      { type: "UPDATED", data: updated },
      "Opd Department Prefix",
    );
    logger.info("exiting::updateOpdDepartmentPreFix::controller");
    return res.status(200).json(response);
  },
);
