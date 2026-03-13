import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { eventConfigService } from "@/services/event/eventConfig.service.js";
import { UpsertEventConfigWithKeysInput } from "@/types/event/eventConfig.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createEventConfig = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createEventConfig::controller");
    const data = req.body as UpsertEventConfigWithKeysInput;
    const eventConfig = await eventConfigService.upsertEventConfigWithKeys(
      data
    );
    const response = BaseResponse.success(
      { type: "CREATED", data: eventConfig },
      "Event Config"
    );
    logger.info("exiting::createEventConfig::controller");
    return res.status(201).json(response);
  }
);

export const markReadNotifications = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::markReadNotifications::controller");
    const data = req.body as { ids: number[] };
    await eventConfigService.markReadMultipleNotification(data.ids);
    const response = BaseResponse.success({ type: "UPDATED" }, "Notification");
    logger.info("exiting::markReadNotifications::controller");
    return res.status(200).json(response);
  }
);
