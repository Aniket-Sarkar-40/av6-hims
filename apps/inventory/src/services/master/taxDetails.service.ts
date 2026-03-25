import {
  createTaxDetailsInDb,
  getAllTaxDetailsFromDb,
  getTaxDetailsByIdFromDb,
  updateTaxDetailsInDb,
} from "@/repository/master/taxDetails.repository";
import { CreateOrUpdateTaxDetails } from "@/types/master/taxDetails";
import ErrorHandler from "@/utils/errorHandler.utils";
import { logger } from "@/utils/logger.utils";
import { addToCache, checkIsCacheable, getAllCache, getCacheById, updateCache } from "@/utils/redisHelper.utils";
import { getRedisKey } from "@/utils/redisKey.utils";
import { generateErrorMessage } from "@/utils/responseMessage.utils";
import { SHORT_CODE } from "@/utils/shortCode.utils";
import { validIdCheck } from "@/validations/global.validation";
import {
  createTaxDetailsServiceValidation,
  updateIdTaxDetailsServiceValidation,
} from "@/validations/service/master/taxDetails.service.validation";
import { TaxDetails } from "@prisma/client";

const cacheKey = getRedisKey("TAX_DETAILS", "all");

export const taxDetailsService = {
  async getTaxDetailsById(taxDetailsId: number, canNullReturnable: boolean = false): Promise<TaxDetails | null> {
    logger.info("entering::getTaxDetailsById::service");
    validIdCheck(taxDetailsId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.TAX_DETAILS);
    let taxDetails: TaxDetails | null;
    if (isCacheable) {
      taxDetails = (await getCacheById(cacheKey, taxDetailsId)) as TaxDetails | null;
    } else {
      taxDetails = await getTaxDetailsByIdFromDb(taxDetailsId);
    }
    if (!taxDetails) {
      if (!canNullReturnable) throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Tax Details"));
      else return null;
    }

    logger.info("exiting::getTaxDetailsById::service");
    return taxDetails;
  },

  async getAllTaxDetails(canNullReturnable: boolean = false): Promise<TaxDetails[]> {
    logger.info("entering::getAllTaxDetails::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.TAX_DETAILS);
    let taxDetails: TaxDetails[];
    if (isCacheable) {
      taxDetails = (await getAllCache(cacheKey)) as TaxDetails[];
    } else {
      taxDetails = await getAllTaxDetailsFromDb();
    }
    if (taxDetails.length === 0) {
      if (!canNullReturnable) throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Tax Details"));
      else return [];
    }

    logger.info("exiting::getAllTaxDetails::service");
    return taxDetails;
  },

  async createTaxDetails(input: CreateOrUpdateTaxDetails) {
    logger.info("entering::createTaxDetails::service");
    await createTaxDetailsServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.TAX_DETAILS);
    const taxDetails = await createTaxDetailsInDb(input);
    if (isCacheable && taxDetails) {
      await addToCache(cacheKey, taxDetails.id, taxDetails);
    }
    logger.info("exiting::createTaxDetails::service");
    return taxDetails;
  },

  async updateTaxDetails(input: CreateOrUpdateTaxDetails) {
    logger.info("entering::updateTaxDetails::service");
    await updateIdTaxDetailsServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.TAX_DETAILS);
    const updatedTaxDetails = await updateTaxDetailsInDb(input);
    if (isCacheable && input.id) {
      await updateCache(cacheKey, input.id, updatedTaxDetails);
    }
    logger.info("exiting::updateTaxDetails::service");
    return updatedTaxDetails;
  },
};
