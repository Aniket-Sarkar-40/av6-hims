import { getByUnique } from "@/repository/common.repository.js";
import { CreateOrUpdateBloodDonationPhysicalExam } from "@/types/bloodDonationPhysicalExam/bloodDonationPhysicalExam.js";
import { validateIdBloodCollection } from "@/validations/service/bloodCollection/bloodCollection.service.validation.js";
import { validateIdBloodBankCenter } from "@/validations/service/master/bloodBankCenter.service.validation.js";
import { validateIdEmployee } from "@apps/core/validations/service/staff/employee.service.validation.js";
import {
  BloodDonationPhysicalExam,
  BloodDonationType,
} from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdBloodDonationPhysicalExam = async (
  id: number,
): Promise<BloodDonationPhysicalExam> => {
  logger.info(
    "entering::validateIdBloodDonationPhysicalExam::service::validation",
  );

  validIdCheck(id);

  const bloodDonationPhysicalExam = await getByUnique({
    model: "BloodDonationPhysicalExam",
    where: {
      id,
    },
  });
  if (!bloodDonationPhysicalExam) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Blood Donation Physical Exam"),
    );
  }
  logger.info(
    "exiting::validateIdBloodDonationPhysicalExam::service::validation",
  );

  return bloodDonationPhysicalExam;
};

export const createOrUpdateBloodDonationPhysicalExamServiceValidation = async (
  body: CreateOrUpdateBloodDonationPhysicalExam,
) => {
  logger.info(
    "entering::createOrUpdateBloodDonationPhysicalExamServiceValidation::service::validation",
  );
  if (body.id) {
    await validateIdBloodDonationPhysicalExam(body.id);
  }
  await validateIdBloodBankCenter(body.bloodBankCenterId);
  const collection = await validateIdBloodCollection(body.collectionId);

  if (collection.bloodBankCenterId !== body.bloodBankCenterId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_ASSOCIATION",
        "Blood Bank Center",
        "Collection",
      ),
    );
  }

  if (collection.donationType === BloodDonationType.WHOLE_BLOOD) {
    if (body.weightKg && Number(body.weightKg) < 45) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("GREATER_THAN_OR_EQUAL_TO", "Weight (kg)", "45"),
      );
    }
  }

  const collectionItem = await getByUnique({
    model: "BloodCollectionItem",
    where: {
      collectionId: body.collectionId,
    },
  });

  if (collectionItem) {
    if (
      Number(collectionItem.quantityMl) === 350 &&
      body.weightKg &&
      Number(body.weightKg) <= 45
    ) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("GREATER_THAN_OR_EQUAL_TO", "Weight (kg)", "45"),
      );
    }
    if (
      Number(collectionItem.quantityMl) === 450 &&
      body.weightKg &&
      Number(body.weightKg) <= 55
    ) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("GREATER_THAN_OR_EQUAL_TO", "Weight (kg)", "55"),
      );
    }
  }

  if (body.hemoglobinGdl && Number(body.hemoglobinGdl) < 12.5) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "GREATER_THAN_OR_EQUAL_TO",
        "Hemoglobin (g/dl)",
        "12.5",
      ),
    );
  }

  if (body.systolicBp) {
    if (Number(body.systolicBp) < 100 || Number(body.systolicBp) > 140) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "MUST_BETWEEN",
          "Systolic BP (mmHg)",
          "100",
          "140",
        ),
      );
    }
  }

  if (body.diastolicBp) {
    if (Number(body.diastolicBp) < 60 || Number(body.diastolicBp) > 90) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("MUST_BETWEEN", "Diastolic BP (mmHg)", "60", "90"),
      );
    }
  }

  if (body.pulsePerMin) {
    if (Number(body.pulsePerMin) < 60 || Number(body.pulsePerMin) > 100) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("MUST_BETWEEN", "Pulse (beats/min)", "60", "100"),
      );
    }
  }

  if (body.temperatureC) {
    if (Number(body.temperatureC) < 36.1 || Number(body.temperatureC) > 37.2) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "MUST_BETWEEN",
          "Temperature (°C)",
          "36.1",
          "37.2",
        ),
      );
    }
  }

  if (body.examinedByStaffId) {
    await validateIdEmployee(body.examinedByStaffId);
  }

  const duplicatePhysicalExam = await getByUnique({
    model: "BloodDonationPhysicalExam",
    where: {
      bloodBankCenterId: body.bloodBankCenterId,
      collectionId: body.collectionId,
      NOT: body.id ? { id: body.id } : undefined,
    },
  });

  if (duplicatePhysicalExam) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "DUPLICATE_ITEM",
        "Physical Exam for this Collection",
      ),
    );
  }

  logger.info(
    "exiting::createOrUpdateBloodDonationPhysicalExamServiceValidation::service::validation",
  );
};
