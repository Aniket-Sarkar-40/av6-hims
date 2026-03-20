import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { generalBillingService } from "@/services/appointment/generalBilling.service.js";
import {
  GeneralBillingCreateInput,
  GeneralBillingReturnInput,
  GeneralBillingUpdateInput,
} from "@/types/appointment/generalBilling.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createGeneralBilling = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createGeneralBilling::controller");
    const input = req.body as GeneralBillingCreateInput;
    const generalBilling =
      await generalBillingService.createGeneralBilling(input);
    const response = BaseResponse.success(
      { data: generalBilling, type: "CREATED" },
      "General Billing",
    );
    logger.info("exiting::createGeneralBilling::controller");
    return res.status(201).json(response);
  },
);
export const updateGeneralBilling = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateGeneralBilling::controller");
    const input = req.body as GeneralBillingUpdateInput;
    const generalBilling =
      await generalBillingService.updateGeneralBilling(input);
    const response = BaseResponse.success(
      { data: generalBilling, type: "UPDATED" },
      "General Billing",
    );
    logger.info("exiting::updateGeneralBilling::controller");
    return res.status(200).json(response);
  },
);
export const returnGeneralBilling = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::returnGeneralBilling::controller");
    const input = req.body as GeneralBillingReturnInput;
    const generalBilling =
      await generalBillingService.returnGeneralBilling(input);
    const response = BaseResponse.success(
      { data: generalBilling, type: "CANCELLED" },
      "General Billing",
    );
    logger.info("exiting::returnGeneralBilling::controller");
    return res.status(200).json(response);
  },
);

export const deleteGeneralBilling = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::deleteGeneralBilling::controller");
    const { id } = req.query as { id: string };

    await generalBillingService.deleteGeneralBilling(Number(id));

    logger.info("exiting::deleteGeneralBilling::controller");
    return res
      .status(200)
      .json(BaseResponse.success({ type: "DELETED" }, "General Billing"));
  },
);
