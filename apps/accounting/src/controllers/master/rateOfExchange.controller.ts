import { rateOfExchangeService } from "@/services/master/rateOfExchange.service.js";
import {
  CreateRateOfExchangeInput,
  FetchRateOfExchangeInput,
} from "@/types/master/rateOfExchange.js";
import { TryCatch } from "@repo/platform";
import { logger } from "@repo/platform/logging/logger.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { Request, Response } from "express";

export const createRateOfExchange = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createRateOfExchange::controller");
    const input = req.body as CreateRateOfExchangeInput;
    const created = await rateOfExchangeService.createRateOfExchange(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: created },
      "Rate Of Exchange",
    );
    logger.info("exiting::createRateOfExchange::controller");
    return res.status(201).json(response);
  },
);

export const fetchRateOfExchange = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::fetchRateOfExchange::controller");
    const input = req.body as FetchRateOfExchangeInput;
    const rate = await rateOfExchangeService.fetchRateOfExchange(input);
    const response = BaseResponse.success(
      { type: "FETCHED", data: rate },
      "Rate Of Exchange",
    );
    logger.info("exiting::fetchRateOfExchange::controller");
    return res.status(200).json(response);
  },
);
