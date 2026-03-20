import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { PatientInsuranceReq } from "@/types/insurance/patientsInsurance.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  InsuranceType,
  PatientInsurance,
} from "@repo/db/generated/prisma/client";

export const createPatientsInsuranceInDb = async (
  data: PatientInsuranceReq,
): Promise<PatientInsurance> => {
  logger.info("entering::createPatientsInsuranceInDb::repository");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const patientsInsurance = await db.patientInsurance.create({
    data: {
      ...data,
      createdBy: currentUser,
    },
  });

  logger.info("exiting::createPatientsInsuranceInDb::repository");
  return patientsInsurance;
};

export const updatePatientsInsuranceInDb = async (
  id: number,
  data: PatientInsuranceReq,
): Promise<PatientInsurance> => {
  logger.info("entering::updatePatientsInsuranceInDb::repository");

  const updatedPatientsInsurance = await db.patientInsurance.update({
    where: {
      id,
    },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });

  logger.info("exiting::updatePatientsInsuranceInDb::repository");

  return updatedPatientsInsurance;
};

export const getAllPatientsInsuranceFromDb = async (input: {
  patientId?: number;
  insuranceType?: InsuranceType;
}): Promise<PatientInsurance[]> => {
  logger.info("entering::getAllPatientsInsuranceFromDb::repository");

  const allPatientsInsurance = await db.patientInsurance.findMany({
    where: {
      patientId: input.patientId,
      insuranceType: input.insuranceType,
    },
  });

  logger.info("exiting::getAllPatientsInsuranceFromDb::repository");
  return allPatientsInsurance;
};

export const getPatientsInsuranceByIdFromDb = async (
  id: number,
): Promise<PatientInsurance | null> => {
  logger.info(`entering::getPatientsInsuranceByIdFromDb::repository id=${id}`);

  const patientsInsurance = await db.patientInsurance.findFirst({
    where: { id },
  });

  logger.info(`exiting::getPatientsInsuranceByIdFromDb::repository id=${id}`);
  return patientsInsurance;
};

// export const getPatientsInsuranceEmailByMobileNoFromDb = async (
//   email: string
// ): Promise<PatientInsurance | null> => {
//   logger.info(
//     `entering::getPatientsInsuranceNameByNameFromDb::repository patientsInsuranceName=${email}`
//   );

//   const patientsInsuranceDetails = await db.patientInsurance.findFirst({
//     where: { email },
//   });

//   logger.info(
//     `exiting::getPatientsInsuranceNameByNameFromDb::repository patientsInsuranceName=${email}`
//   );
//   return patientsInsuranceDetails;
// };

export const deletePatientsInsuranceFromDb = async (id: number) => {
  logger.info(`entering::deletePatientsInsuranceFromDb::repository id=${id}`);

  await db.patientInsurance.delete({
    where: { id },
  });

  logger.info(`exiting::deletePatientsInsuranceFromDb::repository id=${id}`);
};
