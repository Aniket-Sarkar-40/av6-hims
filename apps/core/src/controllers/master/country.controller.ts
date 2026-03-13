import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { countryService } from "@/services/master/country.service.js";
import {
  CreateCountryInput,
  UpdateCountryInput,
} from "@/types/master/country.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const createCountry = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createCountry::controller");
  const data = req.body as CreateCountryInput;
  const country = await countryService.createCountry(data);
  const response = new BaseResponse(
    { success: true, message: generateSuccessMessage("CREATED", "Country") },
    country
  );
  logger.info("exiting::createCountry::controller");
  return res.status(201).json(response);
});

export const getAllCountries = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllCountries::controller");
  const countries = await countryService.getAllCountries();
  logger.info("exiting::getAllCountries::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Country"),
      },
      countries
    )
  );
});

export const getCountryById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getCountryById::controller");
  const { countryId } = req.query as { countryId: string };
  const country = await countryService.getCountryById(Number(countryId));

  if (!country) {
    return res.status(404).json(
      new BaseResponse({
        success: false,
      })
    );
  }
  logger.info("exiting::getCountryById::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Country"),
      },
      country
    )
  );
});

export const updateCountry = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateCountry::controller");
  const data = req.body as UpdateCountryInput;
  const updatedCountry = await countryService.updateCountry(data);
  logger.info("exiting::updateCountry::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "Country"),
      },
      updatedCountry
    )
  );
});

export const deleteCountry = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::deleteCountry::controller");
  const { countryId } = req.params as { countryId: string };
  await countryService.deleteCountry(Number(countryId));
  logger.info("exiting::deleteCountry::controller");
  return res.status(200).json(
    new BaseResponse({
      success: true,
      message: generateSuccessMessage("DELETED", "Country"),
    })
  );
});
