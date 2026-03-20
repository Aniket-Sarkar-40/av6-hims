import { getCountCollectionCenterFromDb } from "@/repository/collectionCenter/collectionCenter.repository.js";
import {
  checkGeneralBillPricingExists,
  getGeneralBillPricingByIdFromDb,
} from "@/repository/master/generalBillPricing.repository.js";
import {
  CopyGeneralBillPricing,
  CreateGeneralBillPricingInput,
  UpdateGeneralBillPricingInput,
} from "@/types/master/generalBillPricing.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { validateIdCollectionCenter } from "./collectionCenter.service.validation.js";
import { validateIdGeneralBillItem } from "./generalBillItem.service.validation.js";
import { collectionCenterService } from "@/services/master/collectionCenter.service.js";

export const validateIdGeneralBillPricing = async (id: number) => {
  logger.info("entering::validateIdGeneralBillPricing::service::validation");
  validIdCheck(id);
  const response = await getGeneralBillPricingByIdFromDb(id);
  if (!response) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "General Bill Pricing"),
    );
  }
  logger.info("exiting::validateIdGeneralBillPricing::service::validation");
  return response;
};

export const createGeneralBillPricingServiceValidation = async (
  input: CreateGeneralBillPricingInput,
) => {
  logger.info("entering::createGeneralBillPricing::service::validation");

  await validateIdGeneralBillItem(input.generalBillItemId);

  const collectionCenter = await getCountCollectionCenterFromDb(input.ccIds);
  if (collectionCenter.length !== input.ccIds.length) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_VALUE", "Collection Center"),
    );
  }

  for (const ccId of input.ccIds) {
    const existing = await checkGeneralBillPricingExists(
      input.generalBillItemId,
      ccId,
    );

    if (existing) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "DUPLICATE_ITEM",
          `Collection Center and General Bill Item mapping for ${collectionCenter.find((b) => b.id === ccId)?.colName}`,
        ),
      );
    }
  }

  logger.info("exiting::createGeneralBillPricing::service::validation");
};

export const updateGeneralBillPricingServiceValidation = async (
  input: UpdateGeneralBillPricingInput,
) => {
  logger.info(
    "entering::updateGeneralBillPricingServiceValidation::service::validation",
  );

  await validateIdGeneralBillPricing(input.id);
  await validateIdGeneralBillItem(input.generalBillItemId);
  await validateIdCollectionCenter(input.ccId);

  const existing = await checkGeneralBillPricingExists(
    input.generalBillItemId,
    input.ccId,
  );

  if (existing) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_VALUE",
        "Collection Center And General Bill Item",
      ),
    );
  }

  logger.info(
    "exiting::updateGeneralBillPricingServiceValidation::service::validation",
  );
};

export const copyGeneralBillPricingServiceValidation = async (
  input: CopyGeneralBillPricing,
) => {
  logger.info(
    "entering::copyGeneralBillPricingServiceValidation::service::validation",
  );

  const { fromId, toId } = input;

  if (fromId === toId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_VALUE", "From and To Collection Center"),
    );
  }

  const fromCc = await collectionCenterService.getCollectionCenterById(fromId);
  if (!fromCc) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "From Collection Center"),
    );
  }

  const toCc = await collectionCenterService.getCollectionCenterById(toId);
  if (!toCc) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "To Collection Center"),
    );
  }

  logger.info(
    "exiting::copyGeneralBillPricingServiceValidation::service::validation",
  );
};
