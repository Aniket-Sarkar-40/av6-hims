import { toPatientInsuranceDto } from "@/mapper/insurance/patientsInsurance.mapper.js";
import {
  createPatientsInsuranceInDb,
  deletePatientsInsuranceFromDb,
  getAllPatientsInsuranceFromDb,
  getPatientsInsuranceByIdFromDb,
  updatePatientsInsuranceInDb,
} from "@/repository/insurance/patientInsurance.repository.js";
import {
  PatientInsuranceDto,
  PatientInsuranceReq,
} from "@/types/insurance/patientsInsurance.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  createPatientsInsuranceServiceValidation,
  deletePatientsInsuranceServiceValidation,
  updatePatientsInsuranceServiceValidation,
} from "@/validations/service/insurance/patientInsurance.service.validation.js";
import { PatientInsuranceType } from "@repo/db/generated/prisma/client";
import { FileInfo } from "@repo/shared/types/global.js";

export const patientsInsuranceService = {
  async createPatientsInsurance(
    input: PatientInsuranceReq,
    fileInfos: FileInfo[],
  ): Promise<PatientInsuranceDto> {
    logger.info("entering::createPatientsInsurance::service");
    await createPatientsInsuranceServiceValidation(input);
    const createPatientsInsurance = await createPatientsInsuranceInDb(input);
    // await authService.uploadInsuranceImagesExt(fileInfos);
    const patientRes = await toPatientInsuranceDto(createPatientsInsurance);
    logger.info("exiting::createPatientsInsurance::service");
    return patientRes;
  },

  async updatePatientsInsurance(
    id: number,
    input: PatientInsuranceReq,
    fileInfos: FileInfo[],
  ) {
    logger.info("entering::updatePatientsInsurance::service");

    await updatePatientsInsuranceServiceValidation(input);

    const updatedPO = await updatePatientsInsuranceInDb(id, input);
    // await authService.uploadInsuranceImagesExt(fileInfos);

    logger.info("exiting::updatePatientsInsurance::service");
    return updatedPO;
  },

  async getAllPatientsInsurance(input: {
    patientId?: number;
    insuranceType?: PatientInsuranceType;
  }) {
    logger.info("entering::getAllPatientsInsurance::service");

    const records = await getAllPatientsInsuranceFromDb(input);

    if (records.length === 0) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "patientsInsurance"),
      );
    }
    const dto = await Promise.all(
      records.map(async (patientsInsurance) => {
        return toPatientInsuranceDto(patientsInsurance);
      }),
    );

    logger.info("exiting::getAllPatientsInsurance::service");
    return dto;
  },

  async getPatientsInsuranceById(
    id: number,
    canNullReturnable = false,
  ): Promise<PatientInsuranceDto | null> {
    logger.info(`entering::getPatientsInsuranceById::service id=${id}`);

    validIdCheck(id);

    const record = await getPatientsInsuranceByIdFromDb(id);

    if (!record) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "patientsInsurance"),
        );
      }
      logger.warn(
        `patientsInsurance with id=${id} not found, returning null as requested.`,
      );
      return null;
    }

    const dto = await toPatientInsuranceDto(record);

    logger.info(`exiting::getPatientsInsuranceById::service id=${id}`);
    return dto;
  },

  async deletePatientsInsurance(id: number): Promise<void> {
    logger.info("entering::deletePatientsInsurance::service id=" + id);

    await deletePatientsInsuranceServiceValidation(id);

    await deletePatientsInsuranceFromDb(id);
    logger.info("exiting::deletePatientsInsurance::service id=" + id);
  },
};
