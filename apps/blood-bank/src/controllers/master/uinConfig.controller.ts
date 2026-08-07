import { uinServiceFactory } from "@/config/core.config.js";
import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { uinConfigService } from "@/services/master/uinConfig.service.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  generateErrorMessage,
  generateSuccessMessage,
} from "@repo/shared/utils/responseMessage.utils.js";
import {
  CreateUINConfigRequest,
  UINPreviewRequest,
  UpdateUINConfigRequest,
} from "av6-core-v2";
import { Request, Response } from "express";
import { BloodBankUinShortCode } from "@repo/db/generated/prisma/enums.js";

export const createUINConfig = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createUINConfig::controller");
  const configReq = req.body as CreateUINConfigRequest;
  const createdConfig = await uinServiceFactory.createUINConfig(configReq);
  logger.info("exiting::createUINConfig::controller");
  return res.status(201).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("CREATED", "UIN Config"),
      },
      createdConfig,
    ),
  );
});

export const updateUINConfig = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateUINConfig::controller");
  const configReq = req.body as UpdateUINConfigRequest;
  const updatedUINConfig = await uinServiceFactory.updateUINConfig(configReq);
  logger.info("exiting::updateUINConfig::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "UIN Config"),
      },
      updatedUINConfig,
    ),
  );
});

export const getUIN = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getUIN::controller");
  const shortCode = req.query.shortCode as BloodBankUinShortCode | undefined;
  if (!shortCode)
    throw new ErrorHandler(
      400,
      generateErrorMessage("FIELD_REQUIRED", "Short code"),
    );
  const uin = await uinServiceFactory.generateUIN(shortCode);
  logger.info("exiting::getUIN::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "UIN"),
      },
      uin,
    ),
  );
});

export const previewUIN = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::previewUIN::controller");
  const shortCode = req.query.shortCode as BloodBankUinShortCode | undefined;
  if (!shortCode)
    throw new ErrorHandler(
      400,
      generateErrorMessage("FIELD_REQUIRED", "Short code"),
    );
  const uin = await uinServiceFactory.previewConfig(shortCode);
  logger.info("exiting::previewUIN::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "UIN"),
      },
      uin,
    ),
  );
});

export const previewCustomUIN = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::previewCustomUIN::controller");
    const previewReq = req.body as UINPreviewRequest;

    const uin = uinServiceFactory.previewCustom(previewReq);
    logger.info("exiting::previewCustomUIN::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "UIN"),
        },
        uin,
      ),
    );
  },
);

export const deleteUINConfig = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::deleteUINConfig::controller");
  const id = req.params.id as string;

  await uinServiceFactory.deleteUINConfig(Number(id));
  logger.info("exiting::deleteUINConfig::controller");
  return res.status(200).json(
    new BaseResponse({
      success: true,
      message: generateSuccessMessage("DELETED", "UIN Config"),
    }),
  );
});

export const getAllUinShortCodes = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAllUinShortCodes::controller");

    const codes = await uinConfigService.getAllEnumCodes();

    logger.info("exiting::getAllUinShortCodes::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "UIN Short Codes"),
        },
        codes,
      ),
    );
  },
);
