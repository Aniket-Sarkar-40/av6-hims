import { getReferToDoctorByIdFromDb } from "@/repository/appointment/referToDoctor.repository.js";
import {
  CreateReferToDoctorInput,
  UpdateReferToDoctorInput,
} from "@/types/appointment/referToDoctor.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { validateIdDoctor } from "../doctor/doctor.service.validation.js";
import { validIdPrimaryOpdDepartment } from "../master/opdDepartment.service.validation.js";
import { validateIdAppointment } from "./appointment.service.validation.js";

export const validateIdReferToDoctor = async (id: number) => {
  logger.info("entering::validateIdReferToDoctor::service::validation");
  validIdCheck(id);
  const referToDoctor = await getReferToDoctorByIdFromDb(id);
  if (!referToDoctor) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Patient Refer To Doctor"),
    );
  }
  logger.info("exiting::validateIdReferToDoctor::service::validation");
  return referToDoctor;
};
export const createReferToDoctorServiceValidation = async (
  input: CreateReferToDoctorInput,
) => {
  logger.info("entering::createReferToDoctor::service::validation");
  const appointment = await validateIdAppointment(input.appointmentId);
  input.patientId = appointment.patientId;
  await validateIdDoctor(input.doctorId);
  await validIdPrimaryOpdDepartment(input.opdDepartmentId);
  logger.info("exiting::createReferToDoctor::service::validation");
};
export const updateReferToDoctorServiceValidation = async (
  input: UpdateReferToDoctorInput,
) => {
  logger.info("entering::updateReferToDoctor::service::validation");
  const { id, ...rest } = input;
  await validateIdReferToDoctor(id);
  await createReferToDoctorServiceValidation(rest as CreateReferToDoctorInput);
  logger.info("exiting::updateReferToDoctor::service::validation");
};
