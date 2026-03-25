import { TryCatch } from "@repo/platform";
import { printerSettingService } from "@/services/master/printerSettings.service.js";
import { UpdatePrinterSettings } from "@/types/master/settings.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { Printer_Type } from "@repo/db/generated/prisma/enums.js";
import { Request, Response } from "express";

export const createPrinterSettings = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createPrinterSettings::controller");
    const input = req.body;
    const settings = await printerSettingService.createSettings(input);
    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("CREATED", "Printer Settings"),
      },
      settings,
    );
    logger.info("exiting::createPrinterSettings::controller");
    return res.status(201).json(response);
  },
);

export const updatePrinterSettings = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updatePrinterSettings::controller");
    const input = req.body as UpdatePrinterSettings;
    const settings = await printerSettingService.updateSettings(input);
    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "Printer Settings"),
      },
      settings,
    );
    logger.info("exiting::updatePrinterSettings::controller");
    return res.status(201).json(response);
  },
);

export const getPrinterSettings = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getPrinterSettings::controller");

    const settings = await printerSettingService.getSettings();

    logger.info("exiting::getPrinterSettings::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Printer Settings"),
        },
        settings,
      ),
    );
  },
);

export const getPrinterSettingsByCCAndType = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getPrinterSettingsByCCAndType::controller");

    const ccId = parseInt(req.query.ccId as string, 10);
    const printerType = req.query.printerType as Printer_Type;

    validIdCheck(ccId);

    const settings = await printerSettingService.getSettingsByPrinterTypeAndCC(
      ccId,
      printerType,
    );

    logger.info("exiting::getPrinterSettingsByCCAndType::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Printer Settings"),
        },
        settings,
      ),
    );
  },
);
