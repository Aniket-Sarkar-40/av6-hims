import {
  getSellByAppointmentNo,
  getSellBySellNo,
} from "@/repository/sell/sell.repository.js";
import { CreateMigrationReq } from "@/types/migration/migration.js";
import { SellByRefNoResponse } from "@/types/sell/sell.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateMigrationRefNo = async (
  input: CreateMigrationReq,
): Promise<SellByRefNoResponse> => {
  logger.info("entering::validMigrationRefNo::service::validation");

  if (input.refType === "APPOINTMENT_NO") {
    const sell = await getSellByAppointmentNo(input.refNo);
    if (sell === null) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Sell"));
    }
    logger.info("exiting::validMigrationRefNo::service::validation");
    return sell;
  } else if (input.refType === "SELL_NO") {
    const sell = await getSellBySellNo(input.refNo);
    if (sell === null) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Sell"));
    }
    logger.info("exiting::validMigrationRefNo::service::validation");
    return sell;
  } else {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Sell"));
  }
};

export const createMigrationCopayValidation = async (
  input: CreateMigrationReq,
): Promise<SellByRefNoResponse> => {
  logger.info("entering::createMigrationCopayValidation::service::validation");
  const sell = await validateMigrationRefNo(input);

  if (sell.paymentStatus !== "UNPAID") {
    throw new ErrorHandler(
      404,
      generateErrorMessage("INVALID_STATUS", "payment to change co-payment"),
    );
  }

  if (sell.status !== "COMPLETED") {
    throw new ErrorHandler(
      404,
      generateErrorMessage("INVALID_STATUS", "sell to change co-payment"),
    );
  }

  if (sell.corporateClientId === null && sell.insuranceId === null) {
    throw new ErrorHandler(
      404,
      generateErrorMessage(
        "INVALID_FIELD",
        "sell doesn't have insurance id or corporate client id",
      ),
    );
  }

  return sell;
};
