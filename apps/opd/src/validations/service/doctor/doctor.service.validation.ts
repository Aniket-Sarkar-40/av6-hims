import {
  getCollectionCenterByIdFromDb,
  getCountCollectionCenterFromDb,
} from "@/repository/collectionCenter/collectionCenter.repository.js";
import {
  getDoctorByEmailFromDb,
  getDoctorByIdFromDb,
  getDoctorByRegNOFromDb,
  getDoctorScheduleByIdFromDb,
} from "@/repository/doctor/doctor.repository.js";
import { CreateDoctorInput, UpdateDoctorInput } from "@/types/doctor/doctor.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import {
  validIdPrimaryOpdDepartment,
  validIdSecondaryOpdDepartment,
} from "../master/opdDepartment.service.validation.js";
import { validateIdOpdDepartmentPrefixByDepartmentId } from "../master/opdDepartmentPrefix.service.validation.js";

export const validateIdDoctor = async (id: number) => {
  logger.info("entering::validateIdDoctor::service::validation");
  validIdCheck(id);
  const doctor = await getDoctorByIdFromDb(id);
  if (!doctor) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Doctor"));
  }
  logger.info("exiting::validateIdDoctor::service::validation");
  return doctor;
};

export const validateIdDoctorSchedule = async (id: number) => {
  logger.info("entering::validateIdDoctorSchedule::service::validation");
  validIdCheck(id);
  const schedule = await getDoctorScheduleByIdFromDb(id);
  if (!schedule) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Doctor Schedule"),
    );
  }
  logger.info("exiting::validateIdDoctorSchedule::service::validation");
  return schedule;
};

export const commonDoctorServiceValidation = async (
  input: CreateDoctorInput,
) => {
  logger.info("entering::commonDoctor::service::validation");
  const {
    opdPrimaryDepartmentId,
    opdDepartmentId,
    opdDepartmentPrefixId,
    licenseType,
    collectionCenterIds,
    doctorScheduleDetails,
  } = input;
  /*-------------Master data validation--------------*/

  await validIdPrimaryOpdDepartment(opdPrimaryDepartmentId);
  await validIdSecondaryOpdDepartment(opdDepartmentId);
  const prefix =
    await validateIdOpdDepartmentPrefixByDepartmentId(opdDepartmentId);
  const isValidPrefix = prefix.find(
    (item) => item.id === opdDepartmentPrefixId,
  );
  if (!isValidPrefix) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ID", "Opd Department Prefix"),
    );
  }

  if (licenseType !== isValidPrefix.licenseType) {
    throw new ErrorHandler(
      400,
      "License Type and Department Prefix do not match",
    );
  }
  /*--------------------------------------------------*/

  /*-------------Collectioncenter data validation--------------*/
  const colCenters = await getCountCollectionCenterFromDb(collectionCenterIds);
  if (colCenters.length !== collectionCenterIds.length) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ID", "Collection Center"),
    );
  }
  /*--------------------------------------------------*/

  /*-------------Schedule data validation--------------*/
  for (const schedule of doctorScheduleDetails) {
    const { ccId, startTime, endTime, weekId } = schedule;
    validIdCheck(ccId);
    const cc = getCollectionCenterByIdFromDb(ccId);
    if (!cc) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("NOT_FOUND", "Collection Center"),
      );
    }
    if (endTime <= startTime) {
      throw new ErrorHandler(400, "End time must be greater than start time");
    }
    if (weekId < 1 || weekId > 7) {
      throw new ErrorHandler(400, "Week Id must be between 1 to 7");
    }
    /*--------------------------------------------------*/
  }
  logger.info("exiting::commonDoctor::service::validation");
};

export const createDoctorServiceValidation = async (
  input: CreateDoctorInput,
) => {
  logger.info("entering::createDoctor::service::validation");
  const isExisting = await getDoctorByRegNOFromDb(input.doctorRegistrationNo);
  if (isExisting) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "DUPLICATE_ITEM",
        "Doctor with this registration no",
      ),
    );
  }

  const isEmailExist = await getDoctorByEmailFromDb(input.email);
  if (isEmailExist) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Email"),
    );
  }

  await commonDoctorServiceValidation(input);
  logger.info("exiting::createDoctor::service::validation");
};
export const updateDoctorServiceValidation = async (
  input: UpdateDoctorInput,
) => {
  logger.info("entering::updateDoctor::service::validation");
  const { id, ...rest } = input;
  const doctor = await validateIdDoctor(id);
  input.existingDoctor = doctor;

  const isExisting = await getDoctorByRegNOFromDb(input.doctorRegistrationNo);
  if (isExisting && isExisting.id !== input.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "DUPLICATE_ITEM",
        "Doctor with this registration no",
      ),
    );
  }
  const isEmailExist = await getDoctorByEmailFromDb(input.email);
  if (isEmailExist && isEmailExist.id !== input.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Email"),
    );
  }
  input.checkUpTime = doctor.doctorSchedule[0].timeTaken;

  for (const schedule of input.doctorScheduleDetails) {
    if (schedule.id) {
      const existingSchedule = await validateIdDoctorSchedule(schedule.id);
      if (existingSchedule.docId !== id) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("INVALID_ID", "Doctor Schedule"),
        );
      }
    }
  }
  await commonDoctorServiceValidation(rest);
  logger.info("exiting::updateDoctor::service::validation");
};
