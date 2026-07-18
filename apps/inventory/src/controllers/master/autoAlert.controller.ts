import { autoAlertService } from "@/services/master/autoAlert.service.js";
import {
  CreateAutoAlertEmailInput,
  UpdateAutoAlertEmailInput,
} from "@/types/master/autoAlert.js";
import { TryCatch } from "@repo/platform";
import { logger } from "@repo/platform/logging/logger.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { Request, Response } from "express";

export const createAutoAlertEmail = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createAutoAlertEmail::controller");
    const input = req.body as CreateAutoAlertEmailInput;
    const createdData = await autoAlertService.createAutoAlertEmail(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: createdData },
      "Auto Alert Email",
    );
    logger.info("exiting::createAutoAlertEmail::controller");
    return res.status(201).json(response);
  },
);

export const updateAutoAlertEmail = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateAutoAlertEmail::controller");
    const input = req.body as UpdateAutoAlertEmailInput;
    const updatedData = await autoAlertService.updateAutoAlertEmail(input);
    logger.info("exiting::updateAutoAlertEmail::controller");
    return res
      .status(200)
      .json(
        BaseResponse.success(
          { type: "UPDATED", data: updatedData },
          "Auto Alert Email",
        ),
      );
  },
);

export const resendAutoAlertEmail = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::resendAutoAlertEmail::controller");
    const { auditId } = req.query as { auditId: string };
    const isSuccess = await autoAlertService.resendAutoAlertEmail(
      Number(auditId),
    );
    if (!isSuccess) {
      return res
        .status(400)
        .json(BaseResponse.error({ message: "Unable to resend email alert" }));
    }
    logger.info("exiting::resendAutoAlertEmail::controller");
    return res
      .status(200)
      .json(BaseResponse.success({ type: "RESEND" }, "Email Alert"));
  },
);
