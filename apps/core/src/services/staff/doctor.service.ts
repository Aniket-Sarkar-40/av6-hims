import { toStaffEntity, toDoctorDTO } from "@/mapper/staff/doctor.mapper.js";
import {
  createDoctorInDb,
  getAllDoctorsFromDb,
  getDoctorByIdFromDb,
  updateDoctorInDb,
  deleteDoctorInDb,
} from "@/repository/staff/doctor.repository.js";
import { CreateOrUpdateDoctor, DoctorDTO } from "@/types/staff/doctor.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import {
  createDoctorServiceValidation,
  updateDoctorServiceValidation,
  validateIdDoctorBy,
} from "@/validations/service/staff/doctor.service.validation.js";
import { logger } from "@repo/platform/logging/logger.js";
import { auditProxy } from "@/config/audit.config.js";

const doctorServiceRaw = {
  async createDoctor(input: CreateOrUpdateDoctor) {
    logger.info("entering::createDoctor::service");

    await createDoctorServiceValidation(input);

    const staffInput = toStaffEntity(input);
    await createDoctorInDb(staffInput, input);

    // const dto = toDoctorDTO(staffWithDoctor);

    logger.info("exiting::createDoctor::service");
  },

  async getAllDoctors(designationId: number): Promise<DoctorDTO[]> {
    logger.info("entering::getAllDoctors::service");

    const doctors = await getAllDoctorsFromDb(designationId);

    if (doctors.length === 0) {
      throw new ErrorHandler(404, "doctors not found");
    }

    const dtoList = await Promise.all(doctors.map((e) => toDoctorDTO(e)));
    logger.info("exiting::getAllDoctors::service");
    return dtoList;
  },

  async getDoctorById(
    doctorId: number,
    canNullReturnable: boolean = false
  ): Promise<DoctorDTO | null> {
    logger.info("entering::getDoctorById::service");

    const doctor = await getDoctorByIdFromDb(doctorId);

    if (!doctor) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "doctor")
        );
      }
      return null;
    }

    const staffDTO = await toDoctorDTO(doctor);
    logger.info("exiting::getDoctorById::service");
    return staffDTO;
  },
  async updateDoctor(input: CreateOrUpdateDoctor): Promise<void> {
    logger.info("entering::updateDoctor::service");
    await updateDoctorServiceValidation(input);
    const staffInput = toStaffEntity(input);
    await updateDoctorInDb(staffInput, input);

    logger.info("exiting::updateDoctor::service");
  },

  async deleteDoctor(doctorId: number): Promise<void> {
    logger.info("entering::deleteDoctor::service");
    await validateIdDoctorBy(doctorId);

    await deleteDoctorInDb(doctorId);

    logger.info("exiting::deleteDoctor::service");
  },
};

export const doctorService = auditProxy.createAuditedService(
  "doctor",
  doctorServiceRaw
);
