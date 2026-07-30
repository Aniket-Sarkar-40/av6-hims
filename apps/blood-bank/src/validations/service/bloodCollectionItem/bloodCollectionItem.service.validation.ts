import { uinServiceFactory } from "@/config/core.config.js";
import { getByUnique } from "@/repository/common.repository.js";
import { CreateOrUpdateBloodCollectionItem } from "@/types/bloodCollectionItem/bloodCollectionItem.js";
import { validateIdBloodCollection } from "@/validations/service/bloodCollection/bloodCollection.service.validation.js";
import { validateIdBloodBankCenter } from "@/validations/service/master/bloodBankCenter.service.validation.js";
import {
  BloodBagType,
  BloodBankUinShortCode,
  BloodCollectionItem,
  BloodCollectionItemStatus,
  BloodGroup,
} from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdBloodCollectionItem = async (
  id: number,
): Promise<BloodCollectionItem> => {
  logger.info("entering::validateIdBloodCollectionItem::service::validation");

  validIdCheck(id);

  const bloodCollectionItem = await getByUnique({
    model: "BloodCollectionItem",
    where: {
      id,
    },
  });
  if (!bloodCollectionItem) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Blood Collection Item"),
    );
  }
  logger.info("exiting::validateIdBloodCollectionItem::service::validation");

  return bloodCollectionItem;
};

export const createOrUpdateBloodCollectionItemServiceValidation = async (
  body: CreateOrUpdateBloodCollectionItem,
) => {
  logger.info(
    "entering::createOrUpdateBloodCollectionItemServiceValidation::service::validation",
  );
  if (body.id) {
    await validateIdBloodCollectionItem(body.id);
  }
  await validateIdBloodBankCenter(body.bloodBankCenterId);
  await validateIdBloodCollection(body.collectionId);

  if (!body.unitNo) {
    body.unitNo = await uinServiceFactory.generateUIN(
      BloodBankUinShortCode.UNIT,
    );
  }

  const duplicateCollectionItem = await getByUnique({
    model: "BloodCollectionItem",
    where: {
      bloodBankCenterId: body.bloodBankCenterId,
      unitNo: body.unitNo,
      NOT: body.id ? { id: body.id } : undefined,
    },
  });

  if (duplicateCollectionItem) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "DUPLICATE_ITEM",
        "Unit No for this Blood Bank Center",
      ),
    );
  }

  if (body.quantityMl && Number(body.quantityMl) <= 0) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("GREATER_THAN", "Quantity (ml)", "0"),
    );
  }

  if (body.collectionDate) {
    if (new Date(body.collectionDate) > new Date()) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "LESS_THAN_OR_EQUAL_TO",
          "Collection Date",
          "Current Date",
        ),
      );
    }
  }

  if (body.bagExpiryDate && body.collectionDate) {
    if (new Date(body.bagExpiryDate) < new Date(body.collectionDate)) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "GREATER_THAN_OR_EQUAL_TO",
          "Bag Expiry Date",
          "Collection Date",
        ),
      );
    }
  }

  if (
    body.preliminaryBloodGroup &&
    !Object.values(BloodGroup).includes(body.preliminaryBloodGroup)
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_VALUE", "Preliminary Blood Group"),
    );
  }

  if (body.status) {
    if (!Object.values(BloodCollectionItemStatus).includes(body.status)) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_VALUE", "Status"),
      );
    }
  }

  if (body.bagType && !Object.values(BloodBagType).includes(body.bagType)) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_VALUE", "Bag Type"),
    );
  }

  logger.info(
    "exiting::createOrUpdateBloodCollectionItemServiceValidation::service::validation",
  );
};
