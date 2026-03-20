import { getAppointmentsByIdFromDb } from "@/repository/appointment/appointment.repository.js";
import {
  getAllPatientMedicineDetailsByAptIdAndMedIdFromDb,
  getPatientMedicineByAptIdFromDb,
  getPatientMedicineByIdFromDb,
  getPatientMedicineDetailsByIdFromDb,
  getPatientMedicineDetailsByMasterIdFromDb,
  getPatientMedicineSellInfoByAptIdFromDb,
} from "@/repository/appointment/patientMedicine.repository.js";
import { getCollectionCenterByIdFromDb } from "@/repository/collectionCenter/collectionCenter.repository.js";
import { getItemByIdFromDb } from "@/repository/master/item.repository.js";
import {
  CreatePatientMedicineInput,
  UpdatePatientMedicineDetailInput,
  UpdatePatientMedicineInput,
} from "@/types/appointment/patientMedicine.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { validateIdAppointment } from "../appointment/appointment.service.validation.js";
import { validateIdPatients } from "../patient/patient.service.validation.js";

export const validateIdPatientMedicine = async (id: number) => {
  logger.info("entering::validateIdPatientMedicine::service::validation");
  validIdCheck(id);
  const master = await getPatientMedicineByIdFromDb(id);
  if (!master) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Patient Medicine Master"),
    );
  }
  logger.info("exiting::validateIdPatientMedicine::service::validation");
  return master;
};
export const validateIdPatientMedicineDetail = async (id: number) => {
  logger.info("entering::validateIdPatientMedicineDetail::service::validation");
  validIdCheck(id);
  const detail = await getPatientMedicineDetailsByIdFromDb(id);
  if (!detail) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Patient Medicine Detail"),
    );
  }
  logger.info("exiting::validateIdPatientMedicineDetail::service::validation");
  return detail;
};

export const validateIdPatientMedicineByAptIdAndCcId = async (
  aptId: number,
  ccId: number,
) => {
  logger.info(
    "entering::validateIdPatientMedicineByAptIdAndCcId::service::validation",
  );
  validIdCheck(aptId);
  validIdCheck(ccId);

  const appointment = await getAppointmentsByIdFromDb(aptId);
  if (!appointment) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Appointment"),
    );
  }

  const collectionCenter = await getCollectionCenterByIdFromDb(ccId);
  if (!collectionCenter) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Collection Center"),
    );
  }

  logger.info(
    "exiting::validateIdPatientMedicineByAptIdAndCcId::service::validation",
  );
  return { appointment, collectionCenter };
};

export const validateIdPatientMedicineByAptId = async (aptId: number) => {
  logger.info(
    "entering::validateIdPatientMedicineByAptId::service::validation",
  );
  const master = await getPatientMedicineByAptIdFromDb(aptId);
  if (!master) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Patient Medicine Master"),
    );
  }
  logger.info("exiting::validateIdPatientMedicineByAptId::service::validation");
  return master;
};

export const commonPatientMedicineServiceValidation = async (
  body: CreatePatientMedicineInput | UpdatePatientMedicineInput,
) => {
  logger.info(
    "entering::commonPatientMedicineServiceValidation::service::validation",
  );

  const patient = await validateIdPatients(body.patientId);
  const appointment = await validateIdAppointment(body.appointmentId);

  body.patientUniqueId = patient.patientUniqueId;
  body.doctorId = appointment.doctorId;

  logger.info(
    "exiting::commonPatientMedicineServiceValidation::service::validation",
  );
};

export const createPatientMedicineServiceValidation = async (
  body: CreatePatientMedicineInput,
) => {
  logger.info(
    "entering::createPatientMedicineServiceValidation::service::validation",
  );

  await commonPatientMedicineServiceValidation(body);

  for (const detail of body.details) {
    const item = await getItemByIdFromDb(detail.medId);
    if (!item) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Medicine"),
      );
    }

    const aptAndMedId = await getAllPatientMedicineDetailsByAptIdAndMedIdFromDb(
      body.appointmentId,
      detail.medId,
    );
    if (!aptAndMedId) {
      throw new ErrorHandler(
        404,
        generateErrorMessage(
          "DUPLICATE_ITEM",
          "Apt Id and med id already exists",
        ),
      );
    }
  }

  logger.info(
    "exiting::createPatientMedicineServiceValidation::service::validation",
  );
};

export const updatePatientMedicineServiceValidation = async (
  body: UpdatePatientMedicineInput,
) => {
  logger.info(
    "entering::updatePatientMedicineServiceValidation::service::validation",
  );

  await commonPatientMedicineServiceValidation(body);
  await validateIdPatientMedicine(body.id);

  const unsoldMedDetails = await getPatientMedicineSellInfoByAptIdFromDb(
    body.appointmentId,
  );
  const existingMedDetails = unsoldMedDetails.filter(
    (s) => s.masterId === body.id,
  );

  const toUpdate: UpdatePatientMedicineDetailInput[] = [];
  const toCreate: UpdatePatientMedicineDetailInput[] = [];

  const deleted = existingMedDetails.filter(
    (d) => !body.details.some((item) => item.id === d.id),
  );
  body.toDelete = deleted.map((d) => d.id);

  for (const detail of body.details) {
    const item = await getItemByIdFromDb(detail.medId);
    if (!item) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Medicine"),
      );
    }

    if (detail.id) {
      const patMedDet = existingMedDetails.find(
        (patMed) => patMed.id === detail.id,
      );
      if (!patMedDet) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("INVALID_FIELD", "Details id"),
        );
      }
      toUpdate.push(detail);
    } else {
      const patMedDet = unsoldMedDetails.find(
        (patMed) => patMed.medId === detail.medId,
      );
      if (patMedDet) {
        throw new ErrorHandler(
          404,
          generateErrorMessage(
            "DUPLICATE_ITEM",
            "unsold medicine for the same appointment",
          ),
        );
      }
      toCreate.push(detail);
    }
  }

  body.toCreate = toCreate;
  body.toUpdate = toUpdate;

  logger.info(
    "exiting::updatePatientMedicineServiceValidation::service::validation",
  );
};

export const deletePatientMedicineServiceValidation = async (id: number) => {
  logger.info(
    "entering::deletePatientMedicineServiceValidation::service::validation",
  );

  await validateIdPatientMedicine(id);
  const details = await getPatientMedicineDetailsByMasterIdFromDb(id);

  if (!details) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "No medicine records found to delete."),
    );
  }

  const sold = details.filter((d) => d.sellId && d.sellRefNo);

  if (sold.length > 0) {
    throw new ErrorHandler(400, generateErrorMessage("DELETE_RESTRICTED"));
  }
};
