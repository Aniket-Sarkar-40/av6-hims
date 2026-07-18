import { Request, Response } from "express";
import { CreateOrUpdateVoucherUINConfigRequest } from "@/types/master/voucherUinConfig.js";
import { voucherUINConfigService } from "@/services/master/voucherUinConfig.service.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { TryCatch } from "@repo/platform";

export const createVoucherUINConfig = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createVoucherUINConfig::controller");
    const input = req.body as CreateOrUpdateVoucherUINConfigRequest;
    await voucherUINConfigService.createVoucherUINConfig(input);
    const response = BaseResponse.success(
      { type: "CREATED" },
      "Voucher UIN Config",
    );
    logger.info("exiting::createVoucherUINConfig::controller");
    return res.status(201).json(response);
  },
);

export const updateVoucherUINConfig = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateVoucherUINConfig::controller");
    const input = req.body as CreateOrUpdateVoucherUINConfigRequest;
    await voucherUINConfigService.updateVoucherUINConfig(input);
    const response = BaseResponse.success(
      { type: "UPDATED" },
      "Voucher UIN Config",
    );
    logger.info("exiting::updateVoucherUINConfig::controller");
    return res.status(200).json(response);
  },
);

export const deleteVoucherUINConfig = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::deleteVoucherUINConfig::controller");
    const { voucherUINConfigId } = req.query as { voucherUINConfigId: string };
    await voucherUINConfigService.deleteVoucherUINConfig(
      Number(voucherUINConfigId),
    );
    const response = BaseResponse.success(
      { type: "DELETED" },
      "Voucher UIN Config",
    );
    logger.info("exiting::deleteVoucherUINConfig::controller");
    return res.status(200).json(response);
  },
);
