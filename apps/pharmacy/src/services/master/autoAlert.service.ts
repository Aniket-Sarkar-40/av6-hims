import {
  createAutoAlertEmailInDb,
  getAutoAlertEmailByIdFromDb,
  updateAutoAlertEmailInDb,
} from "@/repository/master/autoAlert.repository.js";
import {
  CreateAutoAlertEmailInput,
  UpdateAutoAlertEmailInput,
} from "@/types/master/autoAlert.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/pharmacy.shortCode.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  createAutoAlertEmailServiceValidation,
  resendAutoAlertEmailServiceValidation,
  updateAutoAlertEmailServiceValidation,
} from "@/validations/service/master/autoAlert.service.validation.js";
import { ALERT_TYPE, AutoAlertEmail } from "@repo/db/generated/prisma/client";
import {
  expiredItemAlert,
  expiringItemAlert,
  lowStockAlert,
} from "../scheduler/scheduler.service.js";

const cacheKey = getRedisKey("AUTO_ALERT_EMAIL", "all");

export const autoAlertService = {
  async createAutoAlertEmail(
    input: CreateAutoAlertEmailInput,
  ): Promise<AutoAlertEmail> {
    logger.info("entering::createAutoAlertEmail::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.AUTO_ALERT_EMAIL);
    await createAutoAlertEmailServiceValidation(input);
    const autoAlertEmail = await createAutoAlertEmailInDb(input);
    if (isCacheable && autoAlertEmail) {
      await addToCache(cacheKey, autoAlertEmail.id, autoAlertEmail);
    }
    logger.info("exiting::createAutoAlertEmail::service");
    return autoAlertEmail;
  },

  async updateAutoAlertEmail(
    input: UpdateAutoAlertEmailInput,
  ): Promise<AutoAlertEmail> {
    logger.info("entering::updateAutoAlertEmail::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.AUTO_ALERT_EMAIL);
    await updateAutoAlertEmailServiceValidation(input);
    const autoAlertEmail = await updateAutoAlertEmailInDb(input);
    if (isCacheable && autoAlertEmail) {
      await updateCache(cacheKey, autoAlertEmail.id, autoAlertEmail);
    }
    logger.info("exiting::updateAutoAlertEmail::service");
    return autoAlertEmail;
  },

  async getAutoAlertEmailById(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<AutoAlertEmail | null> {
    logger.info("entering::getAutoAlertEmailById::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.AUTO_ALERT_EMAIL);
    validIdCheck(id);
    let autoAlertEmail: AutoAlertEmail | null = null;

    if (isCacheable) {
      autoAlertEmail = (await getCacheById(
        cacheKey,
        id,
      )) as AutoAlertEmail | null;
    } else {
      autoAlertEmail = await getAutoAlertEmailByIdFromDb(id);
    }
    logger.info("exiting::getAutoAlertEmailById::service");

    if (!autoAlertEmail) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Auto Alert Email"),
        );
      return null;
    }
    return autoAlertEmail;
  },

  async resendAutoAlertEmail(auditId: number) {
    logger.info("entering::resendAutoAlertEmail::service");

    const audit = await resendAutoAlertEmailServiceValidation(auditId);
    const { alertType, runDate, isResend, resendMasterId } = audit;
    const resendId = isResend && resendMasterId ? resendMasterId : auditId;
    if (alertType === ALERT_TYPE.LOW_STOCK) {
      const isSuccess = await lowStockAlert({
        runDate: runDate,
        isResend: true,
        resendMasterId: resendId,
      });
      return isSuccess;
    } else if (alertType === ALERT_TYPE.EXPIRED_ITEMS) {
      const isSuccess = await expiredItemAlert({
        runDate: runDate,
        isResend: true,
        resendMasterId: resendId,
      });
      return isSuccess;
    } else {
      const isSuccess = await expiringItemAlert({
        runDate: runDate,
        isResend: true,
        resendMasterId: resendId,
      });
      return isSuccess;
    }
  },
};
