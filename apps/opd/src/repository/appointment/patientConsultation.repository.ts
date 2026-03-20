import { PatientConsultation } from "@repo/db/generated/prisma/client";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import {
  CreatePatientConsultationInput,
  UpdatePatientConsultationInput,
} from "@/types/appointment/patientConsultation.js";
import { customOmit } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";

export const createPatientConsultationInDb = async (
  input: CreatePatientConsultationInput,
) => {
  logger.info("entering::createPatientConsultationInDb::repository");
  const store = requestStorage.getStore();
  const currentUserId = store?.user?.id;
  if (input.id) {
    return db.patientConsultation.update({
      where: { id: input.id },
      data: {
        ...input,
        updatedBy: currentUserId,
      },
    });
  } else {
    return db.patientConsultation.create({
      data: {
        ...input,
        createdBy: currentUserId,
      },
    });
  }
};

export const updatePatientConsultationInDb = async (
  data: UpdatePatientConsultationInput,
) => {
  logger.info("entering::updatePatientConsultationInDb::repository");
  const store = requestStorage.getStore();
  const omittedNurseAssessment = customOmit<
    UpdatePatientConsultationInput,
    "id"
  >(data, ["id"]);
  return db.patientConsultation.update({
    where: {
      id: data.id,
    },
    data: {
      ...omittedNurseAssessment.rest,
      updatedBy: store?.user?.id,
    },
  });
};

export const getPatientConsultationByIdFromDb = async (
  id: number,
): Promise<PatientConsultation | null> => {
  logger.info("entering::getOpdDepartmentByIdFromDb::repository");
  return db.patientConsultation.findFirst({
    where: { id, isActive: true },
  });
};

export const getPatientConsultationByAppointmentIdFromDb = async (
  appointmentId: number,
): Promise<PatientConsultation | null> => {
  logger.info(
    "entering::getPatientConsultationByAppointmentIdFromDb::repository",
  );

  return db.patientConsultation.findFirst({
    where: {
      appointmentId,
      isActive: true,
    },
  });
};
