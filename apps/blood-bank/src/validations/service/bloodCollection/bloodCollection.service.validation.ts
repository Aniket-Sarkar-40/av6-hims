import { uinServiceFactory } from "@/config/core.config.js";
import { getByUnique } from "@/repository/common.repository.js";
import { CreateOrUpdateBloodCollection } from "@/types/bloodCollection/bloodCollection.js";
import { validateIdBloodDonor } from "@/validations/service/bloodDonor/bloodDonor.service.validation.js";
import { validateIdBloodBankCenter } from "@/validations/service/master/bloodBankCenter.service.validation.js";
import { validateIdBloodExternalCenter } from "@/validations/service/master/bloodExternalCenter.service.validation.js";
import {
  BloodBankUinShortCode,
  BloodCollection,
  BloodCollectionSourceType,
  BloodCollectionStatus,
  BloodDonationType,
} from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdBloodCollection = async (
  id: number,
): Promise<BloodCollection> => {
  logger.info("entering::validateIdBloodCollection::service::validation");

  validIdCheck(id);

  const bloodCollection = await getByUnique({
    model: "BloodCollection",
    where: {
      id,
    },
  });
  if (!bloodCollection) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Blood Collection"),
    );
  }
  logger.info("exiting::validateIdBloodCollection::service::validation");

  return bloodCollection;
};

export const createOrUpdateBloodCollectionServiceValidation = async (
  body: CreateOrUpdateBloodCollection,
) => {
  logger.info(
    "entering::createOrUpdateBloodCollectionServiceValidation::service::validation",
  );
  if (body.id) {
    await validateIdBloodCollection(body.id);
  }
  await validateIdBloodBankCenter(body.bloodBankCenterId);

  if (!body.collectionNo) {
    body.collectionNo = await uinServiceFactory.generateUIN(
      BloodBankUinShortCode.CC,
    );
  }

  const duplicateCollection = await getByUnique({
    model: "BloodCollection",
    where: {
      bloodBankCenterId: body.bloodBankCenterId,
      collectionNo: body.collectionNo,
      NOT: body.id ? { id: body.id } : undefined,
    },
  });

  if (duplicateCollection) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "DUPLICATE_ITEM",
        "Collection No for this Blood Bank Center",
      ),
    );
  }

  if (
    !body.sourceType ||
    !Object.values(BloodCollectionSourceType).includes(body.sourceType)
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("REQUIRED_FIELD", "Source Type"),
    );
  }

  if (body.status) {
    if (!Object.values(BloodCollectionStatus).includes(body.status)) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_VALUE", "Status"),
      );
    }
    if (body.status === BloodCollectionStatus.COLLECTED) {
      if (!body.receivedByStaffId) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("REQUIRED_FIELD", "Received By Staff Id"),
        );
      }
    }
  }

  if (body.sourceType === BloodCollectionSourceType.DONOR_COLLECTION) {
    if (!body.donorId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("REQUIRED_FIELD", "Donor Id"),
      );
    }
    await validateIdBloodDonor(body.donorId!);
    if (body.externalCenterId) {
      throw new ErrorHandler(
        400,
        "External Center Id should be null for Donor Collection",
      );
    }
  } else if (body.sourceType === BloodCollectionSourceType.EXTERNAL_RECEIVE) {
    if (!body.externalCenterId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("REQUIRED_FIELD", "External Center Id"),
      );
    }
    await validateIdBloodExternalCenter(body.externalCenterId!);

    if (body.donorId) {
      await validateIdBloodDonor(body.donorId!);
    }
    if (!body.externalDocumentNo && !body.externalReferenceNo) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "REQUIRED_FIELD",
          "External Document No or External Reference No",
        ),
      );
    }
  } else if (body.sourceType === BloodCollectionSourceType.MANUAL_STOCK_ENTRY) {
    if (!body.remark || body.remark.trim() === "") {
      throw new ErrorHandler(
        400,
        generateErrorMessage("REQUIRED_FIELD", "Remarks"),
      );
    }
  }

  if (body.collectionDate && body.collectionDate > new Date()) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_DATE", "Collection Date"),
    );
  }

  if (
    body.donationType &&
    !Object.values(BloodDonationType).includes(body.donationType)
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_VALUE", "Donation Type"),
    );
  }

  logger.info(
    "exiting::createOrUpdateBloodCollectionServiceValidation::service::validation",
  );
};
