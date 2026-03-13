import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { serviceEventService } from "@/services/event/serviceEvent.service.js";
import { CreateServiceEvent } from "@/types/event/serviceEvent.js";

import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createServiceEvent = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createServiceEvent::controller");
    const data = req.body as CreateServiceEvent;
    const serviceEvent = await serviceEventService.createServiceEvent(data);
    const response = BaseResponse.success(
      { type: "CREATED", data: serviceEvent },
      "ServiceEvent"
    );
    logger.info("exiting::createServiceEvent::controller");
    return res.status(201).json(response);
  }
);

export const updateServiceEvent = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateServiceEvent::controller");
    const data = req.body;
    const updatedServiceEvent = await serviceEventService.updateServiceEvent(
      data
    );
    logger.info("exiting::updateServiceEvent::controller");
    const response = BaseResponse.success(
      { type: "UPDATED", data: updatedServiceEvent },
      "ServiceEvent"
    );
    return res.status(200).json(response);
  }
);
