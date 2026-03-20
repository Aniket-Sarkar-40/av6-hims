import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { icdTenService } from "@/services/master/icdTen.service.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const getICDTenById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getICDTenById::controller");
  const { id } = req.query as { id: string };
  const row = await icdTenService.getICDTenById(Number(id));
  const response = BaseResponse.success(
    { type: "FETCHED", data: row },
    "ICD Ten",
  );
  logger.info("exiting::getICDTenById::controller");
  return res.status(200).json(response);
});
