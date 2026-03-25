import {
  createCustomerInDb,
  getAllCustomerFromDb,
  getCustomerByIdFromDb,
  updateCustomerInDb,
} from "@/repository/customer/customer.repository.js";
import {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "@/types/customer/customer.js";

import {
  createCustomerServiceValidation,
  updateCustomerServiceValidation,
} from "@/validations/service/customer/customer.service.validation.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import { PmsCustomer } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/pharmacy.shortCode.utils.js";
import {
  addToCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

const cacheKey = getRedisKey("CUSTOMER", "all");

export const customerService = {
  async createCustomer(input: CreateCustomerInput): Promise<PmsCustomer> {
    logger.info("entering::createCountry::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.CUSTOMER);
    await createCustomerServiceValidation(input);
    const customer = await createCustomerInDb(input);
    logger.info("exiting::customer::repository");
    if (isCacheable && customer) {
      await addToCache(cacheKey, customer.id, customer);
    }
    logger.info("exiting::createCustomer::service");

    return customer;
  },
  async getAllCustomers(): Promise<PmsCustomer[]> {
    logger.info("entering::getAllCustomer::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.CUSTOMER);
    if (isCacheable) {
      const cachedCustomer = (await getAllCache(cacheKey)) as
        | PmsCustomer[]
        | null;
      if (cachedCustomer && cachedCustomer.length > 0) {
        return cachedCustomer;
      } else {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Customer"),
        );
      }
    } else {
      const customer = await getAllCustomerFromDb();
      if (customer.length === 0) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Customer"),
        );
      }
      logger.info("exiting::getAllCustomerFromDb::repository");
      return customer;
    }
  },
  async getCustomerById(
    customerId: number,
    canNullReturnable: boolean = false,
  ): Promise<PmsCustomer | null> {
    logger.info("entering::getCustomerById::service");
    validIdCheck(customerId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.CUSTOMER);
    let customer: PmsCustomer | null;
    if (isCacheable) {
      customer = (await getCacheById(
        cacheKey,
        customerId,
      )) as PmsCustomer | null;
    } else {
      customer = await getCustomerByIdFromDb(customerId);
      if (!customer) {
        if (!canNullReturnable)
          throw new ErrorHandler(
            404,
            generateErrorMessage("NOT_FOUND", "Customer"),
          );
        else return null;
      }
      logger.info("exiting::getCustomerById::service");
    }
    return customer;
  },
  async updateCustomer(
    customerId: number,
    input: UpdateCustomerInput,
  ): Promise<PmsCustomer> {
    logger.info("entering::updateCustomer::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.CUSTOMER);
    await updateCustomerServiceValidation(input, customerId);
    const updatedCustomer = await updateCustomerInDb(customerId, input);
    logger.info("exiting::updatedCustomer::repository");
    if (isCacheable && updatedCustomer) {
      await updateCache(cacheKey, customerId, updatedCustomer);
    }
    logger.info("exiting::updateCustomer::service");
    return updatedCustomer;
  },
};
