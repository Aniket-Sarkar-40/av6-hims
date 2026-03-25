import { toPatientDto } from "@/mapper/insurance/patients.mapper.js";
import {
  createPatientInDb,
  deletePatientsFromDb,
  getAllPatientsFromDb,
  getPatientsByIdFromDb,
  updatePatientInDb,
} from "@/repository/insurance/patients.repository.js";
import { PatientDto, PatientReq } from "@/types/insurance/patients.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  createPatientsServiceValidation,
  deletePatientsServiceValidation,
  updatePatientsServiceValidation,
} from "@/validations/service/insurance/patients.service.validation.js";

export const patientsService = {
  async createPatients(input: PatientReq) {
    logger.info("entering::createPatients::service");
    await createPatientsServiceValidation(input);
    const createPatients = await createPatientInDb(input);
    const patientRes = await toPatientDto(createPatients);
    logger.info("exiting::createPatients::service");
    return patientRes;
  },

  async updatePatients(id: number, input: PatientReq) {
    logger.info("entering::updatePatients::service");

    await updatePatientsServiceValidation(input);

    const updatedPO = await updatePatientInDb(id, input);
    const patientRes = await toPatientDto(updatedPO);

    logger.info("exiting::updatePatients::service");
    return patientRes;
  },

  async getAllPatients(): Promise<PatientDto[]> {
    logger.info("entering::getAllPatients::service");

    const records = await getAllPatientsFromDb();
    if (records.length === 0) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Patients"),
      );
    }

    const dto = await Promise.all(
      records.map(async (patient) => {
        try {
          return await toPatientDto(patient);
        } catch {
          return null;
        }
      }),
    );

    const filteredDto = dto.filter((item): item is PatientDto => item !== null);

    logger.info("exiting::getAllPatients::service");
    return filteredDto;
  },

  async getPatientsById(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<PatientDto | null> {
    logger.info("entering::getPatientsById::service id=" + id);

    validIdCheck(id);

    const patients = await getPatientsByIdFromDb(id);

    if (!patients) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Patients"),
        );
      } else {
        logger.warn(
          `patients with id=${id} not found, returning null as requested.`,
        );
        return null;
      }
    }

    const dto = await toPatientDto(patients);

    logger.info("exiting::getPatientsById::service id=" + id);
    return dto;
  },

  async deletePatients(id: number): Promise<void> {
    logger.info("entering::deletePatients::service id=" + id);

    await deletePatientsServiceValidation(id);

    await deletePatientsFromDb(id);
    logger.info("exiting::deletePatients::service id=" + id);
  },
};
