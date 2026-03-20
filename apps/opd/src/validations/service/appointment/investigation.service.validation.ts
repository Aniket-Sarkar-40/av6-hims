import {
  getPatientTestByAppointmentIdFromDb,
  getPatientTestByIdFromDb,
  getTestCategoriesByDoctorIdFromDb,
  getTestCategoriesByIdFromDb,
  getTestsByIdFromDb,
  getTestsByTestCategoryIdFromDb,
} from "@/repository/appointment/investigation.repository.js";
import {
  CreatePatientTestInput,
  CreateTestCategoriesInput,
  CreateTestsInput,
  UpdatePatientTestInput,
  UpdateTestCategoriesInput,
  UpdateTestsInput,
} from "@/types/appointment/investigation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { validateIdDoctor } from "../doctor/doctor.service.validation.js";
import { validateIdCollectionCenter } from "../master/collectionCenter.service.validation.js";
import { validateIdPathologyMaster } from "../pathology/pathologyMaster.service.validation.js";
import { validateIdAppointment } from "./appointment.service.validation.js";
import { YesNoEnum } from "@repo/db/generated/prisma/client";

export const validateIdTestCategories = async (id: number) => {
  logger.info("entering::validateIdTestCategories::service::validation");
  validIdCheck(id);
  const response = await getTestCategoriesByIdFromDb(id);
  if (!response) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Test Categories"),
    );
  }
  logger.info("exiting::validateIdTestCategories::service::validation");
  return response;
};

export const validateIdTests = async (id: number) => {
  logger.info("entering::validateIdTests::service::validation");
  validIdCheck(id);
  const response = await getTestsByIdFromDb(id);
  if (!response) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Tests"));
  }
  logger.info("exiting::validateIdTests::service::validation");
  return response;
};

export const createTestCategoriesServiceValidation = async (
  input: CreateTestCategoriesInput,
) => {
  logger.info("entering::createTestCategories::service::validation");
  await validateIdDoctor(input.doctorId);
  const existing = await getTestCategoriesByDoctorIdFromDb(input.doctorId);

  if (existing.length > 0) {
    const categories = existing.map((item) => item.catergoryName);

    if (categories.includes(input.catergoryName)) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Test Categories"),
      );
    }
  }
  logger.info("exiting::createTestCategories::service::validation");
};

export const updateTestCategoriesServiceValidation = async (
  input: UpdateTestCategoriesInput,
) => {
  logger.info("entering::updateTestCategories::service::validation");
  const { id, ...rest } = input;
  await validateIdTestCategories(id);
  await createTestCategoriesServiceValidation(
    rest as CreateTestCategoriesInput,
  );
  logger.info("exiting::updateTestCategories::service::validation");
};

export const createTestsServiceValidation = async (input: CreateTestsInput) => {
  logger.info("entering::createTests::service::validation");

  const { testCategoryId, data } = input;
  await validateIdTestCategories(testCategoryId);

  for (const test of data) {
    const patho = await validateIdPathologyMaster(test.testId);

    if (patho.analytecode !== test.testCode) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_VALUE", "Test code"),
      );
    }

    if (patho.analyteName !== test.testName) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_VALUE", "Test name"),
      );
    }
  }
  logger.info("exiting::createTests::service::validation");
};

export const updateTestsServiceValidation = async (input: UpdateTestsInput) => {
  logger.info("entering::updateTests::service::validation");
  const { testCategoryId, data } = input;

  await validateIdTestCategories(testCategoryId);

  const existing = await getTestsByTestCategoryIdFromDb(testCategoryId);
  input.existingTests = existing;

  for (const test of data) {
    if (test.id) await validateIdTests(test.id);

    const patho = await validateIdPathologyMaster(test.testId);

    if (patho.analytecode !== test.testCode) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_VALUE", "Test code"),
      );
    }

    if (patho.analyteName !== test.testName) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_VALUE", "Test name"),
      );
    }
  }
  logger.info("exiting::updateTests::service::validation");
};

export const getTestsByTestCategoryIdServiceValidation = async (
  testCategoryId: number,
) => {
  logger.info("entering::getTestsByTestCategoryId::service::validation");
  await validateIdTestCategories(testCategoryId);
  logger.info("exiting::getTestsByTestCategoryId::service::validation");
};

/*-------------------------Investigation/Precedure Service Validation----------------------*/
export const validateIdPatientTest = async (id: number) => {
  logger.info("entering::validateIdPatientTest::service::validation");
  validIdCheck(id);
  const response = await getPatientTestByIdFromDb(id);
  if (!response) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Patient Test"),
    );
  }
  logger.info("exiting::validateIdPatientTest::service::validation");
  return response;
};

export const createPatientTestServiceValidation = async (
  input: CreatePatientTestInput,
) => {
  logger.info("entering::createPatientTest::service::validation");
  const { appointmentId, data } = input;
  const appointment = await validateIdAppointment(appointmentId);
  input.patientId = appointment.patientId;

  const existing = await getPatientTestByAppointmentIdFromDb(appointmentId);
  if (existing.length > 0) {
    throw new ErrorHandler(
      400,
      "Patient test already exist for this appointment please update tests",
    );
  }
  for (const test of data) {
    const patho = await validateIdPathologyMaster(test.testId);
    test.testCode = patho.analytecode;
    test.testName = patho.analyteName;

    if (patho.isCommentRequired === YesNoEnum.Yes && !test.comment) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("FIELD_REQUIRED", `Comment for ${test.testName}`),
      );
    }

    if (patho.isCommentRequired === YesNoEnum.No && test.comment) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_VALUE", `Comment for ${test.testName}`),
      );
    }

    if (test.processLocation)
      await validateIdCollectionCenter(test.processLocation);
  }

  logger.info("exiting::createPatientTest::service::validation");
};

export const updatePatientTestServiceValidation = async (
  input: UpdatePatientTestInput,
) => {
  logger.info("entering::updatePatientTest::service::validation");
  const { appointmentId, data } = input;
  const appointment = await validateIdAppointment(appointmentId);
  input.patientId = appointment.patientId;

  const existing = await getPatientTestByAppointmentIdFromDb(appointmentId);
  input.existing = existing;

  for (const test of data) {
    if (test.id) await validateIdPatientTest(test.id);

    const patho = await validateIdPathologyMaster(test.testId);
    test.testCode = patho.analytecode;
    test.testName = patho.analyteName;

    if (patho.isCommentRequired === YesNoEnum.Yes && !test.comment) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("FIELD_REQUIRED", `Comment for ${test.testName}`),
      );
    }

    if (patho.isCommentRequired === YesNoEnum.No && test.comment) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_VALUE", `Comment for ${test.testName}`),
      );
    }
    if (test.processLocation)
      await validateIdCollectionCenter(test.processLocation);
  }
  logger.info("exiting::updatePatientTest::service::validation");
};
