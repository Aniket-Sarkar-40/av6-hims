import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import {
  createAutoAlertEmailInDb,
  getAutoAlertEmailByIdFromDb,
  updateAutoAlertEmailInDb,
} from "@/repository/master/autoAlert.repository.js";
import { cronService } from "@/services/cron/cron.service.js";
import {
  CreateAutoAlertEmailInput,
  UpdateAutoAlertEmailInput,
} from "@/types/master/autoAlert.js";

import {
  createAutoAlertEmailServiceValidation,
  resendAutoAlertEmailServiceValidation,
  updateAutoAlertEmailServiceValidation,
} from "@/validations/service/master/autoAlert.service.validation.js";
import {
  INV_ALERT_TYPE,
  InvAutoAlertEmail,
} from "@repo/db/generated/prisma/client";
import {
  addToCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/inventory.shortCode.utils.js";

const cacheKey = getRedisKey("AUTO_ALERT_EMAIL", "all");

export const autoAlertService = {
  async createAutoAlertEmail(
    input: CreateAutoAlertEmailInput
  ): Promise<InvAutoAlertEmail> {
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
    input: UpdateAutoAlertEmailInput
  ): Promise<InvAutoAlertEmail> {
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
    canNullReturnable: boolean = false
  ): Promise<InvAutoAlertEmail | null> {
    logger.info("entering::getAutoAlertEmailById::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.AUTO_ALERT_EMAIL);
    validIdCheck(id);
    let autoAlertEmail: InvAutoAlertEmail | null = null;

    if (isCacheable) {
      autoAlertEmail = (await getCacheById(
        cacheKey,
        id
      )) as InvAutoAlertEmail | null;
    } else {
      autoAlertEmail = await getAutoAlertEmailByIdFromDb(id);
    }
    logger.info("exiting::getAutoAlertEmailById::service");

    if (!autoAlertEmail) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Auto Alert Email")
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
    if (alertType === INV_ALERT_TYPE.RE_ORDER_ITEMS) {
      const isSuccess = await cronService.reOrderAlert({
        runDate: runDate,
        isResend: true,
        resendMasterId: resendId,
      });
      return isSuccess;
    } else if (alertType === INV_ALERT_TYPE.EXPIRED_ITEMS) {
      const isSuccess = await cronService.expiredItemAlert({
        runDate: runDate,
        isResend: true,
        resendMasterId: resendId,
      });
      return isSuccess;
    } else {
      const isSuccess = await cronService.expiringItemAlert({
        runDate: runDate,
        isResend: true,
        resendMasterId: resendId,
      });
      return isSuccess;
    }
  },
};
