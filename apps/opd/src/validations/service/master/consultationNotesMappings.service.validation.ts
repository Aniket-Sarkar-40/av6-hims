import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";

import {
  getConsultationNotesMappingByDoctorIdFromDb,
  getConsultationNotesMappingByIdFromDb,
  getConsultationNotesMappingBynotesIdAndDoctorIdFromDb,
} from "@/repository/master/consultationNotesMapping.repository.js";
import { doctorService } from "@/services/doctor/doctor.service.js";
import { consultationNotesService } from "@/services/master/consultationNotes.service.js";
import { CreateOrUpdateConsultationNotesMapping } from "@/types/master/consultationNotesMapping.js";
import { ConsultationNotesMapping } from "@repo/db/generated/prisma/client";

export const validIdConsultationNotesMapping = async (
  id: number,
): Promise<ConsultationNotesMapping> => {
  logger.info("entering::validIdConsultationNotesMapping::service::validation");

  validIdCheck(id);

  const row = await getConsultationNotesMappingByIdFromDb(id);
  if (!row) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Consultation Notes Mapping"),
    );
  }
  logger.info("exiting::validIdConsultationNotesMapping::service::validation");

  return row;
};
export const validIdConsultationNotesMappingByDoctorId = async (
  doctorId: number,
): Promise<ConsultationNotesMapping[]> => {
  logger.info(
    "entering::validIdConsultationNotesMappingByDoctorId::service::validation",
  );

  validIdCheck(doctorId);

  const response = await getConsultationNotesMappingByDoctorIdFromDb(doctorId);
  if (!response) {
    throw new ErrorHandler(
      404,
      generateErrorMessage(
        "NOT_FOUND",
        "Consultation Notes Mapping for doctor",
      ),
    );
  }
  logger.info(
    "exiting::validIdConsultationNotesMappingByDoctorId::service::validation",
  );

  return response;
};

export const commonValidation = async (
  body: CreateOrUpdateConsultationNotesMapping,
) => {
  validIdCheck(body.doctorId);

  const doctor = await doctorService.getDoctorById(body.doctorId, true);
  if (!doctor) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Doctor"));
  }

  for (const consultationNotesId of body.consultationNotesId) {
    const note = await consultationNotesService.getConsultationNotesById(
      consultationNotesId,
      true,
    );
    if (!note) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND"));
    }
    const existing =
      await getConsultationNotesMappingBynotesIdAndDoctorIdFromDb(
        consultationNotesId,
        body.doctorId,
      );

    if (existing) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "DUPLICATE_ITEM",
          "Consultation Notes Mapping for this doctor",
        ),
      );
    }
  }
};

export const updateConsultationNotesMappingServiceValidation = async (
  body: CreateOrUpdateConsultationNotesMapping,
) => {
  logger.info(
    "entering::updateConsultationNotesMappingServiceValidation::service::validation",
  );

  if (body.id) {
    validIdCheck(body.id);
    const mappingIdCheck = await validIdConsultationNotesMapping(body.id);
    if (mappingIdCheck.id !== body.id) {
      throw new ErrorHandler(
        403,
        generateErrorMessage("ACCESS_FAIL", "Invalid id"),
      );
    }
  }

  await commonValidation(body);

  logger.info(
    "exiting::updateConsultationNotesMappingServiceValidation::service::validation",
  );
};

export const createConsultationNotesMappingServiceValidation = async (
  body: CreateOrUpdateConsultationNotesMapping,
) => {
  logger.info(
    "entering::createConsultationNotesServiceValidation::service::validation",
  );
  await commonValidation(body);
  logger.info(
    "exiting::createConsultationNotesServiceValidation::service::validation",
  );
};
