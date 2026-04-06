import {
  getMedicineTabDetailsByMedicineTabIdFromDb,
  getMedicineTabIdAndMedIdByIdFromDb,
} from "@/repository/appointment/medicineTabDetails.repository.js";
import { getItemByIdFromDb } from "@/repository/master/item.repository.js";
import { medicineTabService } from "@/services/appointment/medicineTab.service.js";
import {
  CreateMedicineTabDetails,
  UpdateMedicineTabDetailsInput,
} from "@/types/appointment/medicineTabDetails.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";

import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";

export const validateIdMedicineTabDetails = async (id: number) => {
  logger.info("entering::validateIdMedicineTabDetails::service::validation");
  validIdCheck(id);

  const record = await getMedicineTabDetailsByMedicineTabIdFromDb(id);
  if (!record) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Medicine Tab Detail")
    );
  }

  logger.info("exiting::validateIdMedicineTabDetails::service::validation");
  return record;
};

export const createMedicineTabDetailsServiceValidation = async (
  body: CreateMedicineTabDetails
) => {
  logger.info(
    "entering::createMedicineTabDetailsServiceValidation::service::validation"
  );

  const medTabId = await medicineTabService.getMedicineTabById(
    body.medicineTabId,
    true
  );
  if (!medTabId) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Medicine Tab")
    );
  }

  for (const item of body.data) {
    const records = await getItemByIdFromDb(item.medId);
    if (!records) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Medicine")
      );
    }

    const exists = await getMedicineTabIdAndMedIdByIdFromDb(
      body.medicineTabId,
      item.medId
    );
    if (exists) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Med Id And Med Tab Id")
      );
    }
  }
};
export const updateMedicineTabDetailsServiceValidation = async (
  body: UpdateMedicineTabDetailsInput
) => {
  logger.info(
    "entering::updateMedicineTabDetailsServiceValidation::service::validation"
  );

  const medTab = await medicineTabService.getMedicineTabById(
    body.medicineTabId,
    true
  );
  if (!medTab) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Medicine Tab")
    );
  }

  for (const item of body.data) {
    if (item.id) await validateIdMedicineTabDetails(item.id);
    const medExists = await getItemByIdFromDb(item.medId);
    if (!medExists) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Medicine")
      );
    }

    const existing = await getMedicineTabIdAndMedIdByIdFromDb(
      body.medicineTabId,
      item.medId
    );

    if (existing && existing.id !== item.id) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "DUPLICATE_ITEM",
          "Medicine Tab & Medicine combination"
        )
      );
    }
  }

  logger.info(
    "exiting::updateMedicineTabDetailsServiceValidation::service::validation"
  );
};
