import { requestStorage } from "@/config/requestContext.js";
import { settingsService } from "@/services/settings/settings.service.js";
import { shortCodeService } from "@/services/shortCode.service.js";
import { logger } from "@repo/platform/logging/logger.js";
import { AuthRequest } from "@repo/shared/types/request.type.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { generateHashForAuth } from "av6-core-v2";
import { NextFunction, Response } from "express";

export const authorizeCommonSearch =
  () => async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { shortCode } = req.body as { shortCode?: string };
      if (!shortCode) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("FIELD_REQUIRED", "shortCode")
        );
      }

      logger.info("entering::authorizeCommonSearch ::middleware");

      const tableMetaData = await shortCodeService.getShortCodeByCode(
        shortCode
      );

      if (!req.perms) {
        throw new ErrorHandler(500, "Permission set missing.");
      }

      const isSuper = req.perms.has("SUPER_ADMIN");
      const hasPerm = Boolean(
        tableMetaData?.permission && req.perms.has(tableMetaData.permission)
      );

      if (!isSuper && !hasPerm) {
        throw new ErrorHandler(403, "You are not authorized.");
      }

      logger.info("exiting::authorizeCommonSearch ::middleware");
      // only one next(), and we return it so nothing else runs
      return next();
    } catch (error) {
      // log the actual Error object
      logger.error("authorizeCommonSearch failed:", error);
      return next(error);
    }
  };

export const authorizeExternalRequest =
  () => async (req: AuthRequest, res: Response, next: NextFunction) => {
    logger.info("entering::authorizeExternalRequest ::middleware");
    try {
      const clientKey = req.header("client-key");
      const clientId = req.header("client-id");

      if (!clientKey) {
        logger.error("Client Key is missing in the request header.");
        throw new ErrorHandler(403, "You are not authorized.");
      }
      if (!clientId) {
        logger.error("Client Key is missing in the request header.");
        throw new ErrorHandler(403, "You are not authorized.");
      }

      if (clientKey !== generateHashForAuth(clientId)) {
        logger.error(`Unauthorized client Key: ${clientKey}`);
        throw new ErrorHandler(403, "You are not authorized.");
      }
      const store = requestStorage.getStore();
      if (store) {
        store.settings = await settingsService.getSettings();
      }

      logger.info("exiting::authorizeExternalRequest ::middleware");
      // only one next(), and we return it so nothing else runs
      return next();
    } catch (error) {
      // log the actual Error object
      logger.error("authorizeCommonApproval failed:", error);
      return next(error);
    }
  };
