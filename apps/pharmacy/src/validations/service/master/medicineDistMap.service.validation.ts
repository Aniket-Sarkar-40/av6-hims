import {
  findByItemAndDistributor,
  getMedicineDistMapByIdFromDb,
} from "@/repository/master/medicineDistMap.repository.js";
import { MedicineDistMapReq } from "@/types/master/medicineDistMap.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { validateIdItem } from "../item/item.service.validation.js";
import { validateIdDistributor } from "../distributor/distributor.service.validation.js";

export const validateIdMedicineDistMap = async (medicineDistMapId: number) => {
  logger.info("entering::validateIdMedicineDistMap::service::validation");

  validIdCheck(medicineDistMapId);

  const medicineDistMap = await getMedicineDistMapByIdFromDb(medicineDistMapId);
  if (!medicineDistMap || medicineDistMap.isActive === false) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Medicine Distributor"),
    );
  }
  logger.info("exiting::validateIdMedicineDistMap::service::validation");

  return medicineDistMap;
};

export const deleteMedicineDistMapServiceValidation = async (
  medicineDistMapId: number,
): Promise<void> => {
  logger.info(
    "entering::deleteMedicineDistMapServiceValidation::service::validation",
  );

  await validateIdMedicineDistMap(medicineDistMapId);
  logger.info(
    "exiting::deleteMedicineDistMapServiceValidation::service::validation",
  );

  return;
};

export const updateIdMedicineDistMapServiceValidation = async (
  medicineDistMapId: number,
): Promise<void> => {
  logger.info(
    "entering::updateIdMedicineDistMapServiceValidation::service::validation",
  );
  await validateIdMedicineDistMap(medicineDistMapId);
  logger.info(
    "exiting::updateIdMedicineDistMapServiceValidation::service::validation",
  );
  return;
};

export const validateIds = async (body: MedicineDistMapReq): Promise<void> => {
  logger.info("entering::validateIds::service::validation");

  // Validate itemId exists and is valid
  await validateIdItem(body.itemId);

  // Validate distributorId exists and is valid
  await validateIdDistributor(body.distributorId);

  // Check for existing mapping
  const existingRecord = await findByItemAndDistributor(
    body.itemId,
    body.distributorId,
  );

  const today = new Date();

  if (existingRecord) {
    if (existingRecord.isActive) {
      // If active and expiryDate is NOT over (expiryDate >= today), throw error
      if (existingRecord.expiryDate && existingRecord.expiryDate >= today) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("DUPLICATE_ITEM", "Medicine Distributor Map"),
        );
      }
      // If active and expired (expiryDate < today), allow save (no error)
    }
    // If isActive = false → allow save (no error)
  }

  logger.info("exiting::validateIds::service::validation");
};

export const createMedicineDistMapServiceValidation = async (
  body: MedicineDistMapReq,
): Promise<void> => {
  logger.info(
    "entering::createMedicineDistMapServiceValidation::service::validation",
  );
  await validateIds(body);
  logger.info(
    "exiting::createMedicineDistMapServiceValidation::service::validation",
  );

  return;
};
