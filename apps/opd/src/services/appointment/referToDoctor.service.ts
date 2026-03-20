import {
  createReferToDoctorInDb,
  updateReferToDoctorInDb,
} from "@/repository/appointment/referToDoctor.repository.js";
import {
  CreateReferToDoctorInput,
  UpdateReferToDoctorInput,
} from "@/types/appointment/referToDoctor.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  createReferToDoctorServiceValidation,
  updateReferToDoctorServiceValidation,
  validateIdReferToDoctor,
} from "@/validations/service/appointment/referToDoctor.service.validation.js";

export const referToDoctorService = {
  async createReferToDoctor(input: CreateReferToDoctorInput) {
    logger.info("entering::createReferToDoctor::service");
    await createReferToDoctorServiceValidation(input);
    const createdResponse = await createReferToDoctorInDb(input);
    logger.info("exiting::createReferToDoctor::service");
    return createdResponse;
  },

  async updateReferToDoctor(input: UpdateReferToDoctorInput) {
    logger.info("entering::updateReferToDoctor::service");
    await updateReferToDoctorServiceValidation(input);
    const update = await updateReferToDoctorInDb(input);
    logger.info("exiting::updateReferToDoctor::service");
    return update;
  },
  async getReferToDoctorById(id: number) {
    logger.info("entering::getReferToDoctorById::service");
    const fetchedResponse = await validateIdReferToDoctor(id);
    logger.info("exiting::getReferToDoctorById::service");
    return fetchedResponse;
  },
};
