import { validIdCheck } from "@/validations/global.validation.js";
import { commonGetService } from "@/services/common.service.js";
import { CreateOrUpdateChequeMasterInput } from "@/types/master/chequeMaster.js";
import { validateIdLedger } from "./ledger.service.validation.js";
import { getByUnique } from "@/repository/common.repository.js";
import { ChequeMaster, Status } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdChequeMaster = async (
  id: number
): Promise<ChequeMaster> => {
  logger.info("entering::validateIdChequeMaster::service::validation");
  validIdCheck(id);
  const chequeMaster = await commonGetService.getElementById<"ChequeMaster">({
    cacheCode: "CHEQUE_MASTER",
    canNullReturnable: true,
    id,
    modelName: "ChequeMaster",
    shortCode: "CHEQUE_MASTER",
    useActiveFlag: true,
  });

  if (!chequeMaster) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Cheque Master")
    );
  }
  logger.info("exiting::validateIdChequeMaster::service::validation");
  return chequeMaster;
};

export const createOrUpdateChequeMasterServiceValidation = async (
  body: CreateOrUpdateChequeMasterInput
): Promise<void> => {
  logger.info(
    "entering::createOrUpdateChequeMasterServiceValidation::service::validation"
  );
  if (body.id) {
    await validateIdChequeMaster(body.id);
  }

  const bankLedger = await validateIdLedger(body.bankLedgerId);
  if (!bankLedger.isBankAccount) {
    throw new ErrorHandler(
      400,
      "Cheque Master can only be created for bank account"
    );
  }
  if (body.startChequeNo > body.endChequeNo) {
    throw new ErrorHandler(
      400,
      "Start cheque no must be less than end cheque no"
    );
  }

  const overlappingChequeMaster = await getByUnique({
    model: "ChequeMaster",
    where: {
      bankLedgerId: body.bankLedgerId,
      OR: [
        {
          startChequeNo: { lte: body.endChequeNo },
          endChequeNo: { gte: body.startChequeNo },
        },
      ],
      NOT: body.id ? { id: body.id } : undefined,
    },
  });
  if (overlappingChequeMaster) {
    throw new ErrorHandler(
      400,
      `Cheque number range overlaps with existing cheque range for this bank`
    );
  }
  logger.info(
    "exiting::createOrUpdateChequeMasterServiceValidation::service::validation"
  );
};

export const toggleStatusChequeMasterServiceValidation = async (
  chequeMasterId: number
): Promise<Status> => {
  logger.info(
    "entering::toggleStatusChequeMasterServiceValidation::service::validation"
  );
  const chequeMaster = await validateIdChequeMaster(chequeMasterId);
  let newStatus: Status = Status.ACTIVE;
  if (chequeMaster.status === Status.ACTIVE) {
    newStatus = Status.INACTIVE;
  } else {
    newStatus = Status.ACTIVE;
  }
  logger.info(
    "exiting::toggleStatusChequeMasterServiceValidation::service::validation"
  );
  return newStatus;
};
