import { getCorporateClientById } from "@/repository/corporate/corporate.repository.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { ClientMaster } from "@repo/db/generated/prisma/client";

export const corporateService = {
  async corporateClientById(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<ClientMaster | null> {
    logger.info("entering::corporateService::service");
    validIdCheck(id);
    const response = await getCorporateClientById(id);
    if (!response) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Corporate Client"),
        );
      else return null;
    }
    logger.info("exiting::corporateService::service");
    return response;
  },
};
