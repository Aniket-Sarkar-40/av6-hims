import { TryCatch } from "@repo/platform";
import { Request, Response } from "express";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { CurrencyReq } from "@/types/master/currency.js";
import { currencyService } from "@/services/master/currency.service.js";

export const createCurrency = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createCurrency::controller");
  const data = req.body as CurrencyReq;
  const currency = await currencyService.createCurrency(data);
  const response = new BaseResponse(
    { success: true, message: generateSuccessMessage("CREATED", "Currency") },
    currency,
  );
  logger.info("exiting::createCurrency::controller");
  return res.status(201).json(response);
});

export const getAllCurrency = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllCurrency::controller");
  const currency = await currencyService.getAllCurrency();
  logger.info("exiting::getAllCurrency::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Currency"),
      },
      currency,
    ),
  );
});

export const getCurrencyById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getCurrencyById::controller");
  const { currencyId } = req.params;
  const currency = await currencyService.getCurrencyById(Number(currencyId));

  if (!currency) {
    return res.status(404).json(
      new BaseResponse({
        success: false,
      }),
    );
  }
  logger.info("exiting::getCurrencyById::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Currency"),
      },
      currency,
    ),
  );
});

export const updateCurrency = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateCurrency::controller");
  const data = req.body as CurrencyReq;
  const updatedCurrency = await currencyService.updateCurrency(
    Number(data.id),
    data,
  );
  logger.info("exiting::updateCurrency::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "Currency"),
      },
      updatedCurrency,
    ),
  );
});

export const deleteCurrency = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::deleteCurrency::controller");
  const { currencyId } = req.params;
  await currencyService.deleteCurrency(Number(currencyId));
  logger.info("exiting::deleteCurrency::controller");
  return res.status(200).json(
    new BaseResponse({
      success: true,
      message: generateSuccessMessage("DELETED", "Currency"),
    }),
  );
});
