import { commonGetService } from "@/services/common.service.js";

import { validIdCheck } from "@/validations/global.validation.js";
import { getByUnique } from "@/repository/common.repository.js";
import { CreateOrUpdateNarrationInput } from "@/types/master/narration.js";
import { validateIdVoucherType } from "./voucherType.service.validation.js";
import { Narration } from "@repo/db/generated/prisma/client";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { logger } from "@repo/platform/logging/logger.js";

export const validateIdNarration = async (id: number): Promise<Narration> => {
  logger.info("entering::validateIdNarration::service::validation");
  validIdCheck(id);
  const narration = await commonGetService.getElementById<"Narration">({
    cacheCode: "NARRATION",
    canNullReturnable: true,
    id,
    modelName: "Narration",
    shortCode: "NARRATION",
    useActiveFlag: true,
  });

  if (!narration) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Narration"));
  }
  logger.info("exiting::validateIdNarration::service::validation");
  return narration;
};

export const createOrUpdateNarrationServiceValidation = async (
  input: CreateOrUpdateNarrationInput
) => {
  logger.info("entering::createOrUpdateNarration::service::validation");

  if (input.id) {
    await validateIdNarration(input.id);
  }

  await validateIdVoucherType(input.voucherTypeId);

  const narration = await getByUnique({
    model: "Narration",
    where: {
      name: input.name,
      voucherTypeId: input.voucherTypeId,
      NOT: input.id ? { id: input.id } : undefined,
    },
  });

  if (narration) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "DUPLICATE_ITEM",
        `Narration with name ${input.name}`
      )
    );
  }

  logger.info("exiting::createOrUpdateNarration::service::validation");
};
