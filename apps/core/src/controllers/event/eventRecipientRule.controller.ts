import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { recipientRuleService } from "@/services/event/eventRecipientRule.service.js";
import {
  CreateOrUpdateEventRecipients,
  MultiCreateUpdateEventRecipients,
} from "@/types/event/eventRecipientRule.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createEventRecipientRule = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createEventRecipientRule::controller");
    const input = req.body as CreateOrUpdateEventRecipients;
    const rule = await recipientRuleService.createRecipientRule(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: rule },
      "EventRecipientRule"
    );
    logger.info("exiting::createEventRecipientRule::controller");
    return res.status(201).json(response);
  }
);

export const updateEventRecipientRule = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateEventRecipientRule::controller");
    const input = req.body as CreateOrUpdateEventRecipients;
    const updatedRule = await recipientRuleService.updateRecipientRule(input);
    logger.info("exiting::updateEventRecipientRule::controller");
    const response = BaseResponse.success(
      { type: "UPDATED", data: updatedRule },
      "EventRecipientRule"
    );
    return res.status(200).json(response);
  }
);

export const multiCreateUpdateEventRecipientRule = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::multiCreateUpdateEventRecipientRule::controller");
    const input = req.body as MultiCreateUpdateEventRecipients;
    await recipientRuleService.multiCreateUpdateRecipientRule(input);
    logger.info("exiting::multiCreateUpdateEventRecipientRule::controller");
    const response = BaseResponse.success(
      { type: "UPDATED" },
      "EventRecipientRule"
    );
    return res.status(200).json(response);
  }
);
