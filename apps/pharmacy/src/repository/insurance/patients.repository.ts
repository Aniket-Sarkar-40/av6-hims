import { db } from "@repo/db";
import { PatientReq } from "@/types/insurance/patients.js";
import { customOmit } from "av6-core-v2";
import { logger } from "@repo/platform/logging/logger.js";
import { Patient, Prisma } from "@repo/db/generated/prisma/client";
export const createPatientInDb = async (
  input: PatientReq
): Promise<Patient> => {
  logger.info("Entering::createPatientInDb::repository");

  // 👉 strip out `id`
  const { rest: inputWithoutId } = customOmit(input, ["id"]);

  // now separate patientUniqueId from the cleaned object

  const res = await db.patient.aggregate({
    _max: { patientUniqueId: true },
  });

  const data: Prisma.PatientUncheckedCreateInput = {
    ...inputWithoutId,
    patientUniqueId: res._max.patientUniqueId
      ? res._max.patientUniqueId + 1
      : 0,
    isActive: "yes",
    uniqueSequenceNumber: 0,
    patientType: input.patientType || "",
    note: input.note || "",
  };

  return await db.patient.create({ data });
};
export const updatePatientInDb = async (
  id: number,
  input: PatientReq
): Promise<Patient> => {
  logger.info("Entering::updatePatientInDb::repository");

  const existingPatient = await getPatientsByIdFromDb(id);
  const omittedPatient = customOmit<PatientReq, "id">(input, ["id"]);

  const updatedPatient = await db.patient.update({
    where: {
      id,
    },
    data: {
      ...omittedPatient.rest,
      isActive: "yes",
      patientUniqueId: existingPatient?.patientUniqueId,
      uniqueSequenceNumber: existingPatient?.uniqueSequenceNumber,
      patientType: input.patientType || "",
      note: input.note || "",
    },
  });

  return updatedPatient;
};

export const getAllPatientsFromDb = async (): Promise<Patient[]> => {
  logger.info("entering::getAllPatientsFromDb::repository");

  const allPatients = await db.patient.findMany({
    where: { isActive: "yes" },
  });

  logger.info("exiting::getAllPatientsFromDb::repository");
  return allPatients;
};

export const getPatientsByIdFromDb = async (
  id: number
): Promise<Patient | null> => {
  logger.info(`entering::getPatientsByIdFromDb::repository id=${id}`);

  const patients = await db.patient.findFirst({
    where: { id, isActive: "yes" },
  });

  logger.info(`exiting::getPatientsByIdFromDb::repository id=${id}`);
  return patients;
};

export const getPatientsByUniqueIdFromDb = async (
  id: number
): Promise<Patient | null> => {
  logger.info(`entering::getPatientsByIdFromDb::repository id=${id}`);

  const patients = await db.patient.findFirst({
    where: { patientUniqueId: id, isActive: "yes" },
  });

  logger.info(`exiting::getPatientsByIdFromDb::repository id=${id}`);
  return patients;
};

export const getPatientsNameByNameFromDb = async (
  patientName: string | null
): Promise<Patient | null> => {
  logger.info(
    `entering::getPatientsNameByNameFromDb::repository patientName=${patientName}`
  );

  const patientsDetails = await db.patient.findFirst({
    where: { patientName },
  });

  logger.info(
    `exiting::getPatientsNameByNameFromDb::repository patientName=${patientName}`
  );
  return patientsDetails;
};

export const getPatientsMobileNoByMobileNoFromDb = async (
  mobileNo: string | null
): Promise<Patient | null> => {
  logger.info(
    `entering::getPatientsNameByNameFromDb::repository patientName=${mobileNo}`
  );

  const patientsDetails = await db.patient.findFirst({
    where: { mobileNo },
  });

  logger.info(
    `exiting::getPatientsNameByNameFromDb::repository patientName=${mobileNo}`
  );
  return patientsDetails;
};

export const getPatientsEmailByMobileNoFromDb = async (
  email: string | null
): Promise<Patient | null> => {
  logger.info(
    `entering::getPatientsNameByNameFromDb::repository patientName=${email}`
  );

  const patientsDetails = await db.patient.findFirst({
    where: { email },
  });

  logger.info(
    `exiting::getPatientsNameByNameFromDb::repository patientName=${email}`
  );
  return patientsDetails;
};

export const deletePatientsFromDb = async (id: number) => {
  logger.info(`entering::deletePatientsFromDb::repository id=${id}`);

  await db.patient.update({
    where: { id },
    data: { isActive: "no" },
  });

  logger.info(`exiting::deletePatientsFromDb::repository id=${id}`);
};
