import {
  createPatientMedicineInDb,
  deletePatientMedicineFromDb,
  fetchPharmacyItemsForAppointment,
  getPatientMedicineByIdFromDb,
  getPatientMedicineDetailsByMasterIdFromDb,
  updatePatientMedicineInDb,
} from "@/repository/appointment/patientMedicine.repository.js";

import {
  CreatePatientMedicineInput,
  SearchMedicineInput,
  UpdatePatientMedicineInput,
} from "@/types/appointment/patientMedicine.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import {
  createPatientMedicineServiceValidation,
  deletePatientMedicineServiceValidation,
  updatePatientMedicineServiceValidation,
  validateIdPatientMedicine,
  validateIdPatientMedicineByAptIdAndCcId,
} from "@/validations/service/appointment/patientMedicine.service.validation.js";
import {
  PatientMedicine,
  PatientMedicineDetail,
} from "@repo/db/generated/prisma/client";

export const patientMedicineService = {
  async createPatientMedicine(input: CreatePatientMedicineInput) {
    logger.info("entering::createPatientMedicine::service");

    await createPatientMedicineServiceValidation(input);

    const created = await createPatientMedicineInDb(input);

    logger.info("exiting::createPatientMedicine::service");
    return created;
  },

  async updatePatientMedicine(input: UpdatePatientMedicineInput) {
    logger.info("entering::updatePatientMedicine::service");

    await updatePatientMedicineServiceValidation(input);

    await updatePatientMedicineInDb(input);

    logger.info("exiting::updatePatientMedicine::service");
  },

  async getPatientMedicineById(id: number, canNullReturnable: boolean = false) {
    logger.info("entering::getPatientMedicinesById::service");

    await validateIdPatientMedicine(id);

    const patientMedicines = await getPatientMedicineByIdFromDb(id);

    if (!patientMedicines) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Patient Medicines"),
        );
      } else {
        return null;
      }
    }

    logger.info("exiting::getPatientMedicinesById::service");
  },
  async getPatientMedicineDetailsByIdWoDto(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<PatientMedicineDetail[] | null> {
    logger.info("entering::patientMedicinesDetails::service");

    await validateIdPatientMedicine(id);

    const patientMedicinesDetails =
      await getPatientMedicineDetailsByMasterIdFromDb(id);

    if (!patientMedicinesDetails) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Patient Medicines Details"),
        );
      } else {
        return null;
      }
    }

    logger.info("exiting::getpatientMedicinesDetailsById::service");
    return patientMedicinesDetails;
  },

  async getMedicines(
    input: SearchMedicineInput,
  ): Promise<PatientMedicine[] | null> {
    logger.info("entering::getPatientMedicinesById::service");
    await validateIdPatientMedicineByAptIdAndCcId(input.aptId, input.ccId);

    const patientMedicines = await fetchPharmacyItemsForAppointment(input);

    if (!patientMedicines) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Medicines"),
      );
    }

    logger.info("exiting::getPatientMedicinesById::service");
    return patientMedicines;
  },

  async deletePatientMedicine(id: number): Promise<void> {
    logger.info("entering::deletePatientMedicine::service");

    await deletePatientMedicineServiceValidation(id);

    await deletePatientMedicineFromDb(id);

    logger.info("exiting::deletePatientMedicine::service");
  },
};
