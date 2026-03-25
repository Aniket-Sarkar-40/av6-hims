import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { currencyService } from "@/services/master/currency.service.js";
import { CurrencyReq } from "@/types/master/currency.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createCurrency = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createCurrency::controller");
  const data = req.body as CurrencyReq;
  const currency = await currencyService.createCurrency(data);
  const response = BaseResponse.success(
    { type: "CREATED", data: currency },
    "Currency",
  );
  logger.info("exiting::createCurrency::controller");
  return res.status(201).json(response);
});

export const getAllCurrency = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllCurrency::controller");
  const currency = await currencyService.getAllCurrency();
  logger.info("exiting::getAllCurrency::controller");
  const response = BaseResponse.success(
    { type: "FETCHED", data: currency },
    "Currency",
  );
  return res.status(200).json(response);
});

export const getCurrencyById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getCurrencyById::controller");
  const { currencyId } = req.params;
  const currency = await currencyService.getCurrencyById(Number(currencyId));

  if (!currency) {
    logger.info("exiting::getCurrencyById::controller");
    return res
      .status(404)
      .json(BaseResponse.error({ message: "Currency Not Found" }));
  }
  logger.info("exiting::getCurrencyById::controller");
  return res
    .status(200)
    .json(
      BaseResponse.success({ type: "FETCHED", data: currency }, "Currency"),
    );
});

export const updateCurrency = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateCurrency::controller");
  const data = req.body as CurrencyReq;
  const updatedCurrency = await currencyService.updateCurrency(data);
  logger.info("exiting::updateCurrency::controller");
  return res
    .status(200)
    .json(
      BaseResponse.success(
        { type: "UPDATED", data: updatedCurrency },
        "Currency",
      ),
    );
});

export const deleteCurrency = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::deleteCurrency::controller");
  const { currencyId } = req.params;
  await currencyService.deleteCurrency(Number(currencyId));
  logger.info("exiting::deleteCurrency::controller");
  return res
    .status(200)
    .json(BaseResponse.success({ type: "DELETED" }, "Currency"));
});
