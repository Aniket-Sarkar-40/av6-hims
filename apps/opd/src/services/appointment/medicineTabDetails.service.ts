import { toMedicineTabDetailsDto } from "@/mapper/appointment/medicineTabDetails.mapper.js";
import {
  createMedicineTabDetailsInDb,
  getMedicineTabDetailsByMedicineTabIdFromDb,
  updateMedicineTabDetailsInDb,
} from "@/repository/appointment/medicineTabDetails.repository.js";
import {
  CreateMedicineTabDetails,
  MedicineTabDetailsDto,
  UpdateMedicineTabDetailsInput,
} from "@/types/appointment/medicineTabDetails.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import {
  createMedicineTabDetailsServiceValidation,
  updateMedicineTabDetailsServiceValidation,
  validateIdMedicineTabDetails,
} from "@/validations/service/appointment/medicineTabDetails.service.validation.js";
import { MedicineTabDetails } from "@repo/db/generated/prisma/client";

export const medicineTabDetailsService = {
  async createMedicineTabDetails(
    input: CreateMedicineTabDetails,
  ): Promise<MedicineTabDetails[]> {
    logger.info("entering::createMedicineTabDetails::service");

    await createMedicineTabDetailsServiceValidation(input);

    const createdRows = await createMedicineTabDetailsInDb(input);

    logger.info("exiting::createMedicineTabDetails::service");
    return createdRows;
  },

  async updateMedicineTabDetails(
    input: UpdateMedicineTabDetailsInput,
  ): Promise<MedicineTabDetails[]> {
    logger.info("entering::updateMedicineTabDetails::service");

    await updateMedicineTabDetailsServiceValidation(input);

    const updated = await updateMedicineTabDetailsInDb(input);

    logger.info("exiting::updateMedicineTabDetails::service");
    return updated;
  },

  async getMedicineTabDetailsById(
    id: number,
    ccId: number,
    canNullReturnable = false,
  ): Promise<MedicineTabDetailsDto[] | null> {
    logger.info("entering::getMedicineTabDetailsById::service");

    await validateIdMedicineTabDetails(id);
    validIdCheck(ccId);

    const row = await getMedicineTabDetailsByMedicineTabIdFromDb(id);

    if (!row) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Tab Detail"),
        );
      }
      return null;
    }

    logger.info("exiting::getMedicineTabDetailsById::service");
    return await toMedicineTabDetailsDto(row, ccId);
  },
};
