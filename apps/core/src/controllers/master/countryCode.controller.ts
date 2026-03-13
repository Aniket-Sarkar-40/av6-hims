import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { countryCodeService } from "@/services/master/countryCode.service.js";
import {
  CreateCountryCode,
  UpdateCountryCode,
} from "@/types/master/countryCode.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createCountryCode = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createCountryCode::controller");
    const input = req.body as CreateCountryCode;
    const result = await countryCodeService.createCountryCode(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: result },
      "Country Code"
    );
    logger.info("exiting::createCountryCode::controller");
    return res.status(201).json(response);
  }
);

export const updateCountryCode = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateCountryCode::controller");
    const input = req.body as UpdateCountryCode;
    const result = await countryCodeService.updateCountryCode(input);
    const response = BaseResponse.success(
      { type: "UPDATED", data: result },
      "Country Code"
    );
    logger.info("exiting::updateCountryCode::controller");
    return res.status(200).json(response);
  }
);

export const getAllCountryCode = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAllCountryCode::controller");
    const result = await countryCodeService.getAllCountryCode();
    const response = BaseResponse.success(
      { type: "FETCHED", data: result },
      "Country Code"
    );
    logger.info("exiting::getAllCountryCode::controller");
    return res.status(200).json(response);
  }
);

export const getCountryCodeById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getCountryCodeById::controller");
    const { countryCodeId } = req.query as { countryCodeId: string };
    const result = await countryCodeService.getCountryCodeById(
      Number(countryCodeId)
    );
    const response = BaseResponse.success(
      { type: "FETCHED", data: result },
      "Country Code"
    );
    logger.info("exiting::getCountryCodeById::controller");
    return res.status(200).json(response);
  }
);

export const deleteCountryCodeById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::deleteCountryCodeById::controller");
    const { countryCodeId } = req.query as { countryCodeId: string };
    const result = await countryCodeService.deleteCountryCodeById(
      Number(countryCodeId)
    );
    const response = BaseResponse.success(
      { type: "DELETED", data: result },
      "Country Code"
    );
    logger.info("exiting::deleteCountryCodeById::controller");
    return res.status(200).json(response);
  }
);
