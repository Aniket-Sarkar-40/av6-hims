import { groupService } from "@/services/master/group.service.js";
import { logger } from "@repo/platform/logging/logger.js";
import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { Request, Response } from "express";

export const deleteGroup = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::deleteGroup::controller");
  const { id } = req.query;
  await groupService.deleteGroup(Number(id));
  const response = BaseResponse.success({ type: "DELETED" }, "Group");
  logger.info("exiting::deleteGroup::controller");
  return res.status(200).json(response);
});
