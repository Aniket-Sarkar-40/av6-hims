// validations/service/master/medicineTab.service.validation.ts
import {
  getMedicineTabByIdFromDb,
  getMedicineTabByNameAndDoctorFromDb,
} from "@/repository/appointment/medicineTab.repository.js";
import { doctorService } from "@/services/doctor/doctor.service.js";
import { CreateOrUpdateMedicineTab } from "@/types/appointment/medicineTab.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { MedicineTab } from "@repo/db/generated/prisma/client";

export const validIdMedicineTab = async (id: number): Promise<MedicineTab> => {
  logger.info("entering::validIdMedicineTab::service::validation");
  validIdCheck(id);

  const row = await getMedicineTabByIdFromDb(id);
  if (!row) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Medicine Tab"),
    );
  }

  logger.info("exiting::validIdMedicineTab::service::validation");
  return row;
};

export const updateIdMedicineTabServiceValidation = async (
  body: CreateOrUpdateMedicineTab,
) => {
  logger.info(
    "entering::updateIdMedicineTabServiceValidation::service::validation",
  );

  if (body.id) {
    validIdCheck(body.id);
    const med = await validIdMedicineTab(body.id);

    if (med.doctorId !== body.doctorId)
      throw new ErrorHandler(
        403,
        generateErrorMessage("ACCESS_FAIL", "Doctor"),
      );
  }

  if (body.medTabName && body.doctorId) {
    const sameNameAndDoctor = await getMedicineTabByNameAndDoctorFromDb(
      body.medTabName,
      body.doctorId,
    );
    if (sameNameAndDoctor && sameNameAndDoctor.id !== body.id) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "DUPLICATE_ITEM",
          "Medicine Tab name for the same doctor",
        ),
      );
    }
  }

  logger.info(
    "exiting::updateIdMedicineTabServiceValidation::service::validation",
  );
};

export const createMedicineTabServiceValidation = async (
  body: CreateOrUpdateMedicineTab,
): Promise<MedicineTab | null> => {
  logger.info(
    "entering::createMedicineTabServiceValidation::service::validation",
  );

  const docId = await doctorService.getDoctorById(body.doctorId);
  if (!docId) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Doctor"));
  }
  const byNameAndDoctor = await getMedicineTabByNameAndDoctorFromDb(
    body.medTabName,
    body.doctorId,
  );
  if (byNameAndDoctor) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "DUPLICATE_ITEM",
        "Medicine Tab name for this doctor",
      ),
    );
  }

  logger.info(
    "exiting::createMedicineTabServiceValidation::service::validation",
  );
  return byNameAndDoctor;
};
