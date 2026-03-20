import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { timeSlotService } from "@/services/timeSlot/timeSlot.service.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const getAllTimeSlots = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllTimeSlots::controller");
  const input = req.body;
  const rows = await timeSlotService.getAllTimeSlots(input);
  const response = BaseResponse.success(
    { type: "FETCHED", data: rows },
    "Time Slots",
  );
  logger.info("exiting::getAllTimeSlots::controller");
  return res.status(200).json(response);
});
export const getAllWeekIds = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllWeekIds::controller");
  const input = req.body;
  const rows = await timeSlotService.getAllWeekIds(input);
  const response = BaseResponse.success(
    { type: "FETCHED", data: rows },
    "Week Ids",
  );
  logger.info("exiting::getAllWeekIds::controller");
  return res.status(200).json(response);
});
