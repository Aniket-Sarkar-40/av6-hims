import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { cityService } from "@/services/master/city.service.js";
import { UpdateCityInput } from "@/types/master/city.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const createCity = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createCity::controller");
  const { name, countryId, stateId } = req.body;
  const city = await cityService.createCity({ name, countryId, stateId });
  const response = new BaseResponse(
    { success: true, message: generateSuccessMessage("CREATED", "City") },
    city,
  );
  logger.info("exiting::createCity::controller");
  return res.status(201).json(response);
});

export const getAllCities = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllCities::controller");
  const cities = await cityService.getAllCities();
  logger.info("exiting::getAllCities::controller");
  return res
    .status(200)
    .json(
      new BaseResponse(
        { success: true, message: generateSuccessMessage("FETCHED", "City") },
        cities,
      ),
    );
});

export const getCityById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getCityById::controller");
  const { cityId } = req.params;
  const city = await cityService.getCityById(Number(cityId));

  if (!city) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
      }),
    );
  }
  logger.info("exiting::getCityById::controller");
  return res
    .status(200)
    .json(
      new BaseResponse(
        { success: true, message: generateSuccessMessage("FETCHED", "City") },
        city,
      ),
    );
});

export const updateCity = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateCity::controller");
  const data = req.body as UpdateCityInput;
  const updatedCity = await cityService.updateCity(data);
  logger.info("exiting::updateCity::controller");
  return res
    .status(200)
    .json(
      new BaseResponse(
        { success: true, message: generateSuccessMessage("UPDATED", "City") },
        updatedCity,
      ),
    );
});

export const deleteCity = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::deleteCity::controller");

  const { cityId } = req.params;
  await cityService.deleteCity(Number(cityId));
  logger.info("exiting::deleteCity::controller");

  return res.status(200).json(
    new BaseResponse({
      success: true,
      message: generateSuccessMessage("DELETED", "City"),
    }),
  );
});
