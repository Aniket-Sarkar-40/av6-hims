import { hospitalService } from "@/services/master/hospital.service.js";
import { HospitalReq } from "@/types/master/hospital.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { getHospitalByHospitalNameFromDb } from "@/repository/master/hospital.repository.js";

export const validateHospitalId = async (hospitalId: number) => {
  logger.info("entering::validateHospitalId::service::validation");

  validIdCheck(hospitalId);

  const hospital = await hospitalService.getHospitalById(hospitalId, true);
  if (!hospital) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Hospital"));
  }
  logger.info("exiting::validateHospitalId::service::validation");

  return hospital;
};

export const deleteHospitalServiceValidation = async (
  hospitalId: number
): Promise<void> => {
  logger.info("entering::deleteHospitalServiceValidation::service::validation");

  await validateHospitalId(hospitalId);
  logger.info("exiting::deleteHospitalServiceValidation::service::validation");

  return;
};

export const getIdHospitalServiceValidation = async (
  hospitalId: number
): Promise<void> => {
  logger.info("entering::getIdHospitalServiceValidation::service::validation");

  await validateHospitalId(hospitalId);
  logger.info("exiting::getIdHospitalServiceValidation::service::validation");

  return;
};

export const updateHospitalServiceValidation = async (
  body: HospitalReq
): Promise<void> => {
  logger.info("entering::updateHospitalServiceValidation::service::validation");
  await validateHospitalId(body.id);

  const hospitalByName = await getHospitalByHospitalNameFromDb(body.name);
  if (hospitalByName && hospitalByName.id !== body.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Hospital Name")
    );
  }
  logger.info("exiting::updateHospitalServiceValidation::service::validation");
  return;
};

export const createHospitalServiceValidation = async (
  body: HospitalReq
): Promise<void> => {
  logger.info("entering::createHospitalServiceValidation::service::validation");
  // await validateHospitalForeignKeys(body);
  const alreadyExistsHospital = await hospitalService.getHospitalById(
    body.id,
    true
  );
  if (alreadyExistsHospital) {
    throw new ErrorHandler(400, "Collection center is already mapped");
  }

  const hospital = await getHospitalByHospitalNameFromDb(body.name);
  if (hospital) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Hospital Name")
    );
  }
  logger.info("exiting::createHospitalServiceValidation::service::validation");

  return;
};
