import { toDoctorDTO } from "@/mapper/doctor/doctor.mapper.js";
import {
  createDoctorInDb,
  updateDoctorInDb,
} from "@/repository/doctor/doctor.repository.js";
import {
  CreateDoctorInput,
  DoctorDTO,
  UpdateDoctorInput,
} from "@/types/doctor/doctor.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import {
  createDoctorServiceValidation,
  updateDoctorServiceValidation,
  validateIdDoctor,
} from "@/validations/service/doctor/doctor.service.validation.js";

export const doctorService = {
  async createDoctor(input: CreateDoctorInput): Promise<DoctorDTO> {
    logger.info("entering::createDoctor::service");
    await createDoctorServiceValidation(input);
    const createDoctor = await createDoctorInDb(input);
    logger.info("exiting::createDoctor::service");
    return toDoctorDTO(createDoctor);
  },
  async updateDoctor(input: UpdateDoctorInput): Promise<DoctorDTO> {
    logger.info("entering::updateDoctor::service");
    await updateDoctorServiceValidation(input);
    const updatedDoctor = await updateDoctorInDb(input);
    logger.info("exiting::updateDoctor::service");
    return toDoctorDTO(updatedDoctor);
  },
  async getDoctorById(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<DoctorDTO | null> {
    logger.info("entering::getDoctorById::service");
    const doctor = await validateIdDoctor(id);
    logger.info("exiting::getDoctorById::service");
    if (!doctor) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Doctor"),
        );
      } else {
        return null;
      }
    }
    return toDoctorDTO(doctor);
  },
  async getDoctorByIdWoDto(id: number, canNullReturnable: boolean = false) {
    logger.info("entering::getDoctorById::service");
    const doctor = await validateIdDoctor(id);
    if (!doctor) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Doctor"),
        );
      } else {
        return null;
      }
    }
    logger.info("exiting::getDoctorById::service");
    return doctor;
  },
};
