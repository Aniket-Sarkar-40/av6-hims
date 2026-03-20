import {
  getConsultationICDTenListByAppointmentIdFromDb,
  getConsultationICDTenListByIdFromDb,
} from "@/repository/appointment/consultationICDTenList.repository.js";
import { icdTenService } from "@/services/master/icdTen.service.js";
import { CreateOrUpdateConsultationICDTenList } from "@/types/appointment/consultationICDTenList.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { ConsultationICDTenList } from "@repo/db/generated/prisma/client";
import { validateIdAppointment } from "./appointment.service.validation.js";

export const validateConsultationICDTen = async (
  appointmentId: number,
  icdTenId: number,
) => {
  const consultationICDTenList =
    await getConsultationICDTenListByAppointmentIdFromDb(
      appointmentId,
      icdTenId,
    );

  if (consultationICDTenList) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("DUPLICATE_ITEM", "Consultation ICD Ten List"),
    );
  }
};

export const validateIdICDTen = async (id: number) => {
  logger.info("entering::validateIdICDTen::service::validation");
  validIdCheck(id);
  const appointment = await icdTenService.getICDTenById(id);
  if (!appointment) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "ICD Ten"));
  }
  logger.info("exiting::validateIdICDTen::service::validation");
  return appointment;
};

export const createConsultationICDTenListServiceValidation = async (
  body: CreateOrUpdateConsultationICDTenList,
): Promise<void> => {
  logger.info(
    "entering::createConsultationICDTenListServiceValidation::service::validation",
  );

  const appointment = await validateIdAppointment(body.appointmentId);
  body.patientId = appointment.patientId;
  await validateIdICDTen(body.icdTenId);

  await validateConsultationICDTen(body.appointmentId, body.icdTenId);

  logger.info(
    "exiting::createConsultationICDTenListServiceValidation::service::validation",
  );
};

export const updateIdConsultationICDTenListServiceValidation = async (
  body: CreateOrUpdateConsultationICDTenList,
): Promise<ConsultationICDTenList | null> => {
  logger.info(
    "entering::updateIdConsultationICDTenListServiceValidation::service::validation",
  );

  if (body.id) {
    validIdCheck(body.id);
    const existing = await getConsultationICDTenListByIdFromDb(body.id);
    if (!existing) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Consultation ICD Ten List"),
      );
    }
  }

  const appointment = await validateIdAppointment(body.appointmentId);
  appointment.patientId = body.patientId;
  await validateIdICDTen(body.icdTenId);

  logger.info(
    "exiting::updateIdConsultationICDTenListServiceValidation::service::validation",
  );
  return null;
};
