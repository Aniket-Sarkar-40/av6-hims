import { uinServiceFactory } from "@/config/core.config.js";
import { getByUnique } from "@/repository/common.repository.js";
import {
  BloodCollectionItem,
  CreateOrUpdateBloodCollection,
} from "@/types/bloodCollection/bloodCollection.js";
import { validateIdBloodDonor } from "@/validations/service/bloodDonor/bloodDonor.service.validation.js";
import { validateIdBloodBankCenter } from "@/validations/service/master/bloodBankCenter.service.validation.js";
import { validateIdBloodExternalCenter } from "@/validations/service/master/bloodExternalCenter.service.validation.js";
import { validateIdPhysicalExam } from "@/validations/service/physicalExam/physicalExam.service.validation.js";
import {
  BloodBankUinShortCode,
  BloodCollection,
  BloodCollectionSourceType,
  BloodCollectionStatus,
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

export const upsertBloodCollectionServiceValidation = async (
  body: CreateOrUpdateBloodCollection,
) => {
  logger.info(
    "entering::upsertBloodCollectionServiceValidation::service::validation",
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

  if (body.status === BloodCollectionStatus.COLLECTED) {
    if (!body.receivedByStaffId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("REQUIRED_FIELD", "Received By Staff Id"),
      );
    }
  }

  if (body.sourceType === BloodCollectionSourceType.DONOR_COLLECTION) {
    await validateIdBloodDonor(body.donorId!);
    const physicalExam = await validateIdPhysicalExam(body.physicalExamId!);
    if (physicalExam.donorId !== body.donorId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_ASSOCIATION", "Physical Exam", "Donor"),
      );
    }
    if (physicalExam.bloodBankCenterId !== body.bloodBankCenterId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "INVALID_ASSOCIATION",
          "Physical Exam",
          "Blood Bank Center",
        ),
      );
    }
    if (!physicalExam.isAccepted) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "ACTION_NOT_PERFORMED_BECAUSE",
          "Blood Collection",
          "Physical Exam is not accepted",
        ),
      );
    }
    if (body.externalCenterId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_FIELD", "External Center Id"),
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

  if (body.collectionItems) {
    for (const item of body.collectionItems) {
      if (item.id) {
        await validateIdBloodCollectionItem(item.id);
      }
      if (item.bagExpiryDate && item.bagExpiryDate < new Date()) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("INVALID_DATE", "Bag Expiry Date"),
        );
      }
      if (item.isManualUnitNo) {
        if (!item.unitNo || item.unitNo.trim() === "") {
          throw new ErrorHandler(
            400,
            generateErrorMessage("REQUIRED_FIELD", "Unit No"),
          );
        }
      } else {
        item.unitNo = await uinServiceFactory.generateUIN(
          BloodBankUinShortCode.ITEM,
        );
      }
    }
  }

  logger.info(
    "exiting::upsertBloodCollectionServiceValidation::service::validation",
  );
};
